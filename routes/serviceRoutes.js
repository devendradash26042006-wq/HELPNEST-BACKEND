const express = require("express");
const router = express.Router();
const db = require("../config/firebase");

// Add Service
router.post("/add", async (req, res) => {
  try {
    const { service_id, category_id, service_name, price } = req.body;

    if (!service_id || !category_id || !service_name || !price) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    await db.collection("SERVICE").doc(service_id).set({
      category_id,
      service_name,
      price,
    });

    res.status(201).json({ message: "Service added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// GET services by category
router.get("/category/:category_id", async (req, res) => {
  try {
    const { category_id } = req.params;

    const snapshot = await db.collection("SERVICE")
      .where("category_id", "==", category_id)
      .get();

    const services = [];

    snapshot.forEach(doc => {
      services.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(services);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;



