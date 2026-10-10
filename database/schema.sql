-- Betting Tips & Slip Code Sharing Platform
-- Database schema (MySQL / MariaDB)
-- Only three tables: users, betting_companies, tips

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  username VARCHAR(60) NOT NULL,
  email VARCHAR(160) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'tipster') NOT NULL DEFAULT 'tipster',
  status ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role),
  KEY idx_users_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS betting_companies (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  logo VARCHAR(255) DEFAULT NULL,
  website_url VARCHAR(255) NOT NULL,
  status ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_companies_name (name),
  KEY idx_companies_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tips (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tipster_id INT UNSIGNED NOT NULL,
  company_id INT UNSIGNED NOT NULL,
  title VARCHAR(180) NOT NULL,
  slip_code VARCHAR(60) NOT NULL,
  total_odds DECIMAL(8, 2) NOT NULL,
  description TEXT DEFAULT NULL,
  status ENUM('pending', 'won', 'lost', 'void') NOT NULL DEFAULT 'pending',
  views INT UNSIGNED NOT NULL DEFAULT 0,
  copy_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tips_tipster (tipster_id),
  KEY idx_tips_company (company_id),
  KEY idx_tips_status (status),
  KEY idx_tips_created (created_at),
  CONSTRAINT fk_tips_tipster FOREIGN KEY (tipster_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_tips_company FOREIGN KEY (company_id)
    REFERENCES betting_companies (id) ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
