/**
 * Membaca `req`, memanggil service, mengirim `res`. Tidak ada SQL di sini.
 * try/catch manual, alasannya sama seperti di controller experiences.
 */

import * as profileService from './service.js';

export async function get(req, res, next) {
  try {
    const profile = await profileService.getProfile();

    if (profile === null) {
      const err = new Error('Profil belum ada. Jalankan seed lebih dulu.');
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    res.json(profile);
  } catch (err) {
    next(err);
  }
}
