const ProgressHistory = require("../models/ProgressHistory");

exports.getMyProgressHistory = async (req, res) => {
  try {
    const staffId = req.user.userId;
    const rows = await ProgressHistory.find({ staffId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
