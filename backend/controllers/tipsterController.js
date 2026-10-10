const userModel = require("../models/userModel");
const tipModel = require("../models/tipModel");
const { winRate } = require("../utils/helpers");
const ApiError = require("../utils/ApiError");

function withStat(tipster) {
  const stats = {
    total_tips: Number(tipster.total_tips) || 0,
    won: Number(tipster.won) || 0,
    lost: Number(tipster.lost) || 0,
    pending: Number(tipster.pending) || 0,
    void: Number(tipster.void) || 0,
  };
  return {
    id: tipster.id,
    full_name: tipster.full_name,
    username: tipster.username,
    ...stats,
    win_rate: winRate(stats.won, stats.lost),
  };
}

// Public leaderboard (Top Tipsters)
async function listLeaderboard(req, res, next) {
  try {
    const rows = await userModel.leaderboard();
    const tipsters = rows.map(withStat).map((t, index) => ({ ...t, rank: index + 1 }));
    res.json({ tipsters });
  } catch (err) {
    next(err);
  }
}

// Public tipster profile + statistics + recent tips
async function getProfile(req, res, next) {
  try {
    const { username } = req.params;
    const tipster = await userModel.findByUsernamePublic(username);
    if (!tipster || tipster.status !== "active") {
      throw new ApiError(404, "Tipster not found.");
    }

    const [stats, tips] = await Promise.all([
      tipModel.statsForTipster(tipster.id),
      tipModel.listByTipster(tipster.id),
    ]);

    res.json({
      tipster: {
        id: tipster.id,
        full_name: tipster.full_name,
        username: tipster.username,
        created_at: tipster.created_at,
      },
      stats: {
        total_tips: Number(stats.total_tips) || 0,
        won: Number(stats.won) || 0,
        lost: Number(stats.lost) || 0,
        pending: Number(stats.pending) || 0,
        void: Number(stats.void) || 0,
        total_views: Number(stats.total_views) || 0,
        total_copies: Number(stats.total_copies) || 0,
        win_rate: winRate(stats.won, stats.lost),
      },
      tips: tips.map((t) => ({
        ...t,
        trending_score: Number(t.views) + Number(t.copy_count) * 2,
      })),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listLeaderboard, getProfile };
