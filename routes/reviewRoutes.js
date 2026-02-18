const express = require("express");
const router = express.Router();
const db = require("../config/firebase");

// Add Review
router.post("/add", async (req, res) => {
  try {
    const { review_id, booking_id, rating, comments } = req.body;

    if (!review_id || !booking_id || !rating) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    await db.collection("REVIEW").doc(review_id).set({
      booking_id,
      rating,
      comments: comments || ""
    });

    res.status(201).json({ message: "Review added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
