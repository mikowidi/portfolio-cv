/**
 * Merakit aplikasi Express dan mengekspornya — TANPA `listen()`.
 * Dipisah dari server.js supaya "apa isi aplikasinya" dan "di port berapa dia
 * menyala" jadi dua keputusan berbeda: app bisa diimpor tanpa membuka port.
 */

import cookieParser from 'cookie-parser';
import express from 'express';

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

// Dua middleware ini selalu paling akhir, dan urutannya tidak boleh dibalik.
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
