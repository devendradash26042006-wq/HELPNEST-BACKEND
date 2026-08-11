const express = require("express");
const router = express.Router();
const db = require("../config/firebase");
const verifyToken = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/roleMiddleware");


// Add Category
router.post("/add", verifyToken, verifyRole("admin"), async (req, res) => {
  try {
    const { category_id, name } = req.body;

    if (!category_id || !name) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    await db.collection("CATEGORY").doc(category_id).set({
      name
    });

    res.status(201).json({ message: "Category added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get All Categories
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("CATEGORY").get();
    const categories = [];

    snapshot.forEach(doc => {
      categories.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;