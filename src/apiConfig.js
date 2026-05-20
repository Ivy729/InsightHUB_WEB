/**
 * API base URL for Express.
 * - Local dev: http://localhost:5000 (or REACT_APP_API_URL from .env.local)
 * - Vercel production: REACT_APP_API_URL, or same-origin "" when unset (relative /api/... calls)
 */
function resolveApiBaseUrl() {
  const fromEnv = (process.env.REACT_APP_API_URL || "").trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV === "production") {
    return "";
  }
  return "http://localhost:5000";
}

export const API_BASE_URL = resolveApiBaseUrl();
