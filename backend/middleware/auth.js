const jwt = require("jsonwebtoken");

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

module.exports = {
  authenticateJWT,
  isManager,
  isStaff,
};