const mongoose = require("mongoose");

const kpiSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    target: { type: Number, required: true },
    progress: { type: Number, default: 0 },
    owner: { type: String, default: "staff" },
    deadline: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Kpi", kpiSchema);
