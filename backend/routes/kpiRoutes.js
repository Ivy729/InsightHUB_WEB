const express = require("express");
const Kpi = require("../models/Kpi");

const router = express.Router();

// GET all KPIs
router.get("/", async (req, res) => {
  try {
    const kpis = await Kpi.find().sort({ createdAt: -1 });
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new KPI
router.post("/", async (req, res) => {
  try {
    const newKpi = await Kpi.create(req.body);
    res.status(201).json(newKpi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET single KPI by ID
router.get("/:id", async (req, res) => {
  try {
    const kpi = await Kpi.findById(req.params.id);
    if (!kpi) {
      return res.status(404).json({ message: "KPI not found" });
    }
    res.json(kpi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update KPI by ID
router.put("/:id", async (req, res) => {
  try {
    const kpi = await Kpi.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!kpi) {
      return res.status(404).json({ message: "KPI not found" });
    }
    res.json(kpi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE KPI by ID
router.delete("/:id", async (req, res) => {
  try {
    const kpi = await Kpi.findByIdAndDelete(req.params.id);
    if (!kpi) {
      return res.status(404).json({ message: "KPI not found" });
    }
    res.json({ message: "KPI deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
