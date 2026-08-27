# Catatan Pengerjaan — Portfolio CV

Status per **27 Agustus 2026**.

Dua dokumen sumber, keduanya berlaku:

- [PHASE-1-HANDOFF.md](PHASE-1-HANDOFF.md) — skema, kontrak API, struktur folder. Tidak diubah.
- [PHASE-1-FINISH.md](PHASE-1-FINISH.md) — cara kerja dan definisi selesai. Mencabut aturan
  berhenti per task, memindahkan deploy ke luar lingkup, menetapkan dua checkpoint.

File ini mencatat apa yang sudah jalan, keputusan yang diambil, dan utang yang belum dibayar.

---

## Ringkasan

**Phase 1: 4 dari 9 task selesai.**

Urutan mengikuti bagian 3 `PHASE-1-FINISH.md` — task 9 dikerjakan sebelum task 8'.

| # | Task | Status |
|---|---|---|
| 1 | Skeleton repo, backend Express, `GET /api/v1/health` | **Selesai & terverifikasi** |
| 2 | Migrasi + seed | **Selesai & terverifikasi** |
| 3 | `GET /api/v1/experiences` | **Selesai & terverifikasi** |
| 4 | `GET /api/v1/profile` | **Selesai & terverifikasi** |
| 5 | Frontend Vite — Hero/About/Experience | Belum |
| | ── **CHECKPOINT 1** — berhenti, lapor, tunggu lampu hijau ── | |
| 6 | Auth — createAdmin, login, requireAuth | Belum |
| 7 | Admin panel | Belum |
| | ── **CHECKPOINT 2** ── | |
| 9 | Styling | Belum |
| 8' | Verifikasi build produksi di lokal (deploy ke hosting ditunda) | Belum |

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

## Task 3 — selesai 27 Agustus 2026

### File yang dibuat

| File | Baris | Tanggung jawab |
|---|---|---|
| `backend/src/db/pool.js` | 25 | Pool `mysql2/promise`, satu instance untuk seluruh proses |
| `backend/src/modules/experiences/service.js` | 72 | Query + melipat hasil JOIN jadi bersarang. Tidak menyentuh `req`/`res` |
| `backend/src/modules/experiences/controller.js` | 17 | Panggil service, kirim respons. Tidak ada SQL |
| `backend/src/modules/experiences/routes.js` | 15 | Pemetaan path → controller |
| `backend/src/app.js` | +5 | Mount router, plus `app.disable('x-powered-by')` |

Dependensi baru: `mysql2`.

### Verifikasi yang dijalankan

`curl http://localhost:3000/api/v1/experiences`, hasilnya dicocokkan ke kontrak
bagian 4 handoff:

| Cek | Hasil |
|---|---|
| Array telanjang, bukan `{ data: [...] }` | Benar |
| Jumlah experience | 3 |
| Urut `start_date DESC` | Benar |
| `start_date` berupa string `"2025-11-01"` | Benar — bukan ISO timestamp |
| `end_date` untuk pekerjaan berjalan | `null` |
| `summary` tanpa isi | `null` |
| Highlight bersarang per experience | 4 · 3 · 1 |
| Field highlight | Hanya `id` dan `body` |

### Keputusan yang diambil

- **`dateStrings: true` di pool** — ini syarat kontrak, bukan preferensi gaya.
  Tanpanya kolom `DATE` kembali sebagai objek `Date` dan `JSON.stringify`
  mengubahnya jadi `"2025-10-31T17:00:00.000Z"`: tanggalnya bergeser satu hari
  mengikuti timezone server. Kontrak meminta `"2025-11-01"` apa adanya.
- **Satu query + lipat di JavaScript, bukan query per experience.** JOIN
  mengembalikan satu baris per highlight; `foldRows` menggabungkannya memakai
  `Map` yang di-key id experience. `Map` mempertahankan urutan penyisipan, jadi
  urutan `start_date DESC` dari SQL terjaga tanpa sort ulang. Alternatifnya N+1.
- **`ORDER BY` menyertakan `e.id`** walau kontrak hanya meminta `start_date DESC`.
  Dua experience boleh punya `start_date` sama; tanpa tiebreaker, barisnya bisa
  berselang-seling dan hasil lipatan tidak stabil antar-eksekusi.
