ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS "twoFactor" (
  "id" TEXT PRIMARY KEY,
  "secret" TEXT NOT NULL,
  "backupCodes" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "verified" BOOLEAN DEFAULT TRUE,
  "failedVerificationCount" INTEGER DEFAULT 0,
  "lockedUntil" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "twoFactor_userId_idx" ON "twoFactor"("userId");

CREATE TABLE IF NOT EXISTS "passkey" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "publicKey" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "credentialID" TEXT NOT NULL UNIQUE,
  "counter" BIGINT NOT NULL DEFAULT 0,
  "deviceType" TEXT NOT NULL,
  "backedUp" BOOLEAN NOT NULL DEFAULT FALSE,
  "transports" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "aaguid" TEXT
);
CREATE INDEX IF NOT EXISTS "passkey_userId_idx" ON "passkey"("userId");
