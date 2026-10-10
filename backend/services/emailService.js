const nodemailer = require("nodemailer");

const MAIL_ENABLED = process.env.MAIL_ENABLED === "true";

let transporterPromise = null;

/**
 * Builds the SMTP transport once, on first use.
 *
 * - If MAIL_HOST is set, it uses the real SMTP server from the environment.
 * - If MAIL_ENABLED=true but no MAIL_HOST is given, it falls back to an
 *   Ethereal test account (no signup needed). Ethereal captures the mail and
 *   gives a preview URL instead of delivering to a real inbox — perfect for a
 *   demo. Provide real SMTP creds to deliver for real.
 */
function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = (async () => {
      if (process.env.MAIL_HOST) {
        return nodemailer.createTransport({
          host: process.env.MAIL_HOST,
          port: Number(process.env.MAIL_PORT || 587),
          secure: Number(process.env.MAIL_PORT) === 465,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
          },
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

/**
 * Sends an email when MAIL_ENABLED=true.
 * During development (MAIL_ENABLED=false) it logs the message to the console
 * instead of sending, so nothing sensitive is ever exposed in production logs.
 */
async function sendMail({ to, subject, text, html }) {
  const from = process.env.MAIL_FROM || "Tips Platform <no-reply@tipsplatform.test>";

  if (!MAIL_ENABLED) {
    if (process.env.NODE_ENV !== "production") {
      console.log("\n──── DEV EMAIL (not actually sent) ────");
      console.log(`To:      ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(text || html);
      console.log("───────────────────────────────────────\n");
    }
    return { delivered: false };
  }

  const transporter = await getTransporter();
  const info = await transporter.sendMail({ from, to, subject, text, html });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`\n📧 Email sent to ${to} — preview: ${previewUrl}\n`);
  }

  return { delivered: true, previewUrl: previewUrl || null };
}

function sendTipsterCredentials({ fullName, username, temporaryPassword, email }) {
  const loginUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/login`;
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
};
