const express = require("express");

const controller = require("../controllers/homeImageController");

const router = express.Router();

router.get("/", controller.listPublic);

module.exports = router;