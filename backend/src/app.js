/**
 * Merakit aplikasi Express dan mengekspornya — TANPA `listen()`.
 * Dipisah dari server.js supaya "apa isi aplikasinya" dan "di port berapa dia
 * menyala" jadi dua keputusan berbeda: app bisa diimpor tanpa membuka port.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import cookieParser from 'cookie-parser';
import express from 'express';

import { env } from './config/env.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './modules/auth/routes.js';
import experiencesRoutes from './modules/experiences/routes.js';
import profileRoutes from './modules/profile/routes.js';

const app = express();

// Header bawaan Express yang mengumumkan teknologi server. Tidak berguna bagi
// klien, dan tidak ada alasan memberitahu pemindai apa yang dipakai di sini.
app.disable('x-powered-by');

// Mengisi req.body dari request ber-Content-Type: application/json.
app.use(express.json());

// Mengisi req.cookies. Tanpa ini requireAuth tidak punya tempat membaca token.
// Cookie tidak ditandatangani di sini — isinya JWT yang tanda tangannya sudah
// diverifikasi sendiri, jadi lapisan tanda tangan kedua tidak menambah apa pun.
app.use(cookieParser());

// Endpoint termurah untuk membuktikan proses hidup dan bisa dihubungi.
// Sengaja tidak menyentuh database — kalau nanti ikut mengecek DB, "server mati"
// dan "database mati" jadi tidak bisa dibedakan dari satu respons yang sama.
app.get('/api/v1/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/experiences', experiencesRoutes);
app.use('/api/v1/profile', profileRoutes);

if (env.isProduction) serveFrontendBuild(app);

// Dua middleware ini selalu paling akhir, dan urutannya tidak boleh dibalik.
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Di produksi, Express juga menyajikan hasil `npm run build` frontend — jadi
 * halaman dan API berbagi satu origin, dan tidak ada CORS sama sekali.
 *
 * Dipasang di sini, bukan di server.js seperti sketsa struktur handoff, karena
 * Express mencocokkan middleware sesuai urutan pendaftaran: apa pun yang
 * ditambahkan dari server.js akan berada SETELAH notFoundHandler di bawah, dan
 * tidak akan pernah tercapai.
 */
function serveFrontendBuild(server) {
  const dist = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../frontend/dist',
  );

  // Gagal cepat, dengan alasan yang sama seperti config/env.js: server yang
  // menyala lalu membalas 404 untuk setiap halaman jauh lebih sulit didiagnosis
  // daripada server yang menolak menyala sambil menyebutkan apa yang kurang.
  if (!fs.existsSync(path.join(dist, 'index.html'))) {
    throw new Error(
      `Build frontend tidak ditemukan di ${dist}.\n` +
        'Jalankan `npm run build` di folder frontend lebih dulu.',
    );
  }

  server.use(express.static(dist));

  // SPA fallback: rute seperti /admin hanya ada di React Router, tidak sebagai
  // file. Permintaan GET yang bukan /api dilayani index.html supaya membuka
  // /admin langsung (atau menekan reload di sana) tidak berujung 404.
  //
  // Penjagaan /api penting: tanpanya, salah ketik endpoint akan membalas HTML
  // halaman alih-alih 404 JSON, dan klien akan gagal mengurainya.
  server.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(dist, 'index.html'));
  });
}

export default app;
