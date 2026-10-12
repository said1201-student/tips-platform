const nodemailer = require("nodemailer");

const env = (key, fallback = "") => (process.env[key] || fallback).trim();

const MAIL_ENABLED = env("MAIL_ENABLED") === "true";

/**
 * Transport selection.
 *
 *   brevo | resend | sendgrid  -> HTTP APIs. These send over port 443, so they
 *                                 work on hosts that block outbound SMTP ports
 *                                 (e.g. Render free web services block 25/465/587).
 *   smtp                       -> classic SMTP via Nodemailer. Great locally or
 *                                 on hosts that still allow SMTP.
 *   ethereal                   -> Nodemailer test mailbox (no real delivery).
 *
 * Set MAIL_PROVIDER explicitly, or leave it unset to auto-detect:
 * an HTTP provider key wins, then MAIL_HOST, otherwise Ethereal.
 */
const PROVIDER = (() => {
  const explicit = env("MAIL_PROVIDER").toLowerCase();
  if (explicit) return explicit;
  if (env("BREVO_API_KEY")) return "brevo";
  if (env("RESEND_API_KEY")) return "resend";
  if (env("SENDGRID_API_KEY")) return "sendgrid";
  if (env("MAIL_HOST")) return "smtp";
  return "ethereal";
})();

const FROM = env("MAIL_FROM", "Tips Platform <no-reply@tipsplatform.test>");

function parseAddress(value) {
  const match = value.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/);
  if (match) return { name: match[1] || undefined, email: match[2] };
  return { name: undefined, email: value };
}

async function postJson(url, headers, body, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`${PROVIDER} API error ${res.status}: ${detail.slice(0, 300)}`);
    }
    return res;
  } finally {
    clearTimeout(timer);
  }
}

let transporterPromise = null;

function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = (async () => {
      if (env("MAIL_HOST")) {
        const port = Number(env("MAIL_PORT", "587"));
        return nodemailer.createTransport({
          host: env("MAIL_HOST"),
          port,
          secure: port === 465,
          auth: { user: env("MAIL_USER"), pass: env("MAIL_PASSWORD") },
        });
      }
      const account = await nodemailer.createTestAccount();
      console.log("\n──── Ethereal test mailbox created ────");
      console.log(`User: ${account.user}`);
      console.log(`Pass: ${account.pass}`);
      console.log(`Open previews at: https://ethereal.email\n`);
      return nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: { user: account.user, pass: account.pass },
      });
    })();
  }
  return transporterPromise;
}

async function sendViaBrevo({ to, subject, text, html }) {
  const key = env("BREVO_API_KEY");
  if (!key) throw new Error("BREVO_API_KEY is not set.");
  await postJson(
    "https://api.brevo.com/v3/smtp/email",
    { "api-key": key, accept: "application/json" },
    {
      sender: parseAddress(FROM),
      to: [{ email: to }],
      subject,
      ...(text ? { textContent: text } : {}),
      ...(html ? { htmlContent: html } : {}),
    }
  );
}

async function sendViaResend({ to, subject, text, html }) {
  const key = env("RESEND_API_KEY");
  if (!key) throw new Error("RESEND_API_KEY is not set.");
  await postJson(
    "https://api.resend.com/emails",
    { Authorization: `Bearer ${key}` },
    { from: FROM, to, subject, ...(text ? { text } : {}), ...(html ? { html } : {}) }
  );
}

async function sendViaSendgrid({ to, subject, text, html }) {
  const key = env("SENDGRID_API_KEY");
  if (!key) throw new Error("SENDGRID_API_KEY is not set.");
  const sender = parseAddress(FROM);
  await postJson(
    "https://api.sendgrid.com/v3/mail/send",
    { Authorization: `Bearer ${key}` },
    {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: sender.email, ...(sender.name ? { name: sender.name } : {}) },
      subject,
      content: [
        html ? { type: "text/html", value: html } : { type: "text/plain", value: text || "" },
      ],
    }
  );
}

/**
 * Sends an email when MAIL_ENABLED=true. Throws on provider failure so callers
 * can decide how to react.
 */
async function sendMail({ to, subject, text, html }) {
  if (!MAIL_ENABLED) {
    if (process.env.NODE_ENV !== "production") {
      console.log("\n──── DEV EMAIL (not actually sent) ────");
      console.log(`To:      ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(text || html);
      console.log("───────────────────────────────────────\n");
    }
    return { delivered: false, provider: "disabled" };
  }

  if (PROVIDER === "brevo") {
    await sendViaBrevo({ to, subject, text, html });
    return { delivered: true, provider: "brevo" };
  }
  if (PROVIDER === "resend") {
    await sendViaResend({ to, subject, text, html });
    return { delivered: true, provider: "resend" };
  }
  if (PROVIDER === "sendgrid") {
    await sendViaSendgrid({ to, subject, text, html });
    return { delivered: true, provider: "sendgrid" };
  }

  const transporter = await getTransporter();
  const info = await transporter.sendMail({ from: FROM, to, subject, text, html });
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`\n📧 Email sent to ${to} — preview: ${previewUrl}\n`);
  }
  return { delivered: true, provider: PROVIDER, previewUrl: previewUrl || null };
}

function sendTipsterCredentials({ fullName, username, temporaryPassword, email }) {
  const loginUrl = `${env("CLIENT_URL", "http://localhost:3000")}/login`;
  return sendMail({
    to: email,
    subject: "Your Tips Platform tipster account",
    text:
      `Hello ${fullName},\n\n` +
      `An account has been created for you on the Tips Platform.\n\n` +
      `Username: ${username}\n` +
      `Temporary password: ${temporaryPassword}\n` +
      `Login here: ${loginUrl}\n\n` +
      `Please log in and change your password as soon as possible.\n`,
  });
}

function sendPasswordReset({ to, resetUrl }) {
  return sendMail({
    to,
    subject: "Reset your Tips Platform password",
    text:
      `You requested a password reset.\n\n` +
      `Click the link below to choose a new password (valid for 30 minutes):\n` +
      `${resetUrl}\n\n` +
      `If you did not request this, you can ignore this email.\n`,
  });
}

module.exports = {
  sendMail,
  sendTipsterCredentials,
  sendPasswordReset,
  MAIL_ENABLED,
  PROVIDER,
};
