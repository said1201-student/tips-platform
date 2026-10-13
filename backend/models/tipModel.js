const { pool } = require("../config/db");

const BASE_SELECT = `
  SELECT t.id, t.title, t.slip_code, t.total_odds, t.description,
         t.status, t.review_status, t.views, t.copy_count, t.created_at, t.updated_at,
         t.tipster_id, t.company_id,
         u.full_name AS tipster_name, u.username AS tipster_username,
         c.name AS company_name, c.logo AS company_logo,
         c.website_url AS company_website, c.status AS company_status
  FROM tips t
  JOIN users u ON u.id = t.tipster_id
  JOIN betting_companies c ON c.id = t.company_id
`;

const DETAIL_SELECT = `
  SELECT t.id, t.title, t.slip_code, t.total_odds, t.description,
         t.status, t.review_status, t.views, t.copy_count, t.created_at, t.updated_at,
         t.tipster_id, t.company_id,
         u.full_name AS tipster_name, u.username AS tipster_username,
         c.name AS company_name, c.logo AS company_logo,
         c.website_url AS company_website, c.status AS company_status,
         t.slip_image, t.result_image
  FROM tips t
  JOIN users u ON u.id = t.tipster_id
  JOIN betting_companies c ON c.id = t.company_id
`;

const SORTS = {
  newest: "t.created_at DESC",
  oldest: "t.created_at ASC",
  viewed: "t.views DESC",
  copied: "t.copy_count DESC",
  odds: "t.total_odds DESC",
  trending: "(t.views + t.copy_count * 2) DESC",
};

