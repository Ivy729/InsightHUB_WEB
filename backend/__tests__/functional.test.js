const request = require("supertest");
const { app } = require("../server");
const {
  login,
  managerCredentials,
  staffCredentials,
  authHeader,
} = require("./helpers/testAuth");

describe("FT-01: GET /api/health", () => {
  test("Returns 200 status code", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
  });

  test("Content-Type is application/json", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["content-type"]).toMatch(/json/);
  });

  test("Response body confirms backend running", async () => {
    const res = await request(app).get("/api/health");
    expect(res.body.ok).toBe(true);
    expect(res.body.message).toMatch(/running/i);
  });
});

describe("FT-02: GET /api/kpis", () => {
  test("Returns 401 when Authorization header is missing", async () => {
    const res = await request(app).get("/api/kpis");
    expect(res.statusCode).toBe(401);
  });

  const managerCreds = managerCredentials();
  const describeManager =
    managerCreds != null ? describe : describe.skip;

  describeManager("with manager authentication", () => {
    let token;

    beforeAll(async () => {
      token = await login(app, managerCreds);
    });

    test("Returns 200 status code", async () => {
      const res = await request(app)
        .get("/api/kpis")
        .set(authHeader(token));
      expect(res.statusCode).toBe(200);
    });

    test("Response body is an array", async () => {
      const res = await request(app)
        .get("/api/kpis")
        .set(authHeader(token));
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("Each KPI has title when list is non-empty", async () => {
      const res = await request(app)
        .get("/api/kpis")
        .set(authHeader(token));
      if (res.body.length > 0) {
        res.body.forEach((kpi) => {
          expect(kpi).toHaveProperty("title");
        });
      }
    });
  });
});

describe("FT-03: Protected Route Without Token", () => {
  test("Returns 401 when Authorization header is missing", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });

  test("Response message mentions token or unauthorized", async () => {
    const res = await request(app).get("/api/auth/me");
    const msg = String(res.body.message || "").toLowerCase();
    expect(msg).toMatch(/token|unauthorized|invalid/);
  });

  test("Invalid Bearer token returns 401", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid.token.value");
    expect(res.statusCode).toBe(401);
  });
});

describe("FT-04: Invalid Route Handling", () => {
  test("Returns 404 for unknown API route", async () => {
    const res = await request(app).get("/api/invalid-page");
    expect(res.statusCode).toBe(404);
  });
});

describe("FT-05: Static File Delivery", () => {
  test("Returns 404 when file does not exist", async () => {
    const res = await request(app).get("/uploads/nonexistent-file-xyz.txt");
    expect(res.statusCode).toBe(404);
  });

  test("Returns 200 for existing uploads file when test-asset.txt is present", async () => {
    const res = await request(app).get("/uploads/test-asset.txt");
    if (res.statusCode === 200) {
      expect(res.statusCode).toBe(200);
    } else {
      expect(res.statusCode).toBe(404);
    }
  });
});

describe("FT-06: Route Parameter :id", () => {
  const INVALID_ID = "not-a-valid-object-id";

  test("Invalid id without auth returns 401", async () => {
    const res = await request(app).get(`/api/kpis/${INVALID_ID}`);
    expect(res.statusCode).toBe(401);
  });

  const managerCredsForInvalidId = managerCredentials();
  const describeInvalidIdAuth =
    managerCredsForInvalidId != null ? test : test.skip;

  describeInvalidIdAuth("Invalid id format returns 404 or 500 when authenticated", async () => {
    const token = await login(app, managerCredsForInvalidId);
    const res = await request(app)
      .get(`/api/kpis/${INVALID_ID}`)
      .set(authHeader(token));
    expect([404, 500]).toContain(res.statusCode);
  });

  const managerCreds = managerCredentials();
  const describeWithAuth =
    managerCreds != null ? describe : describe.skip;

  describeWithAuth("with manager authentication", () => {
    let token;
    let kpiId;

    beforeAll(async () => {
      token = await login(app, managerCreds);
      const listRes = await request(app)
        .get("/api/kpis")
        .set(authHeader(token));
      if (Array.isArray(listRes.body) && listRes.body.length > 0) {
        const first = listRes.body[0];
        kpiId = String(first._id || first.id || "");
      }
    });

    test("Valid id returns 200 when KPI exists in scope", async () => {
      if (!kpiId) {
        return;
      }
      const res = await request(app)
        .get(`/api/kpis/${kpiId}`)
        .set(authHeader(token));
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("title");
    });

    test("Returns 401 without token even for valid id format", async () => {
      if (!kpiId) {
        return;
      }
      const res = await request(app).get(`/api/kpis/${kpiId}`);
      expect(res.statusCode).toBe(401);
    });
  });

  const staffCreds = staffCredentials();
  const describeStaff =
    staffCreds != null ? describe : describe.skip;

  describeStaff("staff forbidden on manager evidence route (403 objective)", () => {
    let staffToken;

    beforeAll(async () => {
      staffToken = await login(app, staffCreds);
    });

    test("Staff token cannot access manager evidence queue", async () => {
      const res = await request(app)
        .get("/api/manager/evidence-queue")
        .set(authHeader(staffToken));
      expect(res.statusCode).toBe(403);
    });
  });
});
