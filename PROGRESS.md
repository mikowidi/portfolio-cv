# Catatan Pengerjaan — Portfolio CV

Status per **27 Agustus 2026**.

Dua dokumen sumber, keduanya berlaku:

- [PHASE-1-HANDOFF.md](PHASE-1-HANDOFF.md) — skema, kontrak API, struktur folder. Tidak diubah.
- [PHASE-1-FINISH.md](PHASE-1-FINISH.md) — cara kerja dan definisi selesai. Mencabut aturan
  berhenti per task, memindahkan deploy ke luar lingkup, menetapkan dua checkpoint.

File ini mencatat apa yang sudah jalan, keputusan yang diambil, dan utang yang belum dibayar.

---

## Ringkasan

**Phase 1: 5 dari 9 task selesai — berhenti di CHECKPOINT 1.**

Urutan mengikuti bagian 3 `PHASE-1-FINISH.md` — task 9 dikerjakan sebelum task 8'.

| # | Task | Status |
|---|---|---|
| 1 | Skeleton repo, backend Express, `GET /api/v1/health` | **Selesai & terverifikasi** |
| 2 | Migrasi + seed | **Selesai & terverifikasi** |
| 3 | `GET /api/v1/experiences` | **Selesai & terverifikasi** |
| 4 | `GET /api/v1/profile` | **Selesai & terverifikasi** |
| 5 | Frontend Vite — Hero/About/Experience | **Selesai & terverifikasi** |
| | ── **CHECKPOINT 1** — berhenti, lapor, tunggu lampu hijau ── | **DI SINI** |
| 6 | Auth — createAdmin, login, requireAuth | Belum |
| 7 | Admin panel | Belum |
| | ── **CHECKPOINT 2** ── | |
| 9 | Styling | Belum |
| 8' | Verifikasi build produksi di lokal (deploy ke hosting ditunda) | Belum |

Halaman publik sudah bisa dibuka di `localhost:5173` dan menampilkan data asli dari MySQL.
Yang belum: styling (task 9) dan admin panel (task 7) — halamannya masih HTML polos dan
isinya baru bisa diubah lewat SQL.

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
- ~~`README.md` usang~~ — ditulis ulang sesuai bagian 6a `PHASE-1-FINISH.md`, tiap
  perintahnya diverifikasi jalan. Dikerjakan lebih awal dari rencana (semula task 8')
  karena isinya sudah bisa dipastikan sekarang, kecuali dua bagian yang menunggu
  perintahnya ada: cara membuat admin (task 6) dan penyajian `dist` oleh Express (task 8').

---

## Langkah berikutnya

**Berhenti di CHECKPOINT 1.** Menunggu lampu hijau pemilik sebelum task 6.

Dua hal yang harus disiapkan pemilik sebelum task 6 bisa jalan (bagian 7 `PHASE-1-FINISH.md`):

1. ~~`JWT_SECRET` asli di `.env`~~ — **sudah beres**, secret acak 96 karakter terpasang.
2. **Password admin** — belum. Setelah `npm run create-admin` dibuat di task 6,
   pemiliknya sendiri yang menjalankan dan mengetik passwordnya di prompt terminal.
   Claude Code tidak boleh membuat password sementara maupun password default.

---

## Pengingat aturan kerja

Berhenti per task **tidak berlaku lagi** (dicabut bagian 2 `PHASE-1-FINISH.md`).
Kerjakan berturut-turut, berhenti hanya di checkpoint. Commit tiap task selesai
dan terverifikasi; `PROGRESS.md` ikut di commit yang sama. **Push dilakukan pemilik.**

Yang tetap berlaku tanpa pengecualian: SQL mentah tanpa ORM, auth ditulis manual,
tanpa UI library, maksimal ±150 baris per file, jangan bikin file di luar struktur
bagian 5 handoff tanpa bertanya, `.env` tidak pernah di-commit.
