/**
 * Membungkus satu skema zod jadi middleware Express.
 *
 * Dipasang di routes, sebelum controller. Kalau body tidak lolos, controller
 * tidak pernah dipanggil sama sekali — jadi controller boleh menganggap
 * `req.body` sudah bersih dan tidak perlu memeriksa apa pun lagi.
 */

import { z } from 'zod';

/**
 * Field wajib berupa teks. Argumen pertama `z.string()` mengisi pesan saat
 * field-nya hilang atau salah tipe; `.min(1)` mengisi pesan saat field-nya ada
 * tapi kosong. Keduanya perlu — tanpa yang pertama, field yang tidak dikirim
 * sama sekali dibalas pesan bawaan zod dalam bahasa Inggris.
 */
export function requiredText(maxLength) {
  return z
    .string('wajib diisi')
    .trim()
    .min(1, 'wajib diisi')
    .max(maxLength, `maksimal ${maxLength} karakter`);
}

/**
 * Field yang boleh NULL di database. Form HTML tidak bisa mengirim NULL — yang
 * terkirim adalah string kosong — jadi penerjemahan "kosong berarti NULL"
 * dilakukan sekali di sini, bukan diulang di service dan di frontend.
 */
export function nullableText(maxLength) {
  return z
    .string('harus berupa teks')
    .trim()
    .max(maxLength, `maksimal ${maxLength} karakter`)
    .nullish()
    .transform((value) => value || null);
}

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const err = new Error('Data yang dikirim tidak valid.');
      err.status = 400;
      err.code = 'VALIDATION_FAILED';
      err.fields = collectFields(result.error);
      return next(err);
    }

    // Body diganti hasil parse, bukan sekadar divalidasi: nilainya sudah
    // dipangkas dan bertipe benar, dan field yang tidak ada di skema ikut
    // terbuang — jadi field liar tidak bisa menyelinap ke query di bawahnya.
    req.body = result.data;
    next();
  };
}

/** Mengubah issue zod jadi { namaField: pesan } sesuai bentuk error bagian 4. */
function collectFields(error) {
  const fields = {};

  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';

    // Satu pesan per field: yang pertama sudah cukup untuk ditampilkan di form.
    if (!(key in fields)) fields[key] = issue.message;
  }

  return fields;
}
