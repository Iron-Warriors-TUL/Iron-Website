// Wspólna polityka haseł. Odpowiednik w scripts/lib/accounts.mjs musi pozostać
// zsynchronizowany, bo CLI nie importuje modułów TypeScript.

export const MIN_PASSWORD_LENGTH = 12
export const MAX_PASSWORD_LENGTH = 128

const KNOWN_WEAK_PASSWORDS = new Set([
  'generate-a-long-random-password',
  'change-me-to-a-long-random-string',
  'local-development-secret-change-before-production',
  'ci-only-secret-not-used-in-production-0123456789',
  'password123456',
  'password12345678',
  'admin123456789',
  'administrator',
  'qwerty123456',
  '123456789012',
  'haslo12345678',
])

/** Odrzuca hasła z dokumentacji, powtarzalne i oczywiste wzorce. */
export function isWeakPassword(password: string): boolean {
  const value = password.trim()
  const lower = value.toLowerCase()

  if (KNOWN_WEAK_PASSWORDS.has(lower)) return true
  if (/change[-_ ]?me|generate[-_ ]?a[-_ ]?long|default[-_ ]?password|example[-_ ]?password/i.test(value)) {
    return true
  }
  if (/^(admin|administrator|haslo|password|qwerty|test)[\W_]*\d*$/i.test(value)) return true
  if (/^(.)\1+$/.test(value)) return true

  return false
}

export function passwordPolicyError(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków.`
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Hasło może mieć najwyżej ${MAX_PASSWORD_LENGTH} znaków.`
  }
  if (isWeakPassword(password)) {
    return 'Hasło jest zbyt przewidywalne lub pochodzi z przykładu. Ustaw własne, losowe hasło.'
  }
  return null
}
