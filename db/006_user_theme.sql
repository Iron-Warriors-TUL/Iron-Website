-- Preferencja motywu panelu zapisywana per konto (jasny/ciemny).
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "theme" TEXT NOT NULL DEFAULT 'light';
