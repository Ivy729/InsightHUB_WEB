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
    deadline: { type: mongoose.Schema.Types.Mixed, default: null },
    notifiedOverdue: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Pre-save hook to automatically calculate status whenever the document is saved
kpiSchema.pre("save", function () {
  const progress = this.progress || 0;
  const deadline = this.deadline;

  // Achieved: progress == 100
  if (progress === 100) {
    this.status = "achieved";
  }
  // New KPIs with no progress should start as pending, even if a deadline has already passed
  else if (this.isNew && progress === 0) {
    this.status = "pending";
  }
  // Check if deadline has passed for existing KPIs
  else if (deadline) {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);

    // Overdue: current date > deadline AND progress < 100
    if (today > deadlineDate && progress < 100) {
      this.status = "overdue";
    }
    // In Progress: progress > 0 AND progress < 100
    else if (progress > 0 && progress < 100) {
      this.status = "in-progress";
    }
    // Pending: progress == 0
    else if (progress === 0) {
      this.status = "pending";
    }
  }
  // In Progress: progress > 0 AND progress < 100
  else if (progress > 0 && progress < 100) {
    this.status = "in-progress";
  }
  // Pending: progress == 0
  else if (progress === 0) {
    this.status = "pending";
  }
});

module.exports = mongoose.model("Kpi", kpiSchema);
