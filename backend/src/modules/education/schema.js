import { z } from 'zod';

import {
  dateOrderRefinement,
  nullableText,
  optionalDate,
  requiredDate,
  requiredText,
} from '../../middleware/validate.js';

/**
 * Panjang maksimum mencerminkan DDL 002 apa adanya: `qualification` dan `org`
 * VARCHAR(160), `location` VARCHAR(120), `note` VARCHAR(200). Kalau berbeda,
 * isian yang terlalu panjang akan lolos zod lalu dipotong diam-diam oleh MySQL
 * — data yang tersimpan tidak sama dengan yang dikirim, tanpa satu pun error.
 */
export const educationSchema = z
  .object({
    qualification: requiredText(160),
    org: requiredText(160),
    location: nullableText(120),

    start_date: requiredDate,

    // NULL berarti masih berjalan. Konsisten dengan experiences: tidak ada
    // kolom is_current yang bisa berbeda dari kolom ini.
    end_date: optionalDate,

    note: nullableText(200),
  })
  .refine(...dateOrderRefinement);
