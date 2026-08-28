/**
 * Pemetaan path -> middleware -> controller. Tidak ada logika di sini.
 * Router ini dipasang di app.js dengan prefix /api/v1/experiences, jadi path
 * di bawah ditulis relatif terhadap prefix itu.
 */

import { Router } from 'express';

import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './controller.js';
import { experienceSchema } from './schema.js';

const router = Router();

router.get('/', controller.list);

// Urutannya: pastikan sudah login dulu, baru periksa bentuk body. Terbalik
// berarti tamu yang belum login tetap mendapat pesan validasi yang rinci —
// membocorkan bentuk data ke pihak yang belum berhak melihatnya.
router.post('/', requireAuth, validate(experienceSchema), controller.create);
router.put('/:id', requireAuth, validate(experienceSchema), controller.update);
router.delete('/:id', requireAuth, controller.remove);

export default router;
