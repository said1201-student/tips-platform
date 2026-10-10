const companyModel = require("../models/companyModel");
const ApiError = require("../utils/ApiError");

async function listCompanies(req, res, next) {
  try {
    // Admins can request the full list (including disabled companies).
    const showAll = req.query.all === "1" && req.user && req.user.role === "admin";
    const companies = await companyModel.list({ activeOnly: !showAll });
    res.json({ companies });
  } catch (err) {
    next(err);
  }
}

async function getCompany(req, res, next) {
  try {
    const company = await companyModel.findById(req.params.id);
    if (!company) throw new ApiError(404, "Betting company not found.");
    res.json({ company });
  } catch (err) {
    next(err);
  }
}

async function createCompany(req, res, next) {
  try {
    const { name, logo, websiteUrl } = req.body;

    if (await companyModel.findByName(name)) {
      throw new ApiError(409, "A company with that name already exists.");
    }

    const company = await companyModel.create({ name, logo, websiteUrl });
    res.status(201).json({ message: "Company added.", company });
  } catch (err) {
    next(err);
  }
}

async function updateCompany(req, res, next) {
  try {
    const target = await companyModel.findById(req.params.id);
    if (!target) throw new ApiError(404, "Betting company not found.");

    const { name, logo, websiteUrl, status } = req.body;

    if (name && name !== target.name && (await companyModel.findByName(name))) {
      throw new ApiError(409, "A company with that name already exists.");
    }

    const company = await companyModel.update(target.id, {
      name,
      logo,
      website_url: websiteUrl,
      status,
    });
    res.json({ message: "Company updated.", company });
  } catch (err) {
    next(err);
  }
}

async function deleteCompany(req, res, next) {
  try {
    const target = await companyModel.findById(req.params.id);
    if (!target) throw new ApiError(404, "Betting company not found.");

    const { pool } = require("../config/db");
    const [[{ count }]] = await pool.query(
      "SELECT COUNT(*) AS count FROM tips WHERE company_id = ?",
      [target.id]
    );
    if (count > 0) {
      throw new ApiError(
        409,
        "This company has tips linked to it. Disable it instead of deleting."
      );
    }

    await companyModel.remove(target.id);
    res.json({ message: "Company deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
};
