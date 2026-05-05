const mongoose = require("mongoose");

const kpiSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    target: { type: Number, required: true },
    progress: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "in_progress",
    },
    owner: { type: String, default: "staff" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Kpi", kpiSchema);
