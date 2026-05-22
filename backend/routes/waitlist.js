const express = require("express");
const router = express.Router();
const { addToWaitlist } = require("../controllers/waitlistController");

router.post("/", addToWaitlist);

module.exports = router;
