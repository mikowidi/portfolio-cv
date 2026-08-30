-- =========================================================
-- 002_phase2.sql — Phase 2
-- Data asli, bukan placeholder.
--
-- Dibungkus transaksi dengan alasan yang sama seperti 001_seed: file ini
-- dirancang jalan SEKALI. Kalau dijalankan dua kali, INSERT skill_groups
-- gagal karena `uq_skill_group_name` bentrok, dan seluruh isinya di-ROLLBACK
-- — bukan separuh masuk separuh tidak.
--
-- Tanggal Gontor dan UT masih perkiraan bulan (QA pemilik, handoff bagian 2).
-- Kolomnya DATE jadi harus diisi sesuatu; nilai di bawah dipakai apa adanya
-- dan bisa diperbaiki lewat admin panel di P2-4 tanpa menyentuh SQL.
-- =========================================================

START TRANSACTION;

INSERT INTO education
  (qualification, org, location, start_date, end_date, note)
VALUES
  ('S1 Sistem Informasi', 'Universitas Terbuka', NULL,
      '2025-08-01', NULL, NULL),
  ('Syariah dan Hukum', 'Al-Azhar University', 'Kairo, Mesir',
      '2021-01-01', '2025-05-31', 'tidak dilanjutkan'),
  ('Pendidikan Menengah', 'Pondok Modern Darussalam Gontor', NULL,
      '2012-07-01', '2018-06-30', NULL);

-- id ditulis eksplisit supaya skill di bawah bisa menunjuk grupnya tanpa
-- bergantung pada nilai AUTO_INCREMENT yang kebetulan terjadi.
INSERT INTO skill_groups (id, name, sort_order) VALUES
  (1, 'Data & spreadsheet', 0),
  (2, 'Bangun aplikasi',    1),
  (3, 'Desain & lainnya',   2);

INSERT INTO skills (group_id, name, sort_order) VALUES
  (1, 'Master data produk dan harga',  0),
  (1, 'Excel lanjutan & VBA',          1),
  (1, 'Pembersihan dan validasi data', 2),
  (1, 'Google Sheets',                 3),
  (1, 'Pembukuan dasar',               4),

  (2, 'JavaScript',        0),
  (2, 'React',             1),
  (2, 'HTML/CSS',          2),
  (2, 'Supabase',          3),
  (2, 'Node.js & Express', 4),
  (2, 'MySQL',             5),
  (2, 'Python',            6),
  (2, 'Git',               7),

  (3, 'Desain grafis materi promosi',         0),
  (3, 'Dokumentasi SOP',                      1),
  (3, 'Dukungan IT dan perawatan perangkat',  2);

COMMIT;
