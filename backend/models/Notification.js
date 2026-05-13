const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    kpiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kpi",
      default: null,
    },
    staffName: { type: String, trim: true, default: null },
    kpiTitle: { type: String, trim: true, default: null },
    actionType: {
      type: String,
      enum: [
        "evidence-submitted",
        "progress-updated",
        "kpi-completed",
        "kpi-overdue",
        "pending-evidence",
        "evidence-approved",
        "evidence-rejected",
        "kpi-assigned",
      ],
      required: true,
    },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
