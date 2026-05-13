const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    firstName: { type: String, default: "", trim: true },
    lastName: { type: String, default: "", trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["manager", "staff"], default: "staff" },
    phone: { type: String, default: "", trim: true },
    position: { type: String, default: "", trim: true },
    department: { type: String, default: "", trim: true },
    profilePhoto: { type: String, default: "" },
    settings: {
      timeFormat: { type: String, enum: ["12h", "24h"], default: "12h" },
    },
    avatarPath: { type: String, default: "" },
    passwordResetCodeHash: { type: String, default: null },
    passwordResetExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
