/**
 * Semua SQL dan logika skills. Tidak pernah menyentuh `req` / `res`.
 *
 * Bentuknya sengaja dibuat cermin `experiences`: satu induk membawa anaknya,
 * diambil dengan SATU query lalu dilipat — bukan satu query anak per induk
 * (N+1). Lipatannya memakai helper bersama di `db/foldRows.js`.
 */

import { foldRows } from '../../db/foldRows.js';
import { pool } from '../../db/pool.js';

// LEFT JOIN, bukan INNER: grup yang belum punya skill tetap ikut terbawa dan
// muncul di halaman sebagai grup kosong, bukan hilang tanpa jejak.
const SELECT_BASE = `
  SELECT
    g.id, g.name,
    s.id   AS skill_id,
    s.name AS skill_name
  FROM skill_groups g
  LEFT JOIN skills s ON s.group_id = g.id
`;

// `g.id` jadi tiebreaker: dua grup boleh punya sort_order sama, dan tanpa itu
// barisnya bisa berselang-seling sehingga hasil lipatan tidak stabil.
const LIST_SQL = `
  ${SELECT_BASE}
  ORDER BY g.sort_order ASC, g.id ASC, s.sort_order ASC, s.id ASC
`;

const FOLD = {
  key: 'skills',
  parent: (row) => ({ id: row.id, name: row.name }),
  child: (row) => (row.skill_id === null ? null : { id: row.skill_id, name: row.skill_name }),
};

export async function listSkillGroups() {
  const [rows] = await pool.execute(LIST_SQL);
  return foldRows(rows, FOLD);
}
