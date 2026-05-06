const express = require("express");
const Kpi = require("../models/Kpi");
const { requireAuth, requireRole } = require("../middleware/auth");
const User = require("../models/User");
const Notification = require("../models/Notification");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const kpis = await Kpi.find().sort({ createdAt: -1 });
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newKpi = await Kpi.create(req.body);

    const ownerRaw = String(newKpi.owner || "").trim();
    if (ownerRaw) {
      const ownerNorm = ownerRaw.toLowerCase();
      const user =
        (await User.findOne({ email: ownerNorm })) ||
        (await User.findOne({ name: new RegExp(`^${ownerRaw}$`, "i") }));

      if (user) {
        const dueText = newKpi.deadline
          ? ` · Due ${new Date(newKpi.deadline).toLocaleDateString()}`
          : "";
        await Notification.create({
          userId: user._id,
          type: "primary",
          text: "New KPI Assigned",
          sub: `${newKpi.title}${dueText}`,
          meta: { kpiId: newKpi._id },
        });
      }
    }

    res.status(201).json(newKpi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put(
  "/:id/progress",
  requireAuth,
  requireRole("staff"),
  async (req, res) => {
    try {
      const progress = Number(req.body.progress);
      if (Number.isNaN(progress) || progress < 0 || progress > 100) {
        return res
          .status(400)
          .json({ message: "Progress must be a number between 0 and 100" });
      }

      const kpi = await Kpi.findById(req.params.id);
      if (!kpi) return res.status(404).json({ message: "KPI not found" });

      const owner = String(kpi.owner || "").trim().toLowerCase();
      const userName = String(req.user.name || "").trim().toLowerCase();
      const userEmail = String(req.user.email || "").trim().toLowerCase();

      if (owner && owner !== userName && owner !== userEmail) {
        return res.status(403).json({ message: "Forbidden" });
      }

      kpi.progress = progress;
      await kpi.save();
      return res.json(kpi);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;
