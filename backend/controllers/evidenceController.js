const mongoose = require("mongoose");
const Evidence = require("../models/Evidence");
const Kpi = require("../models/Kpi");
const User = require("../models/User");              
const { createNotification } = require("./notificationController");

const getEvidenceQueue = async (req, res) => {
  try {
    const pendingEvidence = await Evidence.find({ status: "pending" })
      .populate("kpiId", "title")
      .populate("staffId", "name")
      .sort({ submittedAt: 1 });

    return res.status(200).json(pendingEvidence);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const verifyEvidence = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid evidence ID" });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be either 'approved' or 'rejected'" });
    }

    const evidence = await Evidence.findById(id);
    if (!evidence) {
      return res.status(404).json({ message: "Evidence not found" });
    }

    evidence.status = status;
    await evidence.save();

    const kpi = await Kpi.findById(evidence.kpiId).select("title");
    const staffUser = await User.findById(evidence.staffId).select("name");
    const staffName = staffUser?.name || "Staff";
    const kpiTitle = kpi?.title || "KPI";

    await createNotification({
      staffId: evidence.staffId,
      staffName,
      kpiId: evidence.kpiId,
      kpiTitle,
      actionType: status === 'approved' ? 'evidence-approved' : 'evidence-rejected',
      message: `Your evidence for "${kpiTitle}" has been ${status}.`,
    });

    if (status === "approved") {
      await Kpi.findByIdAndUpdate(evidence.kpiId, {
        status: "completed",
        progress: 100,
      });
    }

    return res.status(200).json({
      message: `Evidence ${status} successfully`,
      evidence,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEvidenceQueue,
  verifyEvidence,
};
