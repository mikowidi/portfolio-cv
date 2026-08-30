-- =========================================================
-- 002_phase2.sql — Education dan Skills
-- MySQL 8.0+ (butuh CHECK constraint yang benar-benar diterapkan)
--
-- Melanjutkan pola 001: file ini hanya mengurus bentuk tabel, tidak membuat
-- database-nya sendiri. `skill_groups → skills` sengaja dibuat identik dengan
-- `experiences → experience_highlights` supaya service dan form adminnya bisa
-- mengikuti bentuk yang sudah terbukti.
-- =========================================================

CREATE TABLE education (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  qualification VARCHAR(160) NOT NULL,   -- "S1 Sistem Informasi"
  org           VARCHAR(160) NOT NULL,   -- "Universitas Terbuka"
  location      VARCHAR(120) NULL,
  start_date    DATE         NOT NULL,
  end_date      DATE         NULL,       -- NULL = masih berjalan
  note          VARCHAR(200) NULL,       -- "tidak dilanjutkan", "cum laude"
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
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
