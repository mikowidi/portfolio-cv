# Catatan Pengerjaan — Portfolio CV

Status per **30 Agustus 2026**.

Tiga dokumen sumber, ketiganya berlaku:

- [PHASE-1-HANDOFF.md](PHASE-1-HANDOFF.md) — skema, kontrak API, struktur folder. Tidak diubah.
- [PHASE-1-FINISH.md](PHASE-1-FINISH.md) — cara kerja dan definisi selesai. Mencabut aturan
  berhenti per task, memindahkan deploy ke luar lingkup, menetapkan dua checkpoint.
- [PHASE-2-HANDOFF.md](PHASE-2-HANDOFF.md) — Education dan Skills. Cara kerjanya mengikuti
  `PHASE-1-FINISH.md`; satu checkpoint saja, setelah P2-3.
- [REDESIGN-HANDOFF.md](REDESIGN-HANDOFF.md) — perombakan tampilan: tema gelap Anthropic,
  dua kolom, nav, plus dua perbaikan admin. Satu checkpoint, setelah R-3.

File ini mencatat apa yang sudah jalan, keputusan yang diambil, dan utang yang belum dibayar.

---

## Ringkasan

**Phase 1: 9 dari 9 task selesai.**

Urutan mengikuti bagian 3 `PHASE-1-FINISH.md` — task 9 dikerjakan sebelum task 8'.

| # | Task | Status |
|---|---|---|
| 1 | Skeleton repo, backend Express, `GET /api/v1/health` | **Selesai & terverifikasi** |
| 2 | Migrasi + seed | **Selesai & terverifikasi** |
| 3 | `GET /api/v1/experiences` | **Selesai & terverifikasi** |
| 4 | `GET /api/v1/profile` | **Selesai & terverifikasi** |
| 5 | Frontend Vite — Hero/About/Experience | **Selesai & terverifikasi** |
| | ── **CHECKPOINT 1** ── | Lewat |
| 6 | Auth — createAdmin, login, requireAuth | **Selesai & terverifikasi** |
| 7 | Admin panel | **Selesai & terverifikasi** |
| | ── **CHECKPOINT 2** ── | Lewat |
| 9 | Styling | **Selesai & terverifikasi** |
| 8' | Verifikasi build produksi di lokal (deploy ke hosting ditunda) | **Selesai & terverifikasi** |

Halaman publik, admin panel, dan build produksi semuanya jalan di lokal. Deploy belum.

**Phase 2: sedang berjalan.**

| # | Task | Status |
|---|---|---|
| P2-1 | Migrasi 002 + seed 002 | **Selesai & terverifikasi** |
| — | Utang Phase 1 dibayar (handoff Phase 2 bagian 6) | **Selesai & terverifikasi** |
| P2-2 | `GET /education` dan `GET /skills` | **Selesai & terverifikasi** |
| P2-3 | Dua section di halaman publik | **Selesai & terverifikasi** |
| | ── **CHECKPOINT** ── | Lewat |
| P2-4 | Endpoint tulis + dua layar admin | **Selesai & terverifikasi** |
| P2-5 | Uji transaksi | **Selesai & terverifikasi** |

**Phase 2 selesai.** Definisi selesai bagian 8 handoff terpenuhi seluruhnya.

**Redesign: sedang berjalan.**

| # | Task | Status |
|---|---|---|
| R-1 | Dua perbaikan admin | **Selesai & terverifikasi** |
| R-2 | Token gelap + font mono | **Selesai & terverifikasi** |
| R-3 | Tata letak dua kolom + nav | **Selesai & terverifikasi** |
| | ── **CHECKPOINT** ── | **Di sini sekarang** |
| R-4 | Poles bagian publik | **Selesai & terverifikasi** |
| R-5 | Poles admin di tema gelap | **Selesai & terverifikasi** |
| R-6 | Build produksi | **Selesai & terverifikasi** |

**Redesign selesai.** Definisi selesai bagian 9 handoff terpenuhi seluruhnya.

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
| `README.md` | — | Cara jalan + verifikasi |
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

## Task 5 — selesai 27 Agustus 2026

### File yang dibuat

| File | Baris | Tanggung jawab |
|---|---|---|
| `frontend/package.json` | 20 | Script `dev`/`build`/`preview` |
| `frontend/vite.config.js` | 20 | Plugin React + proxy `/api` → `:3000` |
| `frontend/index.html` | 12 | Titik masuk Vite |
| `frontend/src/main.jsx` | 10 | Pasang React ke `#root` |
| `frontend/src/App.jsx` | 59 | Ambil dua endpoint paralel, kelola status memuat/gagal |
| `frontend/src/api/client.js` | 61 | Satu-satunya tempat `fetch` dipanggil |
| `frontend/src/sections/Hero.jsx` | 19 | Nama, headline, hero statement, social links |
| `frontend/src/sections/About.jsx` | 24 | Render `about_md` sebagai Markdown, lokasi · email |
| `frontend/src/sections/Experience.jsx` | 56 | Daftar experience + pemformat rentang tanggal |

Dependensi baru: `react` 19.2, `react-dom` 19.2, `marked` 18 · dev: `vite` 8.2,
`@vitejs/plugin-react` 6.1.

### Verifikasi yang dijalankan

Dua server hidup (`:3000` backend, `:5173` Vite), halaman dibuka di browser sungguhan.

| Cek | Hasil |
|---|---|
| Proxy `/api` lewat Vite | `curl localhost:5173/api/v1/health` → `{"ok":true}` |
| Hero | Nama, headline, hero statement, LinkedIn + Email tampil |
| About | Markdown jadi 4 paragraf; `location · email` tampil |
| Em dash di `about_md` | Tampil sebagai `—`, membuktikan perbaikan encoding tembus sampai layar |
| Experience | 3 entri, rentang `Nov 2025 - sekarang`, `Jan 2024 - Mei 2025`, `Agu 2018 - Agu 2019` |
| Highlight | 4 · 3 · 1 sebagai `<ul>` |
| Error konsol | Tidak ada saat backend hidup |
| **Backend dimatikan → muat ulang** | Muncul "Gagal memuat halaman / Tidak bisa menghubungi server…", **bukan layar kosong** |
| Backend dinyalakan lagi | Halaman pulih penuh, request `200 OK` |
| Batas ±150 baris | File terbesar 77 baris (`001_init.sql`); tidak ada yang lewat |

### Keputusan yang diambil

- **`marked` dipakai untuk merender `about_md`.** Aturan 5 melarang UI library;
  `marked` bukan itu — dia parser Markdown murni tanpa komponen. Alternatifnya
  memecah teks per baris kosong sendiri, tapi admin panel di task 7 membiarkan
  pemilik menulis Markdown apa saja, jadi parser sungguhan lebih jujur.
- **`dangerouslySetInnerHTML` dipakai sadar, dengan batas yang ditulis di komentar.**
  Aman untuk Phase 1 karena `about_md` hanya bisa ditulis satu admin yang sudah
  login — tidak ada jalur input publik. Kalau nanti ada teks pengunjung yang ikut
  dirender, HTML dari `marked` wajib disanitasi dulu.
- **Tanggal diformat dengan memotong string, bukan `new Date()`.** `new Date('2025-11-01')`
  ditafsirkan sebagai tengah malam UTC; di timezone sebelah barat GMT tanggalnya
  mundur sehari, dan untuk tanggal 1 bulannya ikut mundur. Tanggal di sini tidak
  butuh zona waktu sama sekali.
- **Status gagal membedakan 502/503/504 dari 4xx biasa.** Percobaan pertama
  menampilkan `Permintaan gagal (502).` — tidak salah, tapi tidak memberitahu apa
  pun ke pembaca. 502 dari proxy Vite artinya backend tidak menjawab, jadi
  pesannya diganti jadi "Tidak bisa menghubungi server". `fetch` sendiri **tidak**
  melempar untuk 502 — hanya kalau permintaannya tidak sampai sama sekali.
- **`credentials: 'include'` dipasang sejak sekarang** walau belum ada cookie.
  Bukan menyiapkan masa depan, tapi menutup lubang: satu pemanggilan yang kelupaan
  opsi ini saat admin panel masuk akan gagal 401 dengan sebab yang sulit dilacak.
- **`index.html` dibuat walau tidak ada di struktur bagian 5 handoff.** Vite tidak
  bisa jalan tanpanya — itu titik masuk build, bukan file tambahan. Dicatat di sini
  sesuai aturan 7 dan 9.

### Catatan

Di development, tiap endpoint terlihat dipanggil dua kali. Itu `StrictMode` React
yang sengaja menjalankan effect dua kali untuk membongkar effect yang tidak bersih;
penanda `cancelled` di `App.jsx` menangani konsekuensinya, dan pemanggilan gandanya
tidak terjadi di build produksi.

`styles.css` **belum dibuat** — halaman masih HTML semantik polos. Itu task 9,
sesuai bagian 7 handoff.

---

## README ditulis ulang — 27 Agustus 2026

Di luar penomoran task, dikerjakan sebelum task 6 supaya repo sudah bisa dibaca orang
lain lebih awal. Sasarannya bagian 6a `PHASE-1-FINISH.md`: orang asing bisa clone dan
menjalankan dalam 5 menit tanpa bertanya.

**Tiap perintah di README dijalankan sungguhan, bukan disalin dari ingatan.** Buktinya:
database `portfolio_cv` **dihapus total** lalu dibangun ulang hanya dengan perintah yang
tertulis di README — hasilnya 5 tabel, 3 experience, 8 highlight, em dash utuh, dan
halaman publik kembali tampil normal.

| Perintah di README | Hasil |
|---|---|
| `node --version` | v24.19.0 |
| `mysql --version` | 8.4.9 |
| `node -e "...randomBytes(48)..."` | 96 karakter hex |
| `CREATE DATABASE ...` | exit 0 |
| `mysql ... -e "source .../001_init.sql"` | exit 0, 5 tabel |
| `mysql ... -e "source .../001_seed.sql"` | exit 0, em dash utuh, mojibake nol |
| `SHOW TABLES; SELECT COUNT(*) ...` | 5 tabel, 3 experience |
| `npm install` (backend & frontend) | exit 0 |
| `npm run dev` (backend) | `:3000` menjawab `{"ok":true}` |
| `npm run dev` (frontend) | `:5173` merender halaman penuh |
| `npm run build` | exit 0, `dist/` berisi `index.html` + bundle |

### Keputusan

- **Perintah SQL memakai `-e "source file.sql"`, bukan redirection.** Bentuk ini membuat
  klien mysql membaca file sendiri byte demi byte, jadi identik di Windows, macOS, dan
  Linux — sekaligus menutup jalan ke bug encoding yang kena di task 2. Alasannya ditulis
  langsung di README supaya tidak ada yang "merapikannya" jadi `Get-Content | mysql`.
- **Checklist task dihapus dari README.** Status pengerjaan sekarang hanya hidup di file
  ini. Dua tempat yang mencatat hal sama pasti akan berbeda suatu hari, dan tidak ada
  cara menentukan mana yang benar.
