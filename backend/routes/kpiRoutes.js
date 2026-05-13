const express = require("express");
const kpiController = require("../controllers/kpiController");
const Kpi = require("../models/Kpi");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

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
      const progress = Number(req.body.progress);
      if (Number.isNaN(progress) || progress < 0 || progress > 100) {
        return res
          .status(400)
          .json({ message: "Progress must be a number between 0 and 100" });
      }

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

      kpi.progress = progress;
      await kpi.save();
      return res.json(kpi);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;
