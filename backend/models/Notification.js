const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["primary", "success", "warning", "danger"],
      default: "primary",
    },
    text: { type: String, required: true, trim: true },
    sub: { type: String, default: "", trim: true },
    link: { type: String, default: "" },
    readAt: { type: Date, default: null },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);

