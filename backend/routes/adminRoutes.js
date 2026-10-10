const express = require("express");

const { authenticate, requireRole } = require("../middleware/auth");
const tipsterRoutes = require("./adminTipsterRoutes");
const tipRoutes = require("./adminTipRoutes");
const adminController = require("../controllers/adminController");

const router = express.Router();

// Every route below requires an authenticated admin.
router.use(authenticate, requireRole("admin"));

router.get("/stats", adminController.getStats);

router.use("/tipsters", tipsterRoutes);
router.use("/tips", tipRoutes);

module.exports = router;
