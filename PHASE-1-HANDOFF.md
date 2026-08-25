# Portfolio CV — Handoff Phase 1

**Untuk:** dikerjakan di Claude Code
**Pemilik:** Deus
**Tujuan project:** latihan full-stack (backend + API + relational DB), bukan produk komersial
**Ruang lingkup Phase 1:** Hero, About Me, Experience — tembus dari database sampai admin panel

---

## 0. Aturan kerja (baca ini dulu, Claude Code)

Pemilik project mau **membedah kode ini secara manual**, bukan menerima repo jadi. Jadi:

1. **Kerjakan satu task saja per giliran.** Urutan task ada di bagian 9. Setelah satu task selesai, berhenti, laporkan apa yang berubah, tunggu review. Jangan lompat ke task berikutnya tanpa diminta.
2. **Jelaskan sebelum menulis.** Untuk tiap file baru, sebut dalam 1–2 kalimat: file ini tanggung jawabnya apa, dan kenapa dipisah dari file sebelah.
3. **SQL ditulis mentah.** Pakai `mysql2/promise` dengan prepared statement. **Dilarang menginstall ORM** (Prisma, Sequelize, TypeORM, Drizzle). Query adalah bagian yang mau dipelajari — jangan ditutupi abstraksi.
4. **Auth ditulis manual.** Dilarang pakai Passport, NextAuth, Auth0, Clerk. Total kode auth di Phase 1 harusnya di bawah 80 baris.
5. **Tanpa UI library.** Tanpa Tailwind, MUI, shadcn, Bootstrap. Satu file CSS biasa.
6. **Maksimal ±150 baris per file.** Kalau lewat, pecah dan jelaskan pemecahannya.
7. **Jangan bikin file yang tidak ada di struktur folder bagian 5** tanpa bertanya dulu.
8. `.env` tidak pernah di-commit. Yang di-commit hanya `.env.example`.
9. Kalau ada keputusan yang ambigu, ambil yang paling sederhana lalu tulis satu baris asumsi — jangan berhenti bertanya untuk hal remeh.

---

## 1. Batas Phase 1

### Masuk

- Skema database + migrasi + seed data asli
- REST API: 2 endpoint publik (read), 1 modul auth, 3 endpoint admin (write)
- Halaman publik satu layar: Hero, About Me, Experience
- Admin panel: login, edit profil, CRUD experience
- Deploy ke satu URL yang bisa diakses publik

### Tidak masuk (jangan dikerjakan, jangan disiapkan "supaya gampang nanti")

Skills, Projects, Education, Technologies/many-to-many, kontak form, upload gambar, dark mode, SEO manager, draft/publish, analytics, activity log, role-based access, Docker, CI/CD, testing otomatis, backup.

Semua itu punya fase sendiri. Menambahkan "hook"-nya sekarang = menambah kode yang belum ada yang pakai.

### Kenapa admin panel ikut di Phase 1

Karena tanpa admin, satu-satunya cara memasukkan data adalah `INSERT` manual. Itu bikin Phase 1 selesai tapi tidak bisa dipakai, dan sisi tulis jadi tertunda tanpa batas waktu. Phase 1 memotong **vertikal** (satu fitur tembus semua lapisan), bukan horizontal (semua fitur di satu lapisan).

---

## 2. Stack — sudah dikunci

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Frontend | Vite + React, **JavaScript** | SPA murni. Frontend benar-benar tidak punya server, jadi Express jadi satu-satunya backend — model mentalnya bersih |
| Backend | Node 20+ · Express 4 · ESM | — |
| DB | **MySQL 8.0+** | Wajib. Butuh 8.0 karena skema pakai `CHECK` constraint |
| Driver | `mysql2/promise` | Prepared statement, tanpa ORM |
| Validasi | `zod` | Satu skema per endpoint tulis |
| Auth | JWT di cookie `httpOnly` | Tanpa tabel sesi, tanpa dependensi auth |
| Hash | `argon2` | — |

### Tiga penyimpangan dari draft awal, beserta alasannya

