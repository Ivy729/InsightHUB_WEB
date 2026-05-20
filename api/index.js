const path = require("path");

const backendNodeModules = path.join(__dirname, "..", "backend", "node_modules");
if (!module.paths.includes(backendNodeModules)) {
  module.paths.unshift(backendNodeModules);
}

let expressApp;

function loadApp() {
  if (!expressApp) {
    ({ app: expressApp } = require("../backend/server"));
  }
  return expressApp;
}

/**
 * Vercel serverless handler (lazy-loads Express app on first request).
 */
module.exports = (req, res) => {
  try {
    const app = loadApp();
    return app(req, res);
  } catch (error) {
    console.error("API handler error:", error);
    res.status(500).json({
      ok: false,
      message: "Server failed to start",
      error: error.message,
    });
  }
};
