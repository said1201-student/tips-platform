const express = require("express");

const validate = require("../middleware/validate");
const controller = require("../controllers/adminController");
const {
  required,
  maxLen,
  isEmail,
  isUsername,
  isIn,
} = require("../utils/validators");

const router = express.Router();

const createSchema = {
  fullName: [required("Full name"), maxLen(120, "Full name")],
  username: [required("Username"), isUsername("Username")],
  email: [required("Email"), isEmail("Email"), maxLen(160, "Email")],
};

const updateSchema = {
  fullName: [required("Full name"), maxLen(120, "Full name")],
  username: [required("Username"), isUsername("Username")],
  email: [required("Email"), isEmail("Email"), maxLen(160, "Email")],
  status: [required("Status"), isIn(["active", "disabled"], "Status")],
};

router.get("/", controller.listTipsters);
router.post("/", validate(createSchema), controller.createTipster);
router.get("/:id", controller.getTipster);
router.put("/:id", validate(updateSchema), controller.updateTipster);
router.patch(
  "/:id/status",
  validate({ status: [required("Status"), isIn(["active", "disabled"], "Status")] }),
  controller.setStatus
);
router.post("/:id/reset-password", controller.resetPassword);
router.delete("/:id", controller.deleteTipster);

module.exports = router;
