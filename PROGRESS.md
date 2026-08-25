# Catatan Pengerjaan — Portfolio CV

Status per **24 Agustus 2026**.

Lingkup, kontrak API, dan aturan kerja ada di [PHASE-1-HANDOFF.md](PHASE-1-HANDOFF.md) —
file itu tidak diubah. File ini hanya mencatat: apa yang sudah jalan, keputusan apa
yang sudah diambil, dan utang apa yang belum dibayar.

---

## Ringkasan

**Phase 1: 1 dari 9 task selesai.**

| # | Task | Status |
|---|---|---|
| 1 | Skeleton repo, backend Express, `GET /api/v1/health` | **Selesai & terverifikasi** |
| 2 | Migrasi + seed | Belum |
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

## Lingkungan mesin

| | |
|---|---|
| Node.js | v24.19.0 (handoff minta 20+) |
| npm | 11.17.0 |
| git | 2.55.0, branch `main` |
| MySQL | **belum dicek sama sekali** |

Catatan: Node terpasang setelah sesi kerja dimulai, jadi terminal yang sudah terbuka
sebelumnya tidak melihat `node` di PATH. Buka terminal baru kalau kena.

---

## Utang yang belum dibayar

- [ ] **Belum ada satu pun commit.** Semua file masih untracked, menunggu review.
- [ ] **`JWT_SECRET` di `.env` lokal masih placeholder** (`ganti-dengan-string-acak-panjang`).
      Belum dipakai sampai task 6, tapi harus diganti sebelum sampai situ.
- [ ] **Header `X-Powered-By: Express` masih terkirim.** Sengaja tidak dimatikan supaya
      tidak menambah baris di luar lingkup. Perbaikannya satu baris: `app.disable('x-powered-by')`.
- [ ] **QA tanggal Wisma Nusantara** (handoff bagian 3): tanggalnya pernah tercatat
      berbeda di dokumen lain. Harus dipastikan **sebelum** seed dijalankan di task 2.
- [ ] **Hosting MySQL belum diriset.** Handoff bagian 8 minta ini dicek di awal, jangan
      menunggu task 8 — PlanetScale sudah menutup free tier-nya.

---

## Langkah berikutnya

**Task 2 — jalankan migrasi + seed.**
Verifikasi: `SHOW TABLES` menampilkan 5 tabel; `SELECT` menunjukkan 3 experience
beserta highlight-nya.

Prasyarat yang harus beres dulu:
1. MySQL 8.0+ terpasang dan hidup di mesin ini (versi 8.0 wajib — skema pakai `CHECK`).
2. Tanggal Wisma Nusantara sudah dipastikan.

---

## Pengingat aturan kerja

Satu task per giliran. Selesai satu task → berhenti, lapor, tunggu review.
Tanpa ORM, tanpa library auth, tanpa UI library, maksimal ±150 baris per file.
