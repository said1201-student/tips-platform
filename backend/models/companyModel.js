const { pool } = require("../config/db");

async function list({ activeOnly = true } = {}) {
  const where = activeOnly ? "WHERE status = 'active'" : "";
  const [rows] = await pool.query(
    `SELECT c.*,
            (SELECT COUNT(*) FROM tips t WHERE t.company_id = c.id) AS tip_count
     FROM betting_companies c
     ${where}
     ORDER BY c.status = 'active' DESC, c.name ASC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    "SELECT * FROM betting_companies WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

async function findByName(name) {
  const [rows] = await pool.query(
    "SELECT * FROM betting_companies WHERE name = ? LIMIT 1",
    [name]
  );
  return rows[0] || null;
}

async function create({ name, logo, websiteUrl }) {
  const [result] = await pool.query(
    "INSERT INTO betting_companies (name, logo, website_url, status) VALUES (?, ?, ?, 'active')",
    [name, logo || null, websiteUrl]
  );
  return findById(result.insertId);
}

async function update(id, fields) {
  const allowed = { name: "name", logo: "logo", website_url: "website_url", status: "status" };
  const sets = [];
  const values = [];
  for (const key of Object.keys(allowed)) {
    if (fields[key] !== undefined) {
      sets.push(`${allowed[key]} = ?`);
      values.push(fields[key]);
    }
  }
  if (sets.length === 0) return findById(id);
  values.push(id);
  await pool.query(
    `UPDATE betting_companies SET ${sets.join(", ")} WHERE id = ?`,
    values
  );
  return findById(id);
}

async function remove(id) {
  await pool.query("DELETE FROM betting_companies WHERE id = ?", [id]);
}

module.exports = { list, findById, findByName, create, update, remove };
