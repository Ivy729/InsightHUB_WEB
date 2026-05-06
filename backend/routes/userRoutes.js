const express = require("express");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const uploadsDir = path.resolve(__dirname, "..", "uploads");
const avatarDir = path.resolve(uploadsDir, "avatars");
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").slice(0, 10) || "";
    const unique = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(png|jpeg|jpg|webp|gif)$/.test(file.mimetype);
    cb(ok ? null : new Error("Only image files are allowed"), ok);
  },
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

router.post(
  "/me/avatar",
  requireAuth,
  avatarUpload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Avatar file is required" });
      }

      const nextPath = `/uploads/avatars/${req.file.filename}`;

      const updated = await User.findByIdAndUpdate(
        req.user._id,
        { avatarPath: nextPath },
        { new: true }
      ).select("-password");

      return res.status(200).json({
        message: "Avatar updated",
        user: updated,
        avatarPath: nextPath,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
);

router.put("/me", requireAuth, async (req, res) => {
  try {
    const firstName = String(req.body.firstName || "").trim();
    const lastName = String(req.body.lastName || "").trim();
    const phone = String(req.body.phone || "").trim();
    const department = String(req.body.department || "").trim();
    const position = String(req.body.position || "").trim();

    if (!firstName || !lastName) {
      return res
        .status(400)
        .json({ message: "First name and last name are required" });
    }

    const name = `${firstName} ${lastName}`.trim();

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, name, phone, department, position },
      { new: true }
    ).select("-password");

    return res.json({ message: "Profile updated", user: updated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/me/settings", requireAuth, async (req, res) => {
  try {
    const timeFormat = req.body.timeFormat === "24h" ? "24h" : "12h";

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { "settings.timeFormat": timeFormat },
      { new: true }
    ).select("-password");

    return res.json({ message: "Settings updated", user: updated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/me/password", requireAuth, async (req, res) => {
  try {
    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const userWithPassword = await User.findById(req.user._id);
    const ok = await bcrypt.compare(currentPassword, userWithPassword.password);
    if (!ok) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    userWithPassword.password = await bcrypt.hash(newPassword, 10);
    await userWithPassword.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;

