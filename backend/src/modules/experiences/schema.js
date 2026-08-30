import { z } from 'zod';

import {
  dateOrderRefinement,
  nullableText,
  optionalDate,
  requiredDate,
  requiredText,
} from '../../middleware/validate.js';

const EMPLOYMENT_TYPES = [
  'full_time',
  'part_time',
  'contract',
  'internship',
  'freelance',
];

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
  .refine(...dateOrderRefinement);
