const User = require("../models/User");
const Kpi = require("../models/Kpi");
const { getManagerScope } = require("../utils/managerScope");

function isKpiCompleted(k) {
  if (String(k.status || "").toLowerCase() === "achieved") return true;
  const p = Number(k.progress) || 0;
  if (p >= 100) return true;
  const steps = Array.isArray(k.taskSteps)
    ? k.taskSteps.map((s) => String(s || "").trim()).filter(Boolean)
    : [];
  if (steps.length > 0) {
    const done = (Array.isArray(k.taskStepDone) ? k.taskStepDone : []).filter(Boolean).length;
    return done >= steps.length;
  }
  const t = Number(k.target) || 0;
  return t > 0 && p >= t;
}

// Get staff members in the same department as the logged-in manager
exports.getAllStaff = async (req, res) => {
  try {
    const scope = await getManagerScope(req.user.userId);
    if (!scope.ok) {
      return res.status(scope.status).json({ message: scope.message });
    }

    const staffMembers = await User.find({
      role: "staff",
      department: scope.department,
    }).select("-password");

    const enrichedStaff = await Promise.all(
      staffMembers.map(async (staff) => {
        const staffName = staff.name || "";
        const normalizedStaffName = staffName.trim();
        const kpis = await Kpi.find({
          staff: new RegExp(`^${escapeRegExp(normalizedStaffName)}$`, "i"),
        });
        const totalKpis = kpis.length;

        const completedKpis = kpis.filter((k) => isKpiCompleted(k)).length;
        const completionRate =
          totalKpis > 0 ? Math.round((completedKpis / totalKpis) * 100) : 0;

        const splitFromName = (full) => {
          const p = String(full || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);
          return {
            first: p[0] || "",
            last: p.slice(1).join(" ") || "",
          };
        };
        const fromName = splitFromName(staff.name);
        return {
          id: staff._id,
          firstName: staff.firstName || fromName.first || staff.name,
          lastName: staff.lastName || fromName.last,
          fullName: staff.name,
          email: staff.email,
          department: staff.department || "N/A",
          phone: staff.phone || "",
          kpis: totalKpis,
          completion: completionRate,
          avatarColor: generateColorFromEmail(staff.email),
          createdAt: staff.createdAt,
          updatedAt: staff.updatedAt,
        };
      })
    );

    res.status(200).json(enrichedStaff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ message: "Failed to fetch staff members" });
  }
};

// Update staff member (same department as manager only)
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, department, phone } = req.body;

    if (!firstName || !lastName || !email) {
      return res
        .status(400)
        .json({ message: "First name, last name, and email are required" });
    }

    const scope = await getManagerScope(req.user.userId);
    if (!scope.ok) {
      return res.status(scope.status).json({ message: scope.message });
    }

    const target = await User.findById(id).select("-password");
    if (!target || target.role !== "staff") {
      return res.status(404).json({ message: "Staff member not found" });
    }
    if (String(target.department || "").trim() !== scope.department) {
      return res.status(403).json({ message: "You can only manage staff in your department." });
    }

    const nextDept = String(department || "").trim();
    if (nextDept !== scope.department) {
      return res.status(403).json({
        message: `Staff must remain in your department (${scope.department}).`,
      });
    }

    const existingUser = await User.findOne({
      email: String(email).trim().toLowerCase(),
      _id: { $ne: id },
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Email already registered by another user" });
    }

    const updatedStaff = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          name: `${firstName} ${lastName}`.trim(),
          firstName,
          lastName,
          email: String(email).trim().toLowerCase(),
          department: scope.department,
          phone: phone || "",
        },
        $unset: { position: "" },
      },
      { new: true }
    ).select("-password");

    if (!updatedStaff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    const staffName = updatedStaff.name || "";
    const staffKpis = await Kpi.find({
      staff: new RegExp(`^${escapeRegExp(staffName.trim())}$`, "i"),
    });
    const totalKpis = staffKpis.length;
    const completedKpis = staffKpis.filter((k) => isKpiCompleted(k)).length;
    const completionRate =
      totalKpis > 0 ? Math.round((completedKpis / totalKpis) * 100) : 0;

    res.status(200).json({
      message: "Staff member updated successfully",
      staff: {
        id: updatedStaff._id,
        firstName,
        lastName,
        fullName: updatedStaff.name,
        email: updatedStaff.email,
        department: updatedStaff.department || "N/A",
        phone: updatedStaff.phone || "",
        kpis: totalKpis,
        completion: completionRate,
        avatarColor: generateColorFromEmail(updatedStaff.email),
      },
    });
  } catch (error) {
    console.error("Error updating staff:", error);
    res.status(500).json({ message: "Failed to update staff member" });
  }
};

// Delete staff member (same department only)
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const scope = await getManagerScope(req.user.userId);
    if (!scope.ok) {
      return res.status(scope.status).json({ message: scope.message });
    }

    const deletedStaff = await User.findById(id);
    if (!deletedStaff || deletedStaff.role !== "staff") {
      return res.status(404).json({ message: "Staff member not found" });
    }
    if (String(deletedStaff.department || "").trim() !== scope.department) {
      return res.status(403).json({ message: "You can only manage staff in your department." });
    }

    await User.findByIdAndDelete(id);

    const staffName = deletedStaff.name || "";
    await Kpi.updateMany(
      { staff: new RegExp(`^${escapeRegExp(staffName.trim())}$`, "i") },
      { staff: "" }
    );

    res.status(200).json({
      message: "Staff member deleted successfully",
      staffId: id,
    });
  } catch (error) {
    console.error("Error deleting staff:", error);
    res.status(500).json({ message: "Failed to delete staff member" });
  }
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function generateColorFromEmail(email) {
  const colors = [
    "#1db87a",
    "#e8a020",
    "#e53e3e",
    "#3b82f6",
    "#9b59b6",
    "#16a085",
  ];
  const hash = (email || "").split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  return colors[hash % colors.length];
}
