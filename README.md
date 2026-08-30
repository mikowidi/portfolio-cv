# Portfolio CV

Portfolio satu halaman dengan admin panel. Halaman publik menampilkan Hero, About Me,
Experience, Education, dan Skills dari MySQL; admin panel dipakai untuk mengubah isinya
tanpa menyentuh SQL.

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
- **Server MySQL 8.0 atau lebih baru**, sedang berjalan
- **Klien `mysql` ada di `PATH`** — `mysql --version`

Ketiganya harus menjawab sebelum lanjut. Kalau `mysql --version` berkata perintahnya tidak
dikenal, servernya boleh jadi sudah jalan tapi kliennya belum ada di `PATH` — dan **semua
perintah database di README ini akan gagal.** Di Windows ini yang paling sering kena;
installer MySQL tidak menambahkannya sendiri. Foldernya:

```
C:\Program Files\MySQL\MySQL Server 8.4\bin
```

Tambahkan ke `PATH`, lalu **buka terminal baru** — terminal yang sudah terbuka masih
memakai `PATH` yang lama.

MySQL **wajib** 8.0+. Skema memakai `CHECK` constraint, dan di MySQL 5.7 constraint itu
diterima saat `CREATE TABLE` lalu diabaikan diam-diam — jadi data yang seharusnya ditolak
akan masuk tanpa error.

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

Lalu migrasi dan seed Phase 2 — Education dan Skills. Urutannya penting: `002` menganggap
`001` sudah jalan.

```bash
mysql -u root -p --default-character-set=utf8mb4 portfolio_cv -e "source backend/src/db/migrations/002_phase2.sql"
```

```bash
mysql -u root -p --default-character-set=utf8mb4 portfolio_cv -e "source backend/src/db/seed/002_phase2.sql"
```

> **Pakai bentuk `-e "source ..."` ini, jangan diganti.** Di PowerShell,
> `Get-Content file.sql | mysql` merusak karakter non-ASCII: `Get-Content` membaca file
> dengan codepage ANSI, lalu pipe-nya meng-encode ulang. Em dash di data seed pernah
> tersimpan jadi `â€"` gara-gara itu. Bentuk `source` membuat klien mysql yang membaca
> filenya sendiri, byte demi byte, dan bekerja sama di Windows, macOS, maupun Linux.

Kedua seed dirancang jalan **sekali** di database kosong. Kalau dijalankan dua kali,
primary key-nya bentrok — `profile` di seed 001, `skill_groups` di seed 002 — dan seluruh
isinya di-`ROLLBACK`, bukan separuh masuk separuh tidak. Tabel `education` sendiri tidak
punya kunci unik apa pun; yang menahannya dari menggandakan diri adalah transaksi itu,
bukan constraint di tabelnya.

Cek hasilnya:

```bash
mysql -u root -p portfolio_cv -e "SHOW TABLES; SELECT (SELECT COUNT(*) FROM experiences) AS experiences, (SELECT COUNT(*) FROM education) AS education, (SELECT COUNT(*) FROM skills) AS skills;"
```

Harus muncul **8 tabel**, 3 experience, 3 education, dan 16 skill.

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

Buka **http://localhost:5173** untuk halaman publik, dan **http://localhost:5173/admin**
untuk admin panel (akan mengalihkan ke form login kalau belum masuk).

Vite mem-proxy `/api` ke `:3000`, jadi browser hanya pernah melihat satu origin — sama
seperti produksi nanti. Karena itu tidak ada konfigurasi CORS di project ini sama sekali.

Kalau halaman menampilkan "Tidak bisa menghubungi server", berarti backend di terminal 1
belum jalan.

---

## Menjalankan mode produksi (lokal)

Berbeda dari mode development, di sini **hanya ada satu server dan satu port**. Express
menyajikan hasil build frontend sekaligus API-nya.

Build dulu:

```bash
cd frontend
npm run build
```

Lalu jalankan backend dengan `NODE_ENV=production` — di PowerShell:

```bash
cd backend; $env:NODE_ENV = "production"; npm start
```

Di bash/macOS/Linux:

```bash
cd backend && NODE_ENV=production npm start
```

Buka **http://localhost:3000** — halaman publik dan `/admin` dua-duanya dilayani dari
port yang sama. Vite tidak dipakai sama sekali di mode ini.

Kalau `frontend/dist` belum ada, server **menolak menyala** dan menyebutkan bahwa build
frontend harus dijalankan lebih dulu — bukan menyala lalu membalas 404 untuk tiap halaman.

Satu perbedaan perilaku yang perlu diketahui: di produksi cookie login membawa flag
`Secure`, jadi hanya terkirim lewat HTTPS. `http://localhost` tetap jalan karena browser
memperlakukan localhost sebagai origin tepercaya, tapi di server sungguhan **HTTPS wajib**
atau login tidak akan pernah nyangkut.

## Deploy

**Belum dilakukan, dan bukan bagian Phase 1.** Yang sudah terbukti hanyalah bahwa aplikasi
jalan dari satu origin di mesin lokal.

Yang masih perlu diputuskan dan dikerjakan sebelum bisa online:

1. **Hosting MySQL** — belum dipilih. PlanetScale sudah menutup free tier-nya; alternatif
   yang masuk akal: Railway, Aiven, atau MySQL bawaan shared hosting. Kalau semuanya buntu,
   memindahkan skema ini ke Postgres kerja sekitar satu jam.
2. **Host aplikasi Node** yang bisa menjalankan `npm start` dan menyajikan `frontend/dist`.
3. **Environment variable di platform** — isinya sama seperti `.env.example`, dengan
   `JWT_SECRET` acak yang baru dan `NODE_ENV=production`.
