const express = require("express");

const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");
const companyRoutes = require("./companyRoutes");
const tipRoutes = require("./tipRoutes");
const tipsterRoutes = require("./tipsterRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/companies", companyRoutes);
router.use("/tips", tipRoutes);
router.use("/tipsters", tipsterRoutes);

module.exports = router;
