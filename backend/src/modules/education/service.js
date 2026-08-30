/**
 * Semua SQL dan logika education. Tidak pernah menyentuh `req` / `res`.
 *
 * Beda dengan `experiences` dan `skills`: education berdiri sendiri, tidak
 * punya tabel anak. Jadi tidak ada JOIN dan tidak ada lipatan — hasil query
 * langsung berbentuk kontrak. Kesederhanaan itu disengaja, bukan kelalaian.
 */

import { pool } from '../../db/pool.js';

const COLUMNS = 'id, qualification, org, location, start_date, end_date, note';

// `id` jadi tiebreaker: dua pendidikan boleh punya start_date sama, dan tanpa
// itu urutannya bisa berubah antar-eksekusi untuk data yang sama persis.
const LIST_SQL = `SELECT ${COLUMNS} FROM education ORDER BY start_date DESC, id ASC`;

// `execute`, bukan `query`, walau tanpa parameter — supaya seluruh backend
// konsisten memakai prepared statement (aturan 3 handoff).
export async function listEducation() {
  const [rows] = await pool.execute(LIST_SQL);
  return rows;
}