**a. JavaScript, bukan TypeScript.**
Phase 1 sudah memperkenalkan Express, MySQL mentah, JWT, dan React sekaligus. Menambah TypeScript berarti error kompilasi akan bercampur dengan error logika, dan sulit membedakan mana yang mana saat sedang belajar. TypeScript masuk di Phase 2, dengan cara migrasi bertahap — bukan sekarang.

**b. Next.js dibuang; Express yang menyajikan hasil build frontend.**
Next.js sudah punya server sendiri. Menempelkan Express di sebelahnya berarti dua target deploy, konfigurasi CORS, dan cookie `httpOnly` lintas domain (`SameSite=None` + `Secure` + `credentials: 'include'` harus benar semua). Itu jam-jam debugging yang tidak mengajarkan apa pun tentang backend.

Susunan yang dipakai:
- **Dev:** Vite di `:5173`, Express di `:3000`. `vite.config.js` mem-proxy `/api` ke `:3000`. Dari sudut pandang browser tetap satu origin.
- **Produksi:** `npm run build` di frontend menghasilkan `frontend/dist`. Express menyajikannya sebagai static + SPA fallback. **Satu origin, satu deploy, tanpa CORS sama sekali.**
- Konsekuensi: cookie cukup `SameSite=Lax`.

**c. Folder per modul, bukan per layer.**
Draft awal memakai `controllers/`, `routes/`, `services/` di level atas. Itu memaksa buka tiga folder untuk mengubah satu fitur. Di sini satu fitur = satu folder. Kalau senior lu minta susunan per layer, memindahkannya kerja 10 menit — polanya identik.

---

## 3. Skema database — Phase 1

```
users                     (berdiri sendiri, hanya untuk auth)

profile ──1:N──> social_links

experiences ──1:N──> experience_highlights
```

Dua relasi satu-ke-banyak yang nyata. Cukup untuk latihan `JOIN`, `ON DELETE CASCADE`, dan pengurutan anak-record.

### DDL lengkap

File: `backend/src/db/migrations/001_init.sql`

```sql
-- =========================================================
-- 001_init.sql — Phase 1
-- MySQL 8.0+ (butuh CHECK constraint yang benar-benar diterapkan)
-- =========================================================

CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Satu baris saja. CHECK mengunci id=1 supaya tidak pernah ada
-- profil kedua yang tidak sengaja masuk.
CREATE TABLE profile (
  id             TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  full_name      VARCHAR(120) NOT NULL,
  headline       VARCHAR(160) NOT NULL,   -- Hero: satu baris peran
  hero_statement VARCHAR(280) NOT NULL,   -- Hero: kalimat pembuka
  about_md       TEXT         NOT NULL,   -- About Me, ditulis sebagai Markdown
  location       VARCHAR(120) NULL,
  email          VARCHAR(160) NULL,
  photo_url      VARCHAR(400) NULL,       -- URL eksternal; upload file BUKAN Phase 1
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                                          ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_profile_singleton CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE social_links (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  profile_id TINYINT UNSIGNED  NOT NULL,
  label      VARCHAR(40)       NOT NULL,   -- 'LinkedIn', 'GitHub', 'Email'
  url        VARCHAR(400)      NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_social_profile
    FOREIGN KEY (profile_id) REFERENCES profile(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  KEY idx_social_sort (profile_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE experiences (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  position        VARCHAR(120) NOT NULL,
  org             VARCHAR(120) NOT NULL,
  location        VARCHAR(120) NULL,
  employment_type ENUM('full_time','part_time','contract',
                       'internship','freelance') NOT NULL DEFAULT 'full_time',
  start_date      DATE         NOT NULL,
  end_date        DATE         NULL,        -- NULL = masih berjalan
  summary         VARCHAR(400) NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                                            ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_exp_dates CHECK (end_date IS NULL OR end_date >= start_date),
  KEY idx_exp_start (start_date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE experience_highlights (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  experience_id INT UNSIGNED      NOT NULL,
  body          VARCHAR(400)      NOT NULL,
  sort_order    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_hl_exp
    FOREIGN KEY (experience_id) REFERENCES experiences(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  KEY idx_hl_exp_sort (experience_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Catatan desain — bagian yang perlu dibedah

**Tidak ada kolom `is_current`.** `end_date IS NULL` sudah berarti "masih berjalan". Menyimpan dua kolom untuk satu fakta menjamin keduanya akan berbeda suatu hari — dan tidak ada cara menentukan mana yang benar. Aturan umum: satu fakta, satu tempat.

**Butir pekerjaan jadi tabel anak, bukan satu kolom `description`.** Ini keputusan yang paling layak diperdebatkan, jadi alasannya eksplisit: tiap butir CV adalah fakta atomik yang perlu diurutkan sendiri, diedit sendiri, dan nanti (Phase 3) difilter per varian CV. Kalau digabung jadi satu blok teks, semua itu jadi manipulasi string. Ongkosnya: satu `JOIN` tambahan dan penulisan yang lebih rumit — dan penulisan itulah yang jadi bahan latihan transaksi di bagian 6.

**`ON DELETE CASCADE` disengaja.** Hapus experience → highlight-nya ikut hilang. Highlight tidak punya arti tanpa induknya, jadi tidak boleh jadi baris yatim.

**Tanpa `is_published`.** Menggoda, tapi berarti setiap query publik butuh filter tambahan, sementara belum pernah ada kebutuhan menyimpan draft. Masuk Phase 2 kalau memang terasa perlu.

**`photo_url` isinya URL eksternal.** Upload file sengaja ditunda: mayoritas host gratis filesystem-nya ephemeral, jadi file yang di-upload hilang tiap redeploy. Upload butuh keputusan penyimpanan objek (S3 / Cloudinary / Supabase Storage) — itu topik Phase 3, bukan sesuatu yang ditambal sekarang.

### Seed

File: `backend/src/db/seed/001_seed.sql` — data asli, bukan placeholder.

```
profile
  id             1
  full_name      Amadeus Thareq Widhi Dhyatmiko
  headline       Master Data Administrator
  hero_statement Mengurus data harga dan produk untuk jaringan ritel di Bali,
                 lalu membangun sendiri alat yang memotong kerja manualnya.
  location       Denpasar, Bali
  email          mmikowidi@gmail.com

