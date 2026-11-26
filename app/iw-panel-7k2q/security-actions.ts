'use server'

import { cookies, headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { requireCms } from '@/lib/admin'
import { pool } from '@/lib/db'
import { writeAuditLog } from '@/lib/audit'

type Result = { ok?: boolean; error?: string }

// Ochrona przed zgadywaniem kodu przy wyłączaniu 2FA: maks. 5 błędnych prób na 15 minut na konto.
const MAX_FAILURES = 5
const WINDOW_MS = 15 * 60 * 1000
const failures = new Map<string, { count: number; until: number }>()

function isLocked(userId: string) {
  const entry = failures.get(userId)
  if (!entry) return false
  if (Date.now() > entry.until) {
    failures.delete(userId)
    return false
  }
  return entry.count >= MAX_FAILURES
}

function recordFailure(userId: string) {
  const entry = failures.get(userId)
  const fresh = !entry || Date.now() > entry.until
  failures.set(userId, { count: fresh ? 1 : entry.count + 1, until: fresh ? Date.now() + WINDOW_MS : entry.until })
}

/**
 * Wyłącza 2FA tylko po podaniu aktualnego hasła ORAZ kodu z aplikacji (6 cyfr) albo kodu zapasowego.
 * Bezpośrednie wywołanie /two-factor/disable z przeglądarki jest zablokowane w lib/auth.ts.
 */
export async function disableTwoFactor(password: string, rawCode: string): Promise<Result> {
  const session = await requireCms()
  const userId = session.user.id
  if (!session.user.twoFactorEnabled) return { error: '2FA nie jest włączone.' }
  if (isLocked(userId)) return { error: 'Zbyt wiele błędnych prób. Spróbuj ponownie za 15 minut.' }

  const code = rawCode.trim()
  if (!password || !code) return { error: 'Podaj hasło i kod.' }
  const requestHeaders = await headers()

  try {
    if (/^\d{6}$/.test(code)) {
      await auth.api.verifyTOTP({ body: { code }, headers: requestHeaders })
    } else {
      await auth.api.verifyBackupCode({ body: { code }, headers: requestHeaders })
    }
  } catch {
    recordFailure(userId)
    return { error: 'Nieprawidłowy kod z aplikacji lub kod zapasowy.' }
  }

  try {
    await auth.api.disableTwoFactor({ body: { password }, headers: requestHeaders })
  } catch {
    recordFailure(userId)
    return { error: 'Nieprawidłowe hasło.' }
  }

  // Zmiana 2FA unieważnia pozostałe sesje i zaufane urządzenia.
  await pool.query('DELETE FROM "session" WHERE "userId" = $1 AND "token" <> $2', [
    userId,
    session.session.token,
  ])
  await pool.query(
    `DELETE FROM "verification"
     WHERE "value" = $1 AND "identifier" LIKE 'trust-device-%'`,
    [userId],
  )
  await writeAuditLog(pool, {
    actorId: userId,
    action: 'account.two_factor_disabled',
    targetType: 'user',
    targetId: userId,
  })

  failures.delete(userId)
  return { ok: true }
}

/** Unieważnia wszystkie zaufane urządzenia (ciasteczka „trust_device”) bieżącego użytkownika. */
export async function revokeTrustedDevices(): Promise<Result> {
  const session = await requireCms()
  await pool.query(
    `DELETE FROM "verification"
     WHERE "value" = $1 AND "identifier" LIKE 'trust-device-%'`,
    [session.user.id],
  )

  const cookieStore = await cookies()
  for (const name of ['better-auth.trust_device', '__Secure-better-auth.trust_device']) {
    cookieStore.delete(name)
  }
  return { ok: true }
}
