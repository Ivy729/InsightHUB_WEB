const mongoose = require("mongoose");

const kpiSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    desc: { type: String, default: "" },
    target: { type: Number, required: true },
    progress: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "in-progress", "achieved", "overdue"],
      default: "pending",
    },
    owner: { type: String, default: "staff" },
    staff: { type: String, default: "" },
    dept: { type: String, default: "" },
    startDate: { type: String, default: "" },
    deadline: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Kpi", kpiSchema);
