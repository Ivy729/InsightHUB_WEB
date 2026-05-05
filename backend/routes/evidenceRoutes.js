const express = require("express");
const {
  getEvidenceQueue,
  verifyEvidence,
} = require("../controllers/evidenceController");
const { authenticateJWT, isManager } = require("../middleware/auth");

const router = express.Router();

router.get("/evidence-queue", authenticateJWT, isManager, getEvidenceQueue);
router.put("/verify-evidence/:id", authenticateJWT, isManager, verifyEvidence);

module.exports = router;
