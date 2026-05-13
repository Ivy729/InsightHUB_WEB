const mongoose = require("mongoose");
const Evidence = require("../models/Evidence");
const Kpi = require("../models/Kpi");
const User = require("../models/User");
const { createNotification } = require("./notificationController");
const { addProgressHistoryEntry } = require("../utils/progressHistory");
const { calculateStatus } = require("./kpiController");
const {
  getManagerScope,
  getDepartmentStaffObjectIds,
} = require("../utils/managerScope");

const getEvidenceQueue = async (req, res) => {
  try {
    const scope = await getManagerScope(req.user.userId);
    if (!scope.ok) {
      return res.status(scope.status).json({ message: scope.message });
    }
    const staffIds = await getDepartmentStaffObjectIds(scope.department);

    const pendingEvidence = await Evidence.find({
      status: "pending",
      staffId: { $in: staffIds },
    })
      .select("kpiId staffId submittedAt status originalFileName managerDownloadedAt")
      .populate("kpiId", "title")
      .populate("staffId", "name")
      .sort({ submittedAt: 1 })
      .lean();

    const payload = pendingEvidence.map((row) => ({
      ...row,
      managerDownloadConsumed: Boolean(row.managerDownloadedAt),
    }));

    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/** One-time file payload for managers (tracks managerDownloadedAt). */
const downloadEvidenceFile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid evidence ID" });
    }

    const scope = await getManagerScope(req.user.userId);
    if (!scope.ok) {
      return res.status(scope.status).json({ message: scope.message });
    }
    const staffIds = await getDepartmentStaffObjectIds(scope.department);
    const allowed = new Set(staffIds.map((x) => String(x)));

    const evidence = await Evidence.findById(id).select(
      "staffId fileUrl originalFileName status managerDownloadedAt"
    );
    if (!evidence) {
      return res.status(404).json({ message: "Evidence not found" });
    }
    if (!allowed.has(String(evidence.staffId))) {
      return res.status(403).json({ message: "You can only access evidence from your department." });
    }
    if (String(evidence.status || "") !== "pending") {
      return res.status(400).json({ message: "Evidence is no longer pending." });
    }
    if (evidence.managerDownloadedAt) {
      return res.status(403).json({
        message: "This evidence file was already downloaded and cannot be downloaded again.",
      });
    }

    evidence.managerDownloadedAt = new Date();
    await evidence.save();

    return res.status(200).json({
      fileUrl: evidence.fileUrl,
      originalFileName: evidence.originalFileName || "evidence",
    });
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

    const scope = await getManagerScope(req.user.userId);
    if (!scope.ok) {
      return res.status(scope.status).json({ message: scope.message });
    }
    const staffIds = await getDepartmentStaffObjectIds(scope.department);
    const allowed = new Set(staffIds.map((x) => String(x)));

    const evidence = await Evidence.findById(id);
    if (!evidence) {
      return res.status(404).json({ message: "Evidence not found" });
    }
    if (!allowed.has(String(evidence.staffId))) {
      return res.status(403).json({ message: "You can only verify evidence from your department." });
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
      actionType: status === "approved" ? "evidence-approved" : "evidence-rejected",
      message: `Your evidence for "${kpiTitle}" has been ${status}.`,
    });

    if (status === "approved") {
      const fullKpi = await Kpi.findById(evidence.kpiId);
      if (fullKpi) {
        const steps = (fullKpi.taskSteps || [])
          .map((s) => String(s || "").trim())
          .filter(Boolean);
        const update = { status: "achieved", progress: 100 };
        if (steps.length > 0) {
          update.taskStepDone = steps.map(() => true);
        }
        await Kpi.findByIdAndUpdate(evidence.kpiId, update);
      }
    } else if (status === "rejected") {
      const kpiDoc = await Kpi.findById(evidence.kpiId).lean();
      if (kpiDoc) {
        const steps = (kpiDoc.taskSteps || [])
          .map((s) => String(s || "").trim())
          .filter(Boolean);
        const taskStepDone = steps.length > 0 ? steps.map(() => false) : [];
        const nextProgress = 0;
        const nextStatus = calculateStatus(nextProgress, kpiDoc.deadline);
        await Kpi.findByIdAndUpdate(evidence.kpiId, {
          progress: nextProgress,
          taskStepDone,
          status: nextStatus,
        });
      }
    }

    await addProgressHistoryEntry({
      staffId: evidence.staffId,
      kpiId: evidence.kpiId,
      kpiTitle: kpiTitle,
      kind: status === "approved" ? "evidence_approved" : "evidence_rejected",
      headline:
        status === "approved"
          ? `Evidence approved: ${evidence.originalFileName || "file"}`
          : `Evidence rejected: ${evidence.originalFileName || "file"}`,
      detail: status === "rejected" ? "KPI progress was reset to 0%." : "",
      progressPercent: status === "approved" ? 100 : status === "rejected" ? 0 : null,
    });

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
  downloadEvidenceFile,
  verifyEvidence,
};
