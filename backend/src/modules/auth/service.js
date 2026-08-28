/**
 * SQL dan logika auth. Tidak pernah menyentuh `req` / `res`, termasuk cookie —
 * cookie adalah urusan transport, jadi diatur di controller.
 */

import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

import { env } from '../../config/env.js';
import { pool } from '../../db/pool.js';

const TOKEN_TTL = '7d';

/** Umur cookie disamakan dengan umur token supaya keduanya tidak pernah beda. */
export const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Mengembalikan `{ token, user }` kalau kredensialnya benar, atau `null` kalau
 * tidak. Pemanggil TIDAK diberi tahu mana yang salah — username atau password —
 * supaya tidak bisa dipakai memetakan username mana yang ada.
 *
 * Catatan jujur soal batasnya: waktu balasan untuk username yang tidak ada
 * lebih cepat, karena argon2 tidak sempat dijalankan. Untuk situs satu admin
 * yang lajunya sudah dibatasi 10 percobaan per 15 menit, itu diterima.
 */
export async function login(username, password) {
  const [rows] = await pool.execute(
    'SELECT id, username, password_hash FROM users WHERE username = ?',
    [username],
  );

  const user = rows[0];
  if (user === undefined) return null;

  const passwordMatches = await argon2.verify(user.password_hash, password);
  if (!passwordMatches) return null;

  const token = jwt.sign({ sub: String(user.id) }, env.JWT_SECRET, {
    expiresIn: TOKEN_TTL,
  });

  return { token, user: { id: user.id, username: user.username } };
}

/**
 * Dipakai `/auth/me`. Sengaja membaca ulang dari database alih-alih memercayai
 * isi token: token yang sah tetap berlaku sampai kedaluwarsa walau user-nya
 * sudah dihapus, dan endpoint ini harus menjawab keadaan sekarang.
 */
export async function findUserById(id) {
  const [rows] = await pool.execute(
    'SELECT id, username FROM users WHERE id = ?',
    [id],
  );

  return rows[0] ?? null;
}
