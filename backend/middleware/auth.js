const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Access token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const isManager = (req, res, next) => {
  const role = String(req.user?.role || "").toLowerCase();
  if (role !== "manager") {
    return res
      .status(403)
      .json({ message: "Access denied. Manager role is required." });
  }
  return next();
};

const isStaff = (req, res, next) => {
  const role = String(req.user?.role || "").toLowerCase();
  if (role !== "staff") {
    return res
      .status(403)
      .json({ message: "Access denied. Staff role is required." });
  }
  return next();
};

/** Loads full User document (used by staff dashboard routes + userRoutes). */
async function requireAuth(req, res, next) {
  try {
    const header = String(req.headers.authorization || "");
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

module.exports = {
  authenticateJWT,
  isManager,
  isStaff,
  requireAuth,
  requireRole,
};
