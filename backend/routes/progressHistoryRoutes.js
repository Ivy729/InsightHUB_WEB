const express = require("express");
const { authenticateJWT, isStaff } = require("../middleware/auth");
const { getMyProgressHistory } = require("../controllers/progressHistoryController");

const router = express.Router();

router.get("/", authenticateJWT, isStaff, getMyProgressHistory);

module.exports = router;
