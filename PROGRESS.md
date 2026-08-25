# Catatan Pengerjaan — Portfolio CV

Status per **25 Agustus 2026**.

Lingkup, kontrak API, dan aturan kerja ada di [PHASE-1-HANDOFF.md](PHASE-1-HANDOFF.md) —
file itu tidak diubah. File ini hanya mencatat: apa yang sudah jalan, keputusan apa
yang sudah diambil, dan utang apa yang belum dibayar.

---

## Ringkasan

**Phase 1: 2 dari 9 task selesai.**

| # | Task | Status |
|---|---|---|
| 1 | Skeleton repo, backend Express, `GET /api/v1/health` | **Selesai & terverifikasi** |
| 2 | Migrasi + seed | **Selesai & terverifikasi** |
| 3 | `GET /api/v1/experiences` | Belum |
| 4 | `GET /api/v1/profile` | Belum |
| 5 | Frontend Vite — Hero/About/Experience | Belum |
| 6 | Auth — createAdmin, login, requireAuth | Belum |
| 7 | Admin panel | Belum |
| 8 | Build produksi + deploy | Belum |
| 9 | Styling | Belum |

Belum ada tampilan yang bisa dilihat. Halaman visual pertama baru muncul di task 5.

---

## Task 1 — selesai 24 Agustus 2026

### File yang dibuat

| File | Baris | Tanggung jawab |
|---|---|---|
| `backend/src/server.js` | 11 | Titik masuk proses; satu-satunya yang memanggil `listen()` |
| `backend/src/app.js` | 26 | Merakit Express: JSON parser → route → 404 → error handler |
| `backend/src/config/env.js` | 52 | Satu-satunya tempat `process.env` dibaca; validasi + gagal cepat |
| `backend/src/middleware/errorHandler.js` | 42 | Satu-satunya tempat body error disusun; plus handler 404 |
| `backend/package.json` | 18 | ESM, `engines.node >= 20`, script `dev`/`start` |
| `backend/.env.example` | 8 | Persis seperti bagian 8 handoff |
| `README.md` | — | Cara jalan + verifikasi + checklist |
| `.gitignore` | — | `node_modules/`, `.env`, `dist/` |

Dependensi baru: `express` + `dotenv`. Tidak ada yang lain.

### Verifikasi yang benar-benar dijalankan

| Cek | Hasil |
|---|---|
| `GET /api/v1/health` | `200` · `{"ok":true}` |
| `GET /api/v1/typo` | `404` · `{"error":{"code":"NOT_FOUND","message":"..."}}` — JSON, bukan HTML |
| Start tanpa `.env` | Proses mati, exit code 1, menyebut 7 variabel yang kurang |
| `git check-ignore` | `backend/.env` dan `backend/node_modules` terkunci; `git status` hanya melihat `.env.example` |

### Keputusan yang diambil

**Tiga hal ditambahkan di luar perintah eksplisit task 1** (semuanya gampang dicabut):

1. `.gitignore` — tidak ada di struktur folder bagian 5, tapi aturan 8 (`.env` tidak
   pernah di-commit) tidak bisa ditegakkan tanpanya.
2. `middleware/errorHandler.js` + `notFoundHandler` — ada di bagian 5 tapi baru
   "dibutuhkan" nanti. Alasan dimasukkan sekarang: tanpanya, route tak dikenal
   membalas HTML bawaan Express, jadi kontrak bentuk error bagian 4 bocor sejak
   baris pertama. Untuk mencabut: hapus file + dua baris terakhir di `app.js`.
3. `express.json()` di `app.js` — belum ada endpoint yang membaca body.

**Asumsi:**

- **`dotenv`, bukan `node --env-file`.** Flag bawaan Node lebih bersih tapi crash
  kalau `.env` tidak ada, sementara di produksi env datang dari platform tanpa file.
- **`DB_PASSWORD` tidak masuk daftar wajib** di `config/env.js`. String kosong adalah
  nilai sah (root MySQL lokal), jadi tidak bisa dibedakan dari "belum diisi".
  Enam variabel lain + `JWT_SECRET` sudah divalidasi sekarang, sesuai bagian 8.
- **Root repo = folder kerja ini**, bukan subfolder `portfolio-cv/` di dalamnya.
- **`/api/v1/health` sengaja tidak menyentuh database.** Kalau ikut cek DB, "server
  mati" dan "database mati" jadi tidak terbedakan dari satu respons yang sama.

---

## Task 2 — selesai 25 Agustus 2026

### File yang dibuat

| File | Isi |
|---|---|
| `backend/src/db/migrations/001_init.sql` | DDL 5 tabel, persis seperti handoff bagian 3 |
| `backend/src/db/seed/001_seed.sql` | 1 profil, 2 social link, 3 experience, 8 highlight |

### Verifikasi yang diminta handoff

| Cek | Hasil |
|---|---|
| `SHOW TABLES` | 5 tabel: `users`, `profile`, `social_links`, `experiences`, `experience_highlights` |
| `SELECT` experiences | 3 baris, urut `start_date DESC` benar, `end_date` I-Thon = `NULL` |
| Highlight per experience | 4 + 3 + 1 = 8 |
| Profil + social link | 1 profil, 2 link dengan `sort_order` 0 dan 1 |

