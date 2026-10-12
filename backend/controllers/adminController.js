const bcrypt = require("bcryptjs");

const userModel = require("../models/userModel");
const { pool } = require("../config/db");
const { generatePassword } = require("../utils/helpers");
const { sendTipsterCredentials } = require("../services/emailService");
const ApiError = require("../utils/ApiError");

const isDev = process.env.NODE_ENV !== "production";

async function listTipsters(req, res, next) {
  try {
    const tipsters = await userModel.listTipsters();
    res.json({ tipsters });
  } catch (err) {
    next(err);
  }
}

async function getTipster(req, res, next) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user || user.role !== "tipster") {
      throw new ApiError(404, "Tipster not found.");
    }
    res.json({ tipster: user });
  } catch (err) {
    next(err);
  }
}

async function createTipster(req, res, next) {
  try {
    const { fullName, username, email } = req.body;

    if (await userModel.findByUsername(username)) {
      throw new ApiError(409, "That username is already taken.");
    }
    if (await userModel.findByEmail(email)) {
      throw new ApiError(409, "That email is already in use.");
    }

    const temporaryPassword = generatePassword(10);
    const hash = await bcrypt.hash(temporaryPassword, 10);

    const tipster = await userModel.create({
      fullName,
      username,
      email,
      password: hash,
      role: "tipster",
    });

    let emailDelivered = false;
    try {
      await sendTipsterCredentials({
        fullName,
        username,
        temporaryPassword,
        email,
      });
      emailDelivered = true;
    } catch (err) {
      console.error("Failed to send tipster credentials email:", err.message);
    }

    res.status(201).json({
      message: emailDelivered
        ? "Tipster created and credentials emailed."
        : "Tipster created, but the email could not be sent.",
      tipster,
      emailDelivered,
      ...(isDev || !emailDelivered ? { temporaryPassword } : {}),
    });
  } catch (err) {
    next(err);
  }
}

async function updateTipster(req, res, next) {
  try {
    const target = await userModel.findById(req.params.id);
    if (!target || target.role !== "tipster") {
      throw new ApiError(404, "Tipster not found.");
    }

    const { fullName, username, email, status } = req.body;

    if (username && username !== target.username) {
      const existing = await userModel.findByUsername(username);
      if (existing) throw new ApiError(409, "That username is already taken.");
    }
    if (email && email !== target.email) {
      const existing = await userModel.findByEmail(email);
      if (existing) throw new ApiError(409, "That email is already in use.");
    }

    const updated = await userModel.update(target.id, {
      full_name: fullName,
      username,
      email,
      status,
    });

    res.json({ message: "Tipster updated.", tipster: updated });
  } catch (err) {
    next(err);
  }
}

async function setStatus(req, res, next) {
  try {
    const { status } = req.body;
    const target = await userModel.findById(req.params.id);
    if (!target || target.role !== "tipster") {
      throw new ApiError(404, "Tipster not found.");
    }
    const updated = await userModel.update(target.id, { status });
    res.json({ message: `Tipster ${status === "active" ? "enabled" : "disabled"}.`, tipster: updated });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const target = await userModel.findById(req.params.id);
    if (!target || target.role !== "tipster") {
      throw new ApiError(404, "Tipster not found.");
    }

    const temporaryPassword = generatePassword(10);
    const hash = await bcrypt.hash(temporaryPassword, 10);
    await userModel.updatePassword(target.id, hash);

    let emailDelivered = false;
    try {
      await sendTipsterCredentials({
        fullName: target.full_name,
        username: target.username,
        temporaryPassword,
        email: target.email,
      });
      emailDelivered = true;
    } catch (err) {
      console.error("Failed to send tipster credentials email:", err.message);
    }

    res.json({
      message: emailDelivered
        ? "Password reset and credentials emailed."
        : "Password reset, but the email could not be sent.",
      emailDelivered,
      ...(isDev || !emailDelivered ? { temporaryPassword } : {}),
    });
  } catch (err) {
    next(err);
  }
}

async function deleteTipster(req, res, next) {
  try {
    const target = await userModel.findById(req.params.id);
    if (!target || target.role !== "tipster") {
      throw new ApiError(404, "Tipster not found.");
    }
    await userModel.remove(target.id);
    res.json({ message: "Tipster deleted." });
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const [[tipsters]] = await pool.query(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'tipster'"
    );
    const [[companies]] = await pool.query(
      "SELECT COUNT(*) AS total FROM betting_companies"
    );
    const [[tips]] = await pool.query(
      `SELECT
         COUNT(*) AS total,
         COALESCE(SUM(status = 'won'), 0) AS won,
         COALESCE(SUM(status = 'lost'), 0) AS lost,
         COALESCE(SUM(status = 'pending'), 0) AS pending,
         COALESCE(SUM(status = 'void'), 0) AS void,
         COALESCE(SUM(views), 0) AS views,
         COALESCE(SUM(copy_count), 0) AS copies
       FROM tips`
    );

    res.json({
      stats: {
        total_tipsters: tipsters.total,
        total_companies: companies.total,
        total_tips: tips.total,
        won: Number(tips.won),
        lost: Number(tips.lost),
        pending: Number(tips.pending),
        void: Number(tips.void),
        total_views: Number(tips.views),
        total_copies: Number(tips.copies),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listTipsters,
  getTipster,
  createTipster,
  updateTipster,
  setStatus,
  resetPassword,
  deleteTipster,
  getStats,
};
