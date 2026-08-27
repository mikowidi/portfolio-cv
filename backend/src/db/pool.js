/**
 * Satu pool koneksi untuk seluruh proses. Pool, bukan koneksi tunggal, supaya
 * request yang datang bersamaan tidak antre di socket yang sama.
 *
 * `dateStrings: true` bukan preferensi gaya — itu syarat kontrak API. Tanpanya
 * kolom DATE kembali sebagai objek Date JavaScript, dan `JSON.stringify`
 * mengubahnya jadi "2025-10-31T17:00:00.000Z": bergeser mengikuti timezone
 * server. Kontrak bagian 4 handoff meminta "2025-11-01" apa adanya.
 */

import mysql from 'mysql2/promise';

import { env } from '../config/env.js';

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});
