CREATE TABLE IF NOT EXISTS teacher_requests (
  user_id BIGINT UNSIGNED PRIMARY KEY,
  display_name VARCHAR(100) NOT NULL,
  institution VARCHAR(150) NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  reviewed_at DATETIME(3) NULL,
  reviewed_by BIGINT UNSIGNED NULL,
  KEY ix_teacher_request_status (status, created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
