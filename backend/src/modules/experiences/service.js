/**
 * Semua SQL dan logika experiences. Tidak pernah menyentuh `req` / `res`.
 */

import { pool, withTransaction } from '../../db/pool.js';

// Satu query untuk experience beserta highlight-nya. LEFT JOIN, bukan INNER,
// supaya experience yang belum punya highlight tetap ikut terbawa.
const SELECT_BASE = `
  SELECT
    e.id, e.position, e.org, e.location, e.employment_type,
    e.start_date, e.end_date, e.summary,
    h.id   AS highlight_id,
    h.body AS highlight_body
  FROM experiences e
  LEFT JOIN experience_highlights h ON h.experience_id = e.id
`;

// `e.id` jadi tiebreaker: dua experience boleh punya start_date sama, dan tanpa
// itu barisnya bisa berselang-seling sehingga hasil lipatan tidak stabil.
const LIST_SQL = `${SELECT_BASE} ORDER BY e.start_date DESC, e.id ASC, h.sort_order ASC`;
const FIND_SQL = `${SELECT_BASE} WHERE e.id = ? ORDER BY h.sort_order ASC`;

const INSERT_SQL = `
  INSERT INTO experiences
    (position, org, location, employment_type, start_date, end_date, summary)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;

const UPDATE_SQL = `
  UPDATE experiences
  SET position = ?, org = ?, location = ?, employment_type = ?,
      start_date = ?, end_date = ?, summary = ?
  WHERE id = ?
`;

const columnValues = (input) => [
  input.position,
  input.org,
  input.location,
  input.employment_type,
  input.start_date,
  input.end_date,
  input.summary,
];

// `execute`, bukan `query`, walau sebagian tanpa parameter — supaya seluruh
// backend konsisten memakai prepared statement (aturan 3 handoff).
export async function listExperiences() {
  const [rows] = await pool.execute(LIST_SQL);
  return foldRows(rows);
}

export async function findExperienceById(id) {
  const [rows] = await pool.execute(FIND_SQL, [id]);
  return foldRows(rows)[0] ?? null;
}

export async function createExperience(input) {
  const id = await withTransaction(async (conn) => {
    const [result] = await conn.execute(INSERT_SQL, columnValues(input));
    await replaceHighlights(conn, result.insertId, input.highlights);
    return result.insertId;
  });

  return findExperienceById(id);
}

/** Mengembalikan experience terbaru, atau null kalau id-nya tidak ada. */
export async function updateExperience(id, input) {
  const found = await withTransaction(async (conn) => {
    // Keberadaan baris diperiksa lewat SELECT, bukan dari affectedRows hasil
    // UPDATE. MySQL menghitung affectedRows sebagai baris yang BERUBAH, jadi
    // menyimpan form tanpa mengubah apa pun akan menghasilkan 0 — tidak bisa
    // dibedakan dari "id tidak ada", dan akan salah dibalas 404.
    const [existing] = await conn.execute('SELECT id FROM experiences WHERE id = ?', [id]);
    if (existing.length === 0) return false;

    await conn.execute(UPDATE_SQL, [...columnValues(input), id]);
    await replaceHighlights(conn, id, input.highlights);
    return true;
  });

  return found ? findExperienceById(id) : null;
}

/** Mengembalikan true kalau ada baris yang benar-benar terhapus. */
export async function deleteExperience(id) {
  // Highlight ikut terhapus lewat ON DELETE CASCADE, jadi tidak perlu transaksi:
  // satu pernyataan, satu keputusan.
  const [result] = await pool.execute('DELETE FROM experiences WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

/**
 * Hapus semua highlight milik satu experience, lalu sisipkan ulang dari array.
 * Terlihat boros, tapi inilah yang menghindarkan CRUD terpisah per butir: klien
 * cukup mengirim daftar final, dan urutan array langsung jadi `sort_order`.
 * WAJIB dipanggil di dalam transaksi — di antara DELETE dan INSERT experience
 * ini tidak punya highlight sama sekali, dan keadaan itu tidak boleh terlihat
 * pembaca lain maupun tertinggal kalau prosesnya gagal.
 */
async function replaceHighlights(conn, experienceId, highlights) {
  await conn.execute('DELETE FROM experience_highlights WHERE experience_id = ?', [
    experienceId,
  ]);

  for (const [index, body] of highlights.entries()) {
    await conn.execute(
      'INSERT INTO experience_highlights (experience_id, body, sort_order) VALUES (?, ?, ?)',
      [experienceId, body, index],
    );
  }
}

/**
 * Melipat hasil JOIN yang datar menjadi bersarang. JOIN mengembalikan SATU
 * BARIS PER HIGHLIGHT, jadi experience dengan 4 highlight muncul 4 kali dengan
 * kolom experience yang berulang. `Map` mempertahankan urutan penyisipan, jadi
 * urutan dari SQL terjaga tanpa sort ulang di JavaScript. Alternatifnya satu
 * query highlight per experience — itu N+1.
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
    // belum punya highlight — baris seperti itu tidak boleh masuk daftar.
    if (row.highlight_id !== null) {
      byId.get(row.id).highlights.push({
        id: row.highlight_id,
        body: row.highlight_body,
      });
    }
  }

  return [...byId.values()];
}
