const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const kpiRoutes = require("./routes/kpiRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const evidenceRoutes = require("./routes/evidenceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const staffRoutes = require("./routes/staffRoutes");
const staffEvidenceRoutes = require("./routes/staffEvidenceRoutes");
const staffNotificationRoutes = require("./routes/staffNotificationRoutes");
const progressHistoryRoutes = require("./routes/progressHistoryRoutes");

// On Vercel, env vars come from the dashboard — do not load/override from backend/.env
if (!process.env.VERCEL) {
  dotenv.config({
    path: path.resolve(__dirname, ".env"),
    override: true,
  });
}

if (!process.env.VERCEL) {
  console.log("ENV PATH:", path.resolve(__dirname, ".env"));
}

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check — no MongoDB required (works even if DB is down)
app.get("/api/health", (req, res) => {
  const smtpConfigured = Boolean(
    (process.env.SMTP_HOST || "").trim() &&
      (process.env.SMTP_USER || "").trim() &&
      (process.env.SMTP_PASS || "").trim() &&
      (process.env.SMTP_FROM || "").trim()
  );
  res.json({
    ok: true,
    message: "Backend running",
    smtpConfigured,
    mongoUriSet: Boolean((process.env.MONGODB_URI || "").trim()),
    runtime: process.env.VERCEL ? "vercel" : "node",
  });
});

// Connect MongoDB before API routes (serverless-safe: no process.exit)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database middleware error:", error.message);
    const clientMessage =
      process.env.VERCEL || process.env.NODE_ENV === "production"
        ? "Database unavailable. Check MONGODB_URI on the server (must be one mongodb:// or mongodb+srv:// line only)."
        : error.message;
    res.status(503).json({
      message: "Database unavailable",
      error: clientMessage,
    });
  }
});

app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

app.use("/api/kpis", kpiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/manager", evidenceRoutes);
app.use("/api/manager/notifications", notificationRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/staff/evidence", staffEvidenceRoutes);
app.use("/api/staff/notifications", staffNotificationRoutes);
app.use("/api/staff/progress-history", progressHistoryRoutes);

module.exports = { app };

if (require.main === module) {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing. Check backend/.env");
    process.exit(1);
  }

  connectDB()
    .then(() => {
      app.listen(process.env.PORT || 5000, () => {
        console.log(`Server running on port ${process.env.PORT || 5000}`);
      });
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}
