/**
 * Avoid leaking stack traces / env details in production API responses.
 */
function clientErrorMessage(error, fallback = "Server error") {
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return fallback;
  }
  return error?.message || fallback;
}

module.exports = { clientErrorMessage };
