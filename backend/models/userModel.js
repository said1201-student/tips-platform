const { pool } = require("../config/db");

const PUBLIC_FIELDS =
  "id, full_name, username, email, role, status, created_at, updated_at";

async function findByUsername(username) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE username = ? LIMIT 1",
    [username]
  );
  return rows[0] || null;
}

async function findByEmail(email) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findByIdWithPassword(id) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

async function create({ fullName, username, email, password, role = "tipster", status = "active" }) {
  const [result] = await pool.query(
    `INSERT INTO users (full_name, username, email, password, role, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [fullName, username, email, password, role, status]
  );
  return findById(result.insertId);
}

async function updatePassword(id, passwordHash) {
  await pool.query("UPDATE users SET password = ? WHERE id = ?", [
    passwordHash,
    id,
  ]);
}

async function update(id, fields) {
  const allowed = ["full_name", "username", "email", "status"];
  const sets = [];
  const values = [];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }
  if (sets.length === 0) return findById(id);
  values.push(id);
  await pool.query(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`, values);
  return findById(id);
}

async function remove(id) {
  await pool.query("DELETE FROM users WHERE id = ?", [id]);
}

/** All tipsters with their tip counters, for the admin list. */
async function listTipsters() {
  const [rows] = await pool.query(
    `SELECT u.id, u.full_name, u.username, u.email, u.status, u.created_at,
            COUNT(t.id) AS total_tips,
            COALESCE(SUM(t.status = 'won'), 0) AS won,
            COALESCE(SUM(t.status = 'lost'), 0) AS lost,
            COALESCE(SUM(t.status = 'pending'), 0) AS pending,
            COALESCE(SUM(t.status = 'void'), 0) AS void
     FROM users u
     LEFT JOIN tips t ON t.tipster_id = u.id
     WHERE u.role = 'tipster'
     GROUP BY u.id
     ORDER BY u.created_at DESC`
  );
  return rows;
}

/** Public leaderboard: active tipsters who have at least one tip. */
async function leaderboard() {
  const [rows] = await pool.query(
    `SELECT u.id, u.full_name, u.username,
            COUNT(t.id) AS total_tips,
            COALESCE(SUM(t.status = 'won'), 0) AS won,
            COALESCE(SUM(t.status = 'lost'), 0) AS lost,
            COALESCE(SUM(t.status = 'pending'), 0) AS pending
     FROM users u
     LEFT JOIN tips t ON t.tipster_id = u.id AND t.review_status = 'approved'
     WHERE u.role = 'tipster' AND u.status = 'active'
     GROUP BY u.id
     HAVING total_tips > 0
     ORDER BY won DESC, total_tips DESC, u.full_name ASC`
  );
  return rows;
}

/** Latest active tipsters (newest first), used on the homepage. */
async function latestTipsters(limit = 4) {
  const [rows] = await pool.query(
    `SELECT u.id, u.full_name, u.username,
            COUNT(t.id) AS total_tips,
            COALESCE(SUM(t.status = 'won'), 0) AS won,
            COALESCE(SUM(t.status = 'lost'), 0) AS lost,
            COALESCE(SUM(t.status = 'pending'), 0) AS pending
     FROM users u
     LEFT JOIN tips t ON t.tipster_id = u.id AND t.review_status = 'approved'
     WHERE u.role = 'tipster' AND u.status = 'active'
     GROUP BY u.id
     ORDER BY u.created_at DESC, u.id DESC
     LIMIT ?`,
    [Number(limit) || 4]
  );
  return rows;
}

async function findByUsernamePublic(username) {
  const [rows] = await pool.query(
    `SELECT ${PUBLIC_FIELDS} FROM users
     WHERE username = ? AND role = 'tipster' LIMIT 1`,
    [username]
  );
  return rows[0] || null;
}

module.exports = {
  PUBLIC_FIELDS,
  findByUsername,
  findByEmail,
  findById,
  findByIdWithPassword,
  create,
  updatePassword,
  update,
  remove,
  listTipsters,
  leaderboard,
  latestTipsters,
  findByUsernamePublic,
};
