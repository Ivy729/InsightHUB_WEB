const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const { authenticateJWT, isManager } = require("../middleware/auth");

// Get all staff members (manager only, scoped by manager's department)
router.get("/", authenticateJWT, isManager, staffController.getAllStaff);

// Update staff member
router.put("/:id", authenticateJWT, isManager, staffController.updateStaff);

// Delete staff member
router.delete("/:id", authenticateJWT, isManager, staffController.deleteStaff);

module.exports = router;
