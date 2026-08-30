/**
 * Pemetaan path -> middleware -> controller. Tidak ada logika di sini.
 * Router ini dipasang di app.js dengan prefix /api/v1/skills.
 *
 * Kontrak memakai DUA nama untuk modul yang sama: `/skills` untuk membaca
 * (yang dibaca adalah grup beserta skill-nya) dan `/skill-groups` untuk
 * menulis. Router kedua untuk prefix tulis itu lahir di P2-4 — dipisah supaya
 * `GET /skill-groups` tidak ikut terbuka hanya karena router-nya dipasang dua
 * kali, sebab endpoint itu tidak ada di kontrak.
 */

import { Router } from 'express';

import * as controller from './controller.js';

const router = Router();

router.get('/', controller.list);

export default router;
