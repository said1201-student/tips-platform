const { pool } = require("../config/db");

const SELECT = `
  SELECT id, title, image, link, sort_order, active, created_at, updated_at
  FROM home_images
`;

const COLUMN_MAP = {
  title: "title",
  image: "image",
  link: "link",
  sort_order: "sort_order",
  active: "active",
};

async function list({ activeOnly = false } = {}) {
  const where = activeOnly ? "WHERE active = 1" : "";
  const [rows] = await pool.query(`${SELECT} ${where} ORDER BY sort_order ASC, id ASC`);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(`${SELECT} WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function create({ title, image, link, sortOrder, active }) {
  const [result] = await pool.query(
    `INSERT INTO home_images (title, image, link, sort_order, active)
     VALUES (?, ?, ?, ?, ?)`,
    [title || null, image, link || null, sortOrder || 0, active === undefined ? 1 : active]
  );
  return findById(result.insertId);
}

async function update(id, fields) {
  const sets = [];
  const values = [];
  for (const key of Object.keys(COLUMN_MAP)) {
    if (fields[key] !== undefined) {
      sets.push(`${COLUMN_MAP[key]} = ?`);
      values.push(fields[key]);
    }
  }
  if (sets.length) {
    values.push(id);
    await pool.query(`UPDATE home_images SET ${sets.join(", ")} WHERE id = ?`, values);
  }
  return findById(id);
}

async function remove(id) {
  await pool.query("DELETE FROM home_images WHERE id = ?", [id]);
}

module.exports = { list, findById, create, update, remove };