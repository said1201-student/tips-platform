const bcrypt = require("bcryptjs");

const userModel = require("../models/userModel");
const { signToken, createResetToken, consumeResetToken } = require("../services/tokenService");
const { sendPasswordReset } = require("../services/emailService");
const ApiError = require("../utils/ApiError");
const { COOKIE_NAME } = require("../middleware/auth");

const isProduction = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  path: "/",
};

// A non-httpOnly flag so the client can tell whether to even ask for a session.
// Without it the browser logs a 401 on every anonymous page load.
const SESSION_FLAG = "tip_session";
const SESSION_FLAG_OPTIONS = {
  httpOnly: false,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
  maxAge: COOKIE_OPTIONS.maxAge,
  path: "/",
};

function toPublicUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
    created_at: user.created_at,
  };
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await userModel.findByUsername(username);

    if (!user) {
      throw new ApiError(401, "Invalid username or password.");
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new ApiError(401, "Invalid username or password.");
    }

    if (user.status === "disabled") {
      throw new ApiError(
        403,
        "Your account has been disabled. Please contact the administrator."
      );
    }

    const token = signToken({ id: user.id, role: user.role });
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    res.cookie(SESSION_FLAG, "1", SESSION_FLAG_OPTIONS);
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    res.clearCookie(COOKIE_NAME, { ...COOKIE_OPTIONS, maxAge: undefined });
    res.clearCookie(SESSION_FLAG, { ...SESSION_FLAG_OPTIONS, maxAge: undefined });
    res.json({ message: "Logged out." });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    res.json({ user: toPublicUser(req.user) });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await userModel.findByIdWithPassword(req.user.id);

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      throw new ApiError(400, "Your current password is incorrect.");
    }

    const sameAsOld = await bcrypt.compare(newPassword, user.password);
    if (sameAsOld) {
      throw new ApiError(400, "Your new password must be different from the current one.");
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(user.id, hash);
    res.json({ message: "Password changed successfully." });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { fullName, username, email } = req.body;

    if (username && username !== req.user.username) {
      const existing = await userModel.findByUsername(username);
      if (existing) throw new ApiError(409, "That username is already taken.");
    }
    if (email && email !== req.user.email) {
      const existing = await userModel.findByEmail(email);
      if (existing) throw new ApiError(409, "That email is already in use.");
    }

    const updated = await userModel.update(req.user.id, {
      full_name: fullName,
      username,
      email,
    });

    res.json({ message: "Profile updated.", user: toPublicUser(updated) });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await userModel.findByEmail(email);

    // Always respond the same way so we never reveal which emails exist.
    const genericMessage =
      "If an account with that email exists, password reset instructions have been sent.";

    if (user && user.status === "active") {
      const token = createResetToken(user.id);
      const base = process.env.CLIENT_URL || "http://localhost:3000";
      const resetUrl = `${base}/reset-password?token=${token}`;
      await sendPasswordReset({ to: user.email, resetUrl });
    }

    res.json({ message: genericMessage });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    const userId = consumeResetToken(token);
    if (!userId) {
      throw new ApiError(400, "This reset link is invalid or has expired.");
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(userId, hash);
    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  logout,
  me,
  changePassword,
  updateProfile,
  forgotPassword,
  resetPassword,
  toPublicUser,
};
