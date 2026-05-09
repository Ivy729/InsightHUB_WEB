const Notification = require("../models/Notification");
const Evidence = require("../models/Evidence");
const Kpi = require("../models/Kpi");

const createNotification = async ({ staffId = null, staffName = null, kpiId = null, kpiTitle = null, actionType, message, meta = {} }) => {
  return Notification.create({
    staffId,
    staffName,
    kpiId,
    kpiTitle,
    actionType,
    message,
    meta,
    read: false,
  });
};

const syncPendingEvidenceReminder = async () => {
  const pendingCount = await Evidence.countDocuments({ status: "pending" });
  const reminder = await Notification.findOne({ actionType: "pending-evidence" });

  if (pendingCount === 0) {
    if (reminder) {
      await reminder.deleteOne();
    }
    return;
  }

  const message = `You have ${pendingCount} evidence waiting for verification.`;

  if (!reminder) {
    await createNotification({
      actionType: "pending-evidence",
      message,
      meta: { pendingCount },
    });
    return;
  }

  if (reminder.message !== message) {
    reminder.message = message;
    reminder.read = false;
    reminder.meta = { pendingCount };
    await reminder.save();
  }
};

const syncOverdueKpiAlerts = async () => {
  const overdueKpis = await Kpi.find({ status: "overdue", notifiedOverdue: { $ne: true } });
  if (!overdueKpis.length) {
    return;
  }

  for (const kpi of overdueKpis) {
    const message = `${kpi.title} is overdue for ${kpi.staff || "staff"}.`;
    await createNotification({
      kpiId: kpi._id,
      staffName: kpi.staff,
      kpiTitle: kpi.title,
      actionType: "kpi-overdue",
      message,
      meta: { deadline: kpi.deadline },
    });
    kpi.notifiedOverdue = true;
    await kpi.save();
  }
};

exports.getManagerNotifications = async (req, res) => {
  try {
    await syncPendingEvidenceReminder();
    await syncOverdueKpiAlerts();

    const notifications = await Notification.find()
      .sort({ read: 1, createdAt: -1 })
      .lean();

    res.json(notifications);
  } catch (error) {
    console.error("Notification fetch error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany({ read: false }, { read: true });
    res.json({ message: "All notifications marked as read", modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createNotification = createNotification;
