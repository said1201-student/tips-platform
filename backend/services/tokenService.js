const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Password reset tokens are kept in memory (no extra database table).
 * Only a hash of the token is stored. Tokens expire quickly.
 */
const RESET_TTL_MS = 30 * 60 * 1000; // 30 minutes
const resetTokens = new Map(); // hash -> { userId, expiresAt }

function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function createResetToken(userId) {
  const raw = crypto.randomBytes(32).toString("hex");
  resetTokens.set(hashToken(raw), { userId, expiresAt: Date.now() + RESET_TTL_MS });
  return raw;
}

function consumeResetToken(raw) {
  if (!raw) return null;
  const key = hashToken(raw);
  const entry = resetTokens.get(key);
  if (!entry) return null;
  resetTokens.delete(key);
  if (entry.expiresAt < Date.now()) return null;
  return entry.userId;
}

module.exports = {
  signToken,
  verifyToken,
  createResetToken,
  consumeResetToken,
};
