import { randomUUID } from 'node:crypto'
import { hashPassword } from 'better-auth/crypto'

export const MIN_PASSWORD_LENGTH = 12
export const MAX_PASSWORD_LENGTH = 128
export const ROLES = ['admin', 'editor']

export function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase()
}

/**
 * Walidacja danych konta. Lustro reguł z lib/cms-validation.ts, żeby CLI i panel
 * odrzucały dokładnie te same wartości.
 */
export function validateAccountInput({ email, name, password, role }) {
  const normalizedEmail = normalizeEmail(email)
  const normalizedName = String(name ?? '').trim()
  const normalizedRole = ROLES.includes(role) ? role : null
  const rawPassword = String(password ?? '')

  if (!normalizedName || normalizedName.length > 80) {
    return { error: 'Podaj prawidłowe imię i nazwisko (maks. 80 znaków).' }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
    return { error: 'Podaj prawidłowy adres e-mail.' }
  }
  if (!normalizedRole) {
    return { error: 'Nieprawidłowa rola. Dozwolone: admin, editor.' }
  }
  if (rawPassword.length < MIN_PASSWORD_LENGTH) {
    return { error: `Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków.` }
  }
  if (rawPassword.length > MAX_PASSWORD_LENGTH) {
    return { error: `Hasło może mieć najwyżej ${MAX_PASSWORD_LENGTH} znaków.` }
  }

  return {
    data: {
      email: normalizedEmail,
      name: normalizedName,
      role: normalizedRole,
      password: rawPassword,
    },
  }
}

async function setCredentialPassword(client, userId, password) {
  const passwordHash = await hashPassword(password)
  const { rowCount } = await client.query(
    `UPDATE "account" SET "password" = $1, "updatedAt" = NOW()
     WHERE "userId" = $2 AND "providerId" = 'credential'`,
    [passwordHash, userId],
  )
  if (rowCount === 0) {
    await client.query(
      `INSERT INTO "account" ("id", "accountId", "providerId", "userId", "password")
       VALUES ($1, $2, 'credential', $3, $4)`,
      [randomUUID(), userId, userId, passwordHash],
    )
  }
}

/**
 * Tworzy konto lub aktualizuje istniejące (rola / hasło). Nie otwiera transakcji —
 * wywołujący zarządza BEGIN/COMMIT/ROLLBACK.
 */
export async function saveAccount(
  client,
  { email, name, password, role },
  { updatePassword = false, promote = false } = {},
) {
  const normalizedEmail = normalizeEmail(email)
  const { rows } = await client.query(
    'SELECT "id", "role" FROM "user" WHERE "email" = $1',
    [normalizedEmail],
  )
  const existing = rows[0]

  if (!existing) {
    const userId = randomUUID()
    await client.query(
      `INSERT INTO "user" ("id", "name", "email", "emailVerified", "role")
       VALUES ($1, $2, $3, TRUE, $4)`,
      [userId, name, normalizedEmail, role],
    )
    await setCredentialPassword(client, userId, password)
    return { created: true, promoted: false, passwordUpdated: false, userId, role }
  }

  let promoted = false
  if (promote && role === 'admin' && existing.role !== 'admin') {
    await client.query(
      'UPDATE "user" SET "role" = \'admin\', "updatedAt" = NOW() WHERE "id" = $1',
      [existing.id],
    )
    promoted = true
  }

  let passwordUpdated = false
  if (updatePassword) {
    await setCredentialPassword(client, existing.id, password)
    passwordUpdated = true
  }

  return {
    created: false,
    promoted,
    passwordUpdated,
    userId: existing.id,
    role: promoted ? 'admin' : existing.role,
  }
}

/**
 * Idempotentny bootstrap administratora z ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME.
 * Nigdy nie rzuca przy braku lub błędnych zmiennych — kontener ma wystartować nawet
 * po usunięciu danych logowania z .env.
 */
export async function ensureAdminFromEnv(client, log = console.log) {
  const email = normalizeEmail(process.env.ADMIN_EMAIL)
  const password = process.env.ADMIN_PASSWORD ?? ''
  const name = String(process.env.ADMIN_NAME ?? '').trim() || 'Administrator'

  const missing = []
  if (!email) missing.push('ADMIN_EMAIL')
  if (!password) missing.push('ADMIN_PASSWORD')

  if (missing.length > 0) {
    if (missing.length === 2) {
      // Typowa sytuacja po pierwszym wdrożeniu: ADMIN_* usunięte z .env.
      log('[accounts] Bootstrap admina pominięty (ADMIN_* nie ustawione).')
    } else {
      log(`[accounts] Bootstrap admina pominięty: brak ${missing.join(' i ')}.`)
      log('  Docker czyta plik .env obok docker-compose.yml (nie .env.local).')
    }
    return { skipped: true, missing }
  }

  const parsed = validateAccountInput({ email, name, password, role: 'admin' })
  if (parsed.error) {
    log(`[accounts] Pominięto bootstrap admina: ${parsed.error}`)
    return { skipped: true, error: parsed.error }
  }

  const result = await saveAccount(client, parsed.data, { promote: true })
  if (result.created) log(`[accounts] Utworzono konto administratora: ${parsed.data.email}`)
  else if (result.promoted) log(`[accounts] Nadano rolę admin kontu: ${parsed.data.email}`)
  else log(`[accounts] Konto administratora już istnieje: ${parsed.data.email}`)

  return result
}
