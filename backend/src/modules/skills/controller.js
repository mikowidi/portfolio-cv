/**
 * Membaca `req`, memanggil service, mengirim `res`. Tidak ada SQL di sini.
 *
 * try/catch dipasang manual di tiap handler karena Express 4 tidak menangkap
 * rejected promise dari fungsi async — tanpa `next(err)`, error database akan
 * menggantung sebagai request yang tidak pernah dibalas, bukan 500 yang rapi.
 */

import * as skillService from './service.js';

export async function list(req, res, next) {
  try {
    res.json(await skillService.listSkillGroups());
  } catch (err) {
    next(err);
  }
}
