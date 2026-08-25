-- =========================================================
-- 001_init.sql — Phase 1
-- MySQL 8.0+ (butuh CHECK constraint yang benar-benar diterapkan)
--
-- File ini TIDAK membuat database-nya sendiri. Pembuatan database adalah
-- keputusan operasional (nama, charset, siapa pemiliknya), sementara file ini
-- hanya mengurus bentuk tabel. Jalankan CREATE DATABASE lebih dulu, lalu
-- arahkan file ini ke database tersebut.
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
