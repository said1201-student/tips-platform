const express = require("express");

const validate = require("../middleware/validate");
const { authenticate, requireRole, optionalAuth } = require("../middleware/auth");
const controller = require("../controllers/companyController");
const {
  required,
  maxLen,
  isUrl,
  isIn,
} = require("../utils/validators");

const router = express.Router();

const createSchema = {
  name: [required("Company name"), maxLen(120, "Company name")],
  websiteUrl: [required("Website URL"), isUrl("Website URL"), maxLen(255, "Website URL")],
  logo: [maxLen(255, "Logo URL")],
};

const updateSchema = {
  name: [required("Company name"), maxLen(120, "Company name")],
  websiteUrl: [required("Website URL"), isUrl("Website URL"), maxLen(255, "Website URL")],
  logo: [maxLen(255, "Logo URL")],
  status: [required("Status"), isIn(["active", "disabled"], "Status")],
};

router.get("/", optionalAuth, controller.listCompanies);
router.get("/:id", controller.getCompany);
router.post("/", authenticate, requireRole("admin"), validate(createSchema), controller.createCompany);
router.put("/:id", authenticate, requireRole("admin"), validate(updateSchema), controller.updateCompany);
router.delete("/:id", authenticate, requireRole("admin"), controller.deleteCompany);

module.exports = router;
