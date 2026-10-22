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
