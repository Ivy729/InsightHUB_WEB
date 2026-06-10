const request = require("supertest");
const { app } = require("../server");
const { isAllowedDepartment } = require("../constants/allowedDepartments");
const { fileNameMatchesEvidenceType } = require("../constants/evidenceFileTypes");
const { getEffectiveKpiStatus } = require("../../src/utils/getEffectiveKpiStatus");

function isValidProgress(value) {
  const n = Number(value);
  return !Number.isNaN(n) && n >= 0 && n <= 100;
}

const sampleKpis = [
  {
    title: "Increase customer satisfaction",
    progress: 0,
    status: "pending",
    deadline: "2026-06-30",
    staff: "staff@company.com",
    dept: "Customer Service",
  },
  {
    title: "Reduce ticket response time",
    progress: 45,
    status: "in-progress",
    deadline: "2026-05-15",
    staff: "staff@company.com",
    dept: "Information Technology",
  },
  {
    title: "Complete quarterly report",
    progress: 100,
    status: "achieved",
    deadline: "2026-04-01",
    staff: "staff@company.com",
    dept: "Finance and Accounting",
  },
];

describe("KPI Object Structure (UT-01)", () => {
  test("Array contains 3 KPI records", () => {
    expect(sampleKpis).toHaveLength(3);
  });

  test("Each KPI has title, progress, status", () => {
    sampleKpis.forEach((kpi) => {
      expect(kpi).toHaveProperty("title");
      expect(kpi).toHaveProperty("progress");
      expect(kpi).toHaveProperty("status");
    });
  });

  test("progress is a number in all records", () => {
    sampleKpis.forEach((kpi) => {
      expect(typeof kpi.progress).toBe("number");
    });
  });
});

describe("KPI Effective Status Logic (UT-02)", () => {
  test("Progress 100 returns achieved", () => {
    expect(
      getEffectiveKpiStatus({
        progress: 100,
        status: "in-progress",
        deadline: "2020-01-01",
      })
    ).toBe("achieved");
  });

  test("Progress 99 with past deadline returns overdue", () => {
    expect(
      getEffectiveKpiStatus({
        progress: 99,
        status: "in-progress",
        deadline: "2020-01-01",
      })
    ).toBe("overdue");
  });

  test("Progress 0 with future deadline returns pending", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const iso = future.toISOString().slice(0, 10);
    expect(
      getEffectiveKpiStatus({ progress: 0, status: "pending", deadline: iso })
    ).toBe("pending");
  });

  test("Progress 50 with future deadline returns in-progress", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const iso = future.toISOString().slice(0, 10);
    expect(
      getEffectiveKpiStatus({
        progress: 50,
        status: "in-progress",
        deadline: iso,
      })
    ).toBe("in-progress");
  });

  test("Progress 1 with future deadline returns in-progress (boundary)", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const iso = future.toISOString().slice(0, 10);
    expect(
      getEffectiveKpiStatus({ progress: 1, status: "pending", deadline: iso })
    ).toBe("in-progress");
  });
});

describe("Backend configuration and health route (UT-03)", () => {
  test("Health route is registered", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("ok", true);
  });

  test("App accepts JSON request bodies", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "secret", intendedRole: "staff" });
    expect(res.statusCode).not.toBe(415);
  });

  test("Unknown API path returns 404", async () => {
    const res = await request(app).get("/api/this-route-does-not-exist");
    expect(res.statusCode).toBe(404);
  });
});

describe("Field Data Types & Validation (UT-04)", () => {
  test("Allowed department returns true", () => {
    expect(isAllowedDepartment("Human Resources")).toBe(true);
  });

  test("Unknown department returns false", () => {
    expect(isAllowedDepartment("Invalid Dept")).toBe(false);
  });

  test("PDF matches Document evidence type", () => {
    expect(
      fileNameMatchesEvidenceType("report.pdf", "Document (PDF/Word)")
    ).toBe(true);
  });

  test(".exe does not match Image evidence type", () => {
    expect(fileNameMatchesEvidenceType("virus.exe", "Image")).toBe(false);
  });

  test("progress 0 and 100 are valid", () => {
    expect(isValidProgress(0)).toBe(true);
    expect(isValidProgress(100)).toBe(true);
  });

  test("progress 101 is invalid", () => {
    expect(isValidProgress(101)).toBe(false);
  });
});
