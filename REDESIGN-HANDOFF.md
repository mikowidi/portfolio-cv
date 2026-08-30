# Portfolio CV — Handoff Redesign

**Untuk:** dikerjakan di Claude Code
**Melengkapi:** `PHASE-1-HANDOFF.md`, `PHASE-1-FINISH.md`, `PHASE-2-HANDOFF.md`.
Ketiganya **tidak diubah**.

**Status awal:** Phase 1 dan 2 selesai. Lima bagian publik, admin panel penuh,
build produksi jalan di lokal. Font sudah Plus Jakarta Sans.

**Isi pass ini:** perombakan tampilan menyeluruh — tema gelap, tata letak dua
kolom, navigasi — plus dua perbaikan kecil di admin panel.

---

## 0. Aturan

Sama seperti `PHASE-1-FINISH.md` bagian 2. Larangan yang paling relevan di sini:

- **Tanpa UI library, tanpa Tailwind, tanpa icon library.** Ikon ditulis sebagai
  SVG inline. `lucide-react` dan sejenisnya termasuk yang dilarang aturan 5.
- Maksimal ±150 baris per file. `styles.css` akan tumbuh — kalau lewat, pisahkan
  blok `:root` ke `tokens.css` dan tambahkan importnya di `main.jsx`.

Ada `stash@{0}` berisi percobaan styling lama dengan tag `<link>` yang rusak.
**Buang** (`git stash drop`) — pass ini menggantikannya seluruhnya.

Kerjakan berturut-turut, commit per task, satu checkpoint setelah task R-3.

---

## 1. Dua perbaikan admin (kerjakan duluan, commit sendiri)

Keduanya ada di `frontend/src/admin/CrudSection.jsx` — satu komponen yang
dipakai Experience, Education, dan Skills sekaligus.

**a. Tombol tambah pindah ke bawah daftar.** Sekarang tombolnya di atas, jadi
riwayat yang sudah masuk ketutup dan pemilik tidak sempat memeriksanya sebelum
menambah. Urutan barunya: judul → daftar record → tombol tambah. Saat form
sedang terbuka, form tetap muncul menggantikan tombol, tapi juga di bawah daftar.

**b. Edit dan Hapus jadi ikon.** Teksnya terlalu panjang dan membuat tiap baris
melebar tidak beraturan.

Wajib dipenuhi, ini bukan opsional:

- Tiap tombol punya `aria-label` yang jelas dan menyebut recordnya —
  `aria-label={`Edit ${renderLabel(item)}`}`. Tanpa ini tombolnya tidak punya
  nama sama sekali bagi pembaca layar, dan itu penurunan aksesibilitas, bukan
  penyederhanaan.
- `title` yang sama supaya muncul tooltip saat hover.
- Ikonnya SVG inline, `stroke="currentColor"`, `aria-hidden="true"`,
  ukuran 16px. Pensil untuk edit, tempat sampah untuk hapus.
- Target sentuh minimal 32×32px meski ikonnya 16px — beri padding.
- `window.confirm` sebelum hapus **tetap ada**. Ikon tanpa teks membuat salah
  klik lebih mudah, jadi konfirmasinya justru makin perlu.
- Tombol hapus diberi warna `--danger` saat hover, bukan sejak awal — daftar
  yang penuh ikon merah terbaca seperti daftar error.

---

## 2. Palet

Warna resmi Anthropic. Yang ditandai *turunan* bukan warna resmi — dihitung
untuk mengisi peran yang tidak ada di palet aslinya.

```css
--bg:           #141413;   /* Anthropic Dark */
--surface:      #1e1e1c;   /* turunan — kartu, input, panel */
--text:         #faf9f5;   /* Anthropic Light */
--muted:        #b0aea5;   /* Anthropic Mid Gray */
--border:       #302f2c;   /* turunan */
--accent:       #d97757;   /* Anthropic Orange */
--accent-hover: /* lebih TERANG dari --accent, bukan lebih gelap */
--focus:        /* lihat syarat di bawah */
--danger:       /* merah yang lolos syarat kontras, untuk tombol hapus */
```

**Sembilan nama token ini tidak boleh diubah** — `admin.css` mengambilnya dari
`styles.css`. Konsekuensinya: admin panel ikut gelap otomatis. Itu memang
diinginkan.

### Syarat yang wajib diverifikasi, bukan dikira-kira

Tema gelap membalik semua perhitungan kontras yang sudah ada. Periksa dengan
alat pengecek kontras, catat angkanya di `PROGRESS.md`:

1. `--text` di atas `--bg` — minimal 4.5:1
2. `--muted` di atas `--bg` — minimal 4.5:1 (dipakai untuk teks, bukan hiasan)
3. `--accent` di atas `--bg` — minimal 3:1 (dipakai untuk tautan dan label)
4. **Teks di atas tombol `--accent` harus `--bg`, bukan putih.** Putih di atas
   `#d97757` gagal; warna gelap lolos.
5. `--focus` minimal 3:1 terhadap `--bg` **dan** terhadap `--accent` — cincin
   fokus muncul di atas keduanya. `#b45309` yang dipakai sekarang **gagal** di
   latar gelap dan harus diganti.
6. `--danger` minimal 4.5:1 terhadap `--bg`

Aturan lama tetap: tidak ada `outline: none` di mana pun, `:focus-visible`
terlihat jelas di setiap elemen interaktif.

---

