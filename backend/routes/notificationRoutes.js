const express = require("express");
const {
  getManagerNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notificationController");
const { authenticateJWT, isManager } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateJWT, isManager, getManagerNotifications);
router.put("/:id/read", authenticateJWT, isManager, markNotificationRead);
router.put("/read-all", authenticateJWT, isManager, markAllNotificationsRead);

module.exports = router;
