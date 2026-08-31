const express = require("express");
const router = express.Router();
const db = require("../config/firebase");
const verifyToken = require("../middleware/authMiddleware");


// Add Review
router.post("/add", verifyToken, async (req, res) => {
  try {
    const { review_id, booking_id, rating, comments } = req.body;

    if (!review_id || !booking_id || !rating) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Get booking
    const bookingDoc = await db.collection("BOOKING").doc(booking_id).get();

    if (!bookingDoc.exists) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const bookingData = bookingDoc.data();

    // Allow review only after completion
    if (bookingData.status !== "Completed") {
      return res.status(400).json({
        message: "Review allowed only after service completion"
      });
    }

    const sp_id = bookingData.sp_id;

    // Prevent duplicate review
    const existingReview = await db.collection("REVIEW")
      .where("booking_id", "==", booking_id)
      .get();

    if (!existingReview.empty) {
      return res.status(400).json({
        message: "Review already submitted"
      });
    }

    // Save review
    await db.collection("REVIEW").doc(review_id).set({
      booking_id,
      sp_id,
      rating,
      comments,
      createdAt: new Date().toISOString()
    });

    // Recalculate provider rating
    const reviewSnapshot = await db.collection("REVIEW")
      .where("sp_id", "==", sp_id)
      .get();

    let total = 0;
    let count = 0;

    reviewSnapshot.forEach(doc => {
      total += doc.data().rating;
      count++;
    });

    const averageRating = total / count;

    await db.collection("SERVICE_PROVIDER").doc(sp_id).update({
      rating: parseFloat(averageRating.toFixed(1))
    });

    res.status(201).json({
      message: "Review submitted successfully"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;