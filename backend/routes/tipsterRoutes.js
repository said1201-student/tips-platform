const express = require("express");

const controller = require("../controllers/tipsterController");

const router = express.Router();

router.get("/", controller.listLeaderboard);
router.get("/:username", controller.getProfile);

module.exports = router;
