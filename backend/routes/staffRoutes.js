const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const { authenticateJWT } = require("../middleware/auth");

// Get all staff members
router.get("/", authenticateJWT, staffController.getAllStaff);

// Update staff member
router.put("/:id", authenticateJWT, staffController.updateStaff);

// Delete staff member
router.delete("/:id", authenticateJWT, staffController.deleteStaff);

module.exports = router;
