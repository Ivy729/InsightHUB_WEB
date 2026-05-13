const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema(
  {
    kpiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kpi",
      required: true,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: { type: String, required: true, trim: true },
    originalFileName: { type: String, default: "" },
    staffNotes: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    /** First manager download time; further downloads are blocked. */
    managerDownloadedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Evidence", evidenceSchema);
