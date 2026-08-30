# Portfolio CV — Handoff Phase 2

**Untuk:** dikerjakan di Claude Code
**Melengkapi:** `PHASE-1-HANDOFF.md` (skema, kontrak API, struktur folder) dan
`PHASE-1-FINISH.md` (cara kerja, konvensi commit). Dua dokumen itu **tidak diubah**.

**Status awal:** Phase 1 selesai — task 1–9. Halaman publik, auth, admin panel,
dan build produksi sudah jalan di lokal. Deploy belum.

**Isi Phase 2:** dua entitas baru — **Education** dan **Skills** — tembus dari
database sampai admin panel.

---

## 1. Aturan kerja

Sama persis seperti `PHASE-1-FINISH.md` bagian 2: berturut-turut tanpa menunggu
review, commit per task, verifikasi dijalankan sungguhan. Semua larangan tetap
berlaku — tanpa ORM, tanpa library auth, tanpa UI library, maksimal ±150 baris
per file.

Satu checkpoint saja, setelah task P2-3.

### Styling: JANGAN disentuh

Setelah Phase 2 ada rencana redesign menyeluruh — tema gelap, dua kolom, nav.
Seluruh `styles.css` akan ditulis ulang.

Artinya: bagian Education dan Skills yang baru **cukup diberi kelas yang
konsisten dengan pola yang sudah ada**, dan tidak perlu dirapikan tampilannya.
Waktu yang dipakai menata visual sekarang akan terbuang seluruhnya.

Yang wajib: struktur HTML semantik dan nama kelas yang selaras dengan
`.entry`, `.entry-dates`, `.entry-org` yang sudah dipakai Experience — supaya
CSS baru nanti bisa menjangkau semuanya dengan satu set aturan.

#### Satu pengecualian: pemilihan font

Font halaman ini **sudah final** — Plus Jakarta Sans, bobot 400 dan 600 saja —
dan akan dipertahankan apa adanya di redesign nanti. Jadi mengganti font bukan
pekerjaan yang akan terbuang: nilainya ikut terbawa ke pass berikutnya, tidak
ditulis ulang seperti sisa `styles.css`.

Yang tercakup pengecualian ini hanya **pemilihan keluarga font itu sendiri**:
tag `<link>` Google Fonts di `index.html` dan deklarasi `font-family` di
`styles.css`. Bobot yang diunduh tetap dijaga sama persis dengan yang dipakai
CSS — menambah bobot yang tidak dipakai berarti mengunduh file untuk apa-apa,
dan memakai bobot yang tidak diunduh membuat browser memalsukan tebalnya.

**Larangan menata layout dan visual tetap berlaku penuh.** Palet warna, skala
ukuran, jarak, grid, garis pemisah, dan segala penataan lain tetap tidak
disentuh sampai dokumen redesign turun.

---

## 2. Skema

Melanjutkan pola yang sudah ada. `skill_groups → skills` adalah relasi satu-ke-
banyak yang sama persis dengan `experiences → experience_highlights`, jadi
service dan form adminnya bisa mengikuti bentuk yang sudah terbukti.

```
education                 (berdiri sendiri)
skill_groups ──1:N──> skills
```

File: `backend/src/db/migrations/002_phase2.sql`

