'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { requireCms } from '@/lib/admin'

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

  failures.delete(userId)
  return { ok: true }
}
