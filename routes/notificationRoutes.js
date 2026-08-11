const express = require("express");
const router = express.Router();
const db = require("../config/firebase");

// Get Notifications by Customer
router.get("/:cust_id", async (req, res) => {
  try {
    const { cust_id } = req.params;

    const snapshot = await db.collection("NOTIFICATION")
      .where("cust_id", "==", cust_id)
      .get();

    const notifications = [];

    snapshot.forEach(doc => {
      notifications.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(notifications);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Mark Notification As Read
router.put("/read/:notification_id", async (req, res) => {
  try {
    const { notification_id } = req.params;

    const notificationDoc = await db.collection("NOTIFICATION")
      .doc(notification_id)
      .get();

    if (!notificationDoc.exists) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    await db.collection("NOTIFICATION")
      .doc(notification_id)
      .update({
        isRead: true
      });

    res.status(200).json({
      message: "Notification marked as read"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// =======================
// Provider Notifications
// =======================
router.get("/provider/:provider_id", async (req, res) => {

  try {

    const { provider_id } = req.params

    const snapshot = await db.collection("NOTIFICATION")
      .where("provider_id", "==", provider_id)
      .orderBy("createdAt", "desc")
      .get()

    const notifications = []

    snapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      })
    })

    res.json(notifications)

  } catch (error) {

    res.status(500).json({ error: error.message })

  }

})
module.exports = router;