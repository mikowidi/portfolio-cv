/**
 * Merakit aplikasi Express dan mengekspornya — TANPA `listen()`.
 * Dipisah dari server.js supaya "apa isi aplikasinya" dan "di port berapa dia
 * menyala" jadi dua keputusan berbeda: app bisa diimpor tanpa membuka port.
 */

import express from 'express';

import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import experiencesRoutes from './modules/experiences/routes.js';

const app = express();

// Header bawaan Express yang mengumumkan teknologi server. Tidak berguna bagi
// klien, dan tidak ada alasan memberitahu pemindai apa yang dipakai di sini.
app.disable('x-powered-by');

// Mengisi req.body dari request ber-Content-Type: application/json.
app.use(express.json());

// Endpoint termurah untuk membuktikan proses hidup dan bisa dihubungi.
// Sengaja tidak menyentuh database — kalau nanti ikut mengecek DB, "server mati"
// dan "database mati" jadi tidak bisa dibedakan dari satu respons yang sama.
app.get('/api/v1/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/v1/experiences', experiencesRoutes);

// Dua middleware ini selalu paling akhir, dan urutannya tidak boleh dibalik.
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