- **Dua bagian bagian 6a sengaja belum ditulis**, karena perintahnya belum ada dan
  karenanya tidak bisa diverifikasi: cara membuat admin (menunggu `npm run create-admin`
  di task 6) dan menjalankan produksi dari satu origin (menunggu task 8'). Keduanya
  ditandai eksplisit di README sebagai belum tersedia, bukan didiamkan.

---

## Task 6 — selesai 27 Agustus 2026

### File yang dibuat

| File | Baris | Tanggung jawab |
|---|---|---|
| `backend/src/middleware/requireAuth.js` | 38 | Baca cookie → verifikasi JWT → tempel `req.user`, atau 401 |
| `backend/src/middleware/validate.js` | 41 | Bungkus skema zod jadi middleware, error jadi 400 + `fields` |
| `backend/src/modules/auth/schema.js` | 16 | Skema zod untuk body login |
| `backend/src/modules/auth/service.js` | 62 | Cari user, `argon2.verify`, tanda tangani JWT |
| `backend/src/modules/auth/controller.js` | 74 | Atur cookie, susun balasan |
| `backend/src/modules/auth/routes.js` | 45 | Rate limit → validasi → controller |
| `backend/src/scripts/createAdmin.js` | 122 | Prompt terminal, hash argon2, INSERT |
| `backend/src/app.js` | +5 | `cookie-parser`, mount router auth |
| `backend/src/middleware/errorHandler.js` | +13 | Tabel kode cadangan per status |

Dependensi baru: `argon2`, `jsonwebtoken`, `cookie-parser`, `zod`, `express-rate-limit`.
`argon2` terpasang lewat prebuilt binary — tidak butuh build tools di Windows.

### Verifikasi yang dijalankan

Jalur gagal, tanpa user sama sekali:

| Cek | Hasil |
|---|---|
| `GET /auth/me` tanpa cookie | `401` `UNAUTHORIZED` |
| `POST /auth/login` field hilang | `400` `VALIDATION_FAILED`, `fields` berbahasa Indonesia |
| `POST /auth/login` field kosong | `400`, sama |
| `POST /auth/login` username tidak ada | `401` "Username atau password salah." |
| Body bukan JSON | `400` `BAD_REQUEST` |
| Endpoint publik | `health`, `profile`, `experiences` tetap `200` |

Jalur berhasil, lewat user sementara (lihat catatan di bawah) — **15 dari 15 lulus**:

| Cek | Hasil |
|---|---|
| Login benar | `200`, body `{ id, username }`, tanpa `password_hash` |
| `Set-Cookie` | `HttpOnly` · `SameSite=Lax` · tanpa `Secure` di dev · `Max-Age=604800` |
| `GET /auth/me` dengan cookie | `200`, hanya `id` dan `username` |
| Password salah | `401`, pesannya **identik** dengan kasus username tidak ada |
| Tanda tangan token dirusak | `401` |
| `POST /auth/logout` | `204`, cookie dikosongkan dan kedaluwarsa 1970 |

Rate limit, dengan hitungan limiter direset lebih dulu:

| Percobaan | Hasil |
|---|---|
| 1–10 | `401` |
| 11–12 | `429` `TOO_MANY_REQUESTS`, header `RateLimit-Policy: 10;w=900` |
| `GET /experiences`, `/profile` di saat yang sama | `200` — endpoint baca tidak ikut terbatasi |

`npm run create-admin` dijalankan tanpa terminal → ditolak dengan pesan yang menjelaskan
sebabnya, bukan error internal Node. Tabel `users` tetap `0`.

### Keputusan yang diambil

- **User sementara dipakai untuk menguji jalur login, lalu dihapus.** Bagian 7
  `PHASE-1-FINISH.md` melarang Claude Code membuat akun admin atau password default —
  larangan itu dipatuhi: password user uji diacak di dalam memori proses, tidak pernah
  ditulis ke disk maupun command line, dan barisnya dihapus di blok `finally`. Setelah
  verifikasi, `SELECT COUNT(*) FROM users` = **0**. Akun admin sungguhan tetap dibuat
  pemilik lewat `npm run create-admin`.
- **Rate limiter melempar `next(err)`, bukan memakai opsi `message` bawaan.** Opsi
  bawaan menyusun body responsnya sendiri dan melanggar aturan "satu tempat penyusunan
  error" di bagian 4 handoff.
- **Status `429` dipakai walau tidak ada di daftar bagian 4.** Pembatasan laju memang
  diminta bagian 6 handoff, dan `429` adalah satu-satunya status yang tepat untuknya.
- **`/auth/me` membaca ulang user dari database**, tidak memercayai isi token. Token yang
  sah tetap berlaku sampai kedaluwarsa walau user-nya sudah dihapus.
- **Password dibaca dalam mode raw tanpa gema.** Kalau digemakan, password tertinggal di
  scrollback terminal. Skrip juga menolak jalan tanpa TTY, sekalian mencegah password
  dioper lewat pipe — yang justru akan menaruhnya di riwayat shell.
- **Cookie tidak ditandatangani `cookie-parser`.** Isinya JWT yang tanda tangannya sudah
  diverifikasi sendiri; lapisan tanda tangan kedua tidak menambah apa pun.

### Dua bug yang ketemu dan diperbaiki saat verifikasi

1. **Pesan validasi keluar dalam bahasa Inggris bawaan zod.** `.min(1, 'wajib diisi')`
   hanya menyala kalau nilainya sudah berupa string; kalau field-nya hilang, yang menyala
   pemeriksaan tipe dengan pesan bawaan. Diperbaiki dengan mengisi argumen pertama
   `z.string('wajib diisi')` juga.
2. **Body bukan JSON dibalas `code: "INTERNAL_ERROR"` bersama status `400`.**
   `express.json()` melempar error ber-status 400 tanpa `code`, dan `errorHandler`
   mengisinya dengan nilai cadangan yang salah. Diperbaiki dengan tabel kode cadangan
   per status.

### Penyimpangan dari verifikasi yang tertulis di handoff

Tabel bagian 9 handoff menyebut verifikasi task 6 sebagai "`PUT /profile` tanpa cookie →
401". Endpoint itu bagian dari task 7 dan belum ada, jadi `requireAuth` diuji lewat
`GET /auth/me` — satu-satunya endpoint terkunci yang sudah ada. Pemeriksaan
`PUT /profile` → 401 dilakukan di task 7 begitu endpointnya lahir.

---

## Task 7 — selesai 29 Agustus 2026

### File yang dibuat

| File | Baris | Tanggung jawab |
|---|---|---|
| `backend/src/modules/experiences/schema.js` | 75 | Skema zod experience + highlight, cermin CHECK di database |
| `backend/src/modules/profile/schema.js` | 33 | Skema zod profil |
| `frontend/src/admin/Login.jsx` | 70 | Form login |
| `frontend/src/admin/Dashboard.jsx` | 140 | Gerbang auth, muat data, daftar experience |
| `frontend/src/admin/ProfileForm.jsx` | 79 | Form profil |
| `frontend/src/admin/ExperienceForm.jsx` | 143 | Form experience |
| `frontend/src/admin/HighlightsEditor.jsx` | 66 | Tambah/hapus/urutkan highlight |

Diubah: `db/pool.js` (+`withTransaction`), `middleware/validate.js` (+field helper),
kedua modul service/controller/routes, `api/client.js` (+POST/PUT/DELETE), `App.jsx` (router).
Dependensi baru: `react-router-dom` 7.18.

### Verifikasi end-to-end lewat UI sungguhan

Dijalankan di browser, bukan lewat curl:

| Langkah | Hasil |
|---|---|
| Buka `/admin` tanpa cookie | Dialihkan ke `/admin/login` |
| Login lewat form | Masuk ke dashboard, nama user tampil |
| Muat ulang penuh `/admin` | Tetap masuk — cookie bertahan |
| Simpan profil | "Profil tersimpan." |
| Tambah experience + **3 highlight** | Tersimpan, langsung muncul di daftar admin di posisi teratas |
| **Halaman publik setelah muat ulang** | Experience baru tampil: `Jan 2026 - sekarang`, org · lokasi, ringkasan, **3 highlight sesuai urutan** |
| Buka form edit | Ketiga highlight kembali persis pada urutan tersimpan |
| Klik "Naik" pada highlight ke-3, simpan | Urutan baru tersimpan dan **tampil berubah di halaman publik** |
| Klik "Hapus", konfirmasi **dibatalkan** | Tidak ada yang terhapus |
| Klik "Hapus", konfirmasi **disetujui** | Terhapus, daftar 4 → 3 |
| Halaman publik setelah hapus | Kembali 3 experience, data uji hilang |
| Highlight yatim di database | 0 — `ON DELETE CASCADE` bekerja |

### Verifikasi sisi API

| Cek | Hasil |
|---|---|
| `PUT /profile`, `POST`/`PUT`/`DELETE /experiences` tanpa cookie | Keempatnya `401` |
| `PUT`/`DELETE /experiences/999999` | `404` |
| `end_date` < `start_date` | `400`, error menunjuk field `end_date` |
| Tanggal 2025-02-31 | `400` — ditolak sebelum sampai MySQL |
| `employment_type` asing | `400` |
| `position` kosong | `400`, `{"position":"wajib diisi"}` |
| Email tidak valid | `400`, `{"email":"format email tidak valid"}` |
| Request yang ditolak | Tidak menambah baris apa pun |
| **ROLLBACK di tengah transaksi** | Highlight dihapus (4 → 0), lalu **kembali 4** setelah rollback |

Keadaan akhir database sama persis seperti sebelum pengujian: 3 experience · 8 highlight ·
1 profil · 2 social link · 1 user (`proxy`).

### Keputusan yang diambil

- **`social_links` tidak ikut diubah `PUT /profile`.** Phase 1 hanya menjanjikan "edit
  profil", dan definisi selesai tidak menyebut social link. Menambahkannya berarti pola
  tulis kedua yang belum ada yang meminta. Link masih diubah lewat SQL.
- **Keberadaan baris pada UPDATE diperiksa lewat `SELECT`, bukan `affectedRows`.** MySQL
  menghitung `affectedRows` sebagai baris yang BERUBAH — menyimpan form tanpa mengubah apa
  pun menghasilkan 0, yang akan salah dibalas `404`.
- **`withTransaction` dipindah ke `db/pool.js`.** Transaksi terikat pada koneksi, jadi
  helper-nya milik lapisan koneksi. Sekaligus memecah `service.js` yang lewat 150 baris.
- **`ExperienceForm.jsx` dipecah, lahir `HighlightsEditor.jsx`** (aturan 6: file lewat
  ±150 baris harus dipecah). Seam-nya bersih — komponen baru tidak tahu apa pun soal
  experience, hanya mengelola satu array string.
- **Validasi mencerminkan CHECK di database, bukan menggantikannya.** Keduanya ada dengan
  sengaja: database supaya data tidak pernah rusak lewat jalur mana pun, zod supaya
  pengisi form dapat `400` yang menyebut field-nya alih-alih `500`.

### Catatan: uji end-to-end memakai akun sekali-pakai

Akun `proxy` milik pemilik dan passwordnya tidak boleh dipegang Claude Code, jadi login UI
diuji dengan akun sekali-pakai berpassword acak yang dibuat dan dihapus di sesi pengujian
ini. `proxy` tidak pernah dipakai maupun disentuh, dan setelah pengujian tabel `users`
kembali berisi hanya `proxy`.

Yang belum terbukti karenanya: bahwa hash password `proxy` sendiri cocok. Itu hanya bisa
dibuktikan pemilik, dengan login sendiri di `/admin/login`.

### Koreksi: kenapa uji login tidak bisa memakai ROLLBACK

Pola `START TRANSACTION` + `ROLLBACK` dari task 2 memang lebih tahan banting daripada
`finally` — `finally` tidak jalan kalau proses mati keras. Tapi pola itu **tidak bisa
dipakai untuk uji login**, dan ini diuji, bukan dikira-kira:

| Uji | Hasil |
|---|---|
| Baris di-INSERT dalam transaksi, dibaca dari koneksi yang sama | terlihat |
| Dibaca dari koneksi lain | **tidak terlihat** |
| Login lewat HTTP (server memakai koneksi lain) | **401** |

Bedanya dengan task 2: di sana seluruh uji berjalan dalam satu sesi klien mysql, jadi
transaksinya utuh di dalam satu koneksi. Uji login justru mengharuskan proses lain — server
HTTP — menemukan akun itu, dan baris yang belum di-commit tidak terlihat lintas koneksi.

Yang dipakai sebagai gantinya menutup celah yang sama: **penyapuan di awal, bukan hanya di
akhir.** Skrip menghapus semua akun berawalan `e2e-` sebelum membuat yang baru, jadi sisa
dari proses yang mati keras tersapu di run berikutnya — tanpa bergantung pada `finally`
yang belum tentu jalan.

---

## Task 9 — selesai 29 Agustus 2026

### File yang dibuat

| File | Baris | Isi |
|---|---|---|
| `frontend/src/styles.css` | 124 | Token, gaya dasar, halaman publik, blok reduced-motion |
| `frontend/src/admin.css` | 91 | Form dan daftar admin panel |

Diubah: `index.html` (link Google Fonts), `main.jsx` (impor CSS), dan tiga komponen
section diberi nama kelas. Tidak ada dependensi baru — Inter dimuat lewat `<link>`.

### Verifikasi terhadap tolok ukur handoff

Handoff bagian 7 menetapkan tiga tolok ukur. Ketiganya diperiksa, bukan diasumsikan.

**1. Terbaca di layar 360px** — viewport diemulasi 360×760:

| Halaman | Scroll horizontal | Elemen meluber |
|---|---|---|
| Halaman publik | Tidak ada | Tidak ada |
| `/admin/login` | Tidak ada | Tidak ada |
| `/admin` dengan form experience terbuka | Tidak ada | Tidak ada |

Di 360px `h1` menyusut sendiri dari 48px jadi 30px lewat `clamp()`, tanpa media query.
Teks terkecil 13px; textarea di dalam fieldset muat pada 291px.

**2. Fokus keyboard terlihat** — sebagian terverifikasi, dan batasnya disebut jujur.
Fokus sistem tidak bisa didapat di pane browser ini (`document.hasFocus()` selalu
`false`), jadi cincin fokus **tidak bisa diuji hidup**. Yang bisa dan sudah diperiksa:

| Cek | Hasil |
|---|---|
| Aturan `:focus-visible` ada di CSSOM | `outline: 3px solid var(--focus); outline-offset: 2px` |
| Ada `outline: none` yang menghapus fallback bawaan browser | Tidak ada satu pun |
| Kontras cincin fokus vs latar halaman | 4.89:1 (WCAG non-teks minta 3:1) |
| Kontras cincin fokus vs isi tombol | 1.56:1 — lihat catatan |
| Kontras teks vs latar | 16.79:1 |
| Kontras teks muted vs latar | 6.07:1 |
| Kontras tautan/aksen vs latar | 7.61:1 |

Angka 1.56:1 itu tidak jadi masalah karena `outline-offset: 2px` menaruh cincinnya di
luar tombol, di atas latar — jadi yang berlaku adalah 4.89:1. Ketergantungan itu ditulis
di komentar CSS supaya offset-nya tidak dihapus orang lain tanpa sadar.

**3. `prefers-reduced-motion` dihormati** — blok media ada dan menargetkan
`*, ::before, ::after` dengan durasi 0.01ms. Diperiksa juga bahwa aturannya **tidak
hampa**: ada dua transisi nyata yang dimatikannya (`border-color` pada input,
`background-color` pada tombol).

### Keputusan yang diambil

- **Satu tipografi: Inter, bobot 400 dan 600 saja.** Dimuat lewat `<link>` di
  `index.html`, bukan `@import` di CSS, supaya unduhannya mulai tanpa menunggu stylesheet
  selesai diurai. `display=swap` membuat teks langsung terbaca dengan font sistem.
- **Bobot heading dipatok 600.** Bawaan browser untuk `h1` adalah 700, dan karena 700
  tidak diunduh, Inter akan dipalsukan tebalnya — huruf melar, bukan digambar ulang.
  Ketahuan dari `computed fontWeight: 700` saat verifikasi, lalu diperbaiki.
- **CSS dipecah dua** (aturan 6: file lewat ±150 baris). Seam-nya halaman publik vs admin;
  token dan gaya dasar tetap di `styles.css` dan berlaku untuk keduanya.
- **Nama kelas ditambahkan ke tiga komponen section.** Alternatifnya menata lewat
  selektor struktural seperti `article > p:first-child`, yang akan patah diam-diam begitu
  urutan elemen berubah.
- **Ukuran fluid dengan `clamp()`, bukan media query.** Hanya dua ukuran yang perlu
  menyesuaikan layar, dan keduanya berubah mulus tanpa titik patah yang harus dirawat.
- **Tanpa dark mode.** Eksplisit di luar lingkup Phase 1.

---

## Task 8' — selesai 29 Agustus 2026

Deploy ke hosting **tidak** dikerjakan, sesuai bagian 5 `PHASE-1-FINISH.md`. Yang
dikerjakan: membuktikan aplikasi jalan dari satu origin di mesin lokal.

### Yang diubah

`backend/src/app.js` (+40 baris): penyajian `frontend/dist` sebagai static plus SPA
fallback, aktif hanya saat `NODE_ENV=production`. `README.md`: cara menjalankan mode
produksi dan apa saja syarat deploy yang belum terpenuhi.

### Verifikasi yang dijalankan

`npm run build` → `dist/` berisi `index.html`, satu bundel CSS (3.6 kB), satu bundel JS
(282 kB / 89 kB gzip). Backend dijalankan dengan `NODE_ENV=production`, log menyebut
`(production)`, lalu semuanya diakses dari `:3000` saja — Vite tidak dipakai sama sekali.

| Cek | Hasil |
|---|---|
| `GET /` | `200 text/html` |
| `GET /admin` dan `/admin/login` | `200 text/html` — SPA fallback bekerja |
| `GET /api/v1/profile`, `/experiences` | `200 application/json` |
| `GET /api/v1/salahketik` | `404` **JSON**, bukan HTML halaman |
| Aset `/assets/index-*.js` | `200 application/javascript` |
| Halaman publik di browser | Render penuh: Inter, 3 entri, highlight 4·3·1 |
| `window.$RefreshReg$` | Tidak ada — membuktikan ini build produksi, bukan dev server |
| Buka `/admin` tanpa cookie | Dialihkan ke `/admin/login` |
| Login lewat form | Masuk; `document.cookie` **kosong** — `httpOnly` bekerja |
| Flag cookie di produksi | `HttpOnly; Secure; SameSite=Lax`, Max-Age 7 hari |
| `POST /experiences` dari origin produksi | `201`, highlight bersarang ikut terbentuk |
| Muncul di daftar publik | Ya, 3 → 4 |
| `DELETE` lalu cek ulang | `204`, kembali 3 |

### Keputusan yang diambil

- **Penyajian `dist` dipasang di `app.js`, bukan `server.js`** seperti sketsa struktur
  bagian 5 handoff. Alasannya mengikat: Express mencocokkan middleware sesuai urutan
  pendaftaran, dan `notFoundHandler` sudah terpasang di akhir `app.js`. Apa pun yang
  ditambahkan dari `server.js` akan berada setelahnya dan tidak akan pernah tercapai.
  `server.js` tetap murni `listen()`.
- **SPA fallback menolak melayani path `/api/`.** Tanpa penjagaan itu, endpoint yang salah
  ketik akan membalas HTML halaman dengan status 200, dan klien gagal mengurainya sebagai
  JSON — kegagalan yang jauh lebih membingungkan daripada 404 biasa. Sudah diuji.
- **Server menolak menyala kalau `frontend/dist` tidak ada**, dengan pesan yang menyuruh
  menjalankan `npm run build`. Alasannya sama seperti `config/env.js`: server yang menyala
  lalu membalas 404 untuk setiap halaman lebih sulit didiagnosis daripada yang menolak
  menyala sambil menyebutkan penyebabnya.
- **Konsekuensi flag `Secure` dicatat di README.** Di `http://localhost` cookie tetap
  terkirim karena browser memperlakukan localhost sebagai origin tepercaya, tapi di server
  sungguhan tanpa HTTPS login tidak akan pernah nyangkut. Itu jebakan deploy yang paling
  mungkin memakan waktu, jadi ditulis sebelum sempat kejadian.

---

## Ganti font ke Plus Jakarta Sans — 30 Agustus 2026

Di luar penomoran task, dikerjakan sebagai commit tersendiri sebelum Phase 2 dimulai.

### Yang diubah

`frontend/index.html` (href Google Fonts + komentar), `frontend/src/styles.css`
(`font-family` + komentar faux-bold), `PHASE-2-HANDOFF.md` (pengecualian font di bagian
"Styling: JANGAN disentuh"). Tidak ada dependensi baru — font dimuat lewat `<link>`.

### Verifikasi yang dijalankan

| Cek | Hasil |
|---|---|
| Stylesheet Google Fonts terunduh | `document.fonts` berisi 8 `@font-face` dari href baru |
| File font dari `fonts.gstatic.com` | Ya — href resolve ke `.woff2` di `fonts.gstatic.com/s/plusjakartasans/v12/…` |
| Bobot yang diunduh | Hanya 400 dan 600, sama persis dengan yang dipakai CSS |
| Font benar-benar dipakai, bukan fallback | Lebar `'Amadeus Thareq Widhi'` 600/40px: **440.6px** dengan Plus Jakarta vs **424.04px** dengan `system-ui`/`Segoe UI` — beda, jadi bukan font sistem |
| `check("600 1rem 'Plus Jakarta Sans'")` | `true` setelah `document.fonts.load` |
| 360px (diemulasi 375×812) | Tidak ada scroll horizontal, tidak ada elemen meluber |
| Em dash di `about_md` | Tetap utuh |

### Kenapa `line-height` tetap 1.65

Instruksi pemilik menyebut Plus Jakarta punya x-height lebih tinggi dari Inter, dan minta
dinilai apakah 1.65 perlu naik ke 1.7. **Premisnya diukur, bukan diterima** — kedua font
dimuat berdampingan lalu x-height-nya diukur lewat `actualBoundingBoxAscent` huruf `x`
pada 1000px, ukuran di mana kuantisasi ke piksel jadi 0.001 em:

| | x-height | cap-height | rasio x/cap |
|---|---|---|---|
| Plus Jakarta Sans | **0.546875 em** | 0.750 em | 0.729 |
| Inter | **0.546875 em** | 0.734 em | 0.745 |

X-height keduanya **identik sampai digit terakhir**. Yang berbeda cuma cap-height (Plus
Jakarta 2% lebih tinggi), dan itu tidak memengaruhi kepadatan blok teks huruf kecil.
Premisnya tidak berlaku, teksnya tidak terasa sesak, jadi `1.65` dibiarkan. Pemilik minta
"ubah hanya kalau memang terasa sesak" — syarat itu tidak terpenuhi.

Pengukuran awal pada 128px dan 200px sempat menunjukkan Plus Jakarta 1–2% lebih pendek.
Itu artefak: `actualBoundingBoxAscent` dibulatkan ke piksel utuh, jadi pada ukuran kecil
selisih satu piksel terbaca sebagai selisih 0.008 em. Pada 1000px artefaknya hilang.

### Catatan: redesign yang belum di-commit di-stash

Saat sesi ini dimulai, `index.html` dan `styles.css` sudah berisi redesign yang belum
di-commit — tiga keluarga font (Archivo, Fraunces, IBM Plex Mono), grid dua kolom, palet
baru, plus tag `<link>` yang rusak (ada `/>` nyasar). Itu bertabrakan dengan larangan
styling di `PHASE-2-HANDOFF.md` bagian 1 dan dengan instruksi ganti font ini.

Atas keputusan pemilik, redesign itu **di-stash, bukan dibuang**:

```
stash@{0}  redesign WIP: Archivo/Fraunces/IBM Plex Mono, grid dua kolom, palet kertas
```

Bisa dipanggil balik dengan `git stash pop` kapan pun redesign resmi dimulai. Perubahan
font dikerjakan di atas baseline yang sudah di-commit (`df486bb`), bukan di atas redesign.

---

## Task P2-1 — selesai 30 Agustus 2026

### File yang dibuat

| File | Baris | Isi |
|---|---|---|
| `backend/src/db/migrations/002_phase2.sql` | 46 | DDL 3 tabel, persis seperti handoff Phase 2 bagian 2 |
| `backend/src/db/seed/002_phase2.sql` | 53 | 3 education, 3 skill group, 16 skill |

Tidak ada dependensi baru. Tidak ada kode aplikasi yang disentuh — P2-1 murni database.

### Verifikasi yang diminta handoff

| Cek | Hasil |
|---|---|
| `SHOW TABLES` | **8 tabel** — 5 lama + `education`, `skill_groups`, `skills` |
| Jumlah baris | 3 education · 3 skill group · 16 skill |
| `education` urut `start_date DESC` | UT (2025) → Al-Azhar (2021) → Gontor (2012), benar |
| `end_date` yang masih berjalan | `NULL` untuk UT |
| `note` | Terisi hanya untuk Al-Azhar (`tidak dilanjutkan`), sisanya `NULL` |
| Jumlah skill per grup | 5 · 8 · 3, cocok dengan handoff |
| Urutan `sort_order` grup dan skill | Sesuai handoff, tanpa satu pun tertukar |

### Verifikasi tambahan — constraint benar-benar ditegakkan

Pola yang sama seperti task 2: semua uji merusak dibungkus `START TRANSACTION` lalu
`ROLLBACK`. Klien dijalankan dengan `--force` supaya lanjut setelah error yang memang
diharapkan muncul.

| Uji | Hasil |
|---|---|
| `education` `end_date` < `start_date` | Ditolak — `ERROR 3819` `chk_edu_dates` |
| `education` `end_date` = `start_date` | **Diterima** — batasnya inklusif, sesuai `>=` di DDL |
| Nama grup duplikat persis | Ditolak — `ERROR 1062` `uq_skill_group_name` |
| Nama grup beda huruf besar-kecil | Ditolak — `ERROR 1062`, lihat catatan di bawah |
| Skill menunjuk grup 999 | Ditolak — `ERROR 1452` foreign key |
| `DELETE` grup 1 | 5 skill anaknya ikut hilang (16 → 11), CASCADE jalan |
| Setelah `ROLLBACK` | Kembali **3 · 3 · 16**, identik dengan keadaan sebelum uji |

### Verifikasi isi, bukan cuma jumlah

Pelajaran dari task 4 (bug encoding yang lolos karena verifikasinya cuma menghitung baris)
diterapkan di sini: isi kolom diperiksa, bukan hanya jumlahnya.

| Cek | Hasil |
|---|---|
| Byte > `0x7F` di file seed | Hanya di dua baris **komentar** (em dash); seluruh data murni ASCII |
| Penanda mojibake `C3A2` di database | 0 di `education`, `skill_groups`, dan `skills` |
| Semua 16 skill di-dump dan dicocokkan ke handoff | Cocok satu per satu |

### Keputusan yang diambil

- **Tanggal Gontor dan UT dipakai apa adanya dari handoff**, menutup QA pemilik di bagian 2
  dengan cara yang dipilih pemilik. Alasannya ditulis di komentar file seed: kolomnya `DATE`
  jadi harus diisi sesuatu, dan begitu P2-4 selesai keduanya bisa diperbaiki lewat admin
  panel tanpa menyentuh SQL. Ini beda dengan QA Wisma Nusantara di task 2 yang dikonfirmasi
  benar — yang ini sengaja dicatat sebagai asumsi yang belum dikonfirmasi.
- **`skill_groups.id` ditulis eksplisit di seed**, sama seperti `experiences` di seed 001,
  supaya baris `skills` bisa menunjuk induknya tanpa bergantung pada nilai `AUTO_INCREMENT`
  yang kebetulan terjadi.
- **Seed 002 dibungkus transaksi** dengan alasan yang sama seperti 001. Yang menahan
  jalan-dua-kali di sini ternyata **primary key `skill_groups`**, bukan
  `uq_skill_group_name` seperti yang diduga saat menulisnya — karena `id` grup ditulis
  eksplisit, PK yang bentrok lebih dulu. Diuji langsung: menjalankan seed 002 dua kali
  menghasilkan `ERROR 1062 ... for key 'skill_groups.PRIMARY'`, dan jumlahnya tetap
  3 · 3 · 16, bukan berganda.

  Yang penting dari situ: `education` tidak punya kunci unik apa pun. Kalau seed ini
  dijalankan dua kali **tanpa** transaksi, tiga baris education akan masuk lagi tanpa satu
  pun error. Jadi transaksinya bukan formalitas — itu satu-satunya yang menjaga tabel itu.
- **Migrasi 002 tidak menyentuh tabel Phase 1.** Tidak ada `ALTER`, jadi tidak ada jalan
  bagi P2-1 untuk merusak data yang sudah ada.

### Temuan yang tidak diminta handoff

**`uq_skill_group_name` juga menolak nama yang cuma beda huruf besar-kecil.** Collation
tabelnya `utf8mb4_unicode_ci` — `ci` berarti case-insensitive — jadi `DATA & SPREADSHEET`
dianggap bentrok dengan `Data & spreadsheet`. Itu perilaku yang diinginkan (dua grup yang
cuma beda kapitalisasi memang salah input), tapi tidak tertulis di mana pun, jadi dicatat
di sini: kalau suatu saat collation-nya diubah ke `_bin` atau `_cs`, penjagaan ini hilang
tanpa error apa pun.

---

## Utang Phase 1 dibayar — 30 Agustus 2026

Tiga butir di `PHASE-2-HANDOFF.md` bagian 6. Dikerjakan sebagai commit tersendiri sebelum
P2-2 karena yang pertama adalah prasyaratnya: service skills memakai fungsi yang dipindah.

### 1. `foldRows` dipindah ke file sendiri

`backend/src/db/foldRows.js` (41 baris) — `experiences/service.js` turun dari **152 ke 133
baris**, kembali di bawah batas ±150.

Fungsinya digeneralisasi lewat tiga callback: `parent(row)` menyusun objek induk,
`child(row)` menyusun anak atau mengembalikan `null` untuk baris LEFT JOIN yang tidak
membawa anak, dan `key` menentukan nama properti array anak. Pengetahuan tentang nama
kolom tetap tinggal di service masing-masing — helper-nya tidak tahu apa itu experience
maupun skill.

Ditaruh di `db/` karena yang dilipat adalah bentuk hasil query, bukan aturan bisnis modul
mana pun. Ini file di luar struktur bagian 5 handoff Phase 1, tapi diminta eksplisit oleh
handoff Phase 2 bagian 6, jadi tidak melanggar aturan 7.

`profile/service.js` **sengaja tidak ikut dipindah**. Lipatannya memang berbeda — induknya
dijamin satu baris jadi tidak butuh `Map` — dan perbedaan itu sudah dicatat sebagai
keputusan sadar di task 4. Memaksakannya ke helper bersama hanya akan menambah cabang.

### 2. `jwt.verify` mengunci algoritma

`{ algorithms: ['HS256'] }` di `requireAuth.js`. Bukti bahwa perbaikannya memang menutup
sesuatu, bukan sekadar menambah baris:

| Uji | Hasil |
|---|---|
| Token HS256, diverifikasi dengan opsi | Diterima |
| Token HS512 (secret sama), diverifikasi **dengan** opsi | Ditolak — `invalid algorithm` |
| Token HS512 yang sama, diverifikasi **tanpa** opsi | **Lolos** — inilah celahnya |

### 3. Rate limiter tidak lagi menghitung login yang berhasil

`skipSuccessfulRequests: true` di `auth/routes.js`.

| Uji | Hasil |
|---|---|
| 12x login dengan password benar | **Semuanya `200`** — tanpa opsi ini, yang ke-11 sudah `429` |
| 12x login dengan password salah | `401` sepuluh kali, lalu `429` mulai percobaan ke-11 |

Setengah yang penting: penebakan tetap dibatasi. Opsi ini hanya membebaskan permintaan yang
berhasil, dan penebak tidak pernah berhasil.

### Catatan: akun uji sekali-pakai

Uji limiter butuh login yang benar-benar berhasil, jadi memakai pola yang sama seperti task
7 — akun berawalan `e2e-`, password diacak dan hanya hidup di memori proses, disapu di awal
dan di akhir. Setelah uji: **0 akun `e2e-` tersisa**. Akun pemilik (`proxy` dan `Operator`)
tidak pernah disentuh.

---

## Task P2-2 — selesai 30 Agustus 2026

### File yang dibuat

| File | Baris | Tanggung jawab |
|---|---|---|
| `backend/src/modules/education/service.js` | 21 | Query education. Tanpa JOIN — education tidak punya tabel anak |
| `backend/src/modules/education/controller.js` | 17 | Panggil service, kirim respons. Tidak ada SQL |
| `backend/src/modules/education/routes.js` | 17 | Pemetaan path → controller |
| `backend/src/modules/skills/service.js` | 39 | Query grup + skill, satu query, dilipat lewat `foldRows` |
| `backend/src/modules/skills/controller.js` | 17 | idem education |
| `backend/src/modules/skills/routes.js` | 20 | idem education |
| `backend/src/app.js` | +4 | Mount dua router baru |

Tidak ada dependensi baru. `schema.js` kedua modul belum ada — itu milik endpoint tulis di P2-4.

### Verifikasi terhadap kontrak bagian 3 handoff

| Cek | `/education` | `/skills` |
|---|---|---|
| Array telanjang, bukan `{ data: [...] }` | Benar | Benar |
| Jumlah | 3 | 3 grup |
| Urutan | `start_date DESC`, tiebreaker `id ASC` | `sort_order` grup, lalu `sort_order` skill |
| Field top-level | Persis 7 field kontrak, urutannya sesuai | `id`, `name`, `skills` |
| Field anak | — | Hanya `id` dan `name` |
| `created_at` / `updated_at` bocor | Tidak | Tidak (tabelnya memang tidak punya) |
| `start_date` berupa string `"2025-08-01"` | Benar — bukan ISO timestamp | — |
| `NULL` terjaga | `location`, `end_date`, `note` | — |
| Jumlah skill per grup | — | 5 · 8 · 3 |

### Verifikasi N+1 — dihitung, bukan diasumsikan

Handoff meminta "cek jumlah query, tidak boleh N+1". Dihitung lewat delta
`Com_stmt_execute` di `SHOW GLOBAL STATUS`, sebelum dan sesudah satu request. Penghitung
itu dipilih karena `SHOW GLOBAL STATUS` sendiri tidak menambahnya — terbukti dari kontrol
tanpa request yang menghasilkan delta `0`, jadi angkanya murni milik request.

| Endpoint | Induk | Anak | Statement dieksekusi |
|---|---|---|---|
| `/education` | 3 | 0 | **1** |
| `/skills` | 3 | 16 | **1** |
| `/experiences` | 4 | 10 | **1** |
| `/profile` | 1 | 2 | **1** |

Yang membuktikan bukan N+1 bukan angka 1 itu sendiri, tapi bahwa angkanya **tidak ikut
naik saat jumlah induk dan anaknya berbeda**. Kalau N+1, `/skills` akan 4 dan
`/experiences` 5.

### Verifikasi lain

| Cek | Hasil |
|---|---|
| Keduanya publik, tanpa cookie | `200` |
| `GET /api/v1/educations` (salah ketik) | `404` **JSON** `NOT_FOUND`, bukan HTML |
| `POST`/`PUT`/`DELETE /education` | `404` — belum ada, dan gagalnya rapi bukan `500` |
| Regresi `/health`, `/profile`, `/experiences` | Ketiganya tetap `200` |
| Regresi bentuk `/experiences` setelah `foldRows` dipindah | 4 entri, highlight 2·4·3·1, urutan dan field tidak berubah |

### Keputusan yang diambil

- **`education` tidak memakai `foldRows`.** Tabelnya berdiri sendiri, jadi hasil query
  sudah berbentuk kontrak dan tidak ada yang perlu dilipat. Memaksakan helper ke sini
  hanya menambah lapisan tanpa menghapus apa pun.
- **`LEFT JOIN`, bukan `INNER`, di skills.** Grup yang belum punya skill tetap terbawa dan
  muncul sebagai grup kosong. Dengan `INNER` grup itu hilang tanpa jejak — dan admin yang
  baru membuat grup lalu belum mengisi skill-nya akan mengira simpanannya gagal.
- **Router skills belum dipasang di prefix `/skill-groups`.** Kontrak memakai dua nama
  untuk modul yang sama: `/skills` untuk baca, `/skill-groups` untuk tulis. Memasang
  router yang sama dua kali akan sekalian membuka `GET /skill-groups` yang tidak ada di
  kontrak, jadi router tulisnya dibuat terpisah di P2-4.
- **Tiebreaker `id ASC` dipasang di kedua query**, mengikuti alasan yang sama seperti task
  3: dua baris boleh punya kunci urut yang sama, dan tanpa tiebreaker urutannya tidak
  stabil antar-eksekusi.

### Catatan: data pemilik yang bertambah sejak Phase 1

Database sekarang berisi **4 experience** (bukan 3 seperti catatan task 7) dan **2 user**
(`proxy` dan `Operator`). Keduanya dibuat pemilik lewat admin panel pada 29 Agustus, di
luar sesi kerja ini. Tidak disentuh — dicatat di sini supaya angka di catatan task lama
tidak dikira melenceng.

---

## Task P2-3 — selesai 30 Agustus 2026

### File yang dibuat

| File | Baris | Tanggung jawab |
|---|---|---|
| `frontend/src/sections/Education.jsx` | 35 | Daftar education memakai pola `.entry` |
| `frontend/src/sections/Skills.jsx` | 36 | Tiap grup: nama + daftar skill |
| `frontend/src/sections/dateRange.js` | 32 | Pemformat rentang tanggal, dipindah dari `Experience.jsx` |

Diubah: `App.jsx` (74 → 85 baris; empat endpoint, dua section baru),
`Experience.jsx` (58 → 36 baris; pemformat tanggal dipindah keluar).
Tidak ada dependensi baru. **`styles.css` dan `admin.css` tidak disentuh sama sekali.**

### Verifikasi yang dijalankan

Dua server hidup, halaman dibuka di browser sungguhan.

| Cek | Hasil |
|---|---|
| Urutan section | `hero > about > experience > education > skills` — sesuai handoff bagian 4 |
| Education | 3 entri, rentang `Agu 2025 - sekarang`, `Jan 2021 - Mei 2025`, `Jul 2012 - Jun 2018` |
| `note` Al-Azhar | Tampil sebagai "tidak dilanjutkan"; dua entri lain tanpa note tidak menyisakan baris kosong |
| `location` kosong (UT, Gontor) | Tidak memunculkan ` · ` yang menggantung |
| Skills | 3 grup, 16 skill total (5 · 8 · 3), urutan sesuai `sort_order` |
| Error konsol saat backend hidup | **Nol** — diperiksa di tab baru supaya log-nya bersih |
| **Backend dimatikan → muat ulang** | "Gagal memuat halaman / Tidak bisa menghubungi server. Pastikan backend jalan di port 3000." — **bukan layar kosong** |
| Backend dinyalakan lagi | Pulih penuh: lima section, 3 education, 3 grup, 16 skill |
| 375px | Tidak ada scroll horizontal; tidak ada elemen meluber di kedua section baru |
| Batas ±150 baris | File terbesar `App.jsx` 85 baris |

### Keputusan yang diambil

- **Tidak ada satu pun nama kelas baru.** Diperiksa langsung di DOM: `.education` memakai
  `entry`, `entry-dates`, `entry-org`, `entry-summary`; `.skills` hanya `entry`. Semuanya
  sudah punya aturan di `styles.css`, jadi dua section ini tampil rapi **tanpa menambah
  satu baris CSS pun** — persis yang diminta handoff Phase 2 bagian 1.
- **`note` memakai `.entry-summary`, bukan kelas `.entry-note` baru.** Perannya di halaman
  identik: satu baris keterangan pendek di bawah nama institusi. Kelas baru berarti aturan
  CSS baru, dan itu pekerjaan yang akan terbuang saat redesign.
- **Pemformat tanggal dipindah ke `dateRange.js`.** Education butuh bentuk yang sama
  persis, dan handoff Phase 1 bagian 7 meminta aturan "end_date null berarti masih
  berjalan" ditulis sekali saja. Menyalinnya ke section kedua akan langsung melanggar itu.
- **`App.jsx` tidak dipecah jadi `usePortfolioData()`.** Handoff bagian 4 memintanya hanya
  *kalau* `App.jsx` lewat 150 baris. Setelah empat endpoint masuk, isinya 85 baris — jadi
  pemecahan itu akan menambah file tanpa ada aturan yang menuntutnya.
- **Grup tanpa skill tetap ditampilkan**, dengan kalimat "Belum ada skill di grup ini."
  Konsisten dengan `LEFT JOIN` di service: kalau grup kosong disembunyikan di frontend,
  keputusan di backend itu jadi sia-sia, dan admin yang baru membuat grup akan mengira
  simpanannya gagal.

### Catatan: error HMR yang sempat muncul dan bukan bug

Saat `App.jsx` di-hot-reload, konsol sempat menampilkan
`TypeError: Cannot read properties of undefined (reading 'length')` dari `<Education>`.
Sebabnya: Vite menukar `App.jsx` yang sudah merender `<Education>` sementara state `data`
masih objek lama dari sebelum reload — yang isinya cuma `{ profile, experiences }`, jadi
`data.education` `undefined`.

Bukan bug: pada muat ulang penuh, `data` selalu dibangun oleh `Promise.all` versi baru yang
berisi keempat kunci. Dibuktikan dengan membuka tab baru — konsolnya bersih, nol error.
Dicatat di sini supaya tidak dikejar lagi kalau muncul saat mengedit `App.jsx` nanti.

---

## Task P2-4 dan P2-5 — selesai 30 Agustus 2026

Dikerjakan dalam satu commit karena P2-5 bukan pekerjaan tersendiri: yang diminta adalah
**menguji** transaksi yang lahir di P2-4, dan menyalakan endpoint tulis tanpa membuktikan
transaksinya berarti mengirim bagian yang paling mungkin salah tanpa pengawal.

### File yang dibuat

| File | Baris | Tanggung jawab |
|---|---|---|
| `backend/src/modules/education/schema.js` | 31 | Skema zod education, cermin CHECK dan panjang kolom di DDL 002 |
| `backend/src/modules/skills/schema.js` | 29 | Skema zod skill group + daftar skill |
| `frontend/src/admin/EducationForm.jsx` | 94 | Form education |
| `frontend/src/admin/SkillGroupForm.jsx` | 98 | Form skill group + daftar skill |
| `frontend/src/admin/CrudSection.jsx` | 88 | Satu bagian admin: daftar, form, hapus |

Diubah: `education/{service,controller,routes}.js`, `skills/{service,controller,routes}.js`,
`middleware/validate.js`, `experiences/schema.js`, `app.js`, `Dashboard.jsx`,
`ExperienceForm.jsx`. Berganti nama: `HighlightsEditor.jsx` → `ListEditor.jsx`.
Tidak ada dependensi baru.

### Tiga pemindahan untuk menghapus duplikasi

Ketiganya lahir dari kebutuhan nyata, bukan dari menebak masa depan:

1. **`requiredDate` / `optionalDate` / `dateOrderRefinement` → `middleware/validate.js`.**
   Education butuh validator tanggal yang sama persis seperti experiences. Ditaruh
   bersama `requiredText`/`nullableText` yang sudah ada di sana. `experiences/schema.js`
   turun dari 74 ke 41 baris.
2. **`HighlightsEditor` → `ListEditor`.** Isinya memang sudah generik sejak Phase 1 —
   yang dikelola cuma satu array string. Yang khusus highlight hanya label, jadi label
   dijadikan props. Ditambah `multiline`: highlight berupa kalimat (VARCHAR 400) pakai
   `textarea`, nama skill berupa frasa pendek (VARCHAR 80) pakai `input`, karena textarea
   di sana justru mengundang isian yang bentuknya tidak muat di kolomnya.
3. **`CrudSection.jsx` lahir.** Tiga bagian admin dengan alur yang sama persis akan
   mendorong `Dashboard.jsx` jauh melewati 150 baris sambil menyalin alur itu tiga kali.
   Yang berbeda antar-bagian cuma props. `Dashboard.jsx` berakhir 146 baris.

`writePath` ada di `CrudSection` karena Skills membaca di `/skills` tapi menulis di
`/skill-groups` — kontrak memang memakai dua nama untuk modul yang sama.

### Bug yang ketemu saat uji UI, bukan saat menulis kode

**Mengedit skill group diam-diam mengembalikan `sort_order`-nya ke 0.**

Ketahuan karena "Grup Uji P2-4" yang dibuat dengan `sort_order` 9 melompat dari urutan
terakhir ke urutan kedua begitu diedit. Dicek ke database: nilainya benar-benar berubah
dari `9` jadi `0`.

Sebabnya bentrokan antara dua bagian kontrak handoff bagian 3: `GET /skills` **tidak**
mengembalikan `sort_order`, sementara `PUT /skill-groups/:id` **mewajibkannya**. Form admin
mengisi nilainya dari hasil `GET`, jadi yang terkirim selalu `0`. Kehilangan data tanpa satu
pun error.

**Perbaikan: `sort_order` ikut dikembalikan `GET /skills`.** Ini penyimpangan sadar dari
contoh JSON di handoff, dan alasannya ditulis di komentar `skills/service.js`: API tulis
yang meminta field yang tidak pernah dikembalikan API baca membuat penyuntingan mustahil
dilakukan tanpa kehilangan. Modul `experiences` sudah memakai aturan itu tanpa pernah
ditulis — semua kolom yang bisa ditulis juga bisa dibaca. Penambahan ini membuat `skills`
ikut aturan yang sama. Halaman publik tidak memakai field itu, jadi tidak ada yang berubah
di tampilan.

### Verifikasi lewat UI sungguhan

Dijalankan di browser dengan akun sekali-pakai (lihat catatan di bawah).

| Langkah | Hasil |
|---|---|
| Buka `/admin` tanpa cookie | Dialihkan ke `/admin/login` |
| Login lewat form | Masuk; tiga bagian tampil: Experience, Education, Skills |
| **Tambah education lewat UI** | Tersimpan, dan langsung masuk ke posisi urut yang benar (2019, di antara 2021 dan 2012) |
| **Tambah skill group dengan 3 skill** | Tersimpan, tampil sebagai "Grup Uji P2-4 (3 skill)" |
| **Halaman publik setelah muat ulang penuh** | Keduanya muncul: `D3 Uji Coba` di Education, `Grup Uji P2-4: Skill Satu, Skill Dua, Skill Tiga` di Skills |
| Buka form edit grup | Kelima skill kembali pada urutan tersimpan; `sort_order` terbaca 9 |
| Hapus grup, konfirmasi **dibatalkan** | Tidak ada yang terhapus |
| Hapus grup, konfirmasi **disetujui** | Terhapus, daftar 4 → 3 |
| Hapus education lewat UI | Terhapus, daftar 4 → 3 |

### P2-5 — uji transaksi

**a. Pengurangan jumlah skill.** Yang diminta handoff: 5 → 2 harus menghasilkan 2, bukan 7.
Diuji lewat UI di grup uji (bukan di data asli pemilik), dan diulang lewat API:

| Cek | Hasil |
|---|---|
| Grup 5 skill, tiga butir dihapus di form, disimpan | **2 skill**, bukan 7 |
| Isi setelahnya | `Skill Satu`, `Skill Dua` — dua yang disisakan |
| `sort_order` skill setelah disimpan | Dinomori ulang 0 dan 1 |
| id baris skill | Berubah jadi baris baru — bukti hapus-lalu-sisipkan, bukan timpa |
| `sort_order` grup induk | Tetap 9, tidak ikut berubah |
| Dikosongkan sepenuhnya | 0 skill, dan grupnya **tetap terbawa** `GET /skills` (LEFT JOIN) |

**b. Cascade saat grup dihapus.**

| Cek | Hasil |
|---|---|
| Hapus grup berisi 2 skill | Grup hilang |
| Skill yatim di database | **0** |
| Baris skill id 26 dan 27 (anak grup itu) | Hilang keduanya |

**c. ROLLBACK di tengah `replaceSkills`** — kegagalannya **disuntikkan, bukan disimulasikan.**

Sebuah `CHECK` constraint sementara dipasang di tabel `skills` yang menolak satu nama
tertentu. Jadi yang benar-benar terjadi di dalam satu transaksi:
`DELETE semua skill` → `INSERT ke-1 sukses` → `INSERT ke-2 ditolak`.

| Cek | Hasil |
|---|---|
| Status PUT saat gagal | `500` — benar: ini kegagalan tak terduga, bukan salah isian |
| Skill sebelum | 3 |
| Skill sesudah gagal | **3** — DELETE-nya ikut dibatalkan |
| Isinya | `satu, dua, tiga` — persis seperti semula |
| INSERT pertama (`aman`) tertinggal? | **Tidak** |
| Grup induk berubah? | Tidak — nama dan `sort_order` utuh |
| Penulisan berikutnya setelah gagal | `200` — koneksi tidak tertinggal dalam keadaan aneh |

Constraint sementaranya dicopot di blok `finally`, dan diperiksa: 0 tersisa di
`information_schema`.

### Verifikasi sisi API — 28 dari 28 lulus

| Kelompok | Yang diperiksa |
|---|---|
| Auth | Keenam endpoint tulis `401` tanpa cookie |
| Rute di luar kontrak | `GET /skill-groups` dan `POST /skills` keduanya `404` |
| Validasi education | Field kosong, `2021-02-31`, `end_date` < `start_date`, teks 161 karakter (kolom 160) — semuanya `400` yang menyebut field-nya |
| Batas inklusif | `end_date` = `start_date` **diterima**, sesuai `>=` di DDL |
| Nama grup duplikat | `400` `VALIDATION_FAILED`, bukan `500` — termasuk yang cuma beda huruf besar-kecil |
| `404` | `PUT`/`DELETE` ke id 999999 pada kedua modul |
| Bentuk respons | `201` membawa objek lengkap; tanggal tetap string `"2020-01-01"` |

### Keputusan yang diambil

- **`ER_DUP_ENTRY` diterjemahkan jadi `400`, dan pengetahuan soal kode error MySQL berhenti
  di service.** Service melempar error ber-penanda `duplicateName`; controller yang
  memetakannya jadi `400` dengan `fields.name`. Bentuknya dibuat sama persis dengan hasil
  validasi zod, jadi form di frontend menampilkannya lewat jalur yang sudah ada tanpa
  cabang baru. Nama grup yang bentrok adalah salah input yang wajar, bukan kerusakan.
- **Education tidak memakai transaksi.** Tabelnya berdiri sendiri, tiap operasi tulis
  selesai dalam satu pernyataan. `withTransaction` di sana hanya akan jadi upacara.
- **`skills` punya dua router, bukan satu yang dipasang dua kali.** Memasang router yang
  sama di `/skills` dan `/skill-groups` akan sekalian membuka `GET /skill-groups` dan
  `POST /skills` — dua endpoint yang tidak ada di kontrak dan tidak ada yang memintanya.
  Sudah diuji: keduanya `404`.
- **Keberadaan baris diperiksa lewat `SELECT`, bukan `affectedRows`** — sama seperti task
  7. MySQL menghitung `affectedRows` sebagai baris yang BERUBAH, jadi menyimpan form tanpa
  mengubah apa pun menghasilkan 0 dan akan salah dibalas `404`.
- **`sort_order` divalidasi 0–65535** mengikuti `SMALLINT UNSIGNED`, supaya angka di luar
  jangkauan dibalas `400` yang menyebut field-nya, bukan `500` dari MySQL.

### Catatan: akun sekali-pakai dan data pemilik

Uji UI butuh login sungguhan, jadi memakai pola task 7: akun berawalan `e2e-`, password
acak yang hanya hidup di memori proses, disapu di awal dan dihapus di akhir. Setelah semua
uji: tabel `users` kembali berisi **hanya `proxy` dan `Operator`**, dan cookie sesi uji
langsung tidak sah lagi (`GET /auth/me` → `401`) karena `/auth/me` membaca ulang user dari
database.

Seluruh data uji dibuat dan dihapus di dalam sesi ini. **Keadaan akhir database identik
dengan sebelum P2-4 dimulai**: 1 profil · 4 experience · 10 highlight · 3 education ·
3 skill group · 16 skill · 2 user · 0 skill yatim.

### Catatan: klik ganda cepat pada "Tambah skill"

Ketahuan saat menyusun uji: dua klik "Tambah skill" yang terjadi dalam satu tick React
hanya menambah satu baris, karena `ListEditor` menyusun array baru dari props `values`
yang belum sempat diperbarui. Untuk pemakaian normal tidak terasa — orang mengklik,
melihat barisnya muncul, baru mengklik lagi. Perilaku ini **diwarisi dari
`HighlightsEditor` Phase 1**, bukan lahir di P2-4, dan tidak diubah di sini karena
memperbaikinya berarti mengubah kontrak `onChange` komponen yang sudah dipakai dua form.
Dicatat supaya jadi keputusan sadar, bukan temuan yang terlewat.

---

## Task R-1 — selesai 30 Agustus 2026

Dua perbaikan admin dari `REDESIGN-HANDOFF.md` bagian 1. Dikerjakan lebih dulu dan
di-commit sendiri, sesuai urutan handoff — keduanya soal perilaku, bukan tema, jadi tidak
perlu menunggu palet gelap.

### File yang dibuat

| File | Baris | Tanggung jawab |
|---|---|---|
| `frontend/src/admin/icons.jsx` | 44 | Ikon pensil dan tempat sampah sebagai SVG inline |

Diubah: `CrudSection.jsx` (urutan render + tombol ikon), `admin.css` (gaya `.row-*`,
`[role=alert]` ikut token), `styles.css` (token `--danger` baru).
Tidak ada dependensi baru — `lucide-react` dan sejenisnya dilarang handoff bagian 0.

### a. Tombol tambah pindah ke bawah daftar

Urutan anak `<section>` diperiksa langsung di DOM, bukan dari tampilan:

| Keadaan | Urutan |
|---|---|
| Normal | `H2` → `UL` → `BUTTON("Tambah experience")` |
| Form terbuka | `H2` → `UL` → `DIV` (form menggantikan tombol di posisi yang sama) |

Formnya muncul di posisi tombol tadi, jadi daftarnya tidak melompat saat form dibuka.

### b. Edit dan Hapus jadi ikon

Semua syarat wajib handoff diperiksa satu per satu di DOM:

| Syarat | Hasil |
|---|---|
| `aria-label` menyebut recordnya | `"Edit Freelancer — NGO (2 highlight)"`, `"Hapus Freelancer — NGO (2 highlight)"` |
| `title` sama dengan `aria-label` | Sama persis, jadi tooltip muncul saat hover |
| Teks terlihat di dalam tombol | Kosong — ikon saja, sesuai maksud perubahan |
| SVG inline, ukuran 16px | `16x16` |
| `stroke="currentColor"` | Ya |
| `aria-hidden="true"` pada SVG | Ya — tanpa itu pembaca layar menyebut dua hal untuk satu kontrol |
| Target sentuh ≥ 32×32 | **32×32** diukur dari `getBoundingClientRect` |
| Warna awal tombol hapus | `rgb(97, 97, 91)` = `--muted`, **bukan merah** |
| Aturan merah hanya saat hover/fokus | `.row-action-danger:hover:not(:disabled), .row-action-danger:focus-visible { color: var(--danger) }` |
| `window.confirm` masih ada | Ya — `"Hapus \"S1 Sistem Informasi\"? Tidak bisa dibatalkan."` |
| Konfirmasi dibatalkan | Jumlah record tetap 3, tidak ada yang terhapus |
| Kedua tombol tercapai keyboard | 9 elemen fokusable di section Experience = 4 record × 2 tombol + 1 tombol tambah |
| Urutan fokus | Edit → Hapus per baris, berurutan sesuai daftar |
| `outline: none` di mana pun | **Tidak ada satu pun** |

### Keputusan yang diambil

- **`--danger` dijadikan token, bukan nilai yang ditulis langsung.** `admin.css` sudah
  memakai `#9a3412` yang di-hardcode untuk `[role=alert]`; sekarang keduanya menunjuk token
  yang sama. Alasannya bukan kerapian: di tema gelap nanti `#9a3412` di atas `#141413` cuma
  **2.52:1** — pesan validasi akan nyaris tak terbaca. Dengan token, R-2 memperbaikinya
  sekali untuk tombol hapus dan pesan validasi sekaligus. Nilai sementaranya `#9a3412`
  (7.11:1 di latar terang), jadi commit ini sendiri tidak mengubah tampilan alert.
- **Ikon dipindah ke `icons.jsx`.** Setelah kedua SVG masuk, `CrudSection.jsx` mendarat
  **tepat di 150 baris** — batas aturan 6, tanpa sisa untuk perubahan berikutnya. Setelah
  dipisah: 117 dan 44. Seam-nya bersih, ikon tidak tahu apa pun soal record maupun CRUD.
- **`<li>` jadi flex, dan `.row-label` diberi `min-width: 0`.** Handoff menyebut baris
  "melebar tidak beraturan" sebagai alasan mengganti teks jadi ikon; flex-lah yang
  benar-benar menyelesaikannya, karena aksi jadi blok terpisah yang lebarnya tetap.
  Tanpa `min-width: 0`, label panjang mendorong tombol keluar baris di layar sempit —
  flex item menolak menyusut lebih kecil dari isinya kecuali diberi izin.
- **Selektor `li button` dicabut dari `admin.css`.** Satu-satunya tombol di dalam `<li>`
  sekarang `.row-action` yang punya gayanya sendiri, jadi aturan lama itu jadi CSS mati.
  `fieldset button` (Naik/Turun/Hapus di `ListEditor`) tetap memakainya.

### Catatan: verifikasi lewat DOM, bukan tangkapan layar

Pane browser di sesi ini dalam keadaan tersembunyi, jadi `innerWidth` terbaca `0` dan
tangkapan layar keluar kosong. Yang dipakai sebagai gantinya justru lebih ketat:
`getBoundingClientRect` untuk ukuran, `getComputedStyle` untuk warna yang benar-benar
terpakai, dan pembacaan CSSOM untuk memastikan aturannya memang ada — bukan menilai dari
gambar. Ukuran viewport diemulasi eksplisit saat mengukur, jadi angkanya nyata.

---

## Task R-2 — selesai 30 Agustus 2026

Palet gelap Anthropic dan font mono. Tidak ada file baru; yang diubah `styles.css`
(blok `:root` + peran tipografi), `index.html` (href dua keluarga font), `admin.css`
(warna teks tombol utama).

### Palet akhir

| Token | Nilai | Asal |
|---|---|---|
| `--bg` | `#141413` | Anthropic Dark |
| `--surface` | `#1e1e1c` | turunan |
| `--text` | `#faf9f5` | Anthropic Light |
| `--muted` | `#b0aea5` | Anthropic Mid Gray |
| `--border` | `#302f2c` | turunan |
| `--accent` | `#d97757` | Anthropic Orange |
| `--accent-hover` | `#e89478` | **dipilih di sini** — lebih terang dari `--accent` |
| `--focus` | `#ffffff` | **dipilih di sini** — lihat "kenapa putih" di bawah |
| `--danger` | `#f87171` | **dipilih di sini** |

### Enam syarat kontras — diukur, bukan dikira-kira

Dihitung dengan rumus WCAG 2.1 (linearisasi sRGB lalu `(L1+0.05)/(L2+0.05)`).
Alat penghitungnya divalidasi lebih dulu terhadap empat angka yang sudah tercatat di
task 9 — `16.79`, `6.07`, `7.61`, `4.89` — dan keempatnya tereproduksi persis, jadi
angkanya bisa dipercaya.

| # | Syarat | Rasio | Minimal | Status |
|---|---|---|---|---|
| 1 | `--text` di atas `--bg` | **17.50:1** | 4.5:1 | LULUS |
| 2 | `--muted` di atas `--bg` | **8.29:1** | 4.5:1 | LULUS |
| 3 | `--accent` di atas `--bg` | **5.90:1** | 3:1 | LULUS |
| 4 | teks `--bg` di atas tombol `--accent` | **5.90:1** | 4.5:1 | LULUS |
| 5a | `--focus` di atas `--bg` | **18.43:1** | 3:1 | LULUS |
| 5b | `--focus` di atas `--accent` | **3.12:1** | 3:1 | LULUS |
| 6 | `--danger` di atas `--bg` | **6.66:1** | 4.5:1 | LULUS |

Syarat 4 diuji dari dua sisi: putih di atas `#d97757` cuma **3.12:1** — gagal untuk teks,
persis seperti yang diperingatkan handoff. `color: #fff` di `admin.css` diganti
`var(--bg)`, dan hasilnya diperiksa di DOM sungguhan: tombol "Simpan profil" merender
`rgb(20, 20, 19)` di atas `rgb(217, 119, 87)`.

### Kenapa `--focus` harus putih, dan kenapa itu bukan pilihan malas

Cincin fokus muncul di atas `--bg` **dan** di atas tombol `--accent`, jadi harus lolos
3:1 terhadap keduanya. Ruang yang tersisa ternyata nyaris kosong:

**Sisi gelap mustahil secara aljabar.** Supaya warna gelap punya ≥3:1 terhadap `--accent`
sekaligus ≥3:1 terhadap `--bg`, dibutuhkan `ratio(--accent, --bg) ≥ 9`. Nyatanya 5.90.
Jadi tidak ada satu pun warna gelap yang bisa memenuhi keduanya — bukan "belum ketemu",
tapi memang tidak ada.

**Sisi terang cuma menyisakan putih.** Putih adalah batas atas luminance, dan bahkan putih
hanya mendapat 3.12:1 terhadap `--accent`:

| Kandidat | vs `--bg` | vs `--accent` | Status |
|---|---|---|---|
| `#ffffff` | 18.43 | **3.12** | LULUS |
| `#fffdf8` | 18.13 | 3.07 | LULUS, nyaris |
| `#faf9f5` (`--text`) | 17.50 | **2.96** | **GAGAL** |
| `#f5f5f4` | 16.90 | 2.86 | GAGAL |

Artinya `--focus` **tidak bisa** sekadar memakai ulang `--text`. Delapan warna beraksen
yang lazim dipakai untuk cincin fokus juga diuji — kuning, cyan, biru, ungu, teal —
**semuanya gagal** terhadap oranye, di rentang 1.23–2.11. Alasannya ditulis di komentar
`styles.css` supaya tidak ada yang "memperhalusnya" jadi putih tulang tanpa mengukur ulang.

`outline-offset: 2px` jadi makin penting, bukan makin tidak: cincinnya didorong keluar
tombol supaya yang berlaku 18.43:1 terhadap latar, bukan 3.12:1 terhadap tombol.

### Kontras tambahan di luar enam syarat

Enam syarat handoff tidak menyentuh `--surface`, padahal seluruh input admin duduk di
atasnya. Diperiksa juga:

| Peran | Rasio | Status |
|---|---|---|
| Teks di dalam input (`--text` di atas `--surface`) | 15.85:1 | LULUS |
| Teks muted di atas `--surface` | 7.51:1 | LULUS |
| Pesan validasi (`--danger`) di atas `--surface` | 6.04:1 | LULUS |
| Border input saat fokus (`--accent` di atas `--surface`) | 5.35:1 | LULUS |
| Tautan saat hover (`--accent-hover` di atas `--bg`) | 7.85:1 | LULUS |
| Teks tombol saat hover (`--bg` di atas `--accent-hover`) | 7.85:1 | LULUS |
| Bullet `::marker` (`--muted` di atas `--bg`) | 8.29:1 | LULUS |

### Tipografi

Href jadi dua keluarga, dan bobot yang diunduh sama persis dengan yang dipakai CSS:

```
IBM+Plex+Mono:wght@400;500 & Plus+Jakarta+Sans:wght@400;600;700
```

Diperiksa di `document.fonts`: **tepat lima face terdaftar** — Plus Jakarta 400/600/700,
IBM Plex Mono 400/500. Tidak ada bobot berlebih yang ikut terunduh, dan tidak ada bobot
terpakai yang tidak terunduh.

Bobot 700 sempat terbaca `false` pada pemeriksaan pertama. Itu bukan kegagalan: `check()`
baru `true` setelah face-nya benar-benar diunduh, dan belum ada teks 700 di halaman —
pemakainya (nama di kolom kiri) baru lahir di R-3. Setelah `document.fonts.load()`
eksplisit, ketiganya `true`.

Mono dipasang ke dua peran metadata yang sudah ada: label bagian (`h2`) dan tanggal
(`.entry-dates`). Item nav menyusul di R-3.

### Keputusan yang diambil

- **`h2` turun ukurannya dan ganti warna ke `--accent`.** Perannya penanda bagian, bukan
  judul yang ikut dibaca. Di tema terang dia abu-abu besar; sekarang mono kecil beroranye,
  dan pembedanya bentuk huruf, bukan cuma warna.
- **`::marker` pindah dari `--border` ke `--muted`.** Di tema terang `--border` abu muda
  yang masih terlihat; di tema gelap nilainya `#302f2c` — 1.38:1 terhadap latar — dan
  bulletnya praktis hilang. Ini regresi yang lahir langsung dari pergantian palet, jadi
  dibereskan di commit yang sama, bukan ditunda ke R-4.
- **Font di-token-kan jadi `--font-body` dan `--font-mono`.** Sebelumnya nama font ditulis
  langsung di `body`. Dengan dua keluarga yang masing-masing punya peran, satu tempat
  lebih murah daripada mengulang daftar fallback di tiap selektor.
- **Tidak ada `prefers-color-scheme` dan tidak ada toggle.** Handoff menetapkan satu tema.
  Menambah cabang kedua berarti setiap angka kontras di atas harus diukur dua kali untuk
  tema yang tidak diminta siapa pun.

### Verifikasi di browser

| Cek | Hasil |
|---|---|
| Kesembilan token resolve di CSSOM | Sesuai tabel palet, tanpa satu pun meleset |
| `body` | latar `rgb(20,20,19)`, teks `rgb(250,249,245)` |
| `h2` | `IBM Plex Mono`, warna `rgb(217,119,87)` |
| `.entry-dates` | `IBM Plex Mono` |
| Warna literal tersisa di CSS | **Hanya di dalam `:root`** — sisanya komentar; nol di JSX |
| **Backend dimatikan → muat ulang** | Pesan gagal tampil `#faf9f5` di atas `#141413` (17.50:1), bukan layar kosong |
| Admin ikut gelap otomatis | Ya — input `--surface`, label `--text`, ikon baris `--muted` |
| Tombol utama admin | latar `rgb(217,119,87)`, teks `rgb(20,20,19)` |

---

## Task R-3 — selesai 30 Agustus 2026

Tata letak dua kolom, kolom kiri sticky, dan nav anchor.

### CSS dipecah jadi empat file

`styles.css` sudah 157 baris begitu R-2 selesai, dan R-3 menambah ~70 baris lagi.
`REDESIGN-HANDOFF` bagian 0 sudah mengantisipasi ini dan menyuruh memisahkan `:root` ke
`tokens.css`. Itu dikerjakan — tapi ternyata tidak cukup: sisanya masih 223 baris. Jadi
dipecah sekali lagi di seam yang jelas, dan `styles.css` tidak lagi ada.

| File | Baris | Isi |
|---|---|---|
| `tokens.css` | 59 | Semua nilai warna, jarak, font, ukuran |
| `base.css` | 76 | Reset, `body`, tipografi, `h2`, fokus, tautan, blok reduced-motion |
| `public.css` | 150 | Tata letak dan komponen halaman publik saja |
| `admin.css` | 129 | Admin panel |

Seam-nya: `base.css` berlaku di halaman publik **dan** `/admin`; `public.css` tidak
berlaku sama sekali di `/admin`. `main.jsx` mengimpor berurutan — token lebih dulu, karena
custom property harus terdefinisi sebelum aturan yang memakainya diurai.

### Perubahan JSX — persis tiga yang disebut handoff, tidak lebih

1. `App.jsx` — empat section non-hero dibungkus `<div className="pane">`. Hero tetap anak
   langsung `<main>`. Tanpa pembungkus, keempatnya jadi empat sel grid terpisah, bukan satu
   kolom kanan.
2. `Hero.jsx` — `<nav aria-label="Navigasi bagian">` berisi empat anchor.
3. Empat file `sections/` — `id` ditambahkan pada `<section>`-nya.

Logika pengambilan data, penanganan error, dan `dateRange.js` tidak disentuh sama sekali.

### Verifikasi tata letak

| Cek | ≥64rem (1280px) | <64rem (1023px) | 360px |
|---|---|---|---|
| `main` display | `grid` | `block` | `block` |
| Kolom | `352px 736px` | — | — |
| `.hero` position | `sticky` | `static` | `static` |
| Nav display | `block` | `none` | `none` |
| Anchor nav bisa ditab | 4 | **0** | **0** |
| Scroll horizontal | — | — | Tidak ada |
| Elemen meluber | — | — | Tidak ada |

**Ambang berpindah tepat di 1024px.** Diuji di 1023 dan 1024, bukan di angka bulat yang
jauh dari batas: 1023 masih satu kolom, 1024 sudah grid. `display: none` pada nav juga
mengeluarkannya dari urutan tab — 0 anchor bisa ditab di layar sempit, jadi pengguna
keyboard tidak menelusuri tautan yang tidak terlihat.

### Verifikasi sticky

Diukur setelah menggulir sungguhan, bukan disimpulkan dari CSS:

| Nilai | Hasil |
|---|---|
| `scrollY` | 400 |
| `.pane` sudah bergulir | `top: -346px` |
| **`.hero` top** | **`0px` — terpaku di puncak** |
| `.social` di dalam hero | `646–672` di dalam kotak hero `0–704` |
| Leluhur dengan `overflow` bukan `visible` | **Tidak ada** — pembunuh sticky yang paling umum |

`margin-top: auto` pada `.social` memang mendorongnya ke dasar kolom, terbukti dari
`margin-top` terhitung `184.9px` yang dihitung sendiri oleh flexbox.

### Verifikasi anchor

Keempat anchor mendarat di section yang benar, pada offset yang benar:

| Anchor | Section yang dituju | `scrollY` | Posisi section |
|---|---|---|---|
| `#about` | About Me | 22 | **32px** |
| `#experience` | Experience | 433 | **32px** |
| `#education` | Education | 1349 | **32px** |
| `#skills` | Skills | 1686 | 100px |

32px itu bukan kebetulan — persis `scroll-margin-top: var(--gap-lg)`. `#skills` berhenti di
100px karena dokumen memang **tidak bisa digulir lebih jauh**: scroll maksimum
`scrollHeight - innerHeight` = 1686, dan `scrollY` sudah 1686. Bukan salah anchor.

### Batas lingkungan yang ditemukan saat menguji, dan bagaimana disiasati

Di pane browser sesi ini, **semua gulir programatik inert** — `window.scrollTo`,
`scrollIntoView`, dan navigasi fragment sama-sama tidak menggerakkan halaman, sementara
event gulir sungguhan (roda mouse) bekerja. Selain itu `scrollY` sempat terbaca `0` padahal
halaman sudah bergulir, jadi pengukuran awal sticky **tidak sah** dan diulang.

Konsekuensinya untuk anchor: animasi `scroll-behavior: smooth` tidak berjalan sampai
selesai di sini. Itu diisolasi, bukan didiamkan — anchor yang sama diuji dua kali:

| `scroll-behavior` | Hasil `#education` |
|---|---|
| `smooth` (asli) | `scrollY` 451, section di 930px — animasi tidak selesai |
| dipaksa `auto` | `scrollY` 1349, section di **32px** — mendarat tepat |

Jadi mekanisme anchor-nya benar; yang tidak bisa dijalankan di pane ini cuma animasinya.
Dicatat apa adanya: **kehalusan gulirnya belum pernah dilihat bergerak**, dan itu yang
tersisa untuk diperiksa pemilik di browser sungguhan.

### Yang tidak boleh hilang — diperiksa ulang

| Cek | Hasil |
|---|---|
| `outline: none` di mana pun | **Tidak ada satu pun** |
| Blok `prefers-reduced-motion` | Ada, dan mematikan `scroll-behavior` jadi `auto` |
| Blok itu tidak hampa | Empat transisi nyata dimatikannya: `.hero-nav a` color 200ms, `.nav-line` width 200ms, input `border-color`, button `background-color` |
| `--measure` menjaga panjang baris | Ya — pindah ke `.pane`, karena `main` sekarang mengurus lebar dua kolom |
| 360px | Tidak ada scroll horizontal, tidak ada elemen meluber, nama menyusut ke 30.4px |
| Urutan section | `hero → about → experience → education → skills` di semua lebar |

### Keputusan yang diambil

- **Satu kolom ditulis sebagai keadaan bawaan, dua kolom ditambahkan di `min-width`.**
  Layar sempit dengan begitu mendapat aturan paling sedikit, dan tidak ada satu pun
  properti dua-kolom yang perlu dibatalkan di sana.
- **Nav disembunyikan dengan `display: none`, bukan `visibility` atau `opacity`.** Hanya
  `display: none` yang ikut mengeluarkannya dari urutan tab. Dua alternatif itu akan
  meninggalkan empat tautan tak terlihat yang tetap bisa difokus keyboard.
- **Hover dan `:focus-visible` diberi efek yang sama persis** pada item nav — garis
  memanjang dan warna naik ke `--text`. Kalau hanya hover yang ditangani, pengguna keyboard
  kehilangan jejak posisinya sepenuhnya.
- **`--bp-dua-kolom: 64rem` ditulis di `tokens.css` walau tidak bisa dipakai langsung di
  dalam kondisi media query.** Angkanya tetap diulang di `public.css`; token itu yang
  menyatakan angka mana yang benar kalau suatu saat harus berubah.
- **Tinggi hero `calc(100vh - padding-atas)` dengan `max-height: 44rem`.** Tanpa pengurangan
  padding, kolomnya melebihi layar dan social link di dasarnya terpotong. `max-height`
  mencegah kolom jadi terlalu renggang di layar yang sangat tinggi.
- **`.pane > section:first-child` kehilangan garis atasnya di mode dua kolom.** Di sana dia
  sejajar puncak hero, bukan berada setelah sesuatu — garis pemisah di situ memisahkan dari
  ruang kosong.

---

## Task R-4 — selesai 30 Agustus 2026

Poles halaman publik di 360px, 768px, dan 1440px. Tiga perbaikan, semuanya lahir dari
pengukuran di lebar-lebar itu — bukan dari daftar keinginan.

### 1. Padding kiri-kanan ikut melebar

`body` dulu `padding: clamp(1.5rem, 1rem + 3vw, 4rem) var(--gap) 5rem` — vertikalnya tumbuh
sampai 64px sementara horizontalnya dipatok 16px. Akibatnya di 768px teks nyaris menyentuh
tepi layar sementara atasnya lega.

Sekarang horizontalnya `clamp(1rem, 3vw, 3rem)`:

| Lebar | Padding lama | Padding baru |
|---|---|---|
| 360px | 16px | **16px** (tidak berubah — batas bawah clamp) |
| 768px | 16px | **23.0px** |
| 1440px | 16px | **43.2px** |

Batas bawah sengaja dipatok 1rem supaya lebar isi di 360px **tidak berkurang sama sekali**.
Diperiksa: panjang baris paragraf di 360px tetap 328px, sama persis seperti sebelumnya.

### 2. `max-height` kolom kiri dinaikkan 44rem → 56rem

44rem (704px) menggigit terlalu awal. Di laptop 900px tinggi, kolom yang seharusnya 841px
dipotong jadi 704px, dan menyisakan **169px ruang mati** di bawah social link.

| | Sebelum | Sesudah |
|---|---|---|
| Tinggi hero di viewport 900px | 704px (kena cap) | **841px** |
| Ruang mati di bawah social link | **169px** | **32px** |
| Tinggi hero di viewport 1200px | 704px | 896px (cap 56rem, sesuai maksud) |

Cap-nya tetap ada dan tetap bekerja — hanya sekarang menggigit di atas ~955px, tempat
rentangnya memang mulai terasa renggang.

### 3. Setiap efek hover dipasangkan `:focus-visible`

Handoff bagian 5 mewajibkan ini. Diaudit lewat CSSOM — semua aturan `:hover` dikumpulkan,
lalu dicocokkan dengan aturan `:focus-visible` yang menyentuh elemen yang sama.

**Empat aturan ternyata yatim**: `a:hover`, `button:hover`, `fieldset button:hover`, dan
`.row-action:hover`. Keempatnya sudah diberi pasangan. Audit yang sama dijalankan lagi
setelah perbaikan: **nol yatim**.

Cincin fokus global memang sudah menandai posisi, tapi kalau mouse mendapat umpan balik
warna dan keyboard tidak, keduanya jadi tidak setara tanpa alasan.

### Verifikasi tiga lebar

| Cek | 360px | 768px | 1440px |
|---|---|---|---|
| Scroll horizontal | Tidak ada | Tidak ada | Tidak ada |
| Elemen meluber | 0 | 0 | 0 |
| Padding horizontal | 16px | 23.0px | 43.2px |
| Panjang baris paragraf | 328px | 707px | 726px |
| Ukuran nama | 30.4px | 40.8px | 48px |
| Nav | tersembunyi | tersembunyi | tampil |
| Kolom | satu | satu | dua (352 + 736) |

Tata letak di 1440px memang terpusat; selisih 137px kiri vs 151px kanan hanya lebar
scrollbar — diukur terhadap `clientWidth`, kiri dan kanan sama.

### Efek nav diverifikasi dengan transisi dimatikan

| Keadaan | Warna label | Lebar garis |
|---|---|---|
| Diam | `rgb(176,174,165)` = `--muted` | 24px |
| **Fokus keyboard** | `rgb(250,249,245)` = `--text` | **44px** = 2.75rem |
| Setelah blur | kembali `--muted` | kembali 24px |

Cincin fokusnya `solid 3px rgb(255,255,255)` dengan `outline-offset: 2px`, dan
`:focus-visible` benar-benar cocok (`matches(':focus-visible')` = `true`) — kali ini fokus
sistem **bisa** didapat di pane ini, berbeda dari catatan task 9.

### Batas lingkungan: transisi dan animasi tidak berjalan di pane ini

Ini akar yang sama dengan yang sudah ditemukan di R-3 pada `scroll-behavior: smooth`, dan
sekarang terbukti berlaku umum. Ditemukan saat efek nav terlihat tidak jalan padahal
aturannya benar:

| Uji | Hasil |
|---|---|
| `:focus-visible` berlaku? | **Ya** — aturan uji `outline: lime` mendarat di `.nav-line` |
| Lebar garis saat fokus, transisi menyala | tetap 24px |
| Lebar garis saat fokus, **transisi dimatikan** | **44px** — sesuai desain |
| `width` diubah inline, transisi menyala | tetap 24px |
| `width` diubah inline, transisi dimatikan | 44px |
| `prefers-reduced-motion` aktif di pane? | Tidak |

Jadi CSS-nya benar; yang tidak bisa dijalankan di pane ini adalah animasinya. Semua
pengukuran keadaan hover/fokus di atas diambil dengan transisi dimatikan supaya yang
terukur adalah keadaan akhir, bukan keadaan yang macet di awal.

**Yang tersisa untuk pemilik:** melihat sendiri di browser sungguhan bahwa perpindahan
200ms itu memang mulus — baik pada garis nav maupun pada gulir anchor.

---

## Task R-5 — selesai 30 Agustus 2026

Poles admin panel di tema gelap. Task ini langsung membayar ongkosnya: begitu `/admin`
dibuka di lebar penuh, ketahuan **R-3 merusaknya** dan tidak ada yang menyadarinya sampai
di sini.

### Regresi yang ketemu: tata letak dua kolom bocor ke admin

Aturan dua kolom R-3 ditulis sebagai `main { display: grid }`. `/admin` juga memakai
`<main>`, jadi admin panel ikut dipaksa jadi dua kolom: form profil terjepit di kolom kiri
selebar 352px, daftar record terlempar ke kanan.

Ketahuan pula **bug kedua yang lebih tua**: `<main>` di `Dashboard.jsx` tidak pernah punya
`className="admin"` — kelas itu cuma dipasang di layar memuat dan layar gagal. Artinya
sejak task 7, **seluruh `admin.css` yang di-scope `.admin` tidak pernah berlaku di
dashboard sungguhan**: `max-width: 78ch` tidak terpakai, dan daftar record memakai bullet
bawaan browser.

Dua-duanya diperbaiki:

| Perbaikan | Sebelum | Sesudah |
|---|---|---|
| `Dashboard.jsx` | `<main>` | `<main className="admin">` |
| `App.jsx` halaman publik | `<main>` | `<main className="page">` |
| `public.css` | `main { display: grid }` | `.page { display: grid }` |

Aturan tata letak sekarang bernama. Pelajaran yang dicatat: **selektor elemen telanjang di
stylesheet bersama akan menemukan elemen yang sama di halaman lain.**

| Cek setelah perbaikan | Hasil |
|---|---|
| `<main>` admin | `class="admin"`, `display: block` |
| `max-width` admin | `913.5px` = 78ch, akhirnya terpakai |
| `list-style` daftar record | `none` — bullet hilang |
| Baris record | `display: flex`, `align-items: center` |

### Seluruh kontrol admin di tema gelap

Ketiga form dibuka sekaligus supaya semua kontrol ada di DOM — **61 kontrol, 4 form**:

| Kontrol | Jumlah | Teks | Latar | Border |
|---|---|---|---|---|
| `input` | 19 | `--text` | `--surface` | `--border` |
| `textarea` | 4 | `--text` | `--surface` | `--border` |
| `select` | 1 | `--text` | `--surface` | `--border` |
| `button` utama | 16 | `--bg` | `--accent` | `--accent` |
| `button.row-action` | 20 | `--muted` | transparan | transparan |
| `a` | 1 | `--accent` | — | — |

`label` dan `legend` keduanya `--text`.

### Cincin fokus di tiap kontrol

| Kontrol | `:focus-visible` | Cincin |
|---|---|---|
| input | ya | `solid 3px #ffffff`, offset 2px |
| textarea | ya | idem |
| select | ya | idem |
| Tombol utama | ya | idem, plus latar naik ke `--accent-hover` |
| Tombol fieldset (aktif) | ya | idem, plus border naik ke `--accent` |
| Ikon edit | ya | idem, plus latar `--surface` |
| Ikon hapus | ya | idem |
| Tautan | ya | idem, plus warna naik ke `--accent-hover` |

Dua tombol fieldset sempat terbaca tanpa cincin. Itu bukan cacat: "Naik" pada butir pertama
dan "Turun" pada butir terakhir memang `disabled`, dan elemen disabled tidak bisa menerima
fokus. Diperiksa langsung lewat properti `disabled`, bukan disimpulkan.

Perubahan latar/border/warna saat fokus di atas adalah hasil pemasangan pasangan
`:focus-visible` di R-4 — sekarang terlihat efeknya di admin.

### Pesan validasi terbaca

Form education dikirim kosong, dan backend membalas `400` dengan pesan per field:

| Pesan | Warna | Ukuran |
|---|---|---|
| `wajib diisi` (×2) | `rgb(248,113,113)` = `--danger` | 14px |
| `format harus YYYY-MM-DD` | idem | 14px |
| `Data yang dikirim tidak valid.` | idem | 14px |

Kontrasnya **6.66:1** terhadap `--bg` dan **6.04:1** terhadap `--surface`. Inilah yang
diselamatkan token `--danger` di R-1: kalau `#9a3412` yang lama dibiarkan di-hardcode,
pesan-pesan ini akan tampil pada **2.52:1** dan praktis tidak terbaca.

### Admin di 360px

| Cek | Hasil |
|---|---|
| Scroll horizontal | Tidak ada |
| Elemen meluber | Tidak ada |
| Input tersempit | 290px |
| Target sentuh ikon | Tetap 32×32 |

---

## Task R-6 — selesai 30 Agustus 2026

Build produksi dijalankan dari satu origin, sama seperti task 8'.

`npm run build` → 44 modul, `dist/` berisi `index.html` (1.50 kB), satu bundel CSS
(5.47 kB / 1.86 kB gzip) dan satu bundel JS (289 kB / 90.7 kB gzip). CSS naik dari 3.57 kB
sebelum redesign — empat file stylesheet tetap jadi satu bundel, jadi pemecahan file tidak
menambah permintaan jaringan.

### Verifikasi dari `:3000` saja, Vite tidak dipakai sama sekali

| Cek | Hasil |
|---|---|
| `GET /` | `200 text/html` |
| `GET /admin` dan `/admin/login` | `200 text/html` — SPA fallback bekerja |
| `GET /api/v1/profile`, `/education`, `/skills` | `200 application/json` |
| `GET /api/v1/salahketik` | `404` **JSON**, bukan HTML halaman |
| Aset CSS | `200 text/css` |
| Aset JS | `200 application/javascript` |
| `window.$RefreshReg$` | Tidak ada — membuktikan ini build produksi |

### Tampilan di build produksi

| Cek | 1280px | 360px |
|---|---|---|
| `<main class>` | `page` | `page` |
| Layout | `grid`, hero `sticky` | `block`, hero statis |
| Nav | tampil | tersembunyi |
| Latar | `rgb(20,20,19)` | idem |
| `h2` | `IBM Plex Mono` | idem |
| Font 700 dan mono 500 termuat | Ya | — |
| Scroll horizontal | — | Tidak ada |
| Elemen meluber | — | 0 |
| Em dash di `about_md` | — | Utuh |
| Isi | 3 education · 3 grup · 16 skill | idem |

### Admin di origin produksi

| Cek | Hasil |
|---|---|
| `<main>` | `class="admin"`, `display: block`, `max-width` 913.5px |
| `document.cookie` dari JS | **Kosong** — `httpOnly` bekerja |
| Daftar record | `list-style: none` |
| Urutan section Experience | `H2` → `UL` → `BUTTON("Tambah experience")` |
| 20 ikon baris | Semuanya punya `aria-label` **dan** `title` |
| Bagian | Profil · Experience · Education · Skills |

### Catatan: satu salah ketik saat menguji, dan kenapa tidak berakibat apa-apa

Sebuah skrip uji gagal di tengah jalan dan sempat mengisi field "Nama lengkap" di form
profil dengan nama akun uji. Diperiksa segera: **database tidak tersentuh** — `full_name`
tetap `Amadeus Thareq Widhi Dhyatmiko` dan `updated_at` tetap `2026-08-28 07:56:24`, tidak
berubah. Skripnya gagal sebelum sampai ke `requestSubmit()`, jadi nilai itu cuma hidup di
state React yang belum tersimpan; muat ulang mengembalikannya. Dicatat di sini apa adanya,
bukan didiamkan karena kebetulan tidak berakibat.

### Keadaan akhir

Database identik dengan sebelum redesign dimulai: 1 profil · 4 experience · 10 highlight ·
3 education · 3 skill group · 16 skill · **4 user** (`proxy`, `Operator`, `Zein`, `Guest`).
Akun uji `e2e-` sudah dihapus. Tidak ada satu pun file lewat 150 baris.

---

## Sidebar admin — 7 September 2026

Di luar penomoran task redesign. Permintaan pemilik: admin panel dirombak mengikuti
template **W3CRM** (`C:\dev\aset-portfolio-cv`) supaya punya sidebar.

### Keputusan: template ditiru, bukan diimpor

W3CRM butuh **Bootstrap 5 + jQuery + metisMenu** plus ~10 plugin jQuery lain.
Ukurannya 59.5 MB / 4623 file; `style.css`-nya sendiri **635 KB**, sementara seluruh CSS
frontend ini 425 baris (~5.5 KB ter-bundle).

Tiga alasan menolak mengimpornya, diajukan ke pemilik sebelum satu baris pun ditulis:

1. **Aturan 5 melarangnya di keempat handoff.** `PHASE-1-HANDOFF` bagian 0 menyebut
   Bootstrap secara harfiah; `PHASE-1-FINISH` bagian 2 menegaskannya "tanpa pengecualian";
   `REDESIGN-HANDOFF` bagian 0 bahkan melarang *icon library*.
2. **Template statis + jQuery vs React SPA.** Sidebar-nya digerakkan metisMenu, plugin
   jQuery yang mengubah DOM langsung — DOM yang sama yang dikelola React.
3. **Redesign yang baru selesai akan terbuang** beserta enam angka kontras yang sudah
   diukur.

Pemilik memilih: **tiru tata letaknya, tulis sendiri CSS-nya, pertahankan palet gelap
Anthropic.** Nol dependensi baru.

Ukuran yang ditiru diambil dari `style.css` W3CRM apa adanya: rail **15rem**, topbar
**3.125rem**. Bedanya, template menempatkan tiap bagian dengan `position: fixed` lalu
menambal isinya pakai padding sebesar sidebar; di sini dipakai grid, jadi ukurannya
dinyatakan sekali dan tidak bisa meleset.

### File yang dibuat

| File | Baris | Tanggung jawab |
|---|---|---|
| `frontend/src/admin/AdminLayout.jsx` | 105 | Kerangka: merek, topbar, sidebar, area isi |
| `frontend/src/admin/AdminRoutes.jsx` | 99 | Empat layar admin, satu per item sidebar |
| `frontend/src/admin-layout.css` | 129 | Grid kerangka, merek, topbar, isi |
| `frontend/src/admin-nav.css` | 88 | Rail, daftar menu, perilaku laci |

Diubah: `Dashboard.jsx` (149 → 96 baris, kini hanya gerbang auth + pemuat data),
`App.jsx` (`/admin` → `/admin/*`), `icons.jsx` (+7 ikon nav), `admin.css` (override `h2`),
`main.jsx` (dua impor CSS baru), dan lima komponen admin naik tingkat headingnya.
**Tidak ada dependensi baru.**

### Dari satu halaman panjang jadi empat rute

Sebelumnya keempat bagian ditumpuk di satu halaman. Sekarang masing-masing punya rutenya
sendiri — itu memang gunanya sidebar, dan sekalian menyelesaikan halaman admin yang
sudah terlalu panjang untuk digulir.

| Item sidebar | Rute | Judul |
|---|---|---|
| Profil | `/admin` | Profil |
| Experience | `/admin/experience` | Experience |
| Education | `/admin/education` | Education |
| Skills | `/admin/skills` | Skills |

Data keempat layar tetap diambil **sekali** di `Dashboard`, jadi berpindah antar-item
tidak menembak API lagi. Alamatnya bisa di-bookmark, tombol kembali bekerja, dan memuat
ulang tetap mendarat di layar yang sama — diuji dengan navigasi langsung ke
`/admin/education`, dan setelah muat ulang penuh judul, menu aktif, serta 3 recordnya
tetap benar.

### Tiga masalah yang ketemu saat menguji

**1. `<main>` menyusut jadi 261px di layar 1280px.** `base.css` memberi tiap `<main>`
`margin-inline: auto`; pada **grid item** auto-margin membuatnya menyusut ke lebar isi lalu
terpusat. Selnya 948px, isinya 261px. Diperbaiki dengan `.shell-isi.admin { max-width:
none; margin-inline: 0 }` — dua kelas supaya menang atas `.admin` tanpa bergantung urutan
impor. Lebar baca dipindah ke `.shell-isi > section`.

**2. Topbar memuai setinggi layar di 360px.** Penempatan grid otomatis mengisi sel menurut
urutan sumber; begitu jumlah kolom turun jadi satu di layar sempit, topbar mendarat di
baris `1fr`. Diperbaiki dengan menempatkan keempat bagian secara eksplisit
(`grid-column`/`grid-row`), jadi tata letaknya tidak lagi bergantung pada urutan JSX.

**3. Heading melompati `<h1>`.** `<h1>Admin</h1>` hilang bersama halaman tunggal, jadi tiap
layar mulai dari `h2`. Judul layar dinaikkan ke `h1` (`CrudSection`, `ProfileForm`) dan
judul form ke `h2` (tiga form). `base.css` memberi `h2` tampilan label mono oranye huruf
besar milik halaman publik — pantas untuk "EXPERIENCE", tidak untuk "Edit: Freelancer" yang
isinya datang dari data pengguna. Ditimpa di `admin.css` jadi heading biasa.

### Verifikasi

| Cek | Hasil |
|---|---|
| Empat rute + penanda aktif | Keempatnya cocok; `aria-current="page"` dipasang NavLink sendiri |
| Penanda aktif | Garis `--accent` di kiri **dan** warna naik ke `--text` — bukan warna saja |
| Deep link + muat ulang penuh | `/admin/education` mendarat benar, 3 record |
| CRUD lewat UI baru | Tambah → muncul di urutan benar; edit → form terisi nilai lama; hapus → konfirmasi muncul, record hilang |
| Cincin fokus (Tab sungguhan) | `solid 3px #ffffff`, offset 2px, `:focus-visible` = true |
| Keadaan hover/fokus menu | Warna naik `--muted` → `--text`, latar jadi `--bg` |
| 1280px | Rail 240px, isi mengisi 948px |
| 360px | Merek menyusut jadi tanda petak saja, tanpa scroll horizontal, nol elemen meluber |
| Halaman publik | Tidak tersentuh — `main.page`, grid, hero sticky, 5 section |
| Build produksi | 48 modul; CSS 5.47 → **8.49 kB** (2.49 kB gzip). Empat rute admin dilayani SPA fallback dari `:3000` |
| `document.cookie` | Kosong — `httpOnly` tetap bekerja |

### Laci di layar sempit

Di bawah 64rem rail jadi laci: digeser `translateX(-100%)` **plus `visibility: hidden`**.
`visibility` itu yang mengeluarkan keenam tautan dari urutan tab — diukur: **0 tautan bisa
ditab saat tertutup, 6 saat terbuka**. Tanpa itu menu tak terlihat tetap bisa difokus
keyboard.

Tirai penutup sengaja `<div>`, bukan `<button>`: perannya menangkap sentuhan di luar menu,
dan menjadikannya kontrol yang bisa difokus hanya menambah perhentian tab yang tidak
berarti. Tombol tutup yang sesungguhnya ada di topbar dengan `aria-expanded`.

### Batas lingkungan yang sama seperti R-4

Transisi tetap tidak berjalan di pane ini, dan itu sempat membuat laci terlihat rusak:
`position` dan `width` dari aturan media berlaku, tapi `transform` dan `visibility` — yang
ikut ditransisikan — macet di nilai awal. Dengan transisi dimatikan, keduanya benar:
tertutup `translateX(-240px)`, terbuka `translateX(0)`. Sama seperti garis nav di R-4,
**animasinya sendiri belum pernah terlihat bergerak di sini**.

### Putaran kedua: merek, ringkasan, topbar menempel, dan perombakan UI edit

Lanjutan dari umpan balik pemilik setelah sidebar pertama jadi.

**Merek.** Petak "AT" jadi ikon pena, teks "Portfolio CV" jadi **"CV Edit"**. Ikonnya
mewarisi warna lewat `stroke="currentColor"`; `--bg` di atas `--accent` lolos 5.90:1.

**Topbar menempel.** Dulu baris atas ikut hilang saat digulir, jadi di layar sempit
satu-satunya cara membuka sidebar adalah menggulir kembali ke puncak. Sekarang merek dan
topbar `position: sticky; top: 0`. Dipilih ini, bukan tombol "back to top", karena
menyelesaikan sebabnya langsung — tombolnya memang yang harus selalu terjangkau. Diukur:
pada `scrollY` 568, keduanya tetap di `top: 0`.

**Layar ringkasan.** Rute `/admin` sekarang berisi empat kartu (Experience, Education,
Skills, Profil) yang menautkan ke masing-masing bagian; Profil pindah ke `/admin/profil`.
Angkanya dihitung dari data yang **sudah** dimuat `Dashboard`, jadi layar ini tidak
menambah satu pun request. Kartunya `auto-fit` + `minmax(11rem, 1fr)` — jumlah kolomnya
menyesuaikan sendiri tanpa media query.

Sengaja **tidak** menampilkan "terakhir diubah": kontrak API tidak mengembalikan
`updated_at` (keputusan task 4 — id dan updated_at tidak ikut bocor), jadi menampilkannya
berarti mengubah kontrak lebih dulu.

**UI edit dirombak.** Empat perubahan yang diminta pemilik:

1. **Semua tombol tambah seragam** — ikon plus + teks "Add new". Nama aksesibelnya tetap
   menyebut bagiannya (`Add new experience`), dan sengaja **memuat** frasa "Add new" yang
   terlihat: kalau nama aksesibel tidak mengandung label yang tampak, perintah suara
   "klik Add new" tidak menemukan tombolnya.
2. **Aksi baris disembunyikan sampai barisnya dipilih.** Label jadi `<button>`
   ber-`aria-expanded`, aksinya muncul di bawahnya. Dibuat `<button>` dan bukan
   `<div onClick>` supaya bisa ditab dan ditekan Enter. Satu baris terbuka pada satu waktu
   — daftar yang separuh barisnya terbuka lebih berantakan daripada yang menutup sendiri.
   Sorotan hover memakai `--surface`, bukan putih penuh: di tema gelap putih menyilaukan
   dan justru menenggelamkan teksnya.
3. **Naik/Turun/Hapus di dalam form jadi ikon**, dengan `aria-label` yang menyebut butir
   keberapa — "Naik" yang berulang lima kali tidak memberitahu naik yang mana.
4. **Simpan dan Batal diberi ikon**, Batal berwarna `--danger`. Teksnya `--bg` (6.66:1);
   putih di atas merah itu cuma **2.77:1** dan gagal. Cincin fokus tetap terbaca karena
   `outline-offset: 2px` menaruhnya di latar halaman, bukan di tombolnya.

**Bug yang ketemu saat menguji.** `.baris-aksi { display: flex }` menimpa aturan bawaan
browser untuk atribut `hidden` — gaya penulis selalu menang atas gaya user-agent. Akibatnya
aksi baris yang tertutup tetap terlihat DAN tetap bisa ditab. Diperbaiki dengan
`.baris-aksi[hidden] { display: none }`. Terukur setelahnya: **0 aksi bisa ditab saat
tertutup, 2 saat terbuka.**

CSS mati ikut dibuang: `.row-label`, `.row-actions`, `.row-action*` dan `.admin ul li`
sudah tidak dipakai satu pun JSX setelah baris memakai `.baris`/`.aksi`.

**Verifikasi putaran kedua**

| Cek | Hasil |
|---|---|
| CRUD penuh lewat UI baru | Tambah → muncul di urutan benar; buka baris → pensil → form terisi nilai lama; simpan → berubah; hapus → konfirmasi muncul, batal tidak menghapus, setuju menghapus |
| Baris terbuka setelah hapus | 0 — pilihan ikut direset |
| Satu baris terbuka pada satu waktu | Klik baris kedua menutup yang pertama |
| Aksi bisa ditab | 0 tertutup, 2 terbuka |
| Ukuran tombol aksi | 36×36 |
| Cincin fokus (Tab sungguhan) | `solid 3px #ffffff`, offset 2px, `:focus-visible` = true |
| Topbar menempel | `top: 0` pada `scrollY` 568 |
| Warna tombol | Simpan `--accent`/`--bg`, Batal `--danger`/`--bg`, dua-duanya berikon |
| 360px | Tanpa scroll horizontal, nol elemen meluber, aksi tetap 36×36 |
| Halaman publik | Tidak tersentuh — `main.page`, grid, hero sticky, 5 section, 16 skill |
| Build produksi | 50 modul, CSS 8.49 → **10.35 kB** (2.77 kB gzip); enam rute admin dilayani dari `:3000` |

**Batas lingkungan yang baru ketahuan.** Aktivasi keyboard tidak bisa diuji di pane ini:
`keydown` sampai ke elemen, tapi `event.key`-nya **kosong**, jadi aktivasi bawaan browser
untuk `<button>` (yang bergantung pada `key === 'Enter'` atau `' '`) tidak pernah menyala.
Yang bisa dipastikan dan sudah diperiksa: elemennya `<button type="button">` sungguhan,
tidak `disabled`, bisa difokus, memunculkan cincin fokus, dan tidak ada satu pun handler
yang mencegat tombol. Aktivasi Enter/Space pada elemen seperti itu adalah perilaku bawaan
browser. Sejenis dengan transisi dan gulir programatik yang juga inert di sini.

### Catatan: template kedua belum dipakai

`noxfolio` adalah template portfolio/resume — sasarannya halaman publik, bukan admin.
Tidak disentuh di pekerjaan ini.

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

- [ ] **Login dengan akun `proxy` belum pernah dicoba pemilik.** Semua jalur auth sudah
      terbukti lewat akun sekali-pakai; yang tersisa hanya memastikan hash password `proxy`
      sendiri cocok. Satu kali login di `/admin/login` sudah cukup.
- [ ] **Hosting MySQL belum diriset.** Handoff bagian 8 minta ini dicek di awal, jangan
      menunggu task 8 — PlanetScale sudah menutup free tier-nya. Kalau semua opsi buntu,
      pindah ke Postgres ±1 jam kerja, dan itu keputusan yang lebih murah diambil sekarang
      daripada di task 8.
- [ ] **Repo public, dan seed berisi data pribadi asli** — nama lengkap, email,
      LinkedIn, riwayat kerja. Ini keputusan sadar pemilik, dicatat di sini supaya
      tidak terlupakan kalau nanti ada data yang lebih sensitif ikut masuk seed.
- [ ] **Tanggal Gontor dan UT di seed 002 belum dikonfirmasi.** Dipakai apa adanya dari
      handoff Phase 2 atas keputusan pemilik. Sekarang bisa diperbaiki lewat admin panel
      tanpa menyentuh SQL — QA-nya jadi satu kali edit, bukan migrasi.
- [ ] **Redesign yang di-stash belum diapa-apakan.** `stash@{0}` berisi Archivo/Fraunces/
      IBM Plex Mono, grid dua kolom, dan palet kertas — plus tag `<link>` yang rusak
      (`/>` nyasar) yang harus dibetulkan kalau diteruskan. Diambil kembali dengan
      `git stash pop` saat pass redesign dimulai.

### Ditunda ke tahap deploy (handoff Phase 2 bagian 6)

- [ ] `ssl` di `db/pool.js` — MySQL managed mewajibkan TLS.
- [ ] `app.set('trust proxy', ...)` — tanpa ini rate limiter jadi satu ember untuk seluruh
      dunia begitu berada di belakang reverse proxy.

### Sudah lunas

- ~~Belum ada commit~~ — commit pertama `3c97af6`, atas nama `Deus`.
- ~~QA tanggal Wisma Nusantara~~ — dikonfirmasi benar, seed sudah jalan.
- ~~MySQL belum dicek~~ — 8.4.9 terpasang dan terisi.
- ~~Belum ada remote~~ — https://github.com/mikowidi/portfolio-cv (public).
- ~~`JWT_SECRET` masih placeholder~~ — sudah diganti pemilik dengan secret acak 96 karakter.
- ~~Header `X-Powered-By`~~ — `app.disable('x-powered-by')` dipasang di task 3.
- ~~`README.md` usang~~ — ditulis ulang sesuai bagian 6a `PHASE-1-FINISH.md`, tiap
  perintahnya diverifikasi jalan. Dikerjakan lebih awal dari rencana (semula task 8')
  karena isinya sudah bisa dipastikan sekarang, kecuali dua bagian yang menunggu
  perintahnya ada: cara membuat admin (task 6) dan penyajian `dist` oleh Express (task 8').
- ~~`experiences/service.js` 152 baris~~ — fungsi pelipat JOIN dipindah ke `db/foldRows.js`,
  sekaligus dipakai ulang service skills. Turun ke 133 baris.
- ~~`jwt.verify` belum mengunci algoritma~~ — `{ algorithms: ['HS256'] }` dipasang, dan
  celahnya dibuktikan nyata sebelum ditutup.
- ~~Rate limiter menghitung login berhasil~~ — `skipSuccessfulRequests: true`.

---

## Langkah berikutnya

**Phase 1 dan Phase 2 dua-duanya selesai.** Definisi selesai bagian 8 `PHASE-2-HANDOFF.md`
terpenuhi seluruhnya, dan tiap butirnya diuji sungguhan:

> Halaman publik menampilkan lima bagian dari MySQL — **ya**. Lewat admin panel, pemilik
> bisa menambah satu education dan satu skill group berisi tiga skill, lalu melihat
> keduanya muncul di halaman publik setelah refresh, tanpa menyentuh SQL — **ya, diuji di
> browser**. Mengurangi jumlah skill dalam satu grup menghasilkan jumlah yang benar, bukan
> tumpukan — **ya, 5 → 2 menghasilkan 2**. Semua ter-commit per task — **ya**.

Yang hanya bisa dikerjakan pemilik:

1. **`git push`** — 14 commit menunggu di lokal. Push dilakukan pemilik (bagian 7
   `PHASE-1-FINISH.md`).
2. **Login dengan akun `proxy` atau `Operator`** — semua jalur auth sudah terbukti lewat
   akun sekali-pakai; yang belum terbukti hanya bahwa hash password akun pemilik sendiri
   cocok. Satu kali login di `/admin/login` menutup itu.
3. **Konfirmasi tanggal Gontor dan UT** — sekarang cukup lewat admin panel.

Menunggu keputusan di luar lingkup: **hosting MySQL** dan deploy (syaratnya sudah ditulis
lengkap di `README.md`), lalu **pass redesign** — dokumennya belum turun, dan
`stash@{0}` menunggu di sana.

### `README.md` diperbarui untuk Phase 2

Tidak ada di urutan task handoff, tapi dikerjakan karena kalau dilewat repo-nya jadi
**rusak untuk orang yang meng-clone**: README hanya menyuruh menjalankan migrasi `001`,
sementara halaman publik sekarang menembak `/education` dan `/skills`. Tanpa migrasi `002`
kedua endpoint itu `500`, dan halamannya tidak pernah tampil. Standar bagian 6a
`PHASE-1-FINISH.md` — orang asing bisa clone dan jalan dalam 5 menit — masih berlaku.

Yang diperbarui: perintah migrasi dan seed `002`, perintah pengecekan (8 tabel · 3
experience · 3 education · 16 skill), daftar endpoint baca dan tulis, penjelasan kenapa
skill dibaca di `/skills` tapi ditulis di `/skill-groups`, pola hapus-lalu-sisipkan untuk
skill, dan struktur folder. Sekalian dibetulkan dua baris usang dari Phase 1: kalimat
"belum ada `styles.css`" (sudah ada sejak task 9) dan intro yang masih menyebut tiga
bagian.

**Tiap perintah dijalankan sungguhan, bukan disalin dari ingatan.** Supaya data pemilik
tidak tersentuh, pembuktiannya dilakukan di database terpisah `portfolio_cv_readme_test`
yang dibuat dari nol, diisi dengan keempat file SQL berurutan, lalu dibuang:

| Perintah README | Hasil |
|---|---|
| `CREATE DATABASE` | exit 0 |
| `source .../001_init.sql` | exit 0 |
| `source .../001_seed.sql` | exit 0 |
| `source .../002_phase2.sql` (migrasi) | exit 0 |
| `source .../002_phase2.sql` (seed) | exit 0 |
| Perintah cek | **8 tabel · 3 experience · 3 education · 16 skill** — persis seperti yang dijanjikan |
| Em dash di `about_md` | 2 karakter `U+2014`, mojibake `C3A2` **0** |
| Seed 002 dijalankan dua kali | Ditolak `ERROR 1062`, jumlah tetap 3 · 3 · 16 |
| `DROP DATABASE` | Bersih; tersisa hanya `portfolio_cv` |

---

## Pengingat aturan kerja

Berhenti per task **tidak berlaku lagi** (dicabut bagian 2 `PHASE-1-FINISH.md`).
Kerjakan berturut-turut, berhenti hanya di checkpoint. Commit tiap task selesai
dan terverifikasi; `PROGRESS.md` ikut di commit yang sama. **Push dilakukan pemilik.**

Yang tetap berlaku tanpa pengecualian: SQL mentah tanpa ORM, auth ditulis manual,
tanpa UI library, maksimal ±150 baris per file, jangan bikin file di luar struktur
bagian 5 handoff tanpa bertanya, `.env` tidak pernah di-commit.
