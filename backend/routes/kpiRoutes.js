const express = require("express");
const Kpi = require("../models/Kpi");

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
    res.status(201).json(newKpi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
