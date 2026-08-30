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

export async function create(req, res, next) {
  try {
    res.status(201).json(await skillService.createSkillGroup(req.body));
  } catch (err) {
    next(asValidationError(err));
  }
}

export async function update(req, res, next) {
  try {
    const group = await skillService.updateSkillGroup(req.params.id, req.body);

    if (group === null) throw notFound(req.params.id);

    res.json(group);
  } catch (err) {
    next(asValidationError(err));
  }
}

export async function remove(req, res, next) {
  try {
    const deleted = await skillService.deleteSkillGroup(req.params.id);

    if (!deleted) throw notFound(req.params.id);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

/**
 * Nama grup yang bentrok adalah kesalahan isian, jadi dibalas 400 yang menunjuk
 * field-nya — bentuknya sama persis dengan hasil validasi zod, supaya form di
 * frontend bisa menampilkannya lewat jalur yang sudah ada tanpa cabang baru.
 */
function asValidationError(err) {
  if (err.duplicateName !== true) return err;

  err.status = 400;
  err.code = 'VALIDATION_FAILED';
  err.fields = { name: 'nama grup itu sudah dipakai' };
  return err;
}

function notFound(id) {
  const err = new Error(`Skill group dengan id ${id} tidak ada.`);
  err.status = 404;
  err.code = 'NOT_FOUND';
  return err;
}
