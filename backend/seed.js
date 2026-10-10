/**
 * Database setup + seed script.
 * Run from the backend folder:  npm run seed
 *
 * It will:
 *   1. Create the database (if it does not exist)
 *   2. Create the three tables (from ../database/schema.sql)
 *   3. Seed one admin, demo tipsters, betting companies and sample tips
 *
 * Safe to run more than once.
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const DB_NAME = process.env.DB_NAME || "tips_platform";

const ADMIN_PASSWORD = "Admin@12345";
const TRIAL_PASSWORD = "Tryit@123";

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  console.log("Connected to MySQL.");

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  await connection.query(`USE \`${DB_NAME}\`;`);
  console.log(`Using database "${DB_NAME}".`);

  const schemaPath = path.join(__dirname, "..", "database", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  await connection.query(schema);
  console.log("Tables created (users, betting_companies, tips).");

  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const tipsterHash = await bcrypt.hash(TRIAL_PASSWORD, 10);

  await connection.query(
    `INSERT INTO users (full_name, username, email, password, role, status)
     VALUES (?, ?, ?, ?, 'admin', 'active')
     ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), role = 'admin';`,
    ["Platform Administrator", "admin", "admin@tipsplatform.test", adminHash]
  );

  const tipsters = [
    ["Said Tips", "saidtips", "said@tipsplatform.test"],
    ["Alpha Tips", "alphatips", "alpha@tipsplatform.test"],
    ["Smart Tips", "smarttips", "smart@tipsplatform.test"],
  ];
  for (const [fullName, username, email] of tipsters) {
    await connection.query(
      `INSERT INTO users (full_name, username, email, password, role, status)
       VALUES (?, ?, ?, ?, 'tipster', 'active')
       ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);`,
      [fullName, username, email, tipsterHash]
    );
  }
  console.log("Admin + demo tipsters seeded.");

  const companies = [
    ["Betway", "https://www.betway.com"],
    ["SportyBet", "https://www.sportybet.com"],
    ["1xBet", "https://www.1xbet.com"],
    ["Bet9ja", "https://www.bet9ja.com"],
  ];
  for (const [name, website] of companies) {
    await connection.query(
      `INSERT INTO betting_companies (name, website_url, status)
       VALUES (?, ?, 'active')
       ON DUPLICATE KEY UPDATE website_url = VALUES(website_url);`,
      [name, website]
    );
  }
  console.log("Betting companies seeded.");

  const [[{ tipCount }]] = await connection.query(
    "SELECT COUNT(*) AS tipCount FROM tips"
  );

  if (tipCount === 0) {
    const [[said]] = await connection.query(
      "SELECT id FROM users WHERE username = 'saidtips'"
    );
    const [[alpha]] = await connection.query(
      "SELECT id FROM users WHERE username = 'alphatips'"
    );
    const [[smart]] = await connection.query(
      "SELECT id FROM users WHERE username = 'smarttips'"
    );
    const [companyRows] = await connection.query(
      "SELECT id, name FROM betting_companies"
    );
    const companyId = (name) => companyRows.find((c) => c.name === name).id;

    const tips = [
      [said.id, companyId("Betway"), "Mega Weekend", "BW8K29X", 18.5, "Weekend accumulator.", "won", 120, 45],
      [said.id, companyId("SportyBet"), "Banker Double", "SP44Q1Z", 3.2, "Two safe home wins.", "won", 340, 88],
      [said.id, companyId("1xBet"), "Over 2.5 Special", "XB77M2K", 6.75, "Goals expected.", "pending", 210, 30],
      [alpha.id, companyId("Bet9ja"), "Alpha Combo", "BJ19P0L", 12.4, "Mixed markets combo.", "won", 512, 140],
      [alpha.id, companyId("Betway"), "Night Owl Treble", "BW3N8T2", 7.9, "Late kickoff treble.", "lost", 190, 22],
      [alpha.id, companyId("SportyBet"), "Safe Six", "SP60X9V", 4.1, "Six low-risk picks.", "pending", 95, 12],
      [smart.id, companyId("Bet9ja"), "Smart Money", "BJ72H4R", 25.0, "High odds value bets.", "won", 780, 260],
      [smart.id, companyId("1xBet"), "Value Singles", "XB11K5D", 9.6, "Singles value picks.", "lost", 260, 40],
      [smart.id, companyId("Betway"), "Weekend Rollover", "BW5R7Y1", 15.3, "Rollover build.", "void", 130, 18],
    ];
    for (const t of tips) {
      await connection.query(
        `INSERT INTO tips
          (tipster_id, company_id, title, slip_code, total_odds, description, status, views, copy_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        t
      );
    }
    console.log("Sample tips seeded.");
  } else {
    console.log("Tips already exist, skipping sample tips.");
  }

  await connection.end();
  console.log("\nDone! Admin login:");
  console.log(`  username: admin`);
  console.log(`  password: ${ADMIN_PASSWORD}`);
  console.log(`Demo tipster password: ${TRIAL_PASSWORD}`);
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