social_links
  LinkedIn   https://linkedin.com/in/thareqdeus   sort 0
  Email      mailto:mmikowidi@gmail.com           sort 1

experiences
  1  Master Data Administrator · I-Thon Mart (PT I-Thon Group) · Bali
     full_time · 2025-11-01 → NULL
     highlights:
       - Mengelola data harga dan master produk untuk tiga cabang toko.
       - Membangun generator form cek stok berbasis Excel VBA; penyiapan form
         yang tadinya 5-15 menit per permintaan turun jadi 2-3 menit.
       - Membangun pembanding harga berbasis Excel yang membaca file export dan
         menampilkan harga lama dan baru per size, dipakai untuk rekondisi stok gudang.
       - Merancang ulang workbook harga produk segar jadi formula-only agar tetap
         jalan saat dibuka lewat Collabora di komputer toko.

  2  Business Unit Staff / Bookkeeper · Wisma Nusantara · Kairo, Mesir
     full_time · 2024-01-01 → 2025-05-31
     highlights:
       - Mengelola operasional guest room dan auditorium.
       - Pencatatan keuangan harian dan rekapitulasi bulanan.
       - Merangkap desainer media sosial unit usaha.

  3  Printing & Design Staff · Darussalam Press · Gontor, Ponorogo
     full_time · 2018-08-01 → 2019-08-31
     highlights:
       - Desain cover buku dan proyek kalender sekolah tahunan.

users
  1 baris admin. Password TIDAK ditulis di file seed.
  Buat lewat skrip `npm run create-admin` yang membaca dari prompt terminal,
  hash pakai argon2, lalu INSERT.
