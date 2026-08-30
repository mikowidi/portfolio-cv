/**
 * Penjaga satu-satunya untuk endpoint tulis: baca cookie, verifikasi, tempel
 * `req.user`, lanjut — atau 401. Tidak ada peran, tidak ada izin; di Phase 1
 * hanya ada satu pertanyaan, "login atau tidak".
 *
 * Perlindungan di frontend cuma soal kenyamanan. Yang benar-benar menegakkan
 * aturan adalah middleware ini.
 */

import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

export function requireAuth(req, res, next) {
  const token = req.cookies?.token;

  if (!token) return next(unauthorized());

  try {
    // Algoritma dikunci eksplisit. Tanpa `algorithms`, jsonwebtoken menerima
    // algoritma apa pun yang disebut header token — termasuk token yang
    // menyatakan dirinya HS256 padahal ditandatangani cara lain. Yang dipakai
    // saat menandatangani di auth/service.js hanya HS256, jadi tidak ada
    // alasan menerima yang lain di sini.
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });

    // `sub` disimpan sebagai string sesuai kebiasaan JWT; id di database berupa
    // angka, jadi dikembalikan ke angka di sini supaya perbandingan di bawahnya
    // tidak pernah membandingkan string dengan number.
    req.user = { id: Number(payload.sub) };
    next();
  } catch {
    // Token kedaluwarsa, tanda tangan salah, atau isinya rusak — ketiganya
    // sama saja bagi pemanggil, dan tidak satu pun boleh dijelaskan ke klien.
    next(unauthorized());
  }
}

function unauthorized() {
  const err = new Error('Belum login.');
  err.status = 401;
  err.code = 'UNAUTHORIZED';
  return err;
}
