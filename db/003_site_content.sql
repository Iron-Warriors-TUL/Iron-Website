-- Tabela treści strony edytowalnej w panelu CMS.
-- Bezpieczna do wielokrotnego stosowania (idempotentna).

CREATE TABLE IF NOT EXISTS "site_content" (
  "id" SERIAL PRIMARY KEY,
  "area" TEXT NOT NULL,
  "entry_key" TEXT NOT NULL,
  "data" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("area", "entry_key")
);

CREATE INDEX IF NOT EXISTS "site_content_area_idx" ON "site_content"("area");
