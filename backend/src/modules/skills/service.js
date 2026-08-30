/**
 * Semua SQL dan logika skills. Tidak pernah menyentuh `req` / `res`.
 *
 * Bentuknya sengaja dibuat cermin `experiences`: satu induk membawa anaknya,
 * diambil dengan SATU query lalu dilipat — bukan satu query anak per induk
 * (N+1). Lipatannya memakai helper bersama di `db/foldRows.js`, dan penulisan
 * anaknya memakai `withTransaction` yang sudah ada di `db/pool.js`.
 */

import { foldRows } from '../../db/foldRows.js';
import { pool, withTransaction } from '../../db/pool.js';

// LEFT JOIN, bukan INNER: grup yang belum punya skill tetap ikut terbawa dan
// muncul di halaman sebagai grup kosong, bukan hilang tanpa jejak.
const SELECT_BASE = `
  SELECT
    g.id, g.name, g.sort_order,
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

const FIND_SQL = `${SELECT_BASE} WHERE g.id = ? ORDER BY s.sort_order ASC, s.id ASC`;

/**
 * `sort_order` ikut dikembalikan walau contoh JSON di handoff bagian 3 tidak
 * menyebutkannya. Alasannya bukan kelengkapan, tapi kebenaran: `PUT
 * /skill-groups/:id` MEWAJIBKAN `sort_order`, sementara form admin mengisi
 * nilainya dari hasil `GET`. Kalau field-nya tidak ikut terbawa, setiap kali
 * grup diedit urutannya diam-diam kembali ke 0 — kehilangan data tanpa satu pun
 * error. Ini ketahuan saat uji UI P2-5, bukan dikira-kira.
 *
 * Modul `experiences` sudah memakai aturan yang sama tanpa pernah ditulis:
 * semua kolom yang bisa ditulis juga bisa dibaca. Penambahan ini membuat
 * `skills` ikut aturan itu.
 */
const FOLD = {
  key: 'skills',
  parent: (row) => ({ id: row.id, name: row.name, sort_order: row.sort_order }),
  child: (row) => (row.skill_id === null ? null : { id: row.skill_id, name: row.skill_name }),
};

export async function listSkillGroups() {
  const [rows] = await pool.execute(LIST_SQL);
  return foldRows(rows, FOLD);
}

export async function findSkillGroupById(id) {
  const [rows] = await pool.execute(FIND_SQL, [id]);
  return foldRows(rows, FOLD)[0] ?? null;
}

/**
 * `uq_skill_group_name` menolak nama grup yang sudah ada — termasuk yang cuma
 * beda huruf besar-kecil, karena collation tabelnya `utf8mb4_unicode_ci`. Itu
 * salah input yang wajar, bukan kerusakan, jadi tidak boleh muncul sebagai 500.
 *
 * Pengetahuan soal kode error MySQL berhenti di file ini; controller cukup
 * melihat penanda `duplicateName` dan tidak perlu tahu apa itu ER_DUP_ENTRY.
 */
function rethrowDuplicate(err) {
  if (err.code !== 'ER_DUP_ENTRY') throw err;

  const conflict = new Error('Nama grup itu sudah dipakai.');
  conflict.duplicateName = true;
  throw conflict;
}

export async function createSkillGroup(input) {
  const id = await withTransaction(async (conn) => {
    const [result] = await conn.execute(
      'INSERT INTO skill_groups (name, sort_order) VALUES (?, ?)',
      [input.name, input.sort_order],
    );
    await replaceSkills(conn, result.insertId, input.skills);
    return result.insertId;
  }).catch(rethrowDuplicate);

  return findSkillGroupById(id);
}

/** Mengembalikan grup terbaru, atau null kalau id-nya tidak ada. */
export async function updateSkillGroup(id, input) {
  const found = await withTransaction(async (conn) => {
    // Keberadaan baris diperiksa lewat SELECT, bukan dari affectedRows hasil
    // UPDATE. MySQL menghitung affectedRows sebagai baris yang BERUBAH, jadi
    // menyimpan form tanpa mengubah apa pun menghasilkan 0 — tidak bisa
    // dibedakan dari "id tidak ada", dan akan salah dibalas 404.
    const [existing] = await conn.execute('SELECT id FROM skill_groups WHERE id = ?', [id]);
    if (existing.length === 0) return false;

    await conn.execute('UPDATE skill_groups SET name = ?, sort_order = ? WHERE id = ?', [
      input.name,
      input.sort_order,
      id,
    ]);
    await replaceSkills(conn, id, input.skills);
    return true;
  }).catch(rethrowDuplicate);

  return found ? findSkillGroupById(id) : null;
}

/** Mengembalikan true kalau ada baris yang benar-benar terhapus. */
export async function deleteSkillGroup(id) {
  // Skill ikut terhapus lewat ON DELETE CASCADE, jadi tidak perlu transaksi:
  // satu pernyataan, satu keputusan.
  const [result] = await pool.execute('DELETE FROM skill_groups WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

/**
 * Hapus semua skill milik satu grup, lalu sisipkan ulang dari array.
 * Terlihat boros, tapi inilah yang menghindarkan CRUD terpisah per skill: klien
 * cukup mengirim daftar final, dan urutan array langsung jadi `sort_order`.
 * WAJIB dipanggil di dalam transaksi — di antara DELETE dan INSERT grup ini
 * tidak punya skill sama sekali, dan keadaan itu tidak boleh terlihat pembaca
 * lain maupun tertinggal kalau prosesnya gagal.
 *
 * Ini juga yang membuat pengurangan jumlah benar: mengubah 5 skill jadi 2
 * menghasilkan 2, bukan 7 — karena yang lama dihapus lebih dulu, bukan ditimpa.
 */
async function replaceSkills(conn, groupId, skills) {
  await conn.execute('DELETE FROM skills WHERE group_id = ?', [groupId]);

  for (const [index, name] of skills.entries()) {
    await conn.execute(
      'INSERT INTO skills (group_id, name, sort_order) VALUES (?, ?, ?)',
      [groupId, name, index],
    );
  }
}
