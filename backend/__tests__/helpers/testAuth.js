const request = require("supertest");

/**
 * Login and return JWT. Uses TEST_MANAGER_* / TEST_STAFF_* from backend/.env
 * (optional; auth-dependent tests skip when not set).
 */
async function login(app, { email, password, intendedRole }) {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password, intendedRole });

  if (res.statusCode !== 200 || !res.body.token) {
    throw new Error(
      res.body?.message || `Login failed (${res.statusCode}) for ${email}`
    );
  }

  return res.body.token;
}

function managerCredentials() {
  const email = (process.env.TEST_MANAGER_EMAIL || "").trim();
  const password = process.env.TEST_MANAGER_PASSWORD || "";
  if (!email || !password) return null;
  return { email, password, intendedRole: "manager" };
}

function staffCredentials() {
  const email = (process.env.TEST_STAFF_EMAIL || "").trim();
  const password = process.env.TEST_STAFF_PASSWORD || "";
  if (!email || !password) return null;
  return { email, password, intendedRole: "staff" };
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

module.exports = {
  login,
  managerCredentials,
  staffCredentials,
  authHeader,
};
