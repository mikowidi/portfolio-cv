/**
 * Membaca `req`, memanggil service, mengirim `res`. Tidak ada SQL di sini.
 *
 * try/catch dipasang manual di tiap handler karena Express 4 tidak menangkap
 * rejected promise dari fungsi async — tanpa `next(err)`, error database akan
 * menggantung sebagai request yang tidak pernah dibalas, bukan 500 yang rapi.
 */

import * as experienceService from './service.js';

export async function list(req, res, next) {
  try {
    res.json(await experienceService.listExperiences());
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    res.status(201).json(await experienceService.createExperience(req.body));
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const experience = await experienceService.updateExperience(
      req.params.id,
      req.body,
    );

    if (experience === null) throw notFound(req.params.id);

    res.json(experience);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const deleted = await experienceService.deleteExperience(req.params.id);

    if (!deleted) throw notFound(req.params.id);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

function notFound(id) {
  const err = new Error(`Experience dengan id ${id} tidak ada.`);
  err.status = 404;
  err.code = 'NOT_FOUND';
  return err;
}
