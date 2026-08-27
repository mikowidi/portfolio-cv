/**
 * Pemetaan path -> middleware -> controller. Tidak ada logika di sini.
 * Router ini dipasang di app.js dengan prefix /api/v1/profile.
 */

import { Router } from 'express';

import * as controller from './controller.js';

const router = Router();

router.get('/', controller.get);

export default router;