- **`try/catch` manual di controller, bukan wrapper `asyncHandler`.** Express 4
  tidak menangkap rejected promise dari fungsi async. Wrapper akan jadi file baru
  di luar struktur bagian 5 (aturan 7), sementara try/catch eksplisit terbaca
  langsung. Pola ini dipakai sama persis di modul `profile`.
- **`app.disable('x-powered-by')` dipasang** — menutup utang dari task 1.

### Asumsi

- **Pesan commit ditulis dalam bahasa Inggris.** Bagian 6e `PHASE-1-FINISH.md`
  meminta nama variabel, fungsi, dan pesan commit berbahasa Inggris, sementara
  contoh format di bagian 4 ditulis dalam bahasa Indonesia. Yang diambil: struktur
  dari bagian 4 (baris pertama singkat, baris kosong, lalu poin), bahasa dari
  bagian 6e. Gampang diubah kalau ternyata maksudnya sebaliknya.

---

## Task 4 — selesai 27 Agustus 2026

### File yang dibuat

| File | Baris | Tanggung jawab |
|---|---|---|
| `backend/src/modules/profile/service.js` | 66 | Query profil + social_links, melipat jadi satu objek |
| `backend/src/modules/profile/controller.js` | 22 | Panggil service; 404 kalau profil belum ada |
| `backend/src/modules/profile/routes.js` | 15 | Pemetaan path → controller |
| `backend/src/app.js` | +2 | Mount router profile |

Tidak ada dependensi baru.

### Verifikasi yang dijalankan

| Cek | Hasil |
|---|---|
| Objek tunggal, bukan array | Benar |
| Field top-level | Persis 8 field kontrak, urutannya sesuai |
| `id` dan `updated_at` tidak ikut bocor | Benar — tidak ada di respons |
| `photo_url` | `null` |
| `social_links` | 2 item, hanya `id`/`label`/`url` |
| Urut `sort_order` | LinkedIn (0) sebelum Email (1) |
| Regresi `GET /experiences` setelah ganti ke `execute` | 3 experience, highlight 4·3·1, urutan tetap benar |
| Route tak dikenal | `404` JSON `NOT_FOUND` |
| Header `X-Powered-By` | Hilang |

### Keputusan yang diambil

- **Pola dipegang identik dengan modul `experiences`** (bagian 6d `PHASE-1-FINISH.md`):
  pembagian routes/controller/service sama, `try/catch` manual sama, service tidak
  pernah menyentuh `req`/`res`.
- **`PROFILE_ID = 1` konstanta di service, bukan parameter dari request.** Skema
  sudah mengunci profil ke satu baris lewat `CHECK (id = 1)`; menerima id dari luar
  akan membuka jalur yang skema-nya sendiri tidak izinkan.
- **`foldRows` profile tidak memakai `Map`.** Induknya dijamin satu baris, jadi kolom
  profil diambil dari baris pertama dan social link dikumpulkan dari seluruh baris.
  Perbedaan dengan `experiences` ini disengaja, bukan inkonsistensi.
- **Seluruh backend memakai `pool.execute`, bukan `pool.query`** — termasuk query
  `experiences` yang tidak punya parameter. Alasannya konsistensi: aturan 3 handoff
  meminta prepared statement, dan satu tempat yang polanya beda akan memicu
  pertanyaan reviewer.

### Koreksi terhadap Task 2 — bug encoding yang baru ketahuan

Verifikasi Task 2 dulu menghitung jumlah baris dan menguji constraint, tapi **tidak
pernah memeriksa isi teksnya byte per byte**. Saat Task 4 mengembalikan `about_md`
lewat API, ketahuan em dash (`—`, UTF-8 `E2 80 94`) tersimpan sebagai tiga karakter
mojibake `â€"` (`C3A2 E282AC E2809D`).

**Penyebabnya skrip migrasi, bukan file seed.** File `001_seed.sql` sendiri selalu
UTF-8 yang benar. Skrip yang dipakai menjalankannya memakai `Get-Content | mysql`,
dan itu merusak di dua tahap: `Get-Content` di PowerShell 5.1 membaca file dengan
codepage ANSI, lalu pipe ke native command menulis ulang memakai `$OutputEncoding`.

