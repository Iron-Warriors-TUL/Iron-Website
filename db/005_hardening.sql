-- Hardening: minimalne uprawnienia domyślne (nowe konta bez jawnie ustawionej roli
-- dostają 'editor'). Seed tworzy administratora z jawną rolą 'admin'.
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'editor';
