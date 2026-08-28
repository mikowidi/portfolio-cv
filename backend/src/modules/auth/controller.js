/**
 * Membaca `req`, memanggil service, mengirim `res`. Cookie diatur di sini,
 * bukan di service, karena cookie urusan transport bukan urusan data.
 */

import { env } from '../../config/env.js';
import * as authService from './service.js';

const COOKIE_NAME = 'token';

/**
 * `httpOnly` menutup token dari JavaScript, jadi XSS tidak bisa mencurinya.
 * `sameSite: 'lax'` cukup karena frontend dan API selalu satu origin — proxy
 * Vite saat development, Express yang menyajikan build saat produksi.
 * `secure` hanya di produksi; kalau dipasang di development, browser menolak
 * menyimpan cookie dari http://localhost.
 */
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.isProduction,
};

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body.username, req.body.password);

    if (result === null) {
      const err = new Error('Username atau password salah.');
      err.status = 401;
      err.code = 'UNAUTHORIZED';
      throw err;
    }

    res.cookie(COOKIE_NAME, result.token, {
      ...COOKIE_OPTIONS,
      maxAge: authService.TOKEN_MAX_AGE_MS,
    });

    res.json(result.user);
  } catch (err) {
    next(err);
  }
}

/**
 * JWT bersifat stateless, jadi ini hanya menghapus cookie di browser. Token
 * yang sudah terlanjur bocor tetap sah sampai kedaluwarsa. Untuk situs satu
 * admin ini diterima; pencabutan token sungguhan berarti menyimpan sesi di
 * database, dan itu bukan Phase 1.
 */
export function logout(req, res) {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
  res.status(204).end();
}

export async function me(req, res, next) {
  try {
    const user = await authService.findUserById(req.user.id);

    if (user === null) {
      const err = new Error('Belum login.');
      err.status = 401;
      err.code = 'UNAUTHORIZED';
      throw err;
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
}
