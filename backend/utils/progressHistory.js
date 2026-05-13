const ProgressHistory = require("../models/ProgressHistory");

async function addProgressHistoryEntry(entry) {
  try {
    await ProgressHistory.create(entry);
  } catch (err) {
    console.error("addProgressHistoryEntry failed:", err.message);
  }
}

module.exports = { addProgressHistoryEntry };
