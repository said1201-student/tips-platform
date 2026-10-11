const mysql = require("mysql2/promise");

// Trim accidental whitespace/tabs that can sneak in when pasting values
// into a hosting provider's environment-variable form.
const env = (key, fallback = "") => (process.env[key] || fallback).trim();

// Managed MySQL providers (Aiven, PlanetScale, etc.) require TLS.
// Set DB_SSL=true in production. DB_SSL_CA (optional) holds a PEM certificate.
const ssl =
  process.env.DB_SSL === "true"
    ? {
        rejectUnauthorized: false,
        ...(process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA.replace(/\\n/g, "\n") } : {}),
      }
    : undefined;

const pool = mysql.createPool({
  host: env("DB_HOST", "localhost"),
  port: Number(env("DB_PORT", "3306")),
  user: env("DB_USER", "root"),
  password: env("DB_PASSWORD"),
  database: env("DB_NAME", "tips_platform"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4_unicode_ci",
  ssl,
});

async function testConnection(retries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const connection = await pool.getConnection();
      try {
        await connection.ping();
      } finally {
        connection.release();
      }
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(
        `Database connection attempt ${attempt}/${retries} failed: ${err.message}. Retrying...`
      );
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

module.exports = { pool, testConnection };
