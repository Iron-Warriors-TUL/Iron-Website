-- Opcjonalna belka z informacją o dofinansowaniu (wymóg ministerstwa), per projekt.
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "funding_bar" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "funding_bar_text" TEXT NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "funding_bar_logo" TEXT NOT NULL DEFAULT '';
