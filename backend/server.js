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

dotenv.config({
  path: path.resolve(__dirname, ".env"),
  override: true,
});

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is missing. Check backend/.env");
  process.exit(1);
}

const usingAtlas = process.env.MONGODB_URI.startsWith("mongodb+srv://");
console.log(`Mongo URI source loaded (${usingAtlas ? "Atlas" : "Local/Other"})`);

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));
app.use("/api/kpis", kpiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend running" });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
