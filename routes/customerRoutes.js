const express = require("express");
const router = express.Router();
const db = require("../config/firebase");

router.post("/add", async (req, res) => {
  try {
    const { cust_id, name, phone, email, address } = req.body;

    if (!cust_id || !name || !phone) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    await db.collection("CUSTOMER").doc(cust_id).set({
      name,
      phone,
      email,
      address,
    });

    res.status(201).json({ message: "Customer added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