## 3. Tipografi

Plus Jakarta Sans dipertahankan untuk isi. Tambahkan **IBM Plex Mono** untuk
label bagian, item nav, dan tanggal — supaya metadata langsung terbaca berbeda
dari isi tanpa mengandalkan warna saja.

```
https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap
```

Bobot 700 ditambahkan khusus untuk nama di kolom kiri. Jangan menambah bobot
lain yang tidak dipakai.

---

## 4. Tata letak

### Lebar ≥ 64rem — dua kolom

```
┌────────────────────────┬────────────────────────┐
│ KOLOM KIRI (sticky)    │ KOLOM KANAN (scroll)   │
│                        │                        │
│ Nama (besar, 700)      │ About                  │
│ Headline (--accent)    │ Experience             │
│ Statement (--muted)    │ Education              │
│                        │ Skills                 │
│ nav                    │                        │
│  — About               │                        │
│  — Experience          │                        │
│  — Education           │                        │
│  — Skills              │                        │
│                        │                        │
│ social (bawah)         │                        │
└────────────────────────┴────────────────────────┘
```

Kolom kiri `position: sticky`, tinggi `100vh`, tidak ikut scroll.

### Lebar < 64rem — satu kolom

Hero kembali ke aliran normal, tidak sticky. **Nav disembunyikan** — di layar
pendek, daftar anchor yang ikut scroll cuma menambah panjang tanpa gunanya.

### Perubahan JSX yang diperlukan

Sticky butuh pembungkus, dan nav butuh sasaran. Totalnya kecil:

1. `App.jsx` — bungkus empat section non-hero dalam `<div className="pane">`.
   Hero tetap sibling langsung `<main>`.
2. `Hero.jsx` — tambahkan `<nav>` berisi empat `<a href="#...">`. Beri
   `aria-label="Navigasi bagian"`.
3. Tiap file di `sections/` — tambahkan `id` pada elemen `<section>`-nya:
   `about`, `experience`, `education`, `skills`.

Tidak ada perubahan JSX lain. Logika pengambilan data, penanganan error, dan
`dateRange.js` tidak disentuh sama sekali.

---

## 5. Navigasi

**Tanpa scroll-spy.** Item aktif tidak mengikuti posisi scroll — itu butuh
IntersectionObserver dan sudah diputuskan di luar lingkup. Yang ada:

- Tiap item: garis pendek horizontal + label mono huruf besar
- Saat hover atau fokus: garis memanjang, warna label naik dari `--muted` ke
  `--text`, transisi ~200ms
- `:focus-visible` harus terlihat, tidak boleh hanya mengandalkan efek hover
- `html { scroll-behavior: smooth }`, dimatikan di blok
  `prefers-reduced-motion: reduce` yang sudah ada

Efek hover apa pun yang dipakai di kartu atau entri harus punya pasangan
`:focus-visible`-nya. Pengguna keyboard tidak boleh kehilangan jejak posisi.

---

## 6. Yang tidak boleh hilang

Semua ini sudah jalan dan mudah rusak saat CSS ditulis ulang:

- Status memuat dan status gagal di halaman publik — matikan backend, refresh,
  harus muncul pesan yang terbaca di tema gelap
- `--measure` untuk lebar baris teks; jangan biarkan paragraf melebar penuh di
  layar lebar
- Halaman terbaca di lebar 360px
- Blok `prefers-reduced-motion`
- Semua form admin tetap terpakai: label terbaca, input berkontras cukup,
  pesan validasi terlihat

---

## 7. Urutan kerja

| # | Task | Verifikasi |
|---|---|---|
| R-1 | Dua perbaikan admin (bagian 1) | Tombol tambah di bawah daftar; ikon punya `aria-label`; konfirmasi hapus masih muncul; navigasi keyboard sampai ke kedua tombol |
| R-2 | Token gelap + font mono | Enam syarat kontras bagian 2 diukur, angkanya dicatat di PROGRESS |
| R-3 | Tata letak dua kolom + nav | Sticky jalan di ≥64rem; satu kolom di bawah itu; anchor melompat ke bagian yang benar |
| — | **CHECKPOINT** | berhenti, lapor |
| R-4 | Poles bagian publik | 360px, 768px, 1440px |
| R-5 | Poles admin di tema gelap | Semua form terpakai; fokus terlihat di tiap kontrol |
| R-6 | Build produksi | `NODE_ENV=production` di `:3000`, publik dan `/admin` dua-duanya benar |

---

## 8. Di luar lingkup

Projects (Phase 3), scroll-spy, dark/light toggle, tombol unduh PDF, meta tag
preview, animasi masuk saat scroll, deploy.

Utang deploy yang masih tercatat dan **tidak** dikerjakan di sini: `ssl` di
`db/pool.js`, `app.set('trust proxy', ...)`.

---

## 9. Definisi selesai

> Halaman publik memakai tema gelap Anthropic. Di layar lebar, kolom kiri diam
> sementara kanan bergulir; di bawah 64rem semuanya satu kolom dan nav
> disembunyikan. Nav melompat ke empat bagian dengan benar. Admin panel ikut
> gelap dan seluruh formnya masih terpakai. Keenam syarat kontras terukur dan
> tercatat. Tombol tambah ada di bawah daftar, edit dan hapus berupa ikon
> ber-`aria-label`. Tidak ada regresi pada status memuat, status gagal, atau
> keterbacaan di 360px.