4. **Migrasi dan seed dijalankan sekali** di database produksi, lalu `npm run create-admin`
   untuk membuat akun admin di sana.
5. **HTTPS** — wajib, karena cookie login memakai flag `Secure`.

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
| `GET` | `/api/v1/education` | — | Array education, urut `start_date DESC` |
| `GET` | `/api/v1/skills` | — | Array skill group, urut `sort_order`, tiap grup membawa `skills` |
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

### Endpoint tulis — butuh cookie login

| Method | Path | Balasan |
|---|---|---|
| `PUT` | `/api/v1/profile` | `200` objek profil terbaru |
| `POST` | `/api/v1/experiences` | `201` experience baru |
| `PUT` | `/api/v1/experiences/:id` | `200` experience terbaru, atau `404` |
| `DELETE` | `/api/v1/experiences/:id` | `204`, atau `404` |
| `POST` | `/api/v1/education` | `201` education baru |
| `PUT` | `/api/v1/education/:id` | `200` education terbaru, atau `404` |
| `DELETE` | `/api/v1/education/:id` | `204`, atau `404` |
| `POST` | `/api/v1/skill-groups` | `201` grup baru beserta skill-nya |
| `PUT` | `/api/v1/skill-groups/:id` | `200` grup terbaru, atau `404` |
| `DELETE` | `/api/v1/skill-groups/:id` | `204`, atau `404` |

Skill dibaca di `/skills` tapi ditulis di `/skill-groups`: yang dibaca halaman publik
adalah grup beserta isinya, sedangkan yang diedit admin adalah grupnya. `GET /skill-groups`
dan `POST /skills` sengaja **tidak ada** — keduanya dibalas `404`.

Nama grup bersifat unik, dan karena collation tabelnya `utf8mb4_unicode_ci`, dua nama yang
cuma beda huruf besar-kecil pun dianggap bentrok. Bentrokan dibalas `400` yang menunjuk
field `name`, bukan `500`.

**Highlight tidak punya endpoint sendiri.** `POST` dan `PUT` experience mengirim seluruh
array highlight sekaligus:

```json
{
  "position": "Master Data Administrator",
  "org": "I-Thon Mart (PT I-Thon Group)",
  "employment_type": "full_time",
  "start_date": "2025-11-01",
  "end_date": null,
  "highlights": ["butir pertama", "butir kedua"]
}
```

Backend menghapus seluruh highlight lama lalu menyisipkan ulang dari array, **di dalam
satu transaksi**, dan `sort_order` diambil dari urutan array. Kalau ada yang gagal di
tengah, `ROLLBACK` mengembalikan highlight yang sudah terhapus — tidak pernah ada keadaan
setengah jadi yang tersimpan.

**Skill mengikuti pola yang sama persis.** `POST` dan `PUT` skill group mengirim seluruh
daftar skill sekaligus:

```json
{ "name": "Data & spreadsheet", "sort_order": 0,
  "skills": ["Master data produk dan harga", "Excel lanjutan & VBA"] }
```

Karena yang lama dihapus lebih dulu, mengubah daftar dari 5 skill jadi 2 menghasilkan
**2**, bukan 7. Menghapus grupnya membuang seluruh skill di dalamnya lewat
`ON DELETE CASCADE`.

Kolom yang boleh `NULL` (`location`, `end_date`, `summary`, `note`, `email`, `photo_url`)
menerima string kosong dari form dan menyimpannya sebagai `NULL`.

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
│   ├── pool.js            pool mysql2 + withTransaction
│   ├── foldRows.js        melipat hasil LEFT JOIN jadi bersarang
│   ├── migrations/        DDL
│   └── seed/              data awal
├── middleware/            errorHandler + 404 · requireAuth · validate (zod + helper field)
├── modules/               satu folder per fitur
│   ├── auth/              routes · controller · service · schema
│   ├── education/         routes · controller · service · schema
│   ├── experiences/       routes · controller · service · schema
│   ├── profile/           routes · controller · service · schema
│   └── skills/            routes · controller · service · schema
├── scripts/createAdmin.js dijalankan manual, bukan bagian server
├── app.js                 merakit Express, tanpa listen
└── server.js              listen

frontend/src/
├── api/client.js          satu-satunya pembungkus fetch
├── sections/              Hero · About · Experience · Education · Skills
│   └── dateRange.js       pemformat rentang tanggal, dipakai dua section
├── admin/                 Login · Dashboard · ProfileForm
│   ├── CrudSection        daftar + form + hapus, dipakai tiga bagian admin
│   ├── ListEditor         tambah/hapus/urutkan daftar teks (highlight & skill)
│   └── forms              ExperienceForm · EducationForm · SkillGroupForm
├── styles.css             token, gaya dasar, halaman publik
├── admin.css              form dan daftar admin panel
├── App.jsx                rute publik + /admin, ambil data halaman publik
└── main.jsx
```

Pembagian di tiap modul dipegang konsisten: `routes.js` hanya memetakan path,
`controller.js` tidak pernah memuat SQL, `service.js` tidak pernah menyentuh `req`/`res`.

Tidak ada file yang melewati ±150 baris — batas itu ditegakkan, bukan sekadar dianjurkan.

---

## Dokumen lain

| File | Isi |
|---|---|
| [PHASE-1-HANDOFF.md](PHASE-1-HANDOFF.md) | Skema, kontrak API, struktur folder — sumber kebenaran |
| [PHASE-1-FINISH.md](PHASE-1-FINISH.md) | Cara kerja dan definisi selesai |
| [PROGRESS.md](PROGRESS.md) | **Status pengerjaan**, verifikasi tiap task, keputusan, dan utang |

Status task hanya dicatat di `PROGRESS.md`, sengaja tidak diduplikasi di sini supaya
tidak ada dua sumber yang bisa saling berbeda.
