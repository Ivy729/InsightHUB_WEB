const express = require("express");
const Kpi = require("../models/Kpi");
const Evidence = require("../models/Evidence");
const Notification = require("../models/Notification");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

function daysFromNow(date) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = target.getTime() - start.getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const normalizeStored = (doc) => ({
  id: String(doc._id),
  _id: doc._id,
  type: doc.type || "primary",
  text: doc.text,
  sub: doc.sub || "",
  createdAt: doc.createdAt,
  unread: !doc.readAt,
  link: doc.link || "",
});

router.get("/mine", requireAuth, requireRole("staff"), async (req, res) => {
  try {
    const ownerName = String(req.user.name || "").trim().toLowerCase();
    const ownerEmail = String(req.user.email || "").trim().toLowerCase();

    const [allKpis, myEvidence, storedNotifs] = await Promise.all([
      Kpi.find().sort({ createdAt: -1 }).lean(),
      Evidence.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(10).lean(),
      Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(30),
    ]);

    const staffKpis = allKpis.filter((kpi) => {
      const owner = String(kpi.owner || "").trim().toLowerCase();
      return owner && (owner === ownerName || owner === ownerEmail);
    });

    const notifications = storedNotifs.map(normalizeStored);

    for (const kpi of staffKpis) {
      if (!kpi.deadline) continue;
      const deadlineDate = new Date(kpi.deadline);
      if (Number.isNaN(deadlineDate.getTime())) continue;

      const progress = Number(kpi.progress || 0);
      if (progress >= 100) continue;

      const days = daysFromNow(deadlineDate);
      if (days < 0) {
        notifications.push({
          id: `kpi-overdue-${kpi._id}`,
          type: "danger",
          text: "KPI Overdue",
          sub: `${kpi.title} · Due ${deadlineDate.toLocaleDateString()}`,
          createdAt: deadlineDate,
          unread: true,
        });
      } else if (days <= 7) {
        notifications.push({
          id: `kpi-due-soon-${kpi._id}`,
          type: "warning",
          text: "KPI Due Soon",
          sub:
            days === 0
              ? `${kpi.title} · Due today`
              : `${kpi.title} · Due in ${days} day${days > 1 ? "s" : ""}`,
          createdAt: deadlineDate,
          unread: true,
        });
      }
    }

    for (const item of myEvidence) {
      // Evidence events are stored in Notification collection now.
      // Keep this loop empty for backward compatibility if you later remove storage.
    }

    notifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return res.json(notifications.slice(0, 20));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/:id/read", requireAuth, requireRole("staff"), async (req, res) => {
  try {
    const updated = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { readAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.post("/read-all", requireAuth, requireRole("staff"), async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, readAt: null },
      { $set: { readAt: new Date() } }
    );
    return res.json({ ok: true });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;

