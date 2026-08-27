/**
 * Semua SQL dan logika profile. Tidak pernah menyentuh `req` / `res`.
 * Pola dipegang sama persis dengan modul experiences.
 */

import { pool } from '../../db/pool.js';

// Skema mengunci profil ke satu baris lewat CHECK (id = 1), jadi id-nya
// konstanta di sini — bukan parameter yang boleh datang dari request.
const PROFILE_ID = 1;

// LEFT JOIN, bukan INNER: profil tanpa satu pun social link harus tetap terbawa.
const GET_SQL = `
  SELECT
    p.full_name, p.headline, p.hero_statement, p.about_md,
    p.location, p.email, p.photo_url,
    s.id    AS social_id,
    s.label AS social_label,
    s.url   AS social_url
  FROM profile p
  LEFT JOIN social_links s ON s.profile_id = p.id
  WHERE p.id = ?
  ORDER BY s.sort_order ASC
`;

/** Mengembalikan objek profil, atau null kalau barisnya memang belum ada. */
export async function getProfile() {
  const [rows] = await pool.execute(GET_SQL, [PROFILE_ID]);

  if (rows.length === 0) return null;

  return foldRows(rows);
}

/**
 * Melipat hasil JOIN yang datar menjadi satu objek.
 *
 * Bedanya dengan experiences: di sini induknya dijamin cuma satu baris, jadi
 * tidak butuh Map — kolom profil diambil dari baris mana pun (dipakai yang
 * pertama, isinya berulang identik di semua baris), dan social link dikumpulkan
 * dari seluruh baris.
 */
function foldRows(rows) {
  const [first] = rows;

  return {
    full_name: first.full_name,
    headline: first.headline,
    hero_statement: first.hero_statement,
    about_md: first.about_md,
    location: first.location,
    email: first.email,
    photo_url: first.photo_url,

    // LEFT JOIN menghasilkan satu baris berisi NULL kalau social link-nya kosong.
    social_links: rows
      .filter((row) => row.social_id !== null)
      .map((row) => ({
        id: row.social_id,
        label: row.social_label,
        url: row.social_url,
      })),
  };
}
