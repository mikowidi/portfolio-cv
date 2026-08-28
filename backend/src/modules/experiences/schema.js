import { z } from 'zod';

import { nullableText, requiredText } from '../../middleware/validate.js';

const EMPLOYMENT_TYPES = [
  'full_time',
  'part_time',
  'contract',
  'internship',
  'freelance',
];

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

const requiredDate = z
  .string('wajib diisi')
  .regex(DATE_PATTERN, 'format harus YYYY-MM-DD')
  .refine(isRealDate, 'tanggalnya tidak ada di kalender');

const optionalDate = z
  .string('harus berupa teks')
  .nullish()
  .transform((value) => value || null)
  .refine(
    (value) => value === null || DATE_PATTERN.test(value),
    'format harus YYYY-MM-DD',
  )
  .refine((value) => value === null || isRealDate(value), 'tanggalnya tidak ada di kalender');

export const experienceSchema = z
  .object({
    position: requiredText(120),
    org: requiredText(120),
    location: nullableText(120),

    employment_type: z.enum(EMPLOYMENT_TYPES, 'pilihan tidak dikenal'),

    start_date: requiredDate,

    // NULL berarti masih berjalan. Tidak ada kolom is_current yang bisa berbeda.
    end_date: optionalDate,

    summary: nullableText(400),

    // Dikirim utuh sebagai satu array, bukan lewat endpoint sendiri per butir.
    // Urutan array inilah yang jadi sort_order di database.
    highlights: z
      .array(requiredText(400), 'harus berupa daftar')
      .max(30, 'maksimal 30 butir')
      .default([]),
  })
  // Cermin dari CHECK chk_exp_dates di database. Dijaga di dua tempat dengan
  // sengaja: database supaya data tidak pernah rusak walau lewat jalur lain,
  // dan di sini supaya pengisi form dapat 400 yang menyebut field-nya, bukan 500.
  .refine(
    (value) => value.end_date === null || value.end_date >= value.start_date,
    { message: 'tidak boleh lebih awal dari tanggal mulai', path: ['end_date'] },
  );
