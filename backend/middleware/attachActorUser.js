const jwt = require("jsonwebtoken");
const User = require("../models/User");

/** Attaches full user document as req.actor when Bearer token is valid (optional). */
async function attachActorUser(req, res, next) {
  req.actor = null;
  const authHeader = String(req.headers.authorization || "");
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (user) req.actor = user;
  } catch {
    req.actor = null;
  }
  next();
}

module.exports = { attachActorUser };
