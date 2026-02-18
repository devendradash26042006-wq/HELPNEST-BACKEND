const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../config/firebase");

// Simulated Login using phone (OTP logic can be added later)
router.post("/login", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number required" });
    }

    // Check if customer exists
    const snapshot = await db.collection("CUSTOMER")
      .where("phone", "==", phone)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "User not found" });
    }

    let userData;
    snapshot.forEach(doc => {
      userData = { id: doc.id, ...doc.data() };
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: userData.id, phone: userData.phone },
      "secretKey",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
