const express = require("express");
const kpiController = require("../controllers/kpiController");

const router = express.Router();

// GET all KPIs
router.get("/", kpiController.getAllKpis);

// POST create new KPI
router.post("/", kpiController.createKpi);

// GET single KPI by ID
router.get("/:id", kpiController.getKpiById);

// PUT update KPI by ID
router.put("/:id", kpiController.updateKpi);

// DELETE KPI by ID
router.delete("/:id", kpiController.deleteKpi);

module.exports = router;
