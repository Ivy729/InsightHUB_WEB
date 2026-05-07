const Kpi = require("../models/Kpi");

// Function to calculate KPI status based on progress and deadline
const calculateStatus = (progress, deadline) => {
  // Achieved: progress == 100
  if (progress === 100) {
    return "achieved";
  }

  // Check if deadline has passed
  if (deadline) {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only
    deadlineDate.setHours(0, 0, 0, 0);

    // Overdue: current date > deadline AND progress < 100
    if (today > deadlineDate && progress < 100) {
      return "overdue";
    }
  }

  // In Progress: progress > 0 AND progress < 100
  if (progress > 0 && progress < 100) {
    return "in-progress";
  }

  // Pending: progress == 0
  if (progress === 0) {
    return "pending";
  }

  return "pending"; // Default fallback
};

// GET all KPIs
exports.getAllKpis = async (req, res) => {
  try {
    const kpis = await Kpi.find().sort({ createdAt: -1 });
    
    // Recalculate status for each KPI before returning
    const updatedKpis = kpis.map(kpi => {
      const status = calculateStatus(kpi.progress, kpi.deadline);
      return { ...kpi.toObject(), status };
    });
    
    res.json(updatedKpis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST create new KPI
exports.createKpi = async (req, res) => {
  try {
    const { progress, deadline, ...rest } = req.body;
    
    // Calculate status based on progress and deadline
    const status = calculateStatus(progress || 0, deadline);
    
    const newKpi = await Kpi.create({
      ...rest,
      progress: progress || 0,
      deadline,
      status,
    });
    
    res.status(201).json(newKpi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET single KPI by ID
exports.getKpiById = async (req, res) => {
  try {
    const kpi = await Kpi.findById(req.params.id);
    if (!kpi) {
      return res.status(404).json({ message: "KPI not found" });
    }
    
    // Recalculate status before returning
    const status = calculateStatus(kpi.progress, kpi.deadline);
    const kpiWithStatus = { ...kpi.toObject(), status };
    
    res.json(kpiWithStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT update KPI by ID
exports.updateKpi = async (req, res) => {
  try {
    const { progress, deadline, ...rest } = req.body;
    
    // Get current KPI to preserve existing values if not provided
    const currentKpi = await Kpi.findById(req.params.id);
    if (!currentKpi) {
      return res.status(404).json({ message: "KPI not found" });
    }
    
    // Calculate status based on new or existing progress and deadline
    const newProgress = progress !== undefined ? progress : currentKpi.progress;
    const newDeadline = deadline !== undefined ? deadline : currentKpi.deadline;
    const status = calculateStatus(newProgress, newDeadline);
    
    const kpi = await Kpi.findByIdAndUpdate(
      req.params.id,
      {
        ...rest,
        progress: newProgress,
        deadline: newDeadline,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    
    res.json(kpi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE KPI by ID
exports.deleteKpi = async (req, res) => {
  try {
    const kpi = await Kpi.findByIdAndDelete(req.params.id);
    if (!kpi) {
      return res.status(404).json({ message: "KPI not found" });
    }
    res.json({ message: "KPI deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
