const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const kpiRoutes = require("./routes/kpiRoutes");
const authRoutes = require("./routes/authRoutes");
const evidenceRoutes = require("./routes/evidenceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const staffRoutes = require("./routes/staffRoutes");
const staffEvidenceRoutes = require("./routes/staffEvidenceRoutes");
const staffNotificationRoutes = require("./routes/staffNotificationRoutes");

dotenv.config({
  path: path.resolve(__dirname, ".env"),
  override: true,
});

console.log("ENV PATH:", path.resolve(__dirname, ".env"));
console.log("MONGO:", process.env.MONGODB_URI);

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is missing. Check backend/.env");
  process.exit(1);
}

const usingAtlas = process.env.MONGODB_URI.startsWith("mongodb+srv://");
console.log(`Mongo URI source loaded (${usingAtlas ? "Atlas" : "Local/Other"})`);

connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api/kpis", kpiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/manager", evidenceRoutes);
app.use("/api/manager/notifications", notificationRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/staff/evidence", staffEvidenceRoutes); 
app.use("/api/staff/notifications", staffNotificationRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend running" });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});