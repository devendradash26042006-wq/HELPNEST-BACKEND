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
// Get Customer Profile
router.get("/:cust_id", async (req, res) => {
  try {
    const { cust_id } = req.params;

    const doc = await db.collection("CUSTOMER").doc(cust_id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Update Customer Profile
router.put("/update", async (req, res) => {
  try {
    const { cust_id, name, email, address } = req.body;

    if (!cust_id) {
      return res.status(400).json({ message: "Customer ID required" });
    }

    await db.collection("CUSTOMER").doc(cust_id).update({
      name,
      email,
      address
    });

    res.status(200).json({ message: "Profile updated successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;