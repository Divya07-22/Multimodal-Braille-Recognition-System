-- MySQL 8 Database Setup Script for Braille Conversion Tool
-- Run this script as root user

CREATE DATABASE IF NOT EXISTS braille_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'braille_user'@'localhost' IDENTIFIED BY 'divdev123';
GRANT ALL PRIVILEGES ON braille_db.* TO 'braille_user'@'localhost';
FLUSH PRIVILEGES;

USE braille_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL UNIQUE,
  hashed_password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role ENUM('admin', 'user', 'guest') DEFAULT 'user' NOT NULL,
  is_active TINYINT(1) DEFAULT 1 NOT NULL,
  is_verified TINYINT(1) DEFAULT 0 NOT NULL,
  avatar_url VARCHAR(512),
  refresh_token TEXT,
  high_contrast TINYINT(1) DEFAULT 0,
  font_size VARCHAR(10) DEFAULT 'medium',
  screen_reader TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_email (email),
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(512) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  doc_type ENUM('image', 'pdf', 'text') NOT NULL,
  status ENUM('uploaded', 'processing', 'completed', 'failed') DEFAULT 'uploaded',
  storage_url VARCHAR(512),
  checksum VARCHAR(64),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conversion Jobs Table
CREATE TABLE IF NOT EXISTS conversion_jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  document_id INT,
  job_type ENUM('text_to_braille', 'image_to_braille', 'braille_to_text', 'pdf_to_braille') NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending' NOT NULL,
  braille_grade ENUM('grade_1', 'grade_2') DEFAULT 'grade_1',
  input_text MEDIUMTEXT,
  output_braille MEDIUMTEXT,
  output_text MEDIUMTEXT,
  processing_time_ms FLOAT,
  confidence_score FLOAT,
  word_count INT,
  character_count INT,
  error_message TEXT,
  export_formats JSON,
  export_urls JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_type (job_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inference Results Table
CREATE TABLE IF NOT EXISTS inference_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  model_version VARCHAR(50),
  confidence FLOAT,
  raw_output JSON,
  bounding_boxes JSON,
  braille_cells JSON,
  processing_time_ms FLOAT,
  error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (job_id) REFERENCES conversion_jobs(id) ON DELETE CASCADE,
  INDEX idx_job (job_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action ENUM('login', 'logout', 'register', 'password_change', 'upload', 'convert', 'export', 'delete', 'profile_update') NOT NULL,
  resource_type VARCHAR(100),
  resource_id INT,
  ip_address VARCHAR(45),
  user_agent VARCHAR(512),
  extra_data JSON,
  success TINYINT(1) DEFAULT 1 NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_action (user_id, action),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: Admin@123)
-- bcrypt hash for 'Admin@123'
INSERT IGNORE INTO users (email, username, hashed_password, full_name, role, is_active, is_verified)
VALUES (
  'admin@brailleai.com',
  'admin',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewbQlZx1T6dMlTBW', -- placeholder
  'System Administrator',
  'admin',
  1,
  1
);

SELECT 'Database setup complete!' AS status;
