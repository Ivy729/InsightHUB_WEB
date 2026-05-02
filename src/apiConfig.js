/**
 * Base URL for the Express API. Set REACT_APP_API_URL in Vercel (and optional .env.local for dev).
 * Create React App only exposes env vars prefixed with REACT_APP_.
 */
export const API_BASE_URL =
  (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');
