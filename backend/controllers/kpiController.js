const mongoose = require("mongoose");
const Kpi = require("../models/Kpi");
const Notification = require("../models/Notification");
const { addProgressHistoryEntry } = require("../utils/progressHistory");
const { createNotification } = require("./notificationController");
const {
  getManagerScope,
  buildAssigneeIdentitySet,
  kpiMatchesAssigneeSet,
} = require("../utils/managerScope");

function parseTaskStepsPayload(taskStepsField) {
  if (taskStepsField === undefined || taskStepsField === null) return null;
  if (Array.isArray(taskStepsField)) {
    return taskStepsField.map((s) => String(s || "").trim()).filter(Boolean);
  }
  if (typeof taskStepsField === "string") {
    return taskStepsField.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function normalizeTaskStepDone(existing, stepsLen) {
  const arr = Array.isArray(existing) ? existing.map(Boolean) : [];
  const out = [];
  for (let i = 0; i < stepsLen; i += 1) {
    out.push(Boolean(arr[i]));
  }
  return out;
}

function progressFromTaskStepDone(taskStepDone, stepsLen) {
  if (!stepsLen) return 0;
  const done = (Array.isArray(taskStepDone) ? taskStepDone : []).filter(Boolean).length;
  return Math.round((done / stepsLen) * 100);
}

const calculateStatus = (progress, deadline) => {
  if (progress === 100) {
    return "achieved";
  }

  if (deadline) {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);

    if (today > deadlineDate && progress < 100) {
      return "overdue";
    }
  }

  if (progress > 0 && progress < 100) {
    return "in-progress";
  }

  if (progress === 0) {
    return "pending";
  }

  return "pending";
};

exports.calculateStatus = calculateStatus;

function actorToLeanUser(actor) {
  if (!actor) return null;
  return typeof actor.toObject === "function" ? actor.toObject() : actor;
}

// GET all KPIs — scoped by role (manager: department team, staff: own KPIs)
exports.getAllKpis = async (req, res) => {
  try {
    const actor = req.actor;
    if (!actor) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const role = String(actor.role || "").toLowerCase();
    let filtered;

    if (role === "manager") {
      const scope = await getManagerScope(actor._id);
      if (!scope.ok) {
        return res.status(scope.status).json({ message: scope.message });
      }
      const identitySet = buildAssigneeIdentitySet(scope.staffUsers);
      const kpis = await Kpi.find().sort({ createdAt: -1 });
      filtered = kpis.filter((k) => kpiMatchesAssigneeSet(k, identitySet));
    } else if (role === "staff") {
      const identitySet = buildAssigneeIdentitySet([actorToLeanUser(actor)]);
      const kpis = await Kpi.find().sort({ createdAt: -1 });
      filtered = kpis.filter((k) => kpiMatchesAssigneeSet(k, identitySet));
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedKpis = filtered.map((kpi) => {
      const status = calculateStatus(kpi.progress, kpi.deadline);
      return { ...kpi.toObject(), status };
    });

    res.json(updatedKpis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createKpi = async (req, res) => {
  try {
    const actor = req.actor;
    if (!actor) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (String(actor.role || "").toLowerCase() !== "manager") {
      return res.status(403).json({ message: "Only managers can create KPIs." });
    }

    const scope = await getManagerScope(actor._id);
    if (!scope.ok) {
      return res.status(scope.status).json({ message: scope.message });
    }
    const identitySet = buildAssigneeIdentitySet(scope.staffUsers);
    const {
      progress,
      deadline,
      staffMemberId,
      staff: staffRaw,
      taskSteps: incomingTaskSteps,
      ...rest
    } = req.body;

    let resolvedStaff = String(staffRaw || "").trim();
    let staffUser = null;
    if (staffMemberId != null && mongoose.Types.ObjectId.isValid(String(staffMemberId))) {
      staffUser = scope.staffUsers.find((u) => String(u._id) === String(staffMemberId));
      if (!staffUser) {
        return res.status(400).json({ message: "Invalid staff member selected." });
      }
      resolvedStaff = String(
        staffUser.name || `${staffUser.firstName || ""} ${staffUser.lastName || ""}`.trim()
      ).trim();
    }

    const assignee = resolvedStaff.trim().toLowerCase();
    if (!assignee || !identitySet.has(assignee)) {
      return res.status(403).json({
        message: "KPI can only be assigned to staff in your department.",
      });
    }

    if (!staffUser) {
      staffUser = scope.staffUsers.find((u) => {
        const keys = [
          u.name,
          u.email,
          `${u.firstName || ""} ${u.lastName || ""}`.trim(),
        ]
          .map((x) => String(x || "").trim().toLowerCase())
          .filter(Boolean);
        return keys.includes(assignee);
      });
    }

    const steps = parseTaskStepsPayload(incomingTaskSteps);
    if (!steps.length) {
      return res.status(400).json({
        message: "Add at least one task step (one line per step).",
      });
    }

    const title = String(rest.title || "").trim();
    if (!title) {
      return res.status(400).json({ message: "KPI title is required." });
    }

    const taskStepDone = steps.map(() => false);
    const effectiveProgress = progressFromTaskStepDone(taskStepDone, steps.length);
    const initialStatus = effectiveProgress === 100 ? "achieved" : "pending";

    const newKpi = await Kpi.create({
      title,
      desc: String(rest.desc ?? "").trim(),
      staff: resolvedStaff,
      dept: String(rest.dept ?? "").trim(),
      target: 0,
      taskSteps: steps,
      taskStepDone,
      startDate: rest.startDate != null ? String(rest.startDate) : "",
      owner: rest.owner != null ? String(rest.owner) : "staff",
      progress: effectiveProgress,
      deadline: deadline !== undefined ? deadline : null,
      status: initialStatus,
    });

    if (staffUser && staffUser._id) {
      await addProgressHistoryEntry({
        staffId: staffUser._id,
        kpiId: newKpi._id,
        kpiTitle: newKpi.title || "",
        kind: "kpi_assigned",
        headline: "KPI Assigned",
        detail: "",
        progressPercent: effectiveProgress,
      });
      await createNotification({
        staffId: staffUser._id,
        staffName: resolvedStaff,
        kpiId: newKpi._id,
        kpiTitle: newKpi.title || "KPI",
        actionType: "kpi-assigned",
        message: `You have been assigned a new KPI: "${newKpi.title || "KPI"}".`,
      });
    }

    res.status(201).json(newKpi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getKpiById = async (req, res) => {
  try {
    const actor = req.actor;
    if (!actor) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const kpi = await Kpi.findById(req.params.id);
    if (!kpi) {
      return res.status(404).json({ message: "KPI not found" });
    }

    const role = String(actor.role || "").toLowerCase();
    if (role === "manager") {
      const scope = await getManagerScope(actor._id);
      if (!scope.ok) {
        return res.status(scope.status).json({ message: scope.message });
      }
      const identitySet = buildAssigneeIdentitySet(scope.staffUsers);
      if (!kpiMatchesAssigneeSet(kpi, identitySet)) {
        return res.status(403).json({ message: "KPI not in your department scope." });
      }
    } else if (role === "staff") {
      const identitySet = buildAssigneeIdentitySet([actorToLeanUser(actor)]);
      if (!kpiMatchesAssigneeSet(kpi, identitySet)) {
        return res.status(403).json({ message: "Forbidden" });
      }
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }

    const status = calculateStatus(kpi.progress, kpi.deadline);
    const kpiWithStatus = { ...kpi.toObject(), status };

    res.json(kpiWithStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateKpi = async (req, res) => {
  try {
    const actor = req.actor;
    if (!actor) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (String(actor.role || "").toLowerCase() !== "manager") {
      return res.status(403).json({ message: "Only managers can update KPIs." });
    }

    const scope = await getManagerScope(actor._id);
    if (!scope.ok) {
      return res.status(scope.status).json({ message: scope.message });
    }
    const identitySet = buildAssigneeIdentitySet(scope.staffUsers);

    const currentKpi = await Kpi.findById(req.params.id);
    if (!currentKpi) {
      return res.status(404).json({ message: "KPI not found" });
    }
    if (!kpiMatchesAssigneeSet(currentKpi, identitySet)) {
      return res.status(403).json({ message: "KPI not in your department scope." });
    }

    const {
      progress,
      deadline,
      staffMemberId,
      staff: staffFromBody,
      taskSteps: incomingTaskSteps,
      taskStepDone: incomingTaskStepDone,
      ...rest
    } = req.body;

    let restPatched = { ...rest };
    if (staffMemberId != null && mongoose.Types.ObjectId.isValid(String(staffMemberId))) {
      const u = scope.staffUsers.find((x) => String(x._id) === String(staffMemberId));
      if (!u) {
        return res.status(400).json({ message: "Invalid staff member selected." });
      }
      restPatched.staff = String(
        u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim()
      ).trim();
    } else if (staffFromBody !== undefined) {
      restPatched.staff = staffFromBody;
    }

    const mergedStaff =
      restPatched.staff !== undefined ? restPatched.staff : currentKpi.staff;
    const mergedOwner = restPatched.owner !== undefined ? restPatched.owner : currentKpi.owner;
    const probe = { staff: mergedStaff, owner: mergedOwner };
    if (!kpiMatchesAssigneeSet(probe, identitySet)) {
      return res.status(403).json({
        message: "KPI must stay assigned to staff in your department.",
      });
    }

    if (incomingTaskSteps !== undefined) {
      const parsed = parseTaskStepsPayload(incomingTaskSteps);
      if (!parsed.length) {
        return res.status(400).json({
          message: "Add at least one task step (one line per step).",
        });
      }
      restPatched.taskSteps = parsed;
      restPatched.taskStepDone = normalizeTaskStepDone(
        incomingTaskStepDone !== undefined ? incomingTaskStepDone : currentKpi.taskStepDone,
        parsed.length
      );
    }

    const newDeadline = deadline !== undefined ? deadline : currentKpi.deadline;

    const stepsForProgress =
      incomingTaskSteps !== undefined
        ? restPatched.taskSteps
        : (currentKpi.taskSteps || []).map((s) => String(s || "").trim()).filter(Boolean);
    const doneForProgress =
      incomingTaskSteps !== undefined
        ? restPatched.taskStepDone
        : currentKpi.taskStepDone || [];

    let newProgress;
    if (stepsForProgress.length > 0) {
      newProgress = progressFromTaskStepDone(
        normalizeTaskStepDone(doneForProgress, stepsForProgress.length),
        stepsForProgress.length
      );
    } else {
      const newProgressRaw = progress !== undefined ? progress : currentKpi.progress;
      const newProgressNum = Number(newProgressRaw);
      newProgress = Number.isFinite(newProgressNum)
        ? Math.min(100, Math.max(0, newProgressNum))
        : Number(currentKpi.progress) || 0;
    }

    const status = calculateStatus(newProgress, newDeadline);

    const shouldNotifyOverdue =
      status === "overdue" && currentKpi.status !== "overdue";
    const kpi = await Kpi.findByIdAndUpdate(
      req.params.id,
      {
        ...restPatched,
        progress: newProgress,
        deadline: newDeadline,
        status,
        notifiedOverdue: shouldNotifyOverdue
          ? true
          : currentKpi.notifiedOverdue,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    const staffName = kpi.staff || "Staff";
    const kpiTitle = kpi.title || "KPI";

    if (newProgress !== currentKpi.progress) {
      await Notification.create({
        staffName,
        kpiTitle,
        kpiId: kpi._id,
        actionType: "progress-updated",
        message: `${staffName} updated progress for ${kpiTitle} to ${newProgress}%.`,
      });
    }

    if (status === "achieved" && currentKpi.status !== "achieved") {
      await Notification.create({
        staffName,
        kpiTitle,
        kpiId: kpi._id,
        actionType: "kpi-completed",
        message: `${staffName} completed ${kpiTitle}.`,
      });
    }

    if (shouldNotifyOverdue) {
      await Notification.create({
        staffName,
        kpiTitle,
        kpiId: kpi._id,
        actionType: "kpi-overdue",
        message: `${kpiTitle} is overdue for ${staffName}.`,
        meta: { deadline: newDeadline },
      });
    }

    const prevStaffNorm = String(currentKpi.staff || "").trim().toLowerCase();
    const nextStaffNorm = String(kpi.staff || "").trim().toLowerCase();
    if (prevStaffNorm !== nextStaffNorm) {
      let newAssignee = null;
      if (staffMemberId != null && mongoose.Types.ObjectId.isValid(String(staffMemberId))) {
        newAssignee = scope.staffUsers.find((x) => String(x._id) === String(staffMemberId));
      }
      if (!newAssignee) {
        newAssignee = scope.staffUsers.find((u) => {
          const keys = [
            u.name,
            u.email,
            `${u.firstName || ""} ${u.lastName || ""}`.trim(),
          ]
            .map((x) => String(x || "").trim().toLowerCase())
            .filter(Boolean);
          return keys.includes(nextStaffNorm);
        });
      }
      if (newAssignee && newAssignee._id) {
        await createNotification({
          staffId: newAssignee._id,
          staffName: kpi.staff,
          kpiId: kpi._id,
          kpiTitle,
          actionType: "kpi-assigned",
          message: `You have been assigned to KPI "${kpiTitle}".`,
        });
      }
    }

    res.json(kpi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteKpi = async (req, res) => {
  try {
    const actor = req.actor;
    if (!actor) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (String(actor.role || "").toLowerCase() !== "manager") {
      return res.status(403).json({ message: "Only managers can delete KPIs." });
    }

    const scope = await getManagerScope(actor._id);
    if (!scope.ok) {
      return res.status(scope.status).json({ message: scope.message });
    }
    const identitySet = buildAssigneeIdentitySet(scope.staffUsers);

    const kpi = await Kpi.findById(req.params.id);
    if (!kpi) {
      return res.status(404).json({ message: "KPI not found" });
    }
    if (!kpiMatchesAssigneeSet(kpi, identitySet)) {
      return res.status(403).json({ message: "KPI not in your department scope." });
    }

    await Kpi.findByIdAndDelete(req.params.id);
    res.json({ message: "KPI deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
