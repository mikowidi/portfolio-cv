/**
 * Semua SQL dan logika experiences. Tidak pernah menyentuh `req` / `res`.
 */

import { pool } from '../../db/pool.js';

// Satu query untuk experience beserta highlight-nya. LEFT JOIN, bukan INNER,
// supaya experience yang belum punya highlight tetap ikut terbawa.
//
// `e.id` ikut disebut di ORDER BY walaupun kontrak hanya meminta start_date DESC:
// dua experience boleh punya start_date yang sama, dan tanpa tiebreaker ini
// barisnya bisa berselang-seling sehingga hasil lipatan tidak stabil.
const LIST_SQL = `
  SELECT
    e.id, e.position, e.org, e.location, e.employment_type,
    e.start_date, e.end_date, e.summary,
    h.id   AS highlight_id,
    h.body AS highlight_body
  FROM experiences e
  LEFT JOIN experience_highlights h ON h.experience_id = e.id
  ORDER BY e.start_date DESC, e.id ASC, h.sort_order ASC
`;

export async function listExperiences() {
  const [rows] = await pool.query(LIST_SQL);
  return foldRows(rows);
}

/**
 * Melipat hasil JOIN yang datar menjadi bersarang.
 *
 * JOIN mengembalikan SATU BARIS PER HIGHLIGHT, jadi experience dengan 4
 * highlight muncul 4 kali dengan kolom experience yang berulang. Fungsi ini
 * menggabungkannya kembali jadi satu objek dengan array `highlights`.
 *
 * Kuncinya Map: selain O(1) saat mencari induk, Map mempertahankan urutan
 * penyisipan — jadi urutan `start_date DESC` yang sudah benar dari SQL ikut
 * terjaga tanpa perlu sort ulang di JavaScript.
 *
 * Alternatifnya: ambil daftar experience dulu, lalu satu query highlight per
 * experience. Itu N+1 query, dan justru itu yang dihindari di sini.
 */
function foldRows(rows) {
  const byId = new Map();

  for (const row of rows) {
    if (!byId.has(row.id)) {
      byId.set(row.id, {
        id: row.id,
        position: row.position,
        org: row.org,
        location: row.location,
        employment_type: row.employment_type,
        start_date: row.start_date,
        end_date: row.end_date,
        summary: row.summary,
        highlights: [],
      });
    }

    // LEFT JOIN mengisi kolom highlight dengan NULL kalau experience-nya memang
    // belum punya highlight sama sekali — baris seperti itu tidak boleh masuk.
    if (row.highlight_id !== null) {
      byId.get(row.id).highlights.push({
        id: row.highlight_id,
        body: row.highlight_body,
      });
    }
  }

  return [...byId.values()];
}
