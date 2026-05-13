const User = require("../models/User");
const Kpi = require("../models/Kpi");
const bcrypt = require("bcryptjs");

// Get all staff members (for manager view)
exports.getAllStaff = async (req, res) => {
  try {
    // Fetch all users with role 'staff'
    const staffMembers = await User.find({ role: "staff" }).select("-password");

    // Enrich staff data with KPI information
    const enrichedStaff = await Promise.all(
      staffMembers.map(async (staff) => {
        const staffName = staff.name || "";
        const normalizedStaffName = staffName.trim();
        const kpis = await Kpi.find({ staff: new RegExp(`^${escapeRegExp(normalizedStaffName)}$`, 'i') });
        const totalKpis = kpis.length;

        const completedKpis = kpis.filter(
          (k) => k.status === 'achieved' || (k.target > 0 && k.progress >= k.target)
        ).length;
        const completionRate = totalKpis > 0 ? Math.round((completedKpis / totalKpis) * 100) : 0;

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
          position: staff.position || "N/A",
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

// Update staff member
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, department, position, phone } = req.body;

    if (!firstName || !lastName || !email) {
      return res
        .status(400)
        .json({ message: "First name, last name, and email are required" });
    }

    // Check if new email is already used by another user
    const existingUser = await User.findOne({
      email,
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
        name: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        email,
        department: department || "",
        position: position || "",
        phone: phone || "",
      },
      { new: true }
    ).select("-password");

    if (!updatedStaff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Get KPI info for this staff
    const staffName = updatedStaff.name || "";
    const staffKpis = await Kpi.find({ staff: new RegExp(`^${escapeRegExp(staffName.trim())}$`, 'i') });
    const totalKpis = staffKpis.length;
    const completedKpis = staffKpis.filter(
      (k) => k.status === 'achieved' || (k.target > 0 && k.progress >= k.target)
    ).length;
    const completionRate = totalKpis > 0 ? Math.round((completedKpis / totalKpis) * 100) : 0;

    res.status(200).json({
      message: "Staff member updated successfully",
      staff: {
        id: updatedStaff._id,
        firstName,
        lastName,
        fullName: updatedStaff.name,
        email: updatedStaff.email,
        department: updatedStaff.department || "N/A",
        position: updatedStaff.position || "N/A",
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

// Delete staff member
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedStaff = await User.findByIdAndDelete(id);

    if (!deletedStaff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Optionally, you can also unassign KPIs associated with this staff member
    const staffName = deletedStaff.name || "";
    await Kpi.updateMany(
      { staff: new RegExp(`^${escapeRegExp(staffName.trim())}$`, 'i') },
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

// Helper function to escape regex special characters
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Helper function to generate a consistent color from email
function generateColorFromEmail(email) {
  const colors = ["#1db87a", "#e8a020", "#e53e3e", "#3b82f6", "#9b59b6", "#16a085"];
  const hash = (email || "").split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  return colors[hash % colors.length];
}