```sql
-- =========================================================
-- 002_phase2.sql — Education dan Skills
-- =========================================================

CREATE TABLE education (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  qualification VARCHAR(160) NOT NULL,   -- "S1 Sistem Informasi"
  org         VARCHAR(160) NOT NULL,     -- "Universitas Terbuka"
  location    VARCHAR(120) NULL,
  start_date  DATE         NOT NULL,
  end_date    DATE         NULL,         -- NULL = masih berjalan
  note        VARCHAR(200) NULL,         -- "tidak dilanjutkan", "cum laude"
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                                         ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_edu_dates CHECK (end_date IS NULL OR end_date >= start_date),
  KEY idx_edu_start (start_date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE skill_groups (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(80)       NOT NULL,   -- "Data & spreadsheet"
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uq_skill_group_name (name),
  KEY idx_skill_group_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE skills (
  id         INT UNSIGNED      AUTO_INCREMENT PRIMARY KEY,
  group_id   INT UNSIGNED      NOT NULL,
  name       VARCHAR(80)       NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_skill_group
    FOREIGN KEY (group_id) REFERENCES skill_groups(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  KEY idx_skill_group_sort (group_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Catatan desain

**Tidak ada kolom `level` atau persentase kemampuan.** Angka seperti
"JavaScript 85%" tidak punya arti yang bisa dipertahankan — tidak ada satuan,
tidak ada pembanding, dan pembaca yang paham justru membacanya sebagai
tebakan. Cukup nama, dikelompokkan.

**`skill_groups.name` dibuat `UNIQUE`.** Dua grup bernama sama adalah salah
input, bukan keadaan yang sah. Lebih baik ditolak database daripada muncul dua
kali di halaman.

**`education.note` sengaja bebas.** Riwayat pendidikan sering butuh keterangan
yang tidak masuk kolom mana pun ("tidak dilanjutkan", "beasiswa"). Satu kolom
teks pendek lebih jujur daripada memaksa enum.

**Tetap tanpa `is_current`** — konsisten dengan `experiences`.

### Seed

File: `backend/src/db/seed/002_phase2.sql`. Data asli, bukan placeholder.

```
education  (urut start_date DESC)
  S1 Sistem Informasi · Universitas Terbuka · 2025-08-01 → NULL
  Syariah dan Hukum · Al-Azhar University · Kairo, Mesir
      · 2021-01-01 → 2025-05-31 · note: "tidak dilanjutkan"
  Pendidikan Menengah · Pondok Modern Darussalam Gontor
      · 2012-07-01 → 2018-06-30

skill_groups / skills
  1. Data & spreadsheet   — Master data produk dan harga · Excel lanjutan & VBA ·
                            Pembersihan dan validasi data · Google Sheets ·
                            Pembukuan dasar
  2. Bangun aplikasi      — JavaScript · React · HTML/CSS · Supabase ·
                            Node.js & Express · MySQL · Python · Git
  3. Desain & lainnya     — Desain grafis materi promosi · Dokumentasi SOP ·
                            Dukungan IT dan perawatan perangkat
```

> **QA pemilik:** tanggal mulai/selesai Gontor dan UT di atas adalah perkiraan
> bulan. Konfirmasi sebelum di-seed — kolomnya `DATE`, jadi harus diisi sesuatu.

---

## 3. Kontrak API

Mengikuti bentuk yang sudah ada: array telanjang, bukan `{ data: [...] }`.

### Publik

```
GET /api/v1/education   -> 200, urut start_date DESC, tiebreaker id ASC
GET /api/v1/skills      -> 200, grup urut sort_order, skill urut sort_order
```

`GET /api/v1/education`

```json
[
  {
    "id": 1,
    "qualification": "S1 Sistem Informasi",
    "org": "Universitas Terbuka",
    "location": null,
    "start_date": "2025-08-01",
    "end_date": null,
    "note": null
  }
]
```

`GET /api/v1/skills` — grup membawa anaknya, sama seperti experiences membawa
highlights. Satu query dengan `JOIN`, dilipat di service. **Bukan** N+1.

```json
[
  { "id": 1, "name": "Data & spreadsheet",
    "skills": [ { "id": 1, "name": "Master data produk dan harga" } ] }
]
```

### Admin — semua wajib `requireAuth`, urutannya `requireAuth` lalu `validate`

```
POST   /api/v1/education         -> 201
PUT    /api/v1/education/:id     -> 200
DELETE /api/v1/education/:id     -> 204

POST   /api/v1/skill-groups      -> 201
PUT    /api/v1/skill-groups/:id  -> 200
DELETE /api/v1/skill-groups/:id  -> 204
```

Skill tidak punya endpoint sendiri. `POST`/`PUT` skill group mengirim seluruh
array nama skill, dan service memakai **hapus-lalu-sisipkan-ulang di dalam satu
transaksi** — sama persis seperti highlights. Pakai `withTransaction` yang sudah
ada di `db/pool.js`, jangan tulis ulang.

```json
{ "name": "Data & spreadsheet", "sort_order": 0,
  "skills": ["Master data produk dan harga", "Excel lanjutan & VBA"] }
```

Bentuk error tetap `{ error: { code, message, fields? } }`.

---

## 4. Frontend

Dua section baru di halaman publik, di bawah Experience, urutan:
**Hero → About → Experience → Education → Skills**

- `frontend/src/sections/Education.jsx` — pola `.entry` yang sama persis
- `frontend/src/sections/Skills.jsx` — tiap grup: nama grup + daftar skill

`App.jsx` sekarang menembak **empat** endpoint publik. Tetap satu `Promise.all`,
jangan berurutan. Perhatikan batas 150 baris — kalau `App.jsx` melewatinya,
pindahkan pengambilan data ke satu hook `usePortfolioData()` di file sendiri.

Admin: dua layar baru mengikuti pola `ExperienceForm` yang sudah ada. Form skill
group bentuknya identik dengan form experience — satu induk plus daftar anak
yang bisa ditambah, dihapus, dan diurutkan.

---

## 5. Urutan kerja

| # | Task | Verifikasi |
|---|---|---|
| P2-1 | Migrasi 002 + seed 002 | `SHOW TABLES` = 8 tabel; uji `CHECK` tanggal dan `UNIQUE` nama grup ditolak, dibungkus transaksi lalu ROLLBACK |
| P2-2 | `GET /education` dan `GET /skills` | `curl` menghasilkan JSON persis seperti bagian 3; cek jumlah query, tidak boleh N+1 |
| P2-3 | Dua section di halaman publik | Muncul dengan data asli; matikan backend → pesan gagal, bukan layar kosong |
| — | **CHECKPOINT** | berhenti, lapor, tunggu lampu hijau |
| P2-4 | Endpoint tulis + dua layar admin | Lewat UI: tambah education, tambah skill group dengan 3 skill, muncul di halaman publik setelah refresh |
| P2-5 | Uji transaksi | Edit skill group, kurangi skill dari 5 jadi 2 → hasilnya **2**, bukan 7. Hapus grup → skill anaknya ikut hilang |

---

## 6. Utang dari Phase 1 — dibereskan di sini

- [ ] **`experiences/service.js` 152 baris**, lewat batas 150. Pindahkan fungsi
      pelipat hasil JOIN ke file sendiri — fungsi itu akan dipakai ulang oleh
      service skills, jadi pemindahannya sekalian menghapus duplikasi.
- [ ] **`jwt.verify` belum mengunci algoritma.** Tambahkan
      `{ algorithms: ['HS256'] }`.
- [ ] **Rate limiter menghitung login yang berhasil.** Selama membangun admin
      baru, sebelas kali login dalam 15 menit akan mengunci pemilik dari
      panelnya sendiri. Setel `skipSuccessfulRequests: true`.

Dicatat, **tidak dikerjakan sekarang** (milik tahap deploy):

- [ ] `ssl` di `db/pool.js` — MySQL managed mewajibkan TLS
- [ ] `app.set('trust proxy', ...)` — tanpa ini rate limiter jadi satu ember
      untuk seluruh dunia begitu berada di belakang reverse proxy

---

## 7. Di luar lingkup

Redesign (tema gelap, dua kolom, nav), Projects, many-to-many technologies,
upload gambar, tombol unduh PDF, meta tag preview, deploy.

Projects adalah Phase 3. Redesign adalah pass tersendiri setelah Phase 2 —
dokumennya menyusul.

---

## 8. Definisi selesai

> Halaman publik menampilkan lima bagian dari MySQL. Lewat admin panel, pemilik
> bisa menambah satu education dan satu skill group berisi tiga skill, lalu
> melihat keduanya muncul di halaman publik setelah refresh — tanpa menyentuh
> SQL. Mengurangi jumlah skill dalam satu grup menghasilkan jumlah yang benar,
> bukan tumpukan. Semua ter-commit per task.
