/**
 * Standalone health check — does not load backend/server (avoids cold-start crashes).
 */
module.exports = (req, res) => {
  const smtpConfigured = Boolean(
    (process.env.SMTP_HOST || "").trim() &&
      (process.env.SMTP_USER || "").trim() &&
      (process.env.SMTP_PASS || "").trim() &&
      (process.env.SMTP_FROM || "").trim()
  );

  res.status(200).json({
    ok: true,
    message: "Backend running",
    smtpConfigured,
    mongoUriSet: Boolean((process.env.MONGODB_URI || "").trim()),
    runtime: "vercel",
  });
};
