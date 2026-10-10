const express = require("express");

const validate = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const controller = require("../controllers/authController");
const {
  required,
  maxLen,
  minLen,
  isEmail,
  isUsername,
} = require("../utils/validators");

const router = express.Router();

router.post(
  "/login",
  validate({
    username: [required("Username"), maxLen(60, "Username")],
    password: [required("Password")],
  }),
  controller.login
);

router.post("/logout", controller.logout);

router.get("/me", authenticate, controller.me);

router.patch(
  "/profile",
  authenticate,
  validate({
    fullName: [required("Full name"), maxLen(120, "Full name")],
    username: [required("Username"), isUsername("Username")],
    email: [required("Email"), isEmail("Email"), maxLen(160, "Email")],
  }),
  controller.updateProfile
);

router.post(
  "/change-password",
  authenticate,
  validate({
    currentPassword: [required("Current password")],
    newPassword: [required("New password"), minLen(8, "New password")],
  }),
  controller.changePassword
);

router.post(
  "/forgot-password",
  validate({
    email: [required("Email"), isEmail("Email")],
  }),
  controller.forgotPassword
);

router.post(
  "/reset-password",
  validate({
    token: [required("Reset token")],
    newPassword: [required("New password"), minLen(8, "New password")],
  }),
  controller.resetPassword
);

module.exports = router;
