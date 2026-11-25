/*
 * Blokada logowania na konto po serii błędnych haseł. Działa w pamięci procesu, co wystarcza
 * przy jednym kontenerze aplikacji (restart kasuje liczniki). Klucz to e-mail, a nie IP,
 * więc podrabianie nagłówka X-Forwarded-For nie pozwala obejść limitu.
 */

type Entry = { count: number; until: number }

export function createLoginLock({
  maxFailures,
  windowMs,
  now = () => Date.now(),
}: {
  maxFailures: number
  windowMs: number
  now?: () => number
}) {
  const failures = new Map<string, Entry>()
  const keyOf = (email: string) => email.trim().toLowerCase().slice(0, 320)

  function current(email: string) {
    const key = keyOf(email)
    const entry = failures.get(key)
    if (entry && now() > entry.until) {
      failures.delete(key)
      return undefined
    }
    return entry
  }

  return {
    isLocked(email: string) {
      if (!email) return false
      return (current(email)?.count ?? 0) >= maxFailures
    },
    recordFailure(email: string) {
      if (!email) return
      const entry = current(email)
      failures.set(keyOf(email), entry ? { ...entry, count: entry.count + 1 } : { count: 1, until: now() + windowMs })
      // Zabezpieczenie przed zapchaniem pamięci losowymi adresami.
      if (failures.size > 10_000) failures.delete(failures.keys().next().value as string)
    },
    reset(email: string) {
      if (email) failures.delete(keyOf(email))
    },
  }
}

/** Lista zaufanych proxy z TRUSTED_PROXIES („10.0.0.1, 172.16.0.0/12”). */
export function parseTrustedProxies(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}
