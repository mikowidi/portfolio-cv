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

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Memeriksa bentuk DAN keberadaan tanggalnya. Regex saja meloloskan 2025-02-31,
 * yang lalu ditolak MySQL dalam mode strict dan muncul sebagai 500 — padahal
 * itu kesalahan isian, bukan kesalahan server.
 */
function isRealDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * Tanggal wajib, format YYYY-MM-DD. Ditaruh di sini bersama helper field lain
 * begitu `education` membutuhkan bentuk yang sama persis seperti `experiences`
 * — dua salinan berarti dua tempat yang harus diperbaiki kalau ada bug.
 */
export const requiredDate = z
  .string('wajib diisi')
  .regex(DATE_PATTERN, 'format harus YYYY-MM-DD')
  .refine(isRealDate, 'tanggalnya tidak ada di kalender');

/** Tanggal boleh kosong; kosong berarti NULL, yang artinya "masih berjalan". */
export const optionalDate = z
  .string('harus berupa teks')
  .nullish()
  .transform((value) => value || null)
  .refine(
    (value) => value === null || DATE_PATTERN.test(value),
    'format harus YYYY-MM-DD',
  )
  .refine((value) => value === null || isRealDate(value), 'tanggalnya tidak ada di kalender');

/**
 * Cermin dari CHECK `end_date IS NULL OR end_date >= start_date` yang dipakai
 * tabel `experiences` maupun `education`. Dijaga di dua tempat dengan sengaja:
 * database supaya data tidak pernah rusak walau lewat jalur lain, dan di sini
 * supaya pengisi form dapat 400 yang menyebut field-nya, bukan 500.
 */
export const dateOrderRefinement = [
  (value) => value.end_date === null || value.end_date >= value.start_date,
  { message: 'tidak boleh lebih awal dari tanggal mulai', path: ['end_date'] },
];

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
