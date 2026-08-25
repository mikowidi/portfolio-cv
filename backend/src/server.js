/**
 * Titik masuk proses: satu-satunya file yang benar-benar membuka port.
 * Impor `env` ditaruh paling atas supaya validasi environment jalan sebelum
 * apa pun sempat menyala — kalau ada yang kurang, proses mati di sini.
 */

import { env } from './config/env.js';
import app from './app.js';

app.listen(env.PORT, () => {
  console.log(`API jalan di http://localhost:${env.PORT} (${env.NODE_ENV})`);
});
