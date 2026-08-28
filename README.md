# Portfolio CV

Portfolio satu halaman dengan admin panel. Halaman publik menampilkan Hero, About Me,
dan Experience dari MySQL; admin panel dipakai untuk mengubah isinya tanpa menyentuh SQL.

Project latihan full-stack: backend, REST API, dan basis data relasional ditulis manual —
**tanpa ORM, tanpa library auth, tanpa UI library.** SQL ditulis mentah dengan
`mysql2/promise` dan prepared statement.

| Lapisan | Pilihan |
|---|---|
| Frontend | Vite + React 19 (JavaScript) |
| Backend | Node 20+ · Express 4 · ESM |
| Database | MySQL 8.0+ |
| Driver | `mysql2/promise`, SQL mentah |

---

## Prasyarat

- **Node.js 20 atau lebih baru** — `node --version`
- **MySQL 8.0 atau lebih baru** — `mysql --version`

MySQL **wajib** 8.0+. Skema memakai `CHECK` constraint, dan di MySQL 5.7 constraint itu
diterima saat `CREATE TABLE` lalu diabaikan diam-diam — jadi data yang seharusnya ditolak
akan masuk tanpa error.

Perintah `mysql` di bawah mengasumsikan klien MySQL ada di `PATH`. Di Windows biasanya
belum, dan perlu ditambahkan sendiri — foldernya `C:\Program Files\MySQL\MySQL Server 8.4\bin`.

---

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Salin contoh environment lalu isi:

```bash
cp .env.example .env
```

Di Windows PowerShell: `Copy-Item .env.example .env`

Buka `backend/.env` dan isi dua nilai:

- **`DB_PASSWORD`** — password root MySQL kamu.
- **`JWT_SECRET`** — string acak panjang. Bikin satu dengan:

  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```

Server **menolak menyala** kalau ada variabel yang masih kosong, dan pesan errornya
menyebut variabel mana yang kurang. Itu disengaja: server yang jalan dengan
`JWT_SECRET` kosong lebih berbahaya daripada server yang tidak mau menyala.

`.env` tidak pernah di-commit — hanya `.env.example`.

### 2. Database

Ketiga perintah berikut dijalankan **dari root repo**, dan akan menanyakan password root.

```bash
mysql -u root -p --default-character-set=utf8mb4 -e "CREATE DATABASE portfolio_cv CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

```bash
mysql -u root -p --default-character-set=utf8mb4 portfolio_cv -e "source backend/src/db/migrations/001_init.sql"
```

```bash
mysql -u root -p --default-character-set=utf8mb4 portfolio_cv -e "source backend/src/db/seed/001_seed.sql"
```

> **Pakai bentuk `-e "source ..."` ini, jangan diganti.** Di PowerShell,
> `Get-Content file.sql | mysql` merusak karakter non-ASCII: `Get-Content` membaca file
> dengan codepage ANSI, lalu pipe-nya meng-encode ulang. Em dash di data seed pernah
> tersimpan jadi `â€"` gara-gara itu. Bentuk `source` membuat klien mysql yang membaca
> filenya sendiri, byte demi byte, dan bekerja sama di Windows, macOS, maupun Linux.

Seed dirancang jalan **sekali** di database kosong. Kalau dijalankan dua kali, primary key
bentrok dan seluruh isinya di-`ROLLBACK` — bukan separuh masuk separuh tidak.

Cek hasilnya:

```bash
mysql -u root -p portfolio_cv -e "SHOW TABLES; SELECT COUNT(*) AS experiences FROM experiences;"
```

Harus muncul 5 tabel dan 3 experience.

### 3. User admin

```bash
cd backend
npm run create-admin
```

Perintah ini menanyakan username lalu password (minimal 12 karakter, diketik dua kali).
**Ketikan password tidak ditampilkan** dan tidak tertinggal di scrollback terminal.

Password sengaja tidak bisa dioper lewat argumen, environment variable, maupun pipe —
ketiganya meninggalkan jejak di riwayat shell atau daftar proses. Kalau dijalankan di luar
terminal sungguhan, skripnya menolak jalan dengan pesan yang menjelaskan kenapa.

Hash disimpan dengan argon2. Username punya `UNIQUE` key, jadi menjalankan perintah ini
dua kali dengan username sama akan ditolak database.

### 4. Frontend

```bash
cd frontend
npm install
```

---

## Menjalankan (development)

Butuh **dua terminal**, dan backend harus lebih dulu.

Terminal 1 — backend di `:3000`:

```bash
cd backend
npm run dev
```

Terminal 2 — frontend di `:5173`:

```bash
cd frontend
npm run dev
```

Buka **http://localhost:5173**.

