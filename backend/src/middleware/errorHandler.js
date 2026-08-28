/**
 * Satu-satunya tempat body error disusun (bentuk error ada di bagian 4 handoff).
 * Controller tidak pernah menulis respons error sendiri — cukup `next(err)`
 * dengan `err.status`, `err.code`, dan opsional `err.fields`.
 */

import { env } from '../config/env.js';

/**
 * Dipasang SETELAH semua route. Kalau request sampai ke sini, berarti tidak
 * ada route yang cocok — ubah jadi error 404 supaya melewati satu jalur
 * penyusunan respons yang sama dengan error lainnya.
 */
export function notFoundHandler(req, res, next) {
  const err = new Error(`Route tidak ditemukan: ${req.method} ${req.originalUrl}`);
  err.status = 404;
  err.code = 'NOT_FOUND';
  next(err);
}

/**
 * Argumen `next` wajib ditulis walau tidak dipakai — Express mengenali sebuah
 * middleware sebagai error handler dari jumlah argumennya (4), bukan dari nama.
 */
/**
 * Kode cadangan kalau error datang tanpa `code` sendiri. Kasus nyatanya:
 * `express.json()` melempar error ber-status 400 saat body-nya bukan JSON yang
 * sah. Tanpa tabel ini, error itu dibalas `code: "INTERNAL_ERROR"` bersama
 * status 400 — dua keterangan yang saling bertentangan di satu respons.
 */
const FALLBACK_CODES = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  404: 'NOT_FOUND',
  429: 'TOO_MANY_REQUESTS',
};

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = Number.isInteger(err.status) ? err.status : 500;

  // 5xx = bug kita sendiri, jadi jejaknya harus masuk log server.
  if (status >= 500) console.error(err);

  res.status(status).json({
    error: {
      code: err.code ?? FALLBACK_CODES[status] ?? 'INTERNAL_ERROR',
      // Pesan 500 bisa membocorkan detail internal (query, path file),
      // jadi di produksi diganti pesan generik. Di dev tetap apa adanya.
      message:
        status >= 500 && env.isProduction
          ? 'Terjadi kesalahan di server.'
          : err.message,
      ...(err.fields ? { fields: err.fields } : {}),
    },
  });
}
