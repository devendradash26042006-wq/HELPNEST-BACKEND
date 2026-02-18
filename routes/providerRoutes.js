const express = require("express");
const router = express.Router();
const db = require("../config/firebase");

// Add Service Provider
router.post("/add", async (req, res) => {
  try {
    const { sp_id, name, phone, category_id, rating } = req.body;

    if (!sp_id || !name || !phone || !category_id) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    await db.collection("SERVICE_PROVIDER").doc(sp_id).set({
      name,
      phone,
      category_id,
      rating: rating || 0
    });

    res.status(201).json({ message: "Service Provider added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get Providers by Category
router.get("/category/:category_id", async (req, res) => {
  try {
    const { category_id } = req.params;

    const snapshot = await db.collection("SERVICE_PROVIDER")
      .where("category_id", "==", category_id)
      .get();

    const providers = [];

    snapshot.forEach(doc => {
      providers.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(providers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get Provider Detail
router.get("/:sp_id", async (req, res) => {
  try {
    const { sp_id } = req.params;

    const doc = await db.collection("SERVICE_PROVIDER")
      .doc(sp_id)
      .get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
