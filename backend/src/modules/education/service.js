/**
 * Semua SQL dan logika education. Tidak pernah menyentuh `req` / `res`.
 *
 * Beda dengan `experiences` dan `skills`: education berdiri sendiri, tidak
 * punya tabel anak. Jadi tidak ada JOIN, tidak ada lipatan, dan tidak ada
 * transaksi — tiap operasi tulis selesai dalam satu pernyataan. Kesederhanaan
 * itu disengaja, bukan kelalaian.
 */

import { pool } from '../../db/pool.js';

const COLUMNS = 'id, qualification, org, location, start_date, end_date, note';

// `id` jadi tiebreaker: dua pendidikan boleh punya start_date sama, dan tanpa
// itu urutannya bisa berubah antar-eksekusi untuk data yang sama persis.
const LIST_SQL = `SELECT ${COLUMNS} FROM education ORDER BY start_date DESC, id ASC`;
const FIND_SQL = `SELECT ${COLUMNS} FROM education WHERE id = ?`;

const INSERT_SQL = `
  INSERT INTO education (qualification, org, location, start_date, end_date, note)
  VALUES (?, ?, ?, ?, ?, ?)
`;

const UPDATE_SQL = `
  UPDATE education
  SET qualification = ?, org = ?, location = ?,
      start_date = ?, end_date = ?, note = ?
  WHERE id = ?
`;

const columnValues = (input) => [
  input.qualification,
  input.org,
  input.location,
  input.start_date,
  input.end_date,
  input.note,
];

// `execute`, bukan `query`, walau sebagian tanpa parameter — supaya seluruh
// backend konsisten memakai prepared statement (aturan 3 handoff).
export async function listEducation() {
  const [rows] = await pool.execute(LIST_SQL);
  return rows;
}

export async function findEducationById(id) {
  const [rows] = await pool.execute(FIND_SQL, [id]);
  return rows[0] ?? null;
}

export async function createEducation(input) {
  const [result] = await pool.execute(INSERT_SQL, columnValues(input));
  return findEducationById(result.insertId);
}

/** Mengembalikan education terbaru, atau null kalau id-nya tidak ada. */
export async function updateEducation(id, input) {
  // Keberadaan baris diperiksa lewat SELECT, bukan dari affectedRows hasil
  // UPDATE. MySQL menghitung affectedRows sebagai baris yang BERUBAH, jadi
  // menyimpan form tanpa mengubah apa pun menghasilkan 0 — tidak bisa
  // dibedakan dari "id tidak ada", dan akan salah dibalas 404.
  if ((await findEducationById(id)) === null) return null;

  await pool.execute(UPDATE_SQL, [...columnValues(input), id]);
  return findEducationById(id);
}

/** Mengembalikan true kalau ada baris yang benar-benar terhapus. */
export async function deleteEducation(id) {
  const [result] = await pool.execute('DELETE FROM education WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
