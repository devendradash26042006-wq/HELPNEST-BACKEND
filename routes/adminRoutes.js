const express = require("express");
const router = express.Router();
const db = require("../config/firebase");

// ================================
// 🔥 ADMIN DASHBOARD
// ================================
router.get("/dashboard", async (req, res) => {
  try {

    const bookingSnapshot = await db.collection("BOOKING").get();
    const providerSnapshot = await db.collection("SERVICE_PROVIDER").get();
    const userSnapshot = await db.collection("CUSTOMER").get(); // 🔥 ADD THIS

    let totalRevenue = 0;
    let totalBookings = bookingSnapshot.size;
    let totalProviders = providerSnapshot.size;
    let totalUsers = userSnapshot.size; // 🔥 ADD THIS

    const weekly = [0, 0, 0, 0, 0, 0, 0];

    bookingSnapshot.forEach(doc => {

      const data = doc.data();

      if (data.payment_status === "Completed") {
        totalRevenue += Number(data.amount || 0);
      }

      if (data.createdAt) {
        const date = new Date(data.createdAt);
        const day = date.getDay();
        weekly[day] += 1;
      }
    });

    res.json({
      total_revenue: totalRevenue,
      total_bookings: totalBookings,
      total_providers: totalProviders,
      total_users: totalUsers, // 🔥 ADD THIS
      weekly_bookings: weekly
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// ---------------- GET ALL USERS ----------------
router.get("/users", async (req, res) => {
  try {

    const snapshot = await db.collection("CUSTOMER").get();

    const users = [];

    snapshot.forEach(doc => {
      const data = doc.data();

      users.push({
        id: doc.id,
        name: data.name || "User",
        phone: data.phone || "",
        is_active: data.is_active ?? true
      });
    });

    res.json(users);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// ================================
// 🚫 BLOCK USER
// ================================
router.put("/user/block/:cust_id", async (req, res) => {
  try {
    await db.collection("CUSTOMER")
      .doc(req.params.cust_id)
      .update({ is_active: false });

    res.json({ message: "User blocked" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// ✅ UNBLOCK USER
// ================================
router.put("/user/unblock/:cust_id", async (req, res) => {
  try {
    await db.collection("CUSTOMER")
      .doc(req.params.cust_id)
      .update({ is_active: true });

    res.json({ message: "User unblocked" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// ❌ DELETE USER
// ================================
router.delete("/user/:cust_id", async (req, res) => {
  try {
    await db.collection("CUSTOMER")
      .doc(req.params.cust_id)
      .delete();

    res.json({ message: "User deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// 🧰 GET ALL PROVIDERS
// ================================
router.get("/providers", async (req, res) => {
  try {
    const snapshot = await db.collection("SERVICE_PROVIDER").get();

    const providers = [];
    snapshot.forEach(doc => {
      providers.push({ id: doc.id, ...doc.data() });
    });

    res.json(providers);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// 🚫 BLOCK PROVIDER
// ================================
router.put("/provider/block/:provider_id", async (req, res) => {
  try {
    await db.collection("SERVICE_PROVIDER")
      .doc(req.params.provider_id)
      .update({ is_active: false });

    res.json({ message: "Provider blocked" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// ✅ UNBLOCK PROVIDER
// ================================
router.put("/provider/unblock/:provider_id", async (req, res) => {
  try {
    await db.collection("SERVICE_PROVIDER")
      .doc(req.params.provider_id)
      .update({ is_active: true });

    res.json({ message: "Provider unblocked" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// ❌ DELETE PROVIDER
// ================================
router.delete("/provider/:provider_id", async (req, res) => {
  try {
    await db.collection("SERVICE_PROVIDER")
      .doc(req.params.provider_id)
      .delete();

    res.json({ message: "Provider deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// 📅 GET BOOKINGS (WITH FILTER)
// ================================
router.get("/bookings", async (req, res) => {
  try {
    const { status } = req.query;

    let query = db.collection("BOOKING");

    if (status) {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();

    const bookings = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      const customerDoc = await db.collection("CUSTOMER")
        .doc(data.cust_id).get();

      const providerDoc = await db.collection("SERVICE_PROVIDER")
        .doc(data.provider_id).get();

      const serviceDoc = await db.collection("SERVICE")
        .doc(data.service_id).get();

      bookings.push({
        id: doc.id,
        customer: customerDoc.data()?.name || "Customer",
        provider: providerDoc.data()?.name || "Provider",
        service: serviceDoc.data()?.service_name || "Service",
        status: data.status,
        date: data.date,
        time_slot: data.time_slot
      });
    }

    res.json(bookings);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// 📊 REPORTS & ANALYTICS
// ================================
router.get("/reports", async (req, res) => {
  try {
    const snapshot = await db.collection("BOOKING").get();

    let revenue = 0;
    let completed = 0;
    let cancelled = 0;

    snapshot.forEach(doc => {
      const data = doc.data();

      if (data.payment_status === "Completed") {
        revenue += data.amount || 0;
      }

      if (data.status === "Completed") completed++;
      if (data.status === "Cancelled") cancelled++;
    });

    res.json({
      total_bookings: snapshot.size,
      revenue,
      completed,
      cancelled
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// 📢 ANNOUNCEMENT
// ================================
router.post("/announcement", async (req, res) => {
  try {
    const { title, message } = req.body;

    await db.collection("NOTIFICATION").add({
      title,
      message,
      target: "all",
      createdAt: new Date().toISOString(),
      isRead: false
    });

    res.json({ message: "Announcement sent" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// 👤 ADMIN PROFILE
// ================================
router.get("/profile", async (req, res) => {
  try {
    const doc = await db.collection("ADMIN")
      .doc("ADMIN001")
      .get();

    res.json(doc.data());

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================================
// ⚙️ UPDATE COMMISSION
// ================================
router.put("/commission", async (req, res) => {
  try {
    const { percentage } = req.body;

    await db.collection("ADMIN")
      .doc("ADMIN001")
      .update({ commission_percentage: percentage });

    res.json({ message: "Commission updated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ---------------- ADD SERVICE ----------------
router.post("/add-service", async (req, res) => {
  try {

    const {
      service_id,
      category_id,
      service_name,
      base_price
    } = req.body;

    if (!service_id || !category_id || !service_name || !base_price) {
      return res.status(400).json({
        message: "Required fields missing"
      });
    }

    await db.collection("SERVICE").doc(service_id).set({
      category_id,
      service_name,
      base_price,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      message: "Service added successfully"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;