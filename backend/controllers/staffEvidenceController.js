const Evidence = require("../models/Evidence");
const Notification = require("../models/Notification");
const Kpi = require("../models/Kpi");
const User = require("../models/User");
const { addProgressHistoryEntry } = require("../utils/progressHistory");
const {
  buildAssigneeIdentitySet,
  kpiMatchesAssigneeSet,
} = require("../utils/managerScope");
const {
  fileNameMatchesEvidenceType,
  DEFAULT_EVIDENCE_TYPE,
} = require("../constants/evidenceFileTypes");

const createNotification = async ({ staffId, staffName, kpiId, kpiTitle, actionType, message }) => {
  return Notification.create({
    staffId,
    staffName,
    kpiId,
    kpiTitle,
    actionType,
    message,
    read: false,
  });
};

exports.submitEvidence = async (req, res) => {
  try {
    const { kpiId, fileUrl, originalFileName, staffNotes, evidenceType } = req.body;
    const staffId = req.user.userId;

    if (!kpiId || !fileUrl) {
      return res.status(400).json({ message: "KPI ID and file are required." });
    }

    const typeKey =
      typeof evidenceType === "string" && evidenceType.trim()
        ? evidenceType.trim()
        : DEFAULT_EVIDENCE_TYPE;

    if (!fileNameMatchesEvidenceType(originalFileName, typeKey)) {
      return res.status(400).json({
        message: `This file type is not allowed for "${typeKey}". Choose a file that matches the evidence type you selected.`,
      });
    }

    const staff = await User.findById(staffId).select("name email firstName lastName").lean();
    if (!staff) {
      return res.status(401).json({ message: "Staff profile not found." });
    }

    const kpi = await Kpi.findById(kpiId);
    if (!kpi) {
      return res.status(404).json({ message: "KPI not found." });
    }

    const identitySet = buildAssigneeIdentitySet([staff]);
    if (!kpiMatchesAssigneeSet(kpi, identitySet)) {
      return res.status(403).json({ message: "You can only submit evidence for KPIs assigned to you." });
    }

    const progress = Number(kpi.progress) || 0;
    if (progress < 100) {
      return res.status(400).json({
        message:
          "Evidence can only be submitted when this KPI is at 100% progress. Complete your tasks on Update Progress first.",
      });
    }

    const evidence = await Evidence.create({
      kpiId,
      staffId,
      fileUrl,
      originalFileName: originalFileName || "",
      staffNotes: staffNotes || "",
      status: "pending",
    });

    const staffName = staff?.name || "Staff";
    const kpiTitle = kpi.title || "KPI";

    await createNotification({
      staffId,
      staffName,
      kpiId,
      kpiTitle,
      actionType: "evidence-submitted",
      message: `${staffName} submitted evidence for ${kpiTitle}.`,
    });

    await addProgressHistoryEntry({
      staffId,
      kpiId,
      kpiTitle,
      kind: "evidence_submitted",
      headline: `Evidence submitted: ${originalFileName || "file"}`,
      detail: String(staffNotes || "").trim().slice(0, 500),
      progressPercent: null,
    });

    res.status(201).json({ message: "Evidence submitted successfully", evidence });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyEvidence = async (req, res) => {
  try {
    const staffId = req.user.userId;
    const evidenceList = await Evidence.find({ staffId })
      .populate("kpiId", "title")
      .sort({ submittedAt: -1 });
    res.status(200).json(evidenceList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};