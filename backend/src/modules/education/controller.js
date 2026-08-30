/**
 * Membaca `req`, memanggil service, mengirim `res`. Tidak ada SQL di sini.
 *
 * try/catch dipasang manual di tiap handler karena Express 4 tidak menangkap
 * rejected promise dari fungsi async — tanpa `next(err)`, error database akan
 * menggantung sebagai request yang tidak pernah dibalas, bukan 500 yang rapi.
 */

import * as educationService from './service.js';

export async function list(req, res, next) {
  try {
    res.json(await educationService.listEducation());
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    res.status(201).json(await educationService.createEducation(req.body));
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const education = await educationService.updateEducation(req.params.id, req.body);

    if (education === null) throw notFound(req.params.id);

    res.json(education);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const deleted = await educationService.deleteEducation(req.params.id);

    if (!deleted) throw notFound(req.params.id);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

function notFound(id) {
  const err = new Error(`Education dengan id ${id} tidak ada.`);
  err.status = 404;
  err.code = 'NOT_FOUND';
  return err;
}