```

> **QA pemilik:** tanggal Wisma Nusantara pernah tercatat berbeda di dokumen lain. Pastikan versi di atas yang benar sebelum di-seed.

---

## 4. Kontrak API

Base path: `/api/v1`

### Publik — tanpa auth

```
GET /api/v1/profile
GET /api/v1/experiences
```

`GET /api/v1/profile` → `200`

```json
{
  "full_name": "Amadeus Thareq Widhi Dhyatmiko",
  "headline": "Master Data Administrator",
  "hero_statement": "Mengurus data harga dan produk ...",
  "about_md": "Latar belakang saya campuran ...",
  "location": "Denpasar, Bali",
  "email": "mmikowidi@gmail.com",
  "photo_url": null,
  "social_links": [
    { "id": 1, "label": "LinkedIn", "url": "https://linkedin.com/in/thareqdeus" }
  ]
}
```

`GET /api/v1/experiences` → `200`, urut `start_date DESC`

```json
[
  {
    "id": 1,
    "position": "Master Data Administrator",
    "org": "I-Thon Mart (PT I-Thon Group)",
    "location": "Bali",
    "employment_type": "full_time",
    "start_date": "2025-11-01",
    "end_date": null,
    "summary": null,
    "highlights": [
      { "id": 1, "body": "Mengelola data harga dan master produk ..." }
    ]
  }
]
```

Endpoint ini mengembalikan **array telanjang**, bukan `{ data: [...] }`. Konsisten: semua endpoint Phase 1 mengembalikan payload langsung.

### Auth

```
POST   /api/v1/auth/login     { username, password } -> 200 + Set-Cookie
POST   /api/v1/auth/logout    -> 204
GET    /api/v1/auth/me        -> 200 { id, username } | 401
```

### Admin — butuh cookie yang sah

```
PUT    /api/v1/profile              -> 200 (objek profil terbaru)
POST   /api/v1/experiences          -> 201 (objek experience baru)
PUT    /api/v1/experiences/:id      -> 200
DELETE /api/v1/experiences/:id      -> 204
```

**Highlight tidak punya endpoint sendiri.** `POST`/`PUT` experience mengirim seluruh array highlight sekaligus:

```json
{
  "position": "Master Data Administrator",
  "org": "I-Thon Mart (PT I-Thon Group)",
  "location": "Bali",
  "employment_type": "full_time",
  "start_date": "2025-11-01",
  "end_date": null,
  "summary": null,
  "highlights": ["butir pertama", "butir kedua"]
}
```

Backend menangani highlight dengan **hapus-lalu-sisipkan-ulang di dalam satu transaksi**, `sort_order` diambil dari urutan array. Ini menghindari CRUD terpisah untuk sub-resource, dan memaksa `BEGIN` / `COMMIT` / `ROLLBACK` ditulis dengan benar — bagian yang memang mau dipelajari.

### Bentuk error — seragam

```json
{ "error": { "code": "VALIDATION_FAILED", "message": "start_date wajib diisi",
             "fields": { "start_date": "wajib diisi" } } }
```

Kode status: `200` · `201` · `204` · `400` validasi · `401` belum login · `404` · `500`.
Satu middleware error di paling akhir. Controller tidak pernah menyusun respons error sendiri.

---

## 5. Struktur folder

```
portfolio-cv/
├── backend/
│   ├── src/
│   │   ├── config/env.js            # baca + validasi process.env, gagal cepat kalau kurang
│   │   ├── db/
│   │   │   ├── pool.js              # pool mysql2, satu instance
│   │   │   ├── migrations/001_init.sql
│   │   │   └── seed/001_seed.sql
│   │   ├── middleware/
│   │   │   ├── requireAuth.js
│   │   │   ├── validate.js          # bungkus zod -> 400
│   │   │   └── errorHandler.js
│   │   ├── modules/
│   │   │   ├── auth/       { routes.js, controller.js, service.js, schema.js }
│   │   │   ├── profile/    { routes.js, controller.js, service.js, schema.js }
│   │   │   └── experiences/{ routes.js, controller.js, service.js, schema.js }
│   │   ├── scripts/createAdmin.js
│   │   ├── app.js                   # rakit express, tanpa listen
│   │   └── server.js                # listen; di produksi serve frontend/dist
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/client.js            # fetch pembungkus, selalu credentials:'include'
│   │   ├── sections/{ Hero.jsx, About.jsx, Experience.jsx }
│   │   ├── admin/{ Login.jsx, Dashboard.jsx, ExperienceForm.jsx, ProfileForm.jsx }
│   │   ├── styles.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js               # proxy /api -> localhost:3000
│   └── package.json
│
└── README.md
```

Pembagian tugas di tiap modul, dipegang konsisten:

- `routes.js` — hanya pemetaan path → middleware → controller
- `controller.js` — baca `req`, panggil service, kirim `res`. **Tidak ada SQL di sini.**
- `service.js` — semua SQL dan logika. Tidak menyentuh `req`/`res` sama sekali.
- `schema.js` — skema zod untuk endpoint tulis

Kalau service perlu tahu isi `req`, batasnya bocor — perbaiki, jangan lanjutkan.

---

## 6. Auth — perilaku yang diharapkan

```
POST /auth/login
  └─ validasi bentuk body (zod)
  └─ SELECT id, username, password_hash FROM users WHERE username = ?
  └─ argon2.verify(hash, password)
  └─ gagal → 401 dengan pesan sama persis untuk username salah maupun password salah
  └─ berhasil → jwt.sign({ sub: id }, JWT_SECRET, { expiresIn: '7d' })
  └─ res.cookie('token', jwt, {
       httpOnly: true, sameSite: 'lax',
       secure: NODE_ENV === 'production', maxAge: 7 hari
     })
