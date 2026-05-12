const express = require("express");
const { submitEvidence, getMyEvidence } = require("../controllers/staffEvidenceController");
const { authenticateJWT, isStaff } = require("../middleware/auth");

const router = express.Router();

router.post("/submit", authenticateJWT, isStaff, submitEvidence);
router.get("/my-evidence", authenticateJWT, isStaff, getMyEvidence);

module.exports = router;