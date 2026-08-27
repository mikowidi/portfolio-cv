# Portfolio CV — Handoff Penyelesaian Phase 1

**Untuk:** dikerjakan di Claude Code
**Melengkapi:** `PHASE-1-HANDOFF.md` — dokumen itu **tidak diubah**, tetap jadi
sumber kebenaran untuk skema, kontrak API, dan struktur folder.
Dokumen ini hanya mengubah **cara kerja** dan **definisi selesai**.

**Status awal:** task 1–2 selesai (lihat `PROGRESS.md`). Yang tersisa: task 3–9.

---

## 1. Tujuan yang berubah

Sebelumnya project ini dikerjakan sebagai latihan mandiri, jadi tempo sengaja
diperlambat. Sekarang tidak lagi: hasilnya akan **dibedah bersama senior pemilik
project**, dan senior itu butuh sampel yang sudah utuh.

Konsekuensinya:

- Berhenti per task **tidak berlaku lagi** (aturan 1 bagian 0 handoff asli dicabut).
- Yang dinilai bukan lagi seberapa banyak pemilik menulis sendiri, tapi seberapa
  **siap direview orang lain**: bisa di-clone, dijalankan, dan dibaca alurnya.

---

## 2. Aturan bagian 0 — mana yang berubah

**Dicabut:**

- Aturan 1 (satu task per giliran). Diganti oleh bagian 3 di bawah.
- Aturan 2 (menjelaskan tiap file sebelum menulis). Diganti: penjelasan cukup
  ditulis sekali per task di `PROGRESS.md`, bukan per file di percakapan.

**Tetap berlaku, tanpa pengecualian:**

- Aturan 3 — SQL mentah, `mysql2/promise`, dilarang install ORM.
- Aturan 4 — auth ditulis manual, tanpa Passport/Auth0/Clerk.
- Aturan 5 — tanpa UI library, tanpa Tailwind.
- Aturan 6 — maksimal ±150 baris per file.
- Aturan 7 — jangan bikin file di luar struktur bagian 5 handoff tanpa bertanya.
- Aturan 8 — `.env` tidak pernah di-commit.
- Aturan 9 — ambigu berarti ambil yang paling sederhana lalu catat asumsinya.

Aturan 6 yang paling gampang bocor saat mengerjakan banyak task berturut-turut.
Kalau sebuah file lewat 150 baris, pecah — jangan diteruskan lalu dirapikan nanti.

---

## 3. Urutan eksekusi

Kerjakan **berturut-turut tanpa menunggu review**, dengan dua titik berhenti:

```
Task 3  GET /api/v1/experiences
Task 4  GET /api/v1/profile
Task 5  Frontend Vite — Hero, About, Experience
        ── CHECKPOINT 1 ── berhenti, lapor, tunggu lampu hijau
Task 6  Auth — createAdmin, login, requireAuth
Task 7  Admin panel — login, edit profil, CRUD experience
        ── CHECKPOINT 2 ── berhenti, lapor, tunggu lampu hijau
Task 9  Styling
Task 8' Verifikasi build produksi di lokal (lihat bagian 5)
```

Task 8 sengaja dipindah ke paling akhir dan diubah isinya.

**Kenapa ada dua checkpoint.** Kalau ada yang keliru di task 5 dan pengerjaan
lanjut sampai task 9, perbaikannya harus menembus empat task. Checkpoint di sini
bukan proses tambahan — ini rem darurat. Laporannya cukup ringkas: apa yang jalan,
apa yang belum, apa yang perlu diputuskan pemilik.

**Verifikasi tiap task tetap wajib** sesuai tabel bagian 9 handoff asli.
Jalankan verifikasinya sungguhan, jangan hanya melaporkan "selesai".

---

## 4. Commit

Commit **setiap kali satu task selesai dan terverifikasi** — bukan satu commit
besar di akhir. Senior yang mereview harus bisa membaca urutan pengerjaannya.

Format pesan commit:

```
task 3: GET /api/v1/experiences dengan JOIN highlight

- pool mysql2 di db/pool.js
- modul experiences: routes, controller, service
- melipat hasil JOIN datar jadi JSON bersarang, satu query
```

Baris pertama singkat, lalu baris kosong, lalu poin-poin isinya.
`PROGRESS.md` diperbarui di commit yang sama, bukan commit terpisah.

**Push ke remote dilakukan pemilik**, bukan otomatis. Lihat bagian 7.

---

## 5. Task 8 diubah — deploy ditunda

Handoff asli menaruh deploy ke hosting sebagai bagian dari Phase 1. Itu diubah,
karena hosting MySQL belum diputuskan dan senior membutuhkan repo-nya lebih dulu.

**Yang dikerjakan (task 8'):**

- `npm run build` di `frontend/` menghasilkan `frontend/dist` tanpa error.
- Saat `NODE_ENV=production`, Express menyajikan `frontend/dist` sebagai static
  beserta SPA fallback — semua rute non-`/api` dilayani `index.html`.
- Jalankan backend dengan `NODE_ENV=production` di lokal, buka `localhost:3000`,
  pastikan halaman publik **dan** `/admin` dua-duanya jalan dari satu origin itu.
- Catat di `README.md` bahwa deploy ke hosting belum dilakukan dan apa syaratnya.

**Yang tidak dikerjakan:** membuat akun hosting, provisioning database, menyetel
environment variable di platform, menyambungkan domain.

---

## 6. Standar "siap direview senior"

Ini yang membedakan repo selesai dari repo yang bisa dibaca orang lain.

**a. `README.md` harus cukup untuk orang yang belum pernah lihat repo ini.**
Isinya: prasyarat (Node, MySQL), cara membuat database, cara menjalankan migrasi
dan seed, cara membuat admin, cara menjalankan dev (dua terminal), cara build
produksi, dan daftar endpoint. Tolok ukurnya: orang asing bisa clone dan
menjalankan dalam 5 menit tanpa bertanya.

**b. `PROGRESS.md` diperbarui tiap task** — file yang dibuat, verifikasi yang
dijalankan beserta hasilnya, keputusan yang diambil, asumsi yang dipakai.
Pertahankan format yang sudah ada.

**c. Komentar hanya di tempat yang tidak jelas dari kodenya sendiri.** Terutama:
fungsi yang melipat hasil JOIN, dan pengaturan cookie di auth. Jangan komentari
hal yang sudah terbaca dari nama fungsinya.

**d. Konsistensi lintas modul.** Modul `profile` dan `experiences` harus memakai
pola yang sama persis — pembagian routes/controller/service, cara menangani error,
bentuk respons. Reviewer membaca perbedaan sebagai keputusan yang disengaja; kalau
sebenarnya tidak disengaja, itu memicu pertanyaan yang buang waktu.

**e. Bahasa.** Nama variabel, fungsi, dan pesan commit dalam bahasa Inggris.
Komentar dan dokumentasi (`README`, `PROGRESS`) dalam bahasa Indonesia — sama
seperti yang sudah berjalan.

---

## 7. Yang hanya bisa dikerjakan pemilik

Claude Code **tidak boleh** mengerjakan hal-hal di bawah ini. Kalau salah satunya
menghalangi, berhenti dan minta ke pemilik.

| # | Hal | Kapan dibutuhkan | Caranya |
|---|---|---|---|
| 1 | `JWT_SECRET` asli di `.env` | Sebelum task 6 | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` lalu tempel ke `.env`. Jangan pernah ditulis di repo atau di percakapan mana pun |
| 2 | Password admin | Saat task 6 | Jalankan `npm run create-admin` sendiri, ketik password di prompt terminal |
| 3 | `git push` ke GitHub | Setelah checkpoint | Pemilik yang menjalankan, memastikan kredensial GitHub-nya jalan |
| 4 | Isi final `about_md` | Sebelum task 9 | Teks yang sekarang masih draf. Edit lewat admin panel setelah task 7 |
| 5 | Foto profil (opsional) | Task 9 | `photo_url` menerima URL eksternal. Upload file bukan bagian Phase 1 |
| 6 | Keputusan hosting MySQL | Setelah handover | Terpisah dari pekerjaan ini |

Nomor 1 dan 2 adalah **blocker keras** untuk task 6. Kalau belum ada, berhenti di
checkpoint 1 dan minta dulu — jangan bikin nilai sementara, jangan bikin password
default, jangan generate secret lalu menyimpannya di file mana pun selain `.env`
milik pemilik.

---

## 8. Definisi selesai — revisi

> Repo bisa di-clone di mesin baru, diikuti `README.md` tanpa bertanya, dan
> menghasilkan: halaman publik menampilkan Hero, About, Experience dari MySQL;
> `/admin` bisa login; menambah experience beserta highlight lewat admin muncul di
> halaman publik setelah refresh; `npm run build` + `NODE_ENV=production`
> menyajikan keduanya dari satu origin. Semua sudah ter-commit dengan riwayat
> yang terbaca per task.

Deploy ke hosting **tidak** termasuk definisi selesai.

---

## 9. Yang tetap tidak dikerjakan

Sama persis seperti bagian 1 handoff asli: Skills, Projects, Education,
many-to-many technologies, kontak form, upload gambar, dark mode, SEO manager,
draft/publish, analytics, activity log, RBAC, Docker, CI/CD, testing otomatis, backup.

Tekanan untuk menambah akan naik sekarang justru karena sampelnya mau ditunjukkan
ke orang lain. Tahan. Tiga fitur yang dikerjakan dengan rapi lebih layak direview
daripada delapan fitur setengah jadi.

---

## 10. Utang yang dibawa dari task sebelumnya

Diselesaikan di dalam pengerjaan ini:

- [ ] `JWT_SECRET` masih placeholder → blocker task 6, lihat bagian 7
- [ ] `app.disable('x-powered-by')` belum dipasang → tambahkan di `app.js`, satu baris
- [ ] `README.md` masih menyebut database dan frontend "belum ada" → perbarui di task 8'

Ditunda dengan sengaja:

- [ ] Riset hosting MySQL → di luar lingkup, dikerjakan setelah handover
