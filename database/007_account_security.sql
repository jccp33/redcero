ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_e164 VARCHAR(15) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at DATETIME(3) NULL;

CREATE TABLE IF NOT EXISTS account_challenges (
  token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  purpose ENUM('phone_verify','password_reset') NOT NULL,
  channel ENUM('email','sms') NOT NULL,
  destination VARCHAR(254) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  credential_stamp CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  expires_at DATETIME(3) NOT NULL,
  consumed_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY ix_challenge_user_time (user_id,created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
