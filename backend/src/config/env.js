/**
 * Satu-satunya tempat `process.env` dibaca di seluruh backend.
 * Modul lain mengimpor objek `env` yang sudah tervalidasi, jadi tidak ada
 * `process.env.APA_PUN` yang tersebar dan tidak ada nilai `undefined` yang
 * baru ketahuan saat request pertama masuk.
 */

import 'dotenv/config';

// DB_PASSWORD sengaja tidak di sini: string kosong adalah nilai yang sah
// (MySQL lokal dengan root tanpa password), jadi tidak bisa dibedakan dari
// "belum diisi". Semua yang lain wajib ada isinya.
const REQUIRED = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_NAME',
  'JWT_SECRET',
];

const missing = REQUIRED.filter((key) => !process.env[key]?.trim());

if (missing.length > 0) {
  throw new Error(
    `Environment variable belum diisi: ${missing.join(', ')}.\n` +
      'Salin backend/.env.example menjadi backend/.env, lalu lengkapi nilainya.'
  );
}

/** Port harus berupa integer 1–65535, bukan sekadar "ada isinya". */
function readPort(key) {
  const value = Number(process.env[key]);

  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`${key} harus angka 1–65535, dapat: "${process.env[key]}"`);
  }

  return value;
}

export const env = Object.freeze({
  NODE_ENV: process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV === 'production',
  PORT: readPort('PORT'),
  DB_HOST: process.env.DB_HOST,
  DB_PORT: readPort('DB_PORT'),
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD ?? '',
  DB_NAME: process.env.DB_NAME,
  JWT_SECRET: process.env.JWT_SECRET,
});
