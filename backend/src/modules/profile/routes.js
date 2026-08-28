/**
 * Pemetaan path -> middleware -> controller. Tidak ada logika di sini.
 * Router ini dipasang di app.js dengan prefix /api/v1/profile.
 */

import { Router } from 'express';

import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './controller.js';
import { updateProfileSchema } from './schema.js';

const router = Router();

router.get('/', controller.get);

// Sama seperti di modul experiences: login diperiksa lebih dulu, baru bentuk
// body — supaya tamu tidak mendapat pesan validasi yang rinci.
router.put('/', requireAuth, validate(updateProfileSchema), controller.update);

export default router;
