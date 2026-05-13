const mongoose = require("mongoose");

const progressHistorySchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    kpiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kpi",
      default: null,
    },
    kpiTitle: { type: String, default: "", trim: true },
    kind: {
      type: String,
      enum: [
        "kpi_assigned",
        "progress_update",
        "evidence_submitted",
        "evidence_approved",
        "evidence_rejected",
      ],
      required: true,
    },
    headline: { type: String, required: true, trim: true },
    detail: { type: String, default: "", trim: true },
    progressPercent: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProgressHistory", progressHistorySchema);
