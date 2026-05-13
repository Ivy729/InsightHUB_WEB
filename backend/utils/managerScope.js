const User = require("../models/User");

/**
 * Resolves a manager's department for scoping staff/KPIs.
 * @param {string} managerUserId - Mongo _id of the logged-in manager
 * @returns {{ ok: true, department: string, staffUsers: import("mongoose").Document[] } | { ok: false, status: number, message: string }}
 */
async function getManagerScope(managerUserId) {
  const manager = await User.findById(managerUserId).select("role department");
  if (!manager || String(manager.role || "").toLowerCase() !== "manager") {
    return { ok: false, status: 403, message: "Manager access required." };
  }
  const department = String(manager.department || "").trim();
  if (!department) {
    return {
      ok: false,
      status: 403,
      message:
        "Set your department in Profile before you can view staff and KPIs for your team.",
    };
  }
  const staffUsers = await User.find({
    role: "staff",
    department,
  })
    .select("name email firstName lastName department")
    .lean();

  return { ok: true, department, staffUsers };
}

/** Lowercase identities used to match KPI `staff` / `owner` strings */
function buildAssigneeIdentitySet(staffUsers) {
  const set = new Set();
  for (const u of staffUsers) {
    if (u.name) set.add(String(u.name).trim().toLowerCase());
    if (u.email) set.add(String(u.email).trim().toLowerCase());
    const fn = String(u.firstName || "").trim();
    const ln = String(u.lastName || "").trim();
    if (fn || ln) set.add(`${fn} ${ln}`.trim().toLowerCase());
  }
  return set;
}

function kpiMatchesAssigneeSet(kpi, identitySet) {
  const candidates = [kpi.staff, kpi.owner]
    .map((x) => String(x || "").trim().toLowerCase())
    .filter(Boolean);
  return candidates.some((c) => identitySet.has(c));
}

async function getDepartmentStaffObjectIds(department) {
  const rows = await User.find({ role: "staff", department }).select("_id").lean();
  return rows.map((r) => r._id);
}

module.exports = {
  getManagerScope,
  buildAssigneeIdentitySet,
  kpiMatchesAssigneeSet,
  getDepartmentStaffObjectIds,
};
