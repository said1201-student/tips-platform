const { verifyToken } = require("../services/tokenService");
const userModel = require("../models/userModel");
const ApiError = require("../utils/ApiError");

const COOKIE_NAME = "token";

function extractToken(req) {
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return null;
}

async function authenticate(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return next(new ApiError(401, "You must be logged in to continue."));
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return next(new ApiError(401, "Your session has expired. Please log in again."));
    }

    const user = await userModel.findById(payload.id);
    if (!user) {
      return next(new ApiError(401, "You must be logged in to continue."));
    }
    if (user.status === "disabled") {
      return next(
        new ApiError(403, "Your account has been disabled. Please contact the administrator.")
      );
    }

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "You must be logged in to continue."));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to do this."));
    }
    return next();
  };
}

/**
 * Attaches req.user when a valid token is present, but never blocks the
 * request. Useful for endpoints that show more data to admins.
 */
async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return next();
    const payload = verifyToken(token);
    const user = await userModel.findById(payload.id);
    if (user && user.status === "active") req.user = user;
    return next();
  } catch {
    return next();
  }
}

module.exports = { authenticate, requireRole, optionalAuth, COOKIE_NAME };
