const Evidence = require("../models/Evidence");
const Notification = require("../models/Notification");
const Kpi = require("../models/Kpi");
const User = require("../models/User");

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
    const { kpiId, fileUrl, originalFileName, staffNotes } = req.body;
    const staffId = req.user.userId;

    if (!kpiId || !fileUrl) {
      return res.status(400).json({ message: "KPI ID and file are required." });
    }

    const evidence = await Evidence.create({
      kpiId,
      staffId,
      fileUrl,
      originalFileName: originalFileName || "",
      staffNotes: staffNotes || "",
      status: "pending",
    });

    // Populate staff and KPI info for notification
    const kpi = await Kpi.findById(kpiId).select("title");
    const staff = await User.findById(staffId).select("name");

    const staffName = staff?.name || "Staff";
    const kpiTitle = kpi?.title || "KPI";

    await createNotification({
      staffId,
      staffName,
      kpiId,
      kpiTitle,
      actionType: "evidence-submitted",
      message: `${staffName} submitted evidence for ${kpiTitle}.`,
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