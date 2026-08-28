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

/**
 * Menjalankan `fn` di dalam satu transaksi pada SATU koneksi.
 *
 * Koneksi diambil eksplisit dari pool karena transaksi terikat pada koneksi:
 * memakai `pool.execute` di tengah transaksi bisa mengambil koneksi lain, dan
 * pernyataan itu akan berada di luar transaksi tanpa error apa pun — jadi
 * ROLLBACK tidak akan mengembalikannya. `fn` menerima koneksinya dan wajib
 * memakai koneksi itu untuk semua query di dalamnya.
 */
export async function withTransaction(fn) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
