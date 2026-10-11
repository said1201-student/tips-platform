const mysql = require("mysql2/promise");

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
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tips_platform",
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
