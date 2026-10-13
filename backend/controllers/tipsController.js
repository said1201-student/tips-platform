const tipModel = require("../models/tipModel");
const companyModel = require("../models/companyModel");
const userModel = require("../models/userModel");
const { trendingScore, winRate } = require("../utils/helpers");
const ApiError = require("../utils/ApiError");

// Simple in-memory de-duplication so a single visitor does not inflate the
// view counter by refreshing the page. Keyed by "ip:tipId".
const recentViews = new Map();
const VIEW_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

function shouldCountView(req, tipId) {
  const ip = req.ip || req.connection?.remoteAddress || "unknown";
  const key = `${ip}:${tipId}`;
  const now = Date.now();
  const last = recentViews.get(key);
  if (last && now - last < VIEW_WINDOW_MS) return false;
  recentViews.set(key, now);
  if (recentViews.size > 5000) recentViews.clear();
  return true;
}

function withTrending(tip) {
  return { ...tip, trending_score: trendingScore(tip.views, tip.copy_count) };
}

const STATUS_VALUES = ["pending", "won", "lost", "void"];

const IMAGE_DATA_URL_RE = /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=\s]+$/i;

function normalizeImage(value, label = "Image") {
  if (value === undefined || value === null) return undefined;
  if (value === "") return "";
  if (typeof value !== "string" || value.length > 6000000 || !IMAGE_DATA_URL_RE.test(value)) {
    throw new ApiError(422, `${label} must be a valid image (PNG/JPG/WebP/GIF, max 4 MB).`);
  }
  return value;
}

// ---------- Public ----------

