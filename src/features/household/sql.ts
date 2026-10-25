export const HOUSEHOLDS_SQL = `
  SELECT h.id, h.name, h.currency_code,
    (SELECT COUNT(*) FROM household_member mm
      WHERE mm.household_id = h.id AND mm.left_at IS NULL) AS members,
    (SELECT ROUND(SUM(CAST(e.amount AS REAL)), 2) FROM expense e
      WHERE e.household_id = h.id AND e.voided_at IS NULL
        AND datetime(e.spent_at) >= datetime(?) AND datetime(e.spent_at) < datetime(?)) AS month_total
  FROM household h
  JOIN household_member m ON m.household_id = h.id
  WHERE m.user_id = ? AND m.left_at IS NULL AND h.deleted_at IS NULL
  ORDER BY h.name`;

export const HOUSEHOLD_SQL = `
  SELECT name, currency_code, invite_code FROM household WHERE id = ?`;

export const MEMBERS_SQL = `
  SELECT id, user_id, nickname, role FROM household_member
  WHERE household_id = ? AND left_at IS NULL
  ORDER BY role = 'owner' DESC, nickname COLLATE NOCASE`;

export const MONTH_SUMMARY_SQL = `
  SELECT COUNT(*) AS count, COALESCE(SUM(CAST(amount AS REAL)), 0) AS total
  FROM expense
  WHERE household_id = ? AND voided_at IS NULL
    AND datetime(spent_at) >= datetime(?) AND datetime(spent_at) < datetime(?)`;

export const TOP_CATEGORIES_SQL = `
  SELECT category, ROUND(SUM(CAST(amount AS REAL)), 2) AS total
  FROM expense
  WHERE household_id = ? AND voided_at IS NULL
    AND datetime(spent_at) >= datetime(?) AND datetime(spent_at) < datetime(?)
  GROUP BY category
  ORDER BY total DESC
  LIMIT 2`;

export const RECENT_EXPENSES_SQL = `
  SELECT e.id, e.title, e.amount, e.category, e.spent_at, e.spender_id,
         m.nickname AS spender_nickname
  FROM expense e
  LEFT JOIN household_member m
    ON m.household_id = e.household_id AND m.user_id = e.spender_id
  WHERE e.household_id = ? AND e.voided_at IS NULL
    AND datetime(e.spent_at) >= datetime(?) AND datetime(e.spent_at) < datetime(?)
  ORDER BY e.spent_at DESC
  LIMIT 5`;

export const EXPENSES_SQL = `
  SELECT e.id, e.title, e.amount, e.category, e.spent_at, e.spender_id,
         m.nickname AS spender_nickname
  FROM expense e
  LEFT JOIN household_member m
    ON m.household_id = e.household_id AND m.user_id = e.spender_id
  WHERE e.household_id = ? AND e.voided_at IS NULL
    AND datetime(e.spent_at) >= datetime(?) AND datetime(e.spent_at) < datetime(?)
  ORDER BY e.spent_at DESC`;

export const EDIT_EXPENSE_SQL = `
  SELECT id, title, amount, category, note, spent_at
  FROM expense
  WHERE id = ? AND household_id = ? AND voided_at IS NULL`;
