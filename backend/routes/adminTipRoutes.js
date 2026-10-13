const express = require("express");

const validate = require("../middleware/validate");
const controller = require("../controllers/tipsController");
const { required, maxLen, isNumber, isOdds, isIn } = require("../utils/validators");

const router = express.Router();

const updateSchema = {
  title: [maxLen(180, "Title")],
  companyId: [isNumber("Betting company")],
  slipCode: [maxLen(60, "Slip code")],
  totalOdds: [isOdds("Total odds")],
  description: [maxLen(2000, "Description")],
  status: [isIn(["pending", "won", "lost", "void"], "Status")],
};

router.get("/", controller.adminListTips);
router.patch(
  "/:id/status",
  validate({ status: [required("Status"), isIn(["pending", "won", "lost", "void"], "Status")] }),
  controller.adminSetStatus
);
router.patch(
  "/:id/review",
  validate({ action: [required("Action"), isIn(["approve", "reject"], "Action")] }),
  controller.adminReviewTip
);
router.put("/:id", validate(updateSchema), controller.updateTip);
router.delete("/:id", controller.deleteTip);

module.exports = router;
