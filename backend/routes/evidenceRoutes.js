const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Evidence = require("../models/Evidence");
const Kpi = require("../models/Kpi");
const Notification = require("../models/Notification");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

const uploadsDir = path.resolve(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeBase = String(file.originalname || "upload")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 120);
    const unique = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}_${safeBase}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get("/mine", requireAuth, requireRole("staff"), async (req, res) => {
  try {
    const items = await Evidence.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post(
  "/",
  requireAuth,
  requireRole("staff"),
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "File is required" });
      }

      const kpiId = req.body.kpiId ? String(req.body.kpiId) : null;
      let kpiTitle = String(req.body.kpiTitle || "").trim();
      const evidenceType = String(req.body.evidenceType || "Document").trim();
      const notes = String(req.body.notes || "").trim();

      if (kpiId && !kpiTitle) {
        const kpi = await Kpi.findById(kpiId);
        if (kpi) kpiTitle = kpi.title;
      }

      if (!kpiTitle) {
        return res.status(400).json({ message: "KPI is required" });
      }

      const created = await Evidence.create({
        userId: req.user._id,
        kpiId: kpiId || undefined,
        kpiTitle,
        evidenceType,
        notes,
        file: {
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: `/uploads/${req.file.filename}`,
        },
      });

      await Notification.create({
        userId: req.user._id,
        type: "primary",
        text: "Evidence Submitted",
        sub: `${kpiTitle} · Just now`,
        meta: { evidenceId: created._id, kpiId: kpiId || null },
      });

      return res.status(201).json(created);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;

