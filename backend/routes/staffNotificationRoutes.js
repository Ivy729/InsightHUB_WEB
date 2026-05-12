const express = require("express");
const router = express.Router();
const {
  getStaffNotifications,
  markStaffNotificationRead,
  markAllStaffNotificationsRead,
} = require("../controllers/notificationController");
const { authenticateJWT, isStaff } = require("../middleware/auth");

router.get("/", authenticateJWT, isStaff, getStaffNotifications);
router.put("/:id/read", authenticateJWT, isStaff, markStaffNotificationRead);
router.put("/read-all", authenticateJWT, isStaff, markAllStaffNotificationsRead);

module.exports = router;