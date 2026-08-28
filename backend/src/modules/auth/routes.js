/**
 * Pemetaan path -> middleware -> controller. Router dipasang di app.js dengan
 * prefix /api/v1/auth.
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './controller.js';
import { loginSchema } from './schema.js';

/**
 * 10 percobaan per 15 menit per IP. Dipasang HANYA di /login: itu satu-satunya
 * endpoint yang bisa ditebak berulang-ulang, dan membatasi laju endpoint baca
 * hanya akan mengganggu pemakaian normal.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,

  // Dilempar ke errorHandler alih-alih memakai opsi `message` bawaan, supaya
  // bentuk body-nya sama dengan error lain. Opsi `message` akan menyusun
  // respons sendiri dan melanggar aturan "satu tempat penyusunan error".
  handler: (req, res, next) => {
    const err = new Error('Terlalu banyak percobaan login. Coba lagi dalam 15 menit.');
    err.status = 429;
    err.code = 'TOO_MANY_REQUESTS';
    next(err);
  },
});

const router = Router();

// Urutannya penting: batasi laju dulu, baru validasi bentuk. Terbalik berarti
// penebak bisa memakai body ngawur untuk lolos dari hitungan percobaan.
router.post('/login', loginLimiter, validate(loginSchema), controller.login);
router.post('/logout', controller.logout);
router.get('/me', requireAuth, controller.me);

export default router;
