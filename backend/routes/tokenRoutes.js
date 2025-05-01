const express = require("express");
const router = express.Router();
const checkTokenLimit = require("../middleware/checkTokenLimit");
const { notifyIfNearLimit } = require("../controllers/tokenController");

router.post("/use-tokens", checkTokenLimit, notifyIfNearLimit);

module.exports = router; 