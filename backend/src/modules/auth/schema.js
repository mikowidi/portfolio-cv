import { z } from 'zod';

/**
 * Hanya memeriksa BENTUK body, bukan benar-salahnya kredensial. Aturan panjang
 * password sengaja tidak ditaruh di sini: password yang sudah ada dibuat lewat
 * `create-admin`, dan menolak login karena panjangnya kurang justru membocorkan
 * aturan password ke penebak.
 */
// Pesan ditulis dua kali per field dengan sengaja: argumen pertama `z.string()`
// dipakai saat field-nya hilang atau salah tipe, sedangkan `.min(1)` dipakai
// saat field-nya ada tapi kosong. Tanpa yang pertama, field yang tidak dikirim
// sama sekali akan dibalas pesan bawaan zod dalam bahasa Inggris.
export const loginSchema = z.object({
  username: z.string('wajib diisi').trim().min(1, 'wajib diisi'),
  password: z.string('wajib diisi').min(1, 'wajib diisi'),
});
