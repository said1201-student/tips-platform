const express = require("express");

const controller = require("../controllers/homeImageController");

const router = express.Router();

router.get("/", controller.adminList);
router.post("/", controller.adminCreate);
router.patch("/:id", controller.adminUpdate);
router.delete("/:id", controller.adminDelete);

module.exports = router;