# Portfolio CV

Portfolio satu halaman dengan admin panel. Project latihan full-stack: backend,
REST API, dan relational database ditulis manual — tanpa ORM, tanpa library auth,
tanpa UI library.

Ruang lingkup dan urutan kerja ada di [PHASE-1-HANDOFF.md](PHASE-1-HANDOFF.md).

## Stack

| Lapisan | Pilihan |
|---|---|
| Frontend | Vite + React (JavaScript) — *belum ada, task 5* |
| Backend | Node 20+ · Express 4 · ESM |
| Database | MySQL 8.0+ — *belum ada, task 2* |
| Driver | `mysql2/promise`, SQL mentah + prepared statement |

## Menjalankan backend

Butuh **Node.js 20 atau lebih baru**.

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Di Windows PowerShell, ganti `cp` dengan `Copy-Item .env.example .env`.

Server menolak menyala kalau ada environment variable yang belum diisi —
pesan errornya menyebutkan variabel mana yang kurang.

## Verifikasi

```bash
curl http://localhost:3000/api/v1/health
```

Harus menghasilkan `{"ok":true}`.

## Progres

Catatan lengkap — keputusan, verifikasi, dan utang yang belum dibayar — ada di
[PROGRESS.md](PROGRESS.md).

- [x] Task 1 — skeleton repo, backend Express, `GET /api/v1/health`
- [x] Task 2 — migrasi + seed
- [ ] Task 3 — `GET /api/v1/experiences`
- [ ] Task 4 — `GET /api/v1/profile`
- [ ] Task 5 — frontend Vite, render Hero/About/Experience
- [ ] Task 6 — auth
- [ ] Task 7 — admin panel
- [ ] Task 8 — build produksi + deploy
- [ ] Task 9 — styling