**Perbaikannya:** kosongkan tabel seed (reset `AUTO_INCREMENT`), lalu jalankan ulang
seed lewat redirection `cmd.exe` yang menyalurkan byte apa adanya, plus
`--default-character-set=utf8mb4` di klien mysql.

Terverifikasi setelah perbaikan: byte `C3A2` dan `E282AC` **tidak ada**, byte `E28094`
**ada** sebanyak 2, dan lewat API `about_md` memuat tepat 2 karakter `U+2014` tanpa
satu pun `U+FFFD`. Jumlah baris kembali 3 · 8 · 1 · 2 · 0 dengan id highlight 1–8.

> **Berdampak ke `README.md`:** perintah menjalankan seed yang nanti ditulis di task 8'
> **tidak boleh** memakai `Get-Content | mysql`. Dicatat di sini supaya bug yang sama
> tidak diwariskan ke orang yang meng-clone repo ini.

Pelajaran yang dipakai untuk task berikutnya: verifikasi "jumlah baris benar" tidak
membuktikan "isi baris benar".

---

## Lingkungan mesin

| | |
|---|---|
| Node.js | v24.19.0 (handoff minta 20+) |
| npm | 11.17.0 |
| git | 2.55.0, branch `main`, identitas lokal `Deus <deus@users.noreply.github.com>` |
| GitHub | `gh` CLI 2.98.0, login sebagai `mikowidi`, remote `origin` → `mikowidi/portfolio-cv` |
| MySQL | **8.4.9**, service `MySQL84` Running, port 3306, database `portfolio_cv` terisi |

Catatan: Node terpasang setelah sesi kerja dimulai, jadi terminal yang sudah terbuka
sebelumnya tidak melihat `node` di PATH. Buka terminal baru kalau kena.

---

## Utang yang belum dibayar

- [ ] **`README.md` masih menyebut database dan frontend "belum ada".** Diperbarui di
      task 8' sesuai bagian 10 `PHASE-1-FINISH.md`.
- [ ] **Password admin belum dibuat.** Blocker keras task 6 — hanya pemilik yang boleh
      menjalankan `npm run create-admin` dan mengetik passwordnya di prompt terminal.
- [ ] **Hosting MySQL belum diriset.** Handoff bagian 8 minta ini dicek di awal, jangan
      menunggu task 8 — PlanetScale sudah menutup free tier-nya. Kalau semua opsi buntu,
      pindah ke Postgres ±1 jam kerja, dan itu keputusan yang lebih murah diambil sekarang
      daripada di task 8.
- [ ] **Repo public, dan seed berisi data pribadi asli** — nama lengkap, email,
      LinkedIn, riwayat kerja. Ini keputusan sadar pemilik, dicatat di sini supaya
      tidak terlupakan kalau nanti ada data yang lebih sensitif ikut masuk seed.

### Sudah lunas

- ~~Belum ada commit~~ — commit pertama `3c97af6`, atas nama `Deus`.
- ~~QA tanggal Wisma Nusantara~~ — dikonfirmasi benar, seed sudah jalan.
- ~~MySQL belum dicek~~ — 8.4.9 terpasang dan terisi.
- ~~Belum ada remote~~ — https://github.com/mikowidi/portfolio-cv (public).
- ~~`JWT_SECRET` masih placeholder~~ — sudah diganti pemilik dengan secret acak 96 karakter.
- ~~Header `X-Powered-By`~~ — `app.disable('x-powered-by')` dipasang di task 3.

---

## Langkah berikutnya

**Task 5 — frontend Vite: Hero, About, Experience tanpa styling.**
Verifikasi: halaman menampilkan data asli; matikan backend → muncul pesan gagal,
bukan layar kosong. Setelah itu berhenti di **checkpoint 1**.

---

## Pengingat aturan kerja

Berhenti per task **tidak berlaku lagi** (dicabut bagian 2 `PHASE-1-FINISH.md`).
Kerjakan berturut-turut, berhenti hanya di checkpoint. Commit tiap task selesai
dan terverifikasi; `PROGRESS.md` ikut di commit yang sama. **Push dilakukan pemilik.**

Yang tetap berlaku tanpa pengecualian: SQL mentah tanpa ORM, auth ditulis manual,
tanpa UI library, maksimal ±150 baris per file, jangan bikin file di luar struktur
bagian 5 handoff tanpa bertanya, `.env` tidak pernah di-commit.
