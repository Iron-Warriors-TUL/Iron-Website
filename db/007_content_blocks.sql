-- Modułowe bloki treści dla wpisów bloga, bolidów i projektów.
-- Dzięki temu każdą z tych stron można zbudować z tych samych sekcji co podstrony CMS.

ALTER TABLE "posts"
  ADD COLUMN IF NOT EXISTS "blocks" JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE "vehicles"
  ADD COLUMN IF NOT EXISTS "blocks" JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE "projects"
  ADD COLUMN IF NOT EXISTS "blocks" JSONB NOT NULL DEFAULT '[]'::jsonb;
