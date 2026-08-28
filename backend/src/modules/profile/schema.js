import { z } from 'zod';

import { nullableText, requiredText } from '../../middleware/validate.js';

// Batas panjang mengikuti kolomnya di 001_init.sql. Kalau tidak dijaga di sini,
// teks yang kepanjangan ditolak MySQL dan muncul sebagai 500 — padahal itu
// kesalahan pengisi form, yang seharusnya 400 beserta nama field-nya.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * `social_links` sengaja TIDAK ikut di sini: Phase 1 hanya menjanjikan "edit
 * profil", dan menambah pengelolaan link berarti menambah pola tulis kedua yang
 * belum ada yang meminta. Link masih diubah lewat SQL sampai ada kebutuhannya.
 */
export const updateProfileSchema = z.object({
  full_name: requiredText(120),
  headline: requiredText(160),
  hero_statement: requiredText(280),

  // TEXT di MySQL, batas praktisnya jauh di atas kebutuhan satu halaman About.
  about_md: requiredText(20000),

  location: nullableText(120),

  email: nullableText(160).refine(
    (value) => value === null || EMAIL_PATTERN.test(value),
    'format email tidak valid',
  ),

  photo_url: nullableText(400).refine(
    (value) => value === null || /^https?:\/\/\S+$/.test(value),
    'harus URL yang diawali http:// atau https://',
  ),
});