### Verifikasi tambahan — constraint benar-benar ditegakkan

Handoff mewajibkan MySQL 8.0+ **khusus** supaya `CHECK` bukan sekadar tertulis.
Itu diuji, bukan diasumsikan. Semua uji merusak dibungkus transaksi lalu di-ROLLBACK.

| Uji | Hasil |
|---|---|
| `INSERT profile id=2` | Ditolak — `ERROR 3819` `chk_profile_singleton` |
| `end_date` < `start_date` | Ditolak — `ERROR 3819` `chk_exp_dates` |
| Dua username sama | Ditolak — `ERROR 1062` `uq_users_username` |
| Highlight menunjuk experience 999 | Ditolak — `ERROR 1452` foreign key |
| `DELETE` experience 1 | 4 highlight ikut hilang (CASCADE jalan), kembali jadi 4 setelah ROLLBACK |

Keadaan akhir: 3 experience · 8 highlight · 1 profil · 2 social link · **0 user**
(benar — admin baru dibuat di task 6).

### Keputusan yang diambil

- **`001_init.sql` tidak membuat database-nya sendiri.** `CREATE DATABASE` adalah
  keputusan operasional (nama, charset, pemilik); file DDL hanya mengurus bentuk
  tabel. Database dibuat lewat perintah terpisah.
- **Seed dibungkus `START TRANSACTION` / `COMMIT`.** Dirancang jalan sekali di DB
  kosong. Kalau tidak sengaja jalan dua kali, `INSERT profile id=1` bentrok primary
  key dan seluruh isinya di-ROLLBACK — bukan separuh masuk separuh tidak.
- **`about_md` tidak pernah ditulis di handoff** padahal kolomnya `NOT NULL`.
  Isinya didraf dari fakta yang sudah ada di handoff, dengan nada yang sama seperti
  `hero_statement`, lalu disetujui pemilik. Bisa diedit lewat admin panel di task 7.
- **Tanggal Wisma Nusantara dikonfirmasi benar** (2024-01-01 → 2025-05-31),
  menutup QA yang ditandai handoff bagian 3.
- **Password root MySQL tidak pernah masuk percakapan.** Migrasi dijalankan lewat
  skrip di luar repo yang membaca `DB_PASSWORD` dari `.env` dan meneruskannya ke
  klien mysql lewat `MYSQL_PWD`, jadi tidak muncul di command line maupun output.

---

## Lingkungan mesin

| | |
|---|---|
| Node.js | v24.19.0 (handoff minta 20+) |
| npm | 11.17.0 |
| git | 2.55.0, branch `main`, identitas lokal `Deus <deus@users.noreply.github.com>` |
| MySQL | **8.4.9**, service `MySQL84` Running, port 3306, database `portfolio_cv` terisi |

Catatan: Node terpasang setelah sesi kerja dimulai, jadi terminal yang sudah terbuka
sebelumnya tidak melihat `node` di PATH. Buka terminal baru kalau kena.

---

## Utang yang belum dibayar

- [ ] **`JWT_SECRET` di `.env` lokal masih placeholder** (`ganti-dengan-string-acak-panjang`).
      Belum dipakai sampai task 6, tapi harus diganti sebelum sampai situ.
- [ ] **Header `X-Powered-By: Express` masih terkirim.** Sengaja tidak dimatikan supaya
      tidak menambah baris di luar lingkup. Perbaikannya satu baris: `app.disable('x-powered-by')`.
- [ ] **Hosting MySQL belum diriset.** Handoff bagian 8 minta ini dicek di awal, jangan
      menunggu task 8 — PlanetScale sudah menutup free tier-nya. Kalau semua opsi buntu,
      pindah ke Postgres ±1 jam kerja, dan itu keputusan yang lebih murah diambil sekarang
      daripada di task 8.
- [ ] **Belum ada remote.** Repo masih lokal sepenuhnya.

### Sudah lunas

- ~~Belum ada commit~~ — commit pertama `3c97af6`, atas nama `Deus`.
- ~~QA tanggal Wisma Nusantara~~ — dikonfirmasi benar, seed sudah jalan.
- ~~MySQL belum dicek~~ — 8.4.9 terpasang dan terisi.

---

## Langkah berikutnya

**Task 3 — `GET /api/v1/experiences`, service + JOIN highlight.**
Verifikasi: `curl` menghasilkan JSON persis seperti handoff bagian 4 — array telanjang,
urut `start_date DESC`, tiap experience membawa array `highlights`-nya.

Yang akan disentuh:
- `backend/src/db/pool.js` — pool `mysql2/promise`, satu instance
- `backend/src/modules/experiences/{routes.js, controller.js, service.js}`
- Dependensi baru: `mysql2`

Bagian yang jadi bahan belajar: menggabungkan hasil `JOIN` yang datar (satu baris per
highlight) menjadi struktur bersarang di JSON, tanpa N+1 query.

---

## Pengingat aturan kerja

Satu task per giliran. Selesai satu task → berhenti, lapor, tunggu review.
Tanpa ORM, tanpa library auth, tanpa UI library, maksimal ±150 baris per file.
