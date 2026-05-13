const express = require("express");
const kpiController = require("../controllers/kpiController");
const Kpi = require("../models/Kpi");
const { requireAuth, requireRole } = require("../middleware/auth");
const { attachActorUser } = require("../middleware/attachActorUser");
const { addProgressHistoryEntry } = require("../utils/progressHistory");

function normalizeTaskStepDone(existing, stepsLen) {
  const arr = Array.isArray(existing) ? existing.map(Boolean) : [];
  const out = [];
  for (let i = 0; i < stepsLen; i += 1) {
    out.push(Boolean(arr[i]));
  }
  return out;
}

function progressFromTaskStepDone(taskStepDone, stepsLen) {
  if (!stepsLen) return 0;
  const done = (Array.isArray(taskStepDone) ? taskStepDone : []).filter(Boolean).length;
  return Math.round((done / stepsLen) * 100);
}

const router = express.Router();

router.use(attachActorUser);

router.get("/", kpiController.getAllKpis);
router.post("/", kpiController.createKpi);
router.get("/:id", kpiController.getKpiById);
router.put("/:id", kpiController.updateKpi);
router.delete("/:id", kpiController.deleteKpi);

router.put(
  "/:id/progress",
  requireAuth,
  requireRole("staff"),
  async (req, res) => {
    try {
      const kpi = await Kpi.findById(req.params.id);
      if (!kpi) return res.status(404).json({ message: "KPI not found" });

      const owner = String(kpi.owner || "").trim().toLowerCase();
      const staffField = String(kpi.staff || "").trim().toLowerCase();
      const userName = String(req.user.name || "").trim().toLowerCase();
      const userEmail = String(req.user.email || "").trim().toLowerCase();

      const allowed =
        (owner && (owner === userName || owner === userEmail)) ||
        (staffField && (staffField === userName || staffField === userEmail));

      if (!allowed) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const steps = (kpi.taskSteps || [])
        .map((s) => String(s || "").trim())
        .filter(Boolean);
      const n = steps.length;

      let progress;

      if (n > 0) {
        if (!Array.isArray(req.body.taskStepDone)) {
          return res.status(400).json({
            message: "This KPI uses task steps; send taskStepDone as an array of booleans.",
          });
        }
        const normalized = normalizeTaskStepDone(req.body.taskStepDone, n);
        progress = progressFromTaskStepDone(normalized, n);
        kpi.taskStepDone = normalized;
      } else {
        progress = Number(req.body.progress);
        if (Number.isNaN(progress) || progress < 0 || progress > 100) {
          return res
            .status(400)
            .json({ message: "Progress must be a number between 0 and 100" });
        }
      }

      kpi.progress = progress;
      const achievement = String(req.body.achievement || "").trim();
      const note = String(req.body.note || "").trim();
      const updatedOn = String(req.body.updatedOn || "").trim();
      const headline =
        achievement || `Progress updated to ${progress}%`;
      const detailParts = [];
      if (note) detailParts.push(note);
      if (updatedOn) detailParts.push(`As of ${updatedOn}`);
      const mergedDetail = detailParts.join(" · ");
      await kpi.save();

      await addProgressHistoryEntry({
        staffId: req.user._id,
        kpiId: kpi._id,
        kpiTitle: kpi.title || "",
        kind: "progress_update",
        headline,
        detail: mergedDetail,
        progressPercent: progress,
      });

      return res.json(kpi);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;
