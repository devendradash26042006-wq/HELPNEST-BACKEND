const express = require("express");
const router = express.Router();
const db = require("../config/firebase");


// =====================================
// PROVIDER DASHBOARD
// =====================================
router.get("/dashboard/:provider_id", async (req, res) => {

  try {

    const { provider_id } = req.params;

    // ---------- Provider Info ----------
    const providerDoc = await db.collection("SERVICE_PROVIDER")
      .doc(provider_id)
      .get();

    if (!providerDoc.exists) {
      return res.status(404).json({
        message: "Provider not found"
      });
    }

    const providerData = providerDoc.data();

    // ---------- Category ----------
    let categoryName = providerData.category_id;

    const categoryDoc = await db.collection("CATEGORY")
      .doc(providerData.category_id)
      .get();

    if (categoryDoc.exists) {
      categoryName = categoryDoc.data().name || categoryName;
    }

    // ---------- Bookings ----------
    const bookingSnapshot = await db.collection("BOOKING")
      .where("provider_id", "==", provider_id)
      .get();

    let pending = 0;
    let active = 0;

    bookingSnapshot.forEach(doc => {

      const data = doc.data();

      if (data.status === "Confirmed") pending++;

      if (data.status === "In Progress") active++;

    });

    // ---------- Earnings ----------
    const earningsSnapshot = await db.collection("PROVIDER_EARNINGS")
      .where("provider_id", "==", provider_id)
      .get();

    let totalEarnings = 0;

    // Weekly earnings (Sun-Sat)
    const weekly = [0,0,0,0,0,0,0];

    earningsSnapshot.forEach(doc => {

      const data = doc.data();

      const amount = data.provider_amount || 0;

      totalEarnings += amount;

      if (data.createdAt) {

        const date = new Date(data.createdAt);
        const day = date.getDay();

        weekly[day] += amount;

      }

    });

    res.json({
      provider_name: providerData.name || "Provider",
      category: categoryName,
      pending,
      active,
      total_earnings: totalEarnings,
      weekly
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});


// =====================================
// GET PROVIDER BOOKINGS
// =====================================
router.get("/bookings/:provider_id", async (req, res) => {
  try {

    const { provider_id } = req.params;

    const snapshot = await db.collection("BOOKING")
      .where("provider_id", "==", provider_id)
      .get();

    const bookings = await Promise.all(
      snapshot.docs.map(async (doc) => {

        const data = doc.data();

        let customerName = "Customer";
        let serviceName = "Service";
        let price = data.amount || 0;

        const [customerDoc, serviceDoc] = await Promise.all([
          data.cust_id
            ? db.collection("CUSTOMER").doc(data.cust_id).get()
            : null,

          data.service_id
            ? db.collection("SERVICE").doc(data.service_id).get()
            : null
        ]);

        if (customerDoc && customerDoc.exists) {
          customerName = customerDoc.data().name;
        }

        if (serviceDoc && serviceDoc.exists) {
          const s = serviceDoc.data();
          serviceName = s.service_name || "Service";
          if (!price) price = s.base_price || 0;
        }

        return {
          id: doc.id,
          customer_name: customerName,
          service_name: serviceName,
          price,
          date: data.date,
          time_slot: data.time_slot,
          status: data.status,
          payment_status: data.payment_status
        };
      })
    );

    res.json(bookings);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================
// UPDATE BOOKING STATUS
// =====================================
router.put("/booking-status", async (req, res) => {

  try {

    const { booking_id, status } = req.body;

    if (!booking_id || !status) {
      return res.status(400).json({
        message: "Missing fields"
      });
    }

    const bookingRef = db.collection("BOOKING").doc(booking_id);

    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    const bookingData = bookingDoc.data();

    await bookingRef.update({ status });

    // ---------- Generate Earnings ----------
    if (status === "Completed") {

      const existing = await db.collection("PROVIDER_EARNINGS")
        .where("booking_id", "==", booking_id)
        .get();

      if (existing.empty) {

        await db.collection("PROVIDER_EARNINGS").add({

          provider_id: bookingData.provider_id,
          booking_id,
          provider_amount: bookingData.provider_amount || 0,
          commission_amount: bookingData.commission_amount || 0,
          createdAt: new Date().toISOString()

        });

      }

    }

    res.json({
      message: "Booking status updated"
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});


// =====================================
// PROVIDER EARNINGS
// =====================================
router.get("/earnings/:provider_id", async (req, res) => {

  try {

    const { provider_id } = req.params;

    const snapshot = await db.collection("PROVIDER_EARNINGS")
      .where("provider_id", "==", provider_id)
      .get();

    let total = 0;

    const earnings = [];

    snapshot.forEach(doc => {

      const data = doc.data();

      const amount = data.provider_amount || 0;

      total += amount;

      earnings.push({
        booking_id: data.booking_id,
        amount,
        commission: data.commission_amount || 0,
        createdAt: data.createdAt
      });

    });

    res.json({
      provider_id,
      total_earnings: total,
      earnings
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});


// =====================================
// UPDATE PROVIDER SERVICE
// =====================================
router.put("/service/:provider_id", async (req, res) => {

  try {

    const { provider_id } = req.params;

    const { price, available, start_time, end_time } = req.body;

    await db.collection("SERVICE_PROVIDER")
      .doc(provider_id)
      .update({
        price,
        available,
        start_time,
        end_time
      });

    res.json({
      message: "Service updated successfully"
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});

// =====================================
// GET PROVIDERS BY CATEGORY
// =====================================
router.get("/category/:category_id", async (req, res) => {

  try {

    const { category_id } = req.params;

    const snapshot = await db.collection("SERVICE_PROVIDER")
      .where("category_id", "==", category_id)
      .get();

    const providers = [];

    snapshot.forEach(doc => {

      const data = doc.data();

      providers.push({
        provider_id: doc.id,
        name: data.name || "Provider",
        phone: data.phone || "",
        rating: data.rating || 0,
        experience: data.experience || 0,
        providerPrice: data.providerPrice || 0,
        category_id: data.category_id
      });

    });

    res.status(200).json(providers);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});
// =====================================
// GET PROVIDER BY ID (FIXED)
// =====================================
router.get("/:provider_id", async (req, res) => {

  try {

    const { provider_id } = req.params;

    const providerDoc = await db.collection("SERVICE_PROVIDER")
      .doc(provider_id)
      .get();

    if (!providerDoc.exists) {
      return res.status(404).json({
        message: "Provider not found"
      });
    }

    const data = providerDoc.data();

    // 🔥 Fetch Category Name (important for UI)
    let categoryName = data.category_id;

    const categoryDoc = await db.collection("CATEGORY")
      .doc(data.category_id)
      .get();

    if (categoryDoc.exists) {
      categoryName = categoryDoc.data().name || categoryName;
    }

    res.json({
      provider_id: providerDoc.id,
      name: data.name || "Provider",
      phone: data.phone || "",
      rating: data.rating || 0,

      // 🔥 IMPORTANT DEFAULTS (prevents crash)
      experience: data.experience || 0,
      providerPrice: data.providerPrice || 0,

      category: categoryName
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});
// ================================
// 👤 GET PROVIDER PROFILE
// ================================
router.get("/:provider_id", async (req, res) => {
  try {

    const { provider_id } = req.params;

    if (!provider_id) {
      return res.status(400).json({ error: "provider_id required" });
    }

    const doc = await db.collection("SERVICE_PROVIDER")
      .doc(provider_id)
      .get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Provider not found" });
    }

    const data = doc.data();

    res.json({
      provider_id,
      name: data.name || "",
      phone: data.phone || "",
      rating: data.rating || 0,
      category_id: data.category_id || "",
      is_active: data.is_active ?? true
    });

  } catch (err) {
    console.error("GET PROVIDER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
// ================================
// ✏️ UPDATE PROVIDER PROFILE
// ================================
router.put("/:provider_id", async (req, res) => {
  try {

    const { provider_id } = req.params;
    const { name, phone } = req.body;

    if (!provider_id) {
      return res.status(400).json({ error: "provider_id required" });
    }

    const providerRef = db.collection("SERVICE_PROVIDER")
      .doc(provider_id);

    const doc = await providerRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Provider not found" });
    }

    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    await providerRef.update(updateData);

    res.json({
      message: "Profile updated successfully"
    });

  } catch (err) {
    console.error("UPDATE PROVIDER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
//generate slots for provider
router.post("/generate-slots", async (req, res) => {
  try {
    const { provider_id, date } = req.body;

    if (!provider_id || !date) {
      return res.status(400).json({ message: "Provider ID and date required" });
    }

    const slots = ["10-11", "11-12", "2-3", "3-4"];

    for (const slot of slots) {

      const slotId = `${provider_id}_${date}_${slot}`;

      await db.collection("PROVIDER_SLOTS").doc(slotId).set({
        provider_id,
        date,
        time_slot: slot,
        is_booked: false
      });
    }

    res.status(200).json({ message: "Slots generated successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;