-- Correos privados para identificación administrativa. Conserva cuentas previas.
-- NULL queda reservado a cuentas anteriores a esta migración.
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(254)
  CHARACTER SET ascii COLLATE ascii_general_ci NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email ON users (email);
