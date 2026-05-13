const express = require("express");
const {
  getEvidenceQueue,
  downloadEvidenceFile,
  verifyEvidence,
} = require("../controllers/evidenceController");
const { authenticateJWT, isManager } = require("../middleware/auth");

const router = express.Router();

router.get("/evidence-queue", authenticateJWT, isManager, getEvidenceQueue);
router.get("/evidence/:id/download", authenticateJWT, isManager, downloadEvidenceFile);
router.put("/verify-evidence/:id", authenticateJWT, isManager, verifyEvidence);

module.exports = router;
