const crypto = require("crypto");

/**
 * Generate a readable, reasonably strong temporary password.
 * Example: "Kx7p-Qm92"
 */
function generatePassword(length = 10) {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const all = upper + lower + digits;

  const pick = (set) => set[crypto.randomInt(set.length)];
  const chars = [pick(upper), pick(lower), pick(digits), pick(digits)];
  while (chars.length < length) chars.push(pick(all));

  // Shuffle so the guaranteed characters are not always at the front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

/** Trending score = views + (copy_count x 2). */
function trendingScore(views = 0, copyCount = 0) {
  return Number(views) + Number(copyCount) * 2;
}

/**
 * Win rate from counters. Pending and void tips are excluded.
 * completed = won + lost; if completed is 0 the rate is 0.
 */
function winRate(won = 0, lost = 0) {
  const completed = Number(won) + Number(lost);
  if (completed === 0) return 0;
  return Math.round((Number(won) / completed) * 1000) / 10;
}

module.exports = { generatePassword, trendingScore, winRate };
