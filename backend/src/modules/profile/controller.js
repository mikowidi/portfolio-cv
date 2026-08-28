/**
 * Membaca `req`, memanggil service, mengirim `res`. Tidak ada SQL di sini.
 * try/catch manual, alasannya sama seperti di controller experiences.
 */

import * as profileService from './service.js';

export async function get(req, res, next) {
  try {
    const profile = await profileService.getProfile();

    if (profile === null) throw missingProfile();

    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const profile = await profileService.updateProfile(req.body);

    if (profile === null) throw missingProfile();

    res.json(profile);
  } catch (err) {
    next(err);
  }
}

function missingProfile() {
  const err = new Error('Profil belum ada. Jalankan seed lebih dulu.');
  err.status = 404;
  err.code = 'NOT_FOUND';
  return err;
}
