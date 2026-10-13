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

async function runMigrations() {
  const connection = await pool.getConnection();
  try {
    const [cols] = await connection.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tips'`
    );
    const names = new Set(cols.map((c) => c.COLUMN_NAME));

    if (!names.has("slip_image")) {
      await connection.query("ALTER TABLE tips ADD COLUMN slip_image LONGTEXT NULL");
      console.log("Migration: added tips.slip_image");
    }
    if (!names.has("result_image")) {
      await connection.query("ALTER TABLE tips ADD COLUMN result_image LONGTEXT NULL");
      console.log("Migration: added tips.result_image");
    }
    if (!names.has("review_status")) {
      await connection.query(
        "ALTER TABLE tips ADD COLUMN review_status ENUM('pending_review','approved','rejected') NOT NULL DEFAULT 'pending_review'"
      );
      console.log("Migration: added tips.review_status");
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS home_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) DEFAULT NULL,
        image LONGTEXT NOT NULL,
        link VARCHAR(500) DEFAULT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("Migration: ensured home_images table");
  } finally {
    connection.release();
  }
}

module.exports = { pool, testConnection, runMigrations };
