const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../config/firebase");


// ==================================
// SEND OTP
// ==================================
router.post("/send-otp", async (req, res) => {
  try {
    const { phone, role } = req.body;

    if (!phone || !role) {
      return res.status(400).json({
        message: "Phone and role are required"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`Generated OTP for ${phone}: ${otp}`);

    await db.collection("OTP_STORE").doc(phone).set({
      otp,
      role,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    // Development only (remove in production)
    res.status(200).json({
      message: "OTP sent successfully",
      otp
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ==================================
// VERIFY OTP
// ==================================
router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        message: "Phone and OTP are required"
      });
    }

    const otpDoc = await db.collection("OTP_STORE").doc(phone).get();

    if (!otpDoc.exists) {
      return res.status(400).json({
        message: "OTP not found"
      });
    }

    const otpData = otpDoc.data();

    if (Date.now() > otpData.expiresAt) {
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    if (otp !== otpData.otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    const role = otpData.role;

    let userCollection;

    if (role === "customer") userCollection = "CUSTOMER";
    else if (role === "provider") userCollection = "SERVICE_PROVIDER";
    else if (role === "admin") userCollection = "ADMIN";
    else {
      return res.status(400).json({
        message: "Invalid role"
      });
    }

    const snapshot = await db.collection(userCollection)
      .where("phone", "==", phone)
      .get();

    let userId;

    if (snapshot.empty) {

      // Auto-create customer only
      if (role === "customer") {

        userId = `CUST${Date.now()}`;

        await db.collection("CUSTOMER").doc(userId).set({
          name: "",
          phone,
          email: "",
          address: "",
          createdAt: new Date().toISOString()
        });

      } else {
        return res.status(404).json({
          message: "User not found"
        });
      }

    } else {
      snapshot.forEach(doc => {
        userId = doc.id;
      });
    }

    const token = jwt.sign(
      { userId, role },
      process.env.JWT_SECRET || "secretKey",
      { expiresIn: "1h" }
    );

    // Delete OTP after successful verification
    await db.collection("OTP_STORE").doc(phone).delete();

    res.status(200).json({
      message: "Login successful",
      token,
      role,
      id: userId
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;