const path = require("path");
const Module = require("module");

// Resolve backend dependencies from backend/node_modules and root node_modules
const backendNodeModules = path.join(__dirname, "..", "backend", "node_modules");
if (!module.paths.includes(backendNodeModules)) {
  module.paths.unshift(backendNodeModules);
}

let app;

try {
  ({ app } = require("../backend/server"));
} catch (error) {
  console.error("Failed to load backend/server:", error);
  const express = require("express");
  app = express();
  app.all("*", (req, res) => {
    res.status(500).json({
      ok: false,
      message: "Server failed to start",
      error: error.message,
    });
  });
}

module.exports = app;
