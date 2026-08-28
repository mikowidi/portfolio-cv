/**
 * Membuat satu user admin. Dijalankan manual: `npm run create-admin`.
 *
 * Password TIDAK pernah masuk file seed, argumen command line, atau environment
 * variable — ketiganya tertinggal di git, di riwayat shell, atau di daftar
 * proses. Satu-satunya jalan masuk adalah prompt terminal di bawah, dan
 * ketikannya tidak digemakan ke layar supaya tidak tertinggal di scrollback.
 */

import process from 'node:process';

import argon2 from 'argon2';

import { pool } from '../db/pool.js';

const MIN_PASSWORD_LENGTH = 12;

const CTRL_C = '\u0003';
const DEL = '\u007f';
const BACKSPACE = '\b';

/** Membaca satu baris dari terminal, digemakan seperti biasa. */
function ask(prompt) {
  return read(prompt, { echo: true });
}

/** Membaca satu baris tanpa menggemakan ketikan. Untuk password. */
function askHidden(prompt) {
  return read(prompt, { echo: false });
}

function read(prompt, { echo }) {
  return new Promise((resolve, reject) => {
    const { stdin, stdout } = process;

    stdout.write(prompt);

    const wasRaw = Boolean(stdin.isRaw);
    if (!echo) stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let value = '';

    const finish = (settle, result) => {
      stdin.removeListener('data', onData);
      if (!echo) stdin.setRawMode(wasRaw);
      stdin.pause();
      stdout.write('\n');
      settle(result);
    };

    function onData(chunk) {
      for (const char of chunk) {
        if (char === '\n' || char === '\r') return finish(resolve, value);

        // Dalam mode raw, Ctrl+C tidak lagi sampai ke proses sebagai sinyal —
        // kalau tidak ditangani di sini, terminalnya terkunci.
        if (char === CTRL_C) return finish(reject, new Error('Dibatalkan.'));

        // Terminal yang berbeda mengirim salah satu dari dua ini untuk backspace.
        if (char === DEL || char === BACKSPACE) {
          value = value.slice(0, -1);
          continue;
        }

        value += char;
        if (echo) stdout.write(char);
      }
    }

    stdin.on('data', onData);
  });
}

async function main() {
  // Password dibaca dalam mode raw supaya ketikannya tidak digemakan, dan mode
  // itu hanya ada di terminal sungguhan. Tanpa penjagaan ini, menjalankan skrip
  // lewat pipe atau CI gagal dengan error internal Node yang tidak menjelaskan
  // apa pun. Sekalian mencegah password dioper lewat pipe — yang justru akan
  // menaruhnya di riwayat shell.
  if (!process.stdin.isTTY) {
    throw new Error(
      'Jalankan perintah ini langsung di terminal. Password harus diketik di prompt, tidak bisa dioper lewat pipe atau file.',
    );
  }

  const username = (await ask('Username admin: ')).trim();

  if (username === '') throw new Error('Username tidak boleh kosong.');

  const password = await askHidden('Password (tidak ditampilkan): ');

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password minimal ${MIN_PASSWORD_LENGTH} karakter.`);
  }

  if (await askHidden('Ulangi password: ') !== password) {
    throw new Error('Password tidak sama.');
  }

  const passwordHash = await argon2.hash(password);

  // Kolom username punya UNIQUE key, jadi duplikat ditolak database sendiri —
  // tidak perlu SELECT lebih dulu, dan tidak ada celah antara memeriksa dan
  // menulis yang bisa disisipi baris kedua.
  try {
    const [result] = await pool.execute(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, passwordHash],
    );
    console.log(`Admin "${username}" dibuat (id ${result.insertId}).`);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new Error(`Username "${username}" sudah dipakai.`);
    }
    throw err;
  }
}

main()
  .then(() => pool.end())
  .catch(async (err) => {
    console.error(`Gagal: ${err.message}`);
    await pool.end();
    process.exitCode = 1;
  });