async function list({
  search,
  companyId,
  tipster,
  status,
  sort = "newest",
  limit = 50,
  offset = 0,
  activeTipstersOnly = true,
  includePending = false,
  reviewStatus,
} = {}) {
  const where = [];
  const values = [];

  if (activeTipstersOnly) where.push("u.role = 'tipster' AND u.status = 'active'");
  if (!includePending) where.push("t.review_status = 'approved'");
  if (reviewStatus) {
    where.push("t.review_status = ?");
    values.push(reviewStatus);
  }
  if (search) {
    where.push("(t.title LIKE ? OR t.slip_code LIKE ?)");
    values.push(`%${search}%`, `%${search}%`);
  }
  if (companyId) {
    where.push("t.company_id = ?");
    values.push(companyId);
  }
  if (tipster) {
    where.push("u.username = ?");
    values.push(tipster);
  }
  if (status) {
    where.push("t.status = ?");
    values.push(status);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderSql = SORTS[sort] || SORTS.newest;
  values.push(Number(limit), Number(offset));

  const [rows] = await pool.query(
    `${BASE_SELECT} ${whereSql} ORDER BY ${orderSql} LIMIT ? OFFSET ?`,
    values
  );
  return rows;
}

async function count({ search, companyId, tipster, status, activeTipstersOnly = true, includePending = false, reviewStatus } = {}) {
  const where = [];
  const values = [];
  if (activeTipstersOnly) where.push("u.role = 'tipster' AND u.status = 'active'");
  if (!includePending) where.push("t.review_status = 'approved'");
  if (reviewStatus) {
    where.push("t.review_status = ?");
    values.push(reviewStatus);
  }
  if (search) {
    where.push("(t.title LIKE ? OR t.slip_code LIKE ?)");
    values.push(`%${search}%`, `%${search}%`);
  }
  if (companyId) {
    where.push("t.company_id = ?");
    values.push(companyId);
  }
  if (tipster) {
    where.push("u.username = ?");
    values.push(tipster);
  }
  if (status) {
    where.push("t.status = ?");
    values.push(status);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM tips t
     JOIN users u ON u.id = t.tipster_id
     ${whereSql}`,
    values
  );
  return rows[0].total;
}

async function findById(id, { approvedOnly = true } = {}) {
  const approvedSql = approvedOnly ? "AND t.review_status = 'approved'" : "";
  const [rows] = await pool.query(
    `${DETAIL_SELECT} WHERE t.id = ? ${approvedSql} LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function listByTipster(tipsterId, { includePending = false } = {}) {
  const approvedSql = includePending ? "" : "AND t.review_status = 'approved'";
  const [rows] = await pool.query(
    `${BASE_SELECT} WHERE t.tipster_id = ? ${approvedSql} ORDER BY t.created_at DESC`,
    [tipsterId]
  );
  return rows;
}

async function listWinners(limit = 6) {
  const [rows] = await pool.query(
    `SELECT t.id, t.title, t.total_odds, t.status, t.review_status, t.updated_at,
            t.tipster_id, t.result_image,
            u.full_name AS tipster_name, u.username AS tipster_username,
            c.name AS company_name, c.logo AS company_logo, c.website_url AS company_website
     FROM tips t
     JOIN users u ON u.id = t.tipster_id
     JOIN betting_companies c ON c.id = t.company_id
     WHERE t.status = 'won' AND t.review_status = 'approved'
       AND t.result_image IS NOT NULL
       AND u.role = 'tipster' AND u.status = 'active'
     ORDER BY t.updated_at DESC
     LIMIT ?`,
    [Number(limit)]
  );
  return rows;
}

async function create({ tipsterId, companyId, title, slipCode, totalOdds, description, slipImage }) {
  const [result] = await pool.query(
    `INSERT INTO tips (tipster_id, company_id, title, slip_code, total_odds, description, slip_image, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [tipsterId, companyId, title, slipCode, totalOdds, description || null, slipImage || null]
  );
  return findById(result.insertId, { approvedOnly: false });
}

const COLUMN_MAP = {
  title: "title",
  slip_code: "slip_code",
  total_odds: "total_odds",
  description: "description",
  status: "status",
  slip_image: "slip_image",
  result_image: "result_image",
  review_status: "review_status",
  company_id: "company_id",
};

async function update(id, fields) {
  const sets = [];
  const values = [];
  for (const key of Object.keys(COLUMN_MAP)) {
    if (fields[key] !== undefined) {
      sets.push(`${COLUMN_MAP[key]} = ?`);
      values.push(fields[key]);
    }
  }
  if (sets.length === 0) return findById(id, { approvedOnly: false });
  values.push(id);
  await pool.query(`UPDATE tips SET ${sets.join(", ")} WHERE id = ?`, values);
  return findById(id, { approvedOnly: false });
}

async function remove(id) {
  await pool.query("DELETE FROM tips WHERE id = ?", [id]);
}

async function incrementViews(id) {
  await pool.query("UPDATE tips SET views = views + 1 WHERE id = ?", [id]);
}

async function incrementCopy(id) {
  await pool.query("UPDATE tips SET copy_count = copy_count + 1 WHERE id = ?", [id]);
}

async function statsForTipster(tipsterId, { approvedOnly = true } = {}) {
  const approvedSql = approvedOnly ? " AND review_status = 'approved'" : "";
  const [rows] = await pool.query(
    `SELECT
       COUNT(*) AS total_tips,
       COALESCE(SUM(status = 'won'), 0) AS won,
       COALESCE(SUM(status = 'lost'), 0) AS lost,
       COALESCE(SUM(status = 'pending'), 0) AS pending,
       COALESCE(SUM(status = 'void'), 0) AS void,
       COALESCE(SUM(views), 0) AS total_views,
       COALESCE(SUM(copy_count), 0) AS total_copies
     FROM tips WHERE tipster_id = ?${approvedSql}`,
    [tipsterId]
  );
  return rows[0];
}

module.exports = {
  list,
  count,
  findById,
  listByTipster,
  listWinners,
  create,
  update,
  remove,
  incrementViews,
  incrementCopy,
  statsForTipster,
  SORTS,
};
