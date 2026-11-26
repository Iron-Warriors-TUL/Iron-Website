-- Dziennik zdarzeń bezpieczeństwa i zmian w panelu (logowanie, konta, uploady, treść).
CREATE TABLE IF NOT EXISTS "audit_log" (
  "id" SERIAL PRIMARY KEY,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "targetType" TEXT,
  "targetId" TEXT,
  "details" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "audit_log_actor_created_idx" ON "audit_log"("actorId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "audit_log_action_created_idx" ON "audit_log"("action", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "audit_log_target_idx" ON "audit_log"("targetType", "targetId");
