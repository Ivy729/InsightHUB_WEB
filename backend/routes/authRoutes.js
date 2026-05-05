const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const { authenticateJWT } = require("../middleware/auth");

const router = express.Router();
const RESET_CODE_TTL_MS = 10 * 60 * 1000;

const createResetCode = () =>
  String(Math.floor(1000 + Math.random() * 9000));

const hashResetCode = (code) =>
  crypto.createHash("sha256").update(code).digest("hex");

const sendResetCodeEmail = async (toEmail, code) => {
  const host = (process.env.SMTP_HOST || "").trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true";
  const user = (process.env.SMTP_USER || "").trim();
  const pass = (process.env.SMTP_PASS || "").trim();
  const from = (process.env.SMTP_FROM || user || "").trim();

  const missing = [];
  if (!host) missing.push("SMTP_HOST");
  if (!user) missing.push("SMTP_USER");
  if (!pass) missing.push("SMTP_PASS");
  if (!from) missing.push("SMTP_FROM");

  if (missing.length > 0) {
    throw new Error(
      `SMTP is not configured correctly. Missing: ${missing.join(", ")}`
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: "Your KPI Manager password reset code",
    text: `Your verification code is ${code}. It will expire in 10 minutes.`,
    html: `<p>Your verification code is <b>${code}</b>.</p><p>This code will expire in 10 minutes.</p>`,
  });
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, phone, position, department, profilePhoto } =
      req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "staff",
      phone: phone || "",
      position: position || "",
      department: department || "",
      profilePhoto: profilePhoto || "",
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        position: user.position || "",
        department: user.department || "",
        profilePhoto: user.profilePhoto || "",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Sign in successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        position: user.position || "",
        department: user.department || "",
        profilePhoto: user.profilePhoto || "",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      position: user.position || "",
      department: user.department || "",
      profilePhoto: user.profilePhoto || "",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/me", authenticateJWT, async (req, res) => {
  try {
    const { name, email, phone, position, department, profilePhoto } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingEmailUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user.userId },
    });
    if (existingEmailUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const updates = {
      name: String(name).trim(),
      email: normalizedEmail,
      phone: String(phone || "").trim(),
      position: String(position || "").trim(),
      department: String(department || "").trim(),
      profilePhoto: String(profilePhoto || "").trim(),
    };

    const updatedUser = await User.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone || "",
        position: updatedUser.position || "",
        department: updatedUser.department || "",
        profilePhoto: updatedUser.profilePhoto || "",
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with that email address" });
    }

    const code = createResetCode();
    user.passwordResetCodeHash = hashResetCode(code);
    user.passwordResetExpiresAt = new Date(Date.now() + RESET_CODE_TTL_MS);
    await user.save();

    await sendResetCodeEmail(user.email, code);

    res.status(200).json({
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("forgot-password error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/verify-reset-code", async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const code = String(req.body.code || "").trim();

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.passwordResetCodeHash || !user.passwordResetExpiresAt) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    if (user.passwordResetExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "Code has expired" });
    }

    const isCodeValid = hashResetCode(code) === user.passwordResetCodeHash;
    if (!isCodeValid) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    res.status(200).json({ message: "Code verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const code = String(req.body.code || "").trim();
    const newPassword = String(req.body.newPassword || "");

    if (!email || !code || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, code, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.passwordResetCodeHash || !user.passwordResetExpiresAt) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    if (user.passwordResetExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "Code has expired" });
    }

    const isCodeValid = hashResetCode(code) === user.passwordResetCodeHash;
    if (!isCodeValid) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetCodeHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
