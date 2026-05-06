const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    kpiId: { type: mongoose.Schema.Types.ObjectId, ref: "Kpi", required: false },
    kpiTitle: { type: String, required: true, trim: true },
    evidenceType: { type: String, default: "Document", trim: true },
    notes: { type: String, default: "", trim: true },
    file: {
      originalName: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true },
      path: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Evidence", evidenceSchema);