```

`requireAuth`: baca cookie → verifikasi → tempel `req.user` → lanjut, atau `401`. Tidak ada peran, tidak ada izin — hanya "login atau tidak". Satu admin.

Batasi laju `POST /auth/login`: `express-rate-limit`, 10 percobaan per 15 menit per IP.

Perlindungan di sisi frontend hanya soal kenyamanan. Yang menegakkan aturan tetap `requireAuth` di server.

**Jujur soal batasannya:** JWT bersifat stateless, jadi `logout` hanya menghapus cookie — token yang bocor tetap sah sampai kedaluwarsa. Untuk situs satu admin ini dapat diterima. Kalau nanti butuh pencabutan token yang sungguhan, itu berarti menyimpan sesi di database, dan itu bukan Phase 1.

---

## 7. Frontend

### Halaman publik — satu halaman, tiga bagian

```
┌──────────────────────────────────────────┐
│ HERO                                     │
│   full_name                              │
│   headline                               │
│   hero_statement                         │
│   social_links                           │
├──────────────────────────────────────────┤
│ ABOUT ME                                 │
│   about_md (render markdown)             │
│   location · email                       │
├──────────────────────────────────────────┤
│ EXPERIENCE                               │
│   untuk tiap experience:                 │
│     rentang tanggal (Nov 2025 - sekarang)│
│     position                             │
│     org · location                       │
│     summary                              │
│     highlights sebagai <ul>              │
└──────────────────────────────────────────┘
```

Satu `useEffect` di `App.jsx` menembak dua endpoint publik secara paralel (`Promise.all`), menyimpan hasilnya di state, mengoper lewat props. Tanpa state manager, tanpa react-query di Phase 1.

Wajib ditangani, jangan dilewat: **status memuat** dan **status gagal**. Kalau API mati, halaman harus menampilkan pesan yang jelas — bukan layar kosong. Ini bagian dari definisi selesai.

Format tanggal: `end_date` `null` → tampilkan `"sekarang"`. Tulis satu fungsi pembantu, jangan sebar logikanya.

### Admin

`/admin` di React Router. Rute:

- `/admin/login` — form username + password
- `/admin` — daftar experience + tombol edit/hapus, plus form profil
- Cek `GET /auth/me` saat memuat; kalau `401`, alihkan ke login

Form experience: input tanggal biasa, `end_date` boleh kosong, highlight sebagai daftar textarea yang bisa ditambah/hapus/diurutkan naik-turun. Sebelum menghapus experience, minta konfirmasi.

### Tampilan

Task 1–7 pakai HTML semantik polos tanpa styling. Styling adalah **task terakhir** Phase 1, supaya tidak ada waktu terbuang merapikan tampilan komponen yang mungkin berubah.

Saat gilirannya tiba: satu file `styles.css`, CSS custom properties untuk warna, satu tipografi dari Google Fonts, tata letak satu kolom yang responsif. Fokusnya jarak dan hierarki tipografi — bukan animasi. Tolok ukur: fokus keyboard terlihat, terbaca di layar 360px, `prefers-reduced-motion` dihormati.

---

## 8. Environment

`backend/.env.example`:

```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=portfolio_cv
JWT_SECRET=ganti-dengan-string-acak-panjang
```

`config/env.js` memvalidasi semuanya saat start dan **melempar error kalau ada yang kosong**. Server yang jalan dengan `JWT_SECRET` kosong lebih buruk daripada server yang menolak menyala.

### Catatan hosting

MySQL gratis makin langka — PlanetScale sudah menutup free tier-nya. Cek dulu di awal, jangan menunggu sampai task 8. Alternatif: Railway (berbayar kecil), Aiven free tier, atau MySQL yang ikut dalam paket shared hosting. Kalau ternyata semua buntu, pemindahan skema ini ke Postgres kerja sekitar satu jam — `AUTO_INCREMENT` → `GENERATED AS IDENTITY`, `ENUM` → tipe enum atau `CHECK`, sisanya sama.

---

## 9. Urutan kerja

Satu task per giliran. Tiap task punya cara verifikasi yang konkret — kerjakan verifikasinya, jangan hanya melaporkan "selesai".

| # | Task | Verifikasi |
|---|---|---|
| 1 | Skeleton repo, backend Express, `GET /api/v1/health` | `curl localhost:3000/api/v1/health` → `{"ok":true}` |
| 2 | Jalankan migrasi + seed | `SHOW TABLES` menampilkan 5 tabel; `SELECT` menunjukkan 3 experience dan highlight-nya |
| 3 | `GET /api/v1/experiences` — service + JOIN highlight | `curl` menghasilkan JSON persis seperti bagian 4 |
| 4 | `GET /api/v1/profile` — beserta social_links | idem |
| 5 | Frontend Vite, ambil data, render Hero/About/Experience tanpa styling | Halaman menampilkan data asli; matikan backend → muncul pesan gagal, bukan layar kosong |
| 6 | Auth: `createAdmin` script, login, `requireAuth`, `/auth/me` | Login lewat curl mengembalikan cookie; `PUT /profile` tanpa cookie → 401 |
| 7 | Admin panel: login, edit profil, CRUD experience + highlight | Tambah experience baru lewat UI, muncul di halaman publik setelah refresh |
| 8 | Build produksi: Express menyajikan `frontend/dist`, deploy | URL publik menampilkan data; login jalan di URL itu |
| 9 | Styling | Terbaca di 360px, fokus keyboard terlihat |

---

## 10. Definisi selesai — Phase 1

> Di URL yang bisa diakses publik, pemilik bisa login, menambah satu experience dengan tiga highlight, menyimpannya, dan melihatnya muncul di halaman publik — tanpa menyentuh SQL, tanpa redeploy.

Kalau itu tercapai, Phase 1 selesai. Tidak ada tambahan apa pun ke Phase 1 setelah titik ini, termasuk hal yang "sekalian saja".

---

## 11. Rencana fase berikutnya (hanya sebagai peta — jangan dikerjakan)

- **Phase 2** — Education, Skills, migrasi ke TypeScript
- **Phase 3** — Projects + technologies (many-to-many), upload gambar beserta keputusan penyimpanan objek
- **Phase 4** — hanya ditentukan setelah Phase 3 benar-benar dipakai selama sebulan

---

## 12. Risiko yang paling mungkin membunuh project ini

**Task 6 (auth).** Bukan karena sulit, tapi karena setelah task 5 halaman publik sudah terlihat "jadi", dan dorongan untuk melanjutkan berkurang tajam. Pemilik project punya pola berulang: membangun sistem lebih cepat daripada merawatnya.

Aturan pengaman: **task 5 harus sudah live di URL sungguhan sebelum baris pertama task 6 ditulis.** Kalau ternyata berhenti di situ, yang tersisa tetap barang utuh yang bisa ditunjukkan — bukan repo setengah jadi di localhost.
