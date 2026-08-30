import { z } from 'zod';

import { requiredText } from '../../middleware/validate.js';

/**
 * Bentuknya cermin `experienceSchema`: satu induk plus seluruh daftar anak
 * dikirim sekaligus. Service menanganinya dengan hapus-lalu-sisipkan-ulang di
 * dalam satu transaksi, dan urutan array inilah yang jadi `sort_order`.
 *
 * Panjang mencerminkan DDL 002: `skill_groups.name` dan `skills.name` sama-sama
 * VARCHAR(80).
 */
export const skillGroupSchema = z.object({
  name: requiredText(80),

  // SMALLINT UNSIGNED di database, jadi 0–65535. Dibatasi di sini supaya angka
  // di luar jangkauan dibalas 400 yang menyebut field-nya, bukan 500 dari MySQL.
  sort_order: z
    .number('harus berupa angka')
    .int('harus bilangan bulat')
    .min(0, 'tidak boleh negatif')
    .max(65535, 'terlalu besar')
    .default(0),

  skills: z
    .array(requiredText(80), 'harus berupa daftar')
    .max(50, 'maksimal 50 skill')
    .default([]),
});
