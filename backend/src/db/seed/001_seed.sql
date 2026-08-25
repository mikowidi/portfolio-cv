-- =========================================================
-- 001_seed.sql — Phase 1
-- Data asli, bukan placeholder.
--
-- Password admin TIDAK ada di file ini. User admin dibuat lewat skrip
-- `npm run create-admin` (task 6) supaya hash argon2 tidak pernah ikut
-- ter-commit ke git.
--
-- Dibungkus transaksi: file ini dirancang jalan SEKALI di database kosong.
-- Kalau dijalankan dua kali, INSERT profile id=1 gagal karena primary key
-- bentrok, dan seluruh isinya di-ROLLBACK — bukan separuh masuk separuh tidak.
-- =========================================================

START TRANSACTION;

INSERT INTO profile
  (id, full_name, headline, hero_statement, about_md, location, email, photo_url)
VALUES (
  1,
  'Amadeus Thareq Widhi Dhyatmiko',
  'Master Data Administrator',
  'Mengurus data harga dan produk untuk jaringan ritel di Bali, lalu membangun sendiri alat yang memotong kerja manualnya.',
  'Latar belakang saya campuran: administrasi data, pembukuan, dan desain.

Sekarang saya mengurus master data harga dan produk untuk tiga cabang ritel di Bali. Bagian yang paling menarik buat saya bukan input datanya, tapi menemukan kerja manual yang berulang lalu membangun alat untuk memotongnya — generator form cek stok berbasis Excel VBA, pembanding harga yang membaca file export, workbook formula-only supaya tetap jalan di komputer toko.

Sebelum itu saya mengurus operasional dan pembukuan sebuah unit usaha di Kairo, dan sempat menggarap desain cover buku serta kalender sekolah tahunan di Ponorogo.

Sekarang saya sedang belajar membangun hal yang sama di luar Excel — backend, API, dan basis data relasional. Situs ini salah satu latihannya.',
  'Denpasar, Bali',
  'mmikowidi@gmail.com',
  NULL
);

INSERT INTO social_links (profile_id, label, url, sort_order) VALUES
  (1, 'LinkedIn', 'https://linkedin.com/in/thareqdeus', 0),
  (1, 'Email',    'mailto:mmikowidi@gmail.com',        1);

-- id ditulis eksplisit supaya highlight di bawah bisa menunjuk induknya
-- tanpa bergantung pada nilai AUTO_INCREMENT yang kebetulan terjadi.
INSERT INTO experiences
  (id, position, org, location, employment_type, start_date, end_date, summary)
VALUES
  (1, 'Master Data Administrator', 'I-Thon Mart (PT I-Thon Group)', 'Bali',
      'full_time', '2025-11-01', NULL, NULL),
  (2, 'Business Unit Staff / Bookkeeper', 'Wisma Nusantara', 'Kairo, Mesir',
      'full_time', '2024-01-01', '2025-05-31', NULL),
  (3, 'Printing & Design Staff', 'Darussalam Press', 'Gontor, Ponorogo',
      'full_time', '2018-08-01', '2019-08-31', NULL);

INSERT INTO experience_highlights (experience_id, body, sort_order) VALUES
  (1, 'Mengelola data harga dan master produk untuk tiga cabang toko.', 0),
  (1, 'Membangun generator form cek stok berbasis Excel VBA; penyiapan form yang tadinya 5-15 menit per permintaan turun jadi 2-3 menit.', 1),
  (1, 'Membangun pembanding harga berbasis Excel yang membaca file export dan menampilkan harga lama dan baru per size, dipakai untuk rekondisi stok gudang.', 2),
  (1, 'Merancang ulang workbook harga produk segar jadi formula-only agar tetap jalan saat dibuka lewat Collabora di komputer toko.', 3),

  (2, 'Mengelola operasional guest room dan auditorium.', 0),
  (2, 'Pencatatan keuangan harian dan rekapitulasi bulanan.', 1),
  (2, 'Merangkap desainer media sosial unit usaha.', 2),

  (3, 'Desain cover buku dan proyek kalender sekolah tahunan.', 0);

COMMIT;