Vite mem-proxy `/api` ke `:3000`, jadi browser hanya pernah melihat satu origin — sama
seperti produksi nanti. Karena itu tidak ada konfigurasi CORS di project ini sama sekali.

Kalau halaman menampilkan "Tidak bisa menghubungi server", berarti backend di terminal 1
belum jalan.

---

## Build produksi

```bash
cd frontend
npm run build
```

Hasilnya masuk ke `frontend/dist`.

> **Belum bisa dipakai sepenuhnya.** Express belum menyajikan `frontend/dist`, jadi
> menjalankan backend dengan `NODE_ENV=production` belum menghasilkan halaman. Itu
> pekerjaan task 8'. Deploy ke hosting belum dilakukan dan bukan bagian Phase 1 —
> keputusan hosting MySQL-nya sendiri belum diambil.

---

## Endpoint

Base path `/api/v1`. Semua endpoint mengembalikan payload langsung, bukan dibungkus
`{ data: ... }`.

### Tersedia sekarang

| Method | Path | Auth | Balasan |
|---|---|---|---|
| `GET` | `/api/v1/health` | — | `{"ok":true}` |
| `GET` | `/api/v1/profile` | — | Objek profil beserta `social_links` |
| `GET` | `/api/v1/experiences` | — | Array experience, urut `start_date DESC`, tiap entri membawa `highlights` |
| `POST` | `/api/v1/auth/login` | — | `{ id, username }` + `Set-Cookie` |
| `POST` | `/api/v1/auth/logout` | — | `204`, cookie dikosongkan |
| `GET` | `/api/v1/auth/me` | cookie | `{ id, username }`, atau `401` kalau belum login |

Login dibatasi **10 percobaan per 15 menit per IP**; lewat dari itu dibalas `429`.
Username salah dan password salah dibalas pesan yang sama persis, supaya tidak bisa
dipakai memetakan username mana yang ada.

Token disimpan di cookie `httpOnly` dengan `SameSite=Lax` dan umur 7 hari. Karena JWT
bersifat stateless, `logout` hanya menghapus cookie — token yang terlanjur bocor tetap sah
sampai kedaluwarsa. Untuk situs satu admin ini diterima; pencabutan sungguhan berarti
menyimpan sesi di database, dan itu bukan Phase 1.

### Belum dibuat

Endpoint tulis admin — `PUT /profile`, `POST`/`PUT`/`DELETE /experiences` — menyusul di
task 7. Kontrak lengkapnya ada di bagian 4 [PHASE-1-HANDOFF.md](PHASE-1-HANDOFF.md).

### Bentuk error

Seragam untuk semua endpoint, disusun di satu middleware terakhir:

```json
{ "error": { "code": "NOT_FOUND", "message": "Route tidak ditemukan: GET /api/v1/typo" } }
```

Kode status yang dipakai: `200` · `201` · `204` · `400` validasi · `401` belum login ·
`404` · `500`.

---

## Struktur

```
backend/src/
├── config/env.js          baca + validasi process.env, gagal cepat
├── db/
│   ├── pool.js            pool mysql2, satu instance
│   ├── migrations/        DDL
│   └── seed/              data awal
├── middleware/            errorHandler + 404 · requireAuth · validate (zod)
├── modules/               satu folder per fitur
│   ├── auth/              routes · controller · service · schema
│   ├── experiences/       routes · controller · service
│   └── profile/           routes · controller · service
├── scripts/createAdmin.js dijalankan manual, bukan bagian server
├── app.js                 merakit Express, tanpa listen
└── server.js              listen

frontend/src/
├── api/client.js          satu-satunya pembungkus fetch
├── sections/              Hero · About · Experience
├── App.jsx                ambil data, kelola status memuat/gagal
└── main.jsx
```

Pembagian di tiap modul dipegang konsisten: `routes.js` hanya memetakan path,
`controller.js` tidak pernah memuat SQL, `service.js` tidak pernah menyentuh `req`/`res`.

Belum ada `styles.css` — halaman masih HTML semantik polos. Styling adalah task terakhir,
supaya tidak ada waktu terbuang merapikan komponen yang mungkin masih berubah.

---

## Dokumen lain

| File | Isi |
|---|---|
| [PHASE-1-HANDOFF.md](PHASE-1-HANDOFF.md) | Skema, kontrak API, struktur folder — sumber kebenaran |
| [PHASE-1-FINISH.md](PHASE-1-FINISH.md) | Cara kerja dan definisi selesai |
| [PROGRESS.md](PROGRESS.md) | **Status pengerjaan**, verifikasi tiap task, keputusan, dan utang |

Status task hanya dicatat di `PROGRESS.md`, sengaja tidak diduplikasi di sini supaya
tidak ada dua sumber yang bisa saling berbeda.
