/**
 * Pemetaan path -> middleware -> controller. Tidak ada logika di sini.
 *
 * Modul ini punya DUA router karena kontrak memakai dua nama untuk hal yang
 * sama: `/api/v1/skills` untuk membaca (yang dibaca adalah grup beserta
 * skill-nya) dan `/api/v1/skill-groups` untuk menulis.
 *
 * Dipisah, bukan satu router yang dipasang dua kali, supaya `GET /skill-groups`
 * dan `POST /skills` tidak ikut terbuka — dua endpoint yang tidak ada di
 * kontrak dan tidak ada yang memintanya.
 */

import { Router } from 'express';

import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './controller.js';
import { skillGroupSchema } from './schema.js';

const publicRouter = Router();
publicRouter.get('/', controller.list);

export const skillGroupsRouter = Router();

// Urutannya: pastikan sudah login dulu, baru periksa bentuk body. Terbalik
// berarti tamu yang belum login tetap mendapat pesan validasi yang rinci —
// membocorkan bentuk data ke pihak yang belum berhak melihatnya.
skillGroupsRouter.post('/', requireAuth, validate(skillGroupSchema), controller.create);
skillGroupsRouter.put('/:id', requireAuth, validate(skillGroupSchema), controller.update);
skillGroupsRouter.delete('/:id', requireAuth, controller.remove);

export default publicRouter;