async function listTips(req, res, next) {
  try {
    const { search, company_id, tipster, status, sort = "newest" } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const perPage = Math.min(50, Math.max(1, Number(req.query.per_page) || 12));

    if (status && !STATUS_VALUES.includes(status)) {
      throw new ApiError(400, "Invalid status filter.");
    }
    if (sort && !tipModel.SORTS[sort]) {
      throw new ApiError(400, "Invalid sort option.");
    }

    const filters = {
      search: search ? String(search).trim() : undefined,
      companyId: company_id ? Number(company_id) : undefined,
      tipster: tipster ? String(tipster).trim() : undefined,
      status,
      sort,
      limit: perPage,
      offset: (page - 1) * perPage,
    };

    const [tips, total] = await Promise.all([
      tipModel.list(filters),
      tipModel.count(filters),
    ]);

    res.json({
      tips: tips.map(withTrending),
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getTip(req, res, next) {
  try {
    const tip = await tipModel.findById(req.params.id);
    if (!tip) throw new ApiError(404, "Tip not found.");
    res.json({ tip: withTrending(tip) });
  } catch (err) {
    next(err);
  }
}

async function recordView(req, res, next) {
  try {
    const tip = await tipModel.findById(req.params.id);
    if (!tip) throw new ApiError(404, "Tip not found.");

    let counted = false;
    if (shouldCountView(req, tip.id)) {
      await tipModel.incrementViews(tip.id);
      tip.views += 1;
      counted = true;
    }
    res.json({ counted, views: tip.views });
  } catch (err) {
    next(err);
  }
}

async function copyTip(req, res, next) {
  try {
    const tip = await tipModel.findById(req.params.id);
    if (!tip) throw new ApiError(404, "Tip not found.");
    await tipModel.incrementCopy(tip.id);
    res.json({ message: "Copy recorded.", copy_count: tip.copy_count + 1 });
  } catch (err) {
    next(err);
  }
}

// ---------- Tipster ----------

async function listMyTips(req, res, next) {
  try {
    const tips = await tipModel.listByTipster(req.user.id, { includePending: true });
    res.json({ tips: tips.map(withTrending) });
  } catch (err) {
    next(err);
  }
}

async function getMyTip(req, res, next) {
  try {
    const tip = await tipModel.findById(req.params.id, { approvedOnly: false });
    if (!tip) throw new ApiError(404, "Tip not found.");
    if (req.user.id !== tip.tipster_id) {
      throw new ApiError(403, "You can only view your own tips.");
    }
    res.json({ tip: withTrending(tip) });
  } catch (err) {
    next(err);
  }
}

async function myStats(req, res, next) {
  try {
    const raw = await tipModel.statsForTipster(req.user.id, { approvedOnly: false });
    const stats = {
      total_tips: Number(raw.total_tips) || 0,
      won: Number(raw.won) || 0,
      lost: Number(raw.lost) || 0,
      pending: Number(raw.pending) || 0,
      void: Number(raw.void) || 0,
      total_views: Number(raw.total_views) || 0,
      total_copies: Number(raw.total_copies) || 0,
    };
    res.json({ stats: { ...stats, win_rate: winRate(stats.won, stats.lost) } });
  } catch (err) {
    next(err);
  }
}

async function createTip(req, res, next) {
  try {
    const { companyId, title, slipCode, totalOdds, description, slipImage } = req.body;

    const company = await companyModel.findById(companyId);
    if (!company) throw new ApiError(400, "Please choose a valid betting company.");
    if (company.status !== "active") {
      throw new ApiError(400, "That betting company is not available.");
    }

    const tip = await tipModel.create({
      tipsterId: req.user.id,
      companyId,
      title,
      slipCode,
      totalOdds,
      description,
      slipImage: normalizeImage(slipImage, "Slip image"),
    });

    res.status(201).json({ message: "Tip created.", tip: withTrending(tip) });
  } catch (err) {
    next(err);
  }
}

async function loadOwnedTip(req) {
  const tip = await tipModel.findById(req.params.id);
  if (!tip) throw new ApiError(404, "Tip not found.");
  if (req.user.role !== "admin" && tip.tipster_id !== req.user.id) {
    throw new ApiError(403, "You can only manage your own tips.");
  }
  return tip;
}

async function updateTip(req, res, next) {
  try {
    const tip = await loadOwnedTip(req);
    const {
      companyId,
      title,
      slipCode,
      totalOdds,
      description,
      status,
      slipImage,
      resultImage,
    } = req.body;

    const fields = {};
    if (title !== undefined) fields.title = title;
    if (slipCode !== undefined) fields.slip_code = slipCode;
    if (totalOdds !== undefined) fields.total_odds = totalOdds;
    if (description !== undefined) fields.description = description;

    if (companyId !== undefined) {
      const company = await companyModel.findById(companyId);
      if (!company || company.status !== "active") {
        throw new ApiError(400, "Please choose a valid betting company.");
      }
      fields.company_id = companyId;
    }

    // The owner (or an admin) may mark the result once the matches finish.
    if (status !== undefined) {
      if (!STATUS_VALUES.includes(status)) {
        throw new ApiError(400, "Invalid status.");
      }
      fields.status = status;
    }

    if (slipImage !== undefined) fields.slip_image = normalizeImage(slipImage, "Slip image");
    if (resultImage !== undefined) fields.result_image = normalizeImage(resultImage, "Result slip");

    const updated = await tipModel.update(tip.id, fields);
    res.json({ message: "Tip updated.", tip: withTrending(updated) });
  } catch (err) {
    next(err);
  }
}

async function deleteTip(req, res, next) {
  try {
    const tip = await loadOwnedTip(req);
    await tipModel.remove(tip.id);
    res.json({ message: "Tip deleted." });
  } catch (err) {
    next(err);
  }
}

// ---------- Admin ----------

async function adminListTips(req, res, next) {
  try {
    const { search, company_id, tipster, status, sort = "newest" } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const perPage = Math.min(100, Math.max(1, Number(req.query.per_page) || 20));

    const filters = {
      search: search ? String(search).trim() : undefined,
      companyId: company_id ? Number(company_id) : undefined,
      tipster: tipster ? String(tipster).trim() : undefined,
      status: STATUS_VALUES.includes(status) ? status : undefined,
      sort: tipModel.SORTS[sort] ? sort : "newest",
      limit: perPage,
      offset: (page - 1) * perPage,
      activeTipstersOnly: false,
      includePending: true,
    };

    const [tips, total] = await Promise.all([
      tipModel.list(filters),
      tipModel.count(filters),
    ]);

    res.json({
      tips: tips.map(withTrending),
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function adminSetStatus(req, res, next) {
  try {
    const { status } = req.body;
    const tip = await tipModel.findById(req.params.id, { approvedOnly: false });
    if (!tip) throw new ApiError(404, "Tip not found.");

    const updated = await tipModel.update(tip.id, { status });
    res.json({ message: `Tip marked as ${status}.`, tip: withTrending(updated) });
  } catch (err) {
    next(err);
  }
}

async function adminReviewTip(req, res, next) {
  try {
    const { action } = req.body;
    const tip = await tipModel.findById(req.params.id, { approvedOnly: false });
    if (!tip) throw new ApiError(404, "Tip not found.");

    const reviewStatus = action === "approve" ? "approved" : "rejected";
    const updated = await tipModel.update(tip.id, { review_status: reviewStatus });
    res.json({
      message:
        action === "approve"
          ? "Tip approved and is now public."
          : "Tip rejected. It will not be shown publicly.",
      tip: withTrending(updated),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listTips,
  getTip,
  recordView,
  copyTip,
  listMyTips,
  getMyTip,
  myStats,
  createTip,
  updateTip,
  deleteTip,
  adminListTips,
  adminSetStatus,
  adminReviewTip,
  STATUS_VALUES,
};
