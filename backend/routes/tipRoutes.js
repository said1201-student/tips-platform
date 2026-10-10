const express = require("express");

const validate = require("../middleware/validate");
const { authenticate, requireRole } = require("../middleware/auth");
const controller = require("../controllers/tipsController");
const {
  required,
  maxLen,
  isNumber,
  isOdds,
  isIn,
} = require("../utils/validators");

const router = express.Router();

const createSchema = {
  title: [required("Title"), maxLen(180, "Title")],
  companyId: [required("Betting company"), isNumber("Betting company")],
  slipCode: [required("Slip code"), maxLen(60, "Slip code")],
  totalOdds: [required("Total odds"), isOdds("Total odds")],
  description: [maxLen(2000, "Description")],
};

const updateSchema = {
  title: [maxLen(180, "Title")],
  companyId: [isNumber("Betting company")],
  slipCode: [maxLen(60, "Slip code")],
  totalOdds: [isOdds("Total odds")],
  description: [maxLen(2000, "Description")],
  status: [isIn(["pending", "won", "lost", "void"], "Status")],
};

// Tipster routes (literal paths first so they are not caught by /:id)
router.get("/mine", authenticate, requireRole("tipster"), controller.listMyTips);
router.get("/stats/me", authenticate, requireRole("tipster"), controller.myStats);

// Public routes
router.get("/", controller.listTips);
router.get("/:id", controller.getTip);
router.post("/:id/view", controller.recordView);
router.post("/:id/copy", controller.copyTip);

// Tipster + admin
router.post("/", authenticate, requireRole("tipster"), validate(createSchema), controller.createTip);
router.put("/:id", authenticate, validate(updateSchema), controller.updateTip);
router.delete("/:id", authenticate, controller.deleteTip);

module.exports = router;
