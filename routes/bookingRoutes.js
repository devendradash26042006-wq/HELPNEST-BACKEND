const express = require("express");
const router = express.Router();
const db = require("../config/firebase");
const verifyToken = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/roleMiddleware");

// =======================
// Update Booking Status
// =======================
router.put("/update-status", async (req, res) => {
  try {

    const { booking_id, status } = req.body;

    if (!booking_id || !status) {
      return res.status(400).json({
        error: "booking_id and status required"
      });
    }

    console.log("UPDATE HIT:", booking_id, status);

    const bookingRef = db.collection("BOOKING").doc(booking_id);

    const doc = await bookingRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Booking not found" });
    }

    await bookingRef.update({ status });

    res.json({
      message: "Status updated successfully"
    });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// =======================
// Verify Payment
// =======================
router.put("/payment-success/:booking_id", async (req, res) => {

  try {

    const { booking_id } = req.params;

    const bookingRef = db.collection("BOOKING").doc(booking_id);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    const bookingData = bookingDoc.data();

    const totalAmount = bookingData.amount || 0;

    const commissionPercent = 20;

    const commission = (totalAmount * commissionPercent) / 100;

    const providerEarning = totalAmount - commission;

    await bookingRef.update({
      payment_status: "Completed",
      status: "Confirmed",
      commission,
      provider_earning: providerEarning
    });

    await db.collection("PROVIDER_EARNINGS").add({
      provider_id: bookingData.provider_id,
      booking_id,
      amount: providerEarning,
      commission,
      createdAt: new Date().toISOString()
    });

    res.status(200).json({
      message: "Payment updated successfully"
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});


// =======================
// Get Bookings by Customer
// =======================
router.get("/customer/:cust_id", async (req, res) => {

  try {

    const { cust_id } = req.params;

    const snapshot = await db.collection("BOOKING")
      .where("cust_id", "==", cust_id)
      .orderBy("createdAt", "desc")
      .get();

    const bookings = [];

    for (const doc of snapshot.docs) {

      const data = doc.data();

      const providerDoc = await db.collection("SERVICE_PROVIDER")
        .doc(data.provider_id)
        .get();

      const providerName = providerDoc.exists
        ? providerDoc.data().name
        : "Provider";

      const serviceDoc = await db.collection("SERVICE")
        .doc(data.service_id)
        .get();

      const serviceName = serviceDoc.exists
        ? serviceDoc.data().service_name
        : "Service";

      bookings.push({
        id: doc.id,
        customer_name:"customer",
        serviceName: "Service",
        providerName,
        amount: `₹${data.amount || 0}`,
        status: data.status,
        date: data.date,
        time_slot: data.time_slot,
        status: data.status,
        payment_status: data.payment_status
      });

    }

    res.status(200).json(bookings);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});
// =======================
// Get Bookings by Provider
// =======================
router.get("/provider/:sp_id", async (req, res) => {

  try {

    const { sp_id } = req.params;

    const snapshot = await db.collection("BOOKING")
      .where("provider_id", "==", sp_id)
      .orderBy("createdAt", "desc")
      .get();

    const bookings = [];

    for (const doc of snapshot.docs) {

      const data = doc.data();

      const customerDoc = await db.collection("CUSTOMER")
        .doc(data.cust_id)
        .get();

      const customerName = customerDoc.exists
        ? customerDoc.data().name || "Customer"
        : "Customer";

      const serviceDoc = await db.collection("SERVICE")
        .doc(data.service_id)
        .get();

      const serviceName = serviceDoc.exists
        ? serviceDoc.data().service_name
        : "Service";

      const price = serviceDoc.exists
        ? serviceDoc.data().base_price
        : 0;

      bookings.push({
        id: doc.id,
        customer_name: customerName,
        service_name: serviceName,
        price,
        date: data.date,
        time_slot: data.time_slot,
        status: data.status,
        payment_status: data.payment_status
      });

    }

    res.status(200).json(bookings);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});
// =======================
// Available Slots
// =======================
router.get("/available-slots/:provider_id/:date", async (req, res) => {
  try {

    const { provider_id, date } = req.params;

    const allSlots = ["10-11", "12-01", "2-3", "4-5"];

    // 🔥 Get bookings for that date
    const snapshot = await db.collection("BOOKING")
      .where("provider_id", "==", provider_id)
      .where("date", "==", date)
      .get();

    const bookedSlots = [];

    snapshot.forEach(doc => {
      const data = doc.data();

      bookedSlots.push(data.time_slot);
    });

    // 🔥 Filter available slots
    const availableSlots = allSlots.filter(
      slot => !bookedSlots.includes(slot)
    );

    res.status(200).json(availableSlots);

  } catch (error) {

    console.error("SLOT ERROR:", error);

    res.status(500).json({
      error: error.message
    });
  }
});
// =======================
// Book Slot
// =======================
router.post("/book-slot", async (req, res) => {
  try {

    let {
      booking_id,
      provider_id,
      cust_id,
      service_id,
      date,
      time_slot,
      amount
    } = req.body;

    // 🔥 CLEAN DATA
    date = date.trim();
    time_slot = time_slot.trim();

    if (!booking_id || !provider_id || !cust_id || !service_id || !date || !time_slot) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // 🔥 CHECK SLOT ALREADY BOOKED
    const snapshot = await db.collection("BOOKING")
      .where("provider_id", "==", provider_id)
      .where("date", "==", date)
      .where("time_slot", "==", time_slot)
      .get();

    if (!snapshot.empty) {
      return res.status(400).json({ message: "Slot already booked" });
    }

    // 🔥 CREATE BOOKING
    await db.collection("BOOKING").doc(booking_id).set({
      provider_id,
      cust_id,
      service_id,
      date, // ✅ MUST BE STRING (YYYY-MM-DD)
      time_slot,
      amount: amount || 0,
      status: "Scheduled",
      payment_status: "Pending",
      createdAt: new Date().toISOString()
    });;

    res.status(201).json({
      message: "Booking successful"
    });

  } catch (error) {

    console.error("BOOKING ERROR:", error);

    res.status(500).json({
      error: error.message
    });
  }
});
module.exports = router;