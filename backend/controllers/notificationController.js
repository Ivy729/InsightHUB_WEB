const Notification = require("../models/Notification");
const Evidence = require("../models/Evidence");
const Kpi = require("../models/Kpi");
const User = require("../models/User");
const {
  getManagerScope,
  getDepartmentStaffObjectIds,
} = require("../utils/managerScope");

/** Shown only in manager notification dropdown */
const MANAGER_NOTIFICATION_ACTIONS = new Set([
  "evidence-submitted",
  "progress-updated",
  "kpi-completed",
  "kpi-overdue",
  "pending-evidence",
]);

/** Shown only in staff notification dropdown */
const STAFF_NOTIFICATION_ACTIONS = new Set(["evidence-approved", "evidence-rejected", "kpi-assigned"]);

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
    const scope = await getManagerScope(req.user.userId);
    if (!scope.ok) {
      return res.status(scope.status).json({ message: scope.message });
    }

    const staffIds = await getDepartmentStaffObjectIds(scope.department);
    const staffIdStr = new Set(staffIds.map((id) => String(id)));
    const staffUsers = await User.find({ _id: { $in: staffIds } })
      .select("name email")
      .lean();
    const nameLower = new Set();
    for (const s of staffUsers) {
      if (s.name) nameLower.add(String(s.name).trim().toLowerCase());
      if (s.email) nameLower.add(String(s.email).trim().toLowerCase());
    }

    const notifications = await Notification.find()
      .sort({ read: 1, createdAt: -1 })
      .lean();

    const filtered = notifications.filter((n) => {
      if (!MANAGER_NOTIFICATION_ACTIONS.has(n.actionType)) return false;
      if (n.actionType === "pending-evidence") return true;
      if (n.staffId && staffIdStr.has(String(n.staffId))) return true;
      const sn = String(n.staffName || "").trim().toLowerCase();
      if (sn && nameLower.has(sn)) return true;
      return false;
    });

    res.json(filtered);
  } catch (error) {
    console.error("Notification fetch error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const scope = await getManagerScope(req.user.userId);
    if (!scope.ok) {
      return res.status(scope.status).json({ message: scope.message });
    }
    const staffIds = await getDepartmentStaffObjectIds(scope.department);
    const staffIdStr = new Set(staffIds.map((x) => String(x)));
    const staffUsers = await User.find({ _id: { $in: staffIds } })
      .select("name email")
      .lean();
    const nameLower = new Set();
    for (const s of staffUsers) {
      if (s.name) nameLower.add(String(s.name).trim().toLowerCase());
      if (s.email) nameLower.add(String(s.email).trim().toLowerCase());
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    if (!MANAGER_NOTIFICATION_ACTIONS.has(notification.actionType)) {
      return res.status(404).json({ message: "Notification not found" });
    }
    const ok =
      notification.actionType === "pending-evidence" ||
      (notification.staffId && staffIdStr.has(String(notification.staffId))) ||
      (notification.staffName &&
        nameLower.has(String(notification.staffName).trim().toLowerCase()));
    if (!ok) {
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
    const scope = await getManagerScope(req.user.userId);
    if (!scope.ok) {
      return res.status(scope.status).json({ message: scope.message });
    }
    const staffIds = await getDepartmentStaffObjectIds(scope.department);
    const staffIdStr = new Set(staffIds.map((x) => String(x)));
    const staffUsers = await User.find({ _id: { $in: staffIds } })
      .select("name email")
      .lean();
    const nameLower = new Set();
    for (const s of staffUsers) {
      if (s.name) nameLower.add(String(s.name).trim().toLowerCase());
      if (s.email) nameLower.add(String(s.email).trim().toLowerCase());
    }

    const unread = await Notification.find({ read: false }).lean();
    const allowedIds = unread
      .filter((n) => {
        if (!MANAGER_NOTIFICATION_ACTIONS.has(n.actionType)) return false;
        if (n.actionType === "pending-evidence") return true;
        if (n.staffId && staffIdStr.has(String(n.staffId))) return true;
        const sn = String(n.staffName || "").trim().toLowerCase();
        return sn && nameLower.has(sn);
      })
      .map((n) => n._id);

    const result = await Notification.updateMany(
      { _id: { $in: allowedIds }, read: false },
      { read: true }
    );
    res.json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStaffNotifications = async (req, res) => {
  try {
    const staffId = req.user.userId;
    const notifications = await Notification.find({
      staffId,
      actionType: { $in: [...STAFF_NOTIFICATION_ACTIONS] },
    })
      .sort({ read: 1, createdAt: -1 })
      .lean();
    res.json(notifications);
  } catch (error) {
    console.error("Staff notification fetch error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.markStaffNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const staffId = req.user.userId;
    const notification = await Notification.findOne({
      _id: id,
      staffId,
      actionType: { $in: [...STAFF_NOTIFICATION_ACTIONS] },
    });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    notification.read = true;
    await notification.save();
    res.json({ message: "Marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAllStaffNotificationsRead = async (req, res) => {
  try {
    const staffId = req.user.userId;
    const result = await Notification.updateMany(
      { staffId, read: false, actionType: { $in: [...STAFF_NOTIFICATION_ACTIONS] } },
      { read: true }
    );
    res.json({ message: "All marked as read", modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createNotification = createNotification;
