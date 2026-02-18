const express = require("express");
const router = express.Router();
const db = require("../config/firebase");
const verifyToken = require("../middleware/authMiddleware");


// Create Booking
router.post("/add", async (req, res) => {
  try {
    const {
      booking_id,
      cust_id,
      sp_id,
      service_id,
      status,
      date,
      amount
    } = req.body;

    if (!booking_id || !cust_id || !sp_id || !service_id || !amount) {
      return res.status(400).json({ message: "Required fields missing" });
    }
    await db.collection("BOOKING").doc(booking_id).set({
  cust_id,
  sp_id,
  service_id,
  amount,
  status: "Requested",
  payment_status: "Pending",
  createdAt: new Date().toISOString()
});


    res.status(201).json({ message: "Booking created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Booking Status
router.put("/update-status", verifyToken, async (req, res) => {
  try {
    const { booking_id, status } = req.body;

    if (!booking_id || !status) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    await db.collection("BOOKING").doc(booking_id).update({
      status
    });

    res.status(200).json({ message: "Booking status updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Bookings by Customer
router.get("/customer/:cust_id", async (req, res) => {
  try {
    const { cust_id } = req.params;

    const snapshot = await db.collection("BOOKING")
      .where("cust_id", "==", cust_id)
      .get();

    const bookings = [];

    snapshot.forEach(doc => {
      bookings.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Bookings by Provider
router.get("/provider/:sp_id", async (req, res) => {
  try {
    const { sp_id } = req.params;

    const snapshot = await db.collection("BOOKING")
      .where("sp_id", "==", sp_id)
      .get();

    const bookings = [];

    snapshot.forEach(doc => {
      bookings.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
