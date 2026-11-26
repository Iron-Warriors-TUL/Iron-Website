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

function ipv4ToNumber(ip: string): number | null {
  const parts = ip.split('.')
  if (parts.length !== 4) return null
  let value = 0
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null
    const octet = Number(part)
    if (octet > 255) return null
    value = (value << 8) | octet
  }
  return value >>> 0
}

function isTrustedProxy(ip: string, trustedProxies: string[]): boolean {
  const value = ipv4ToNumber(ip)
  for (const entry of trustedProxies) {
    if (entry === ip) return true
    const [base, bitsRaw] = entry.split('/')
    if (!base || bitsRaw === undefined) continue
    const baseValue = ipv4ToNumber(base)
    const bits = Number(bitsRaw)
    if (value === null || baseValue === null || !Number.isInteger(bits) || bits < 0 || bits > 32) continue
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0
    if ((value & mask) === (baseValue & mask)) return true
  }
  return false
}

/**
 * Adres klienta do limitów logowania, wyliczony z nagłówka proxy. Bez listy zaufanych
 * proxy akceptujemy tylko pojedynczy adres (łańcuch z dopisanymi adresami da się podrobić).
 * Przy skonfigurowanych proxy bierzemy pierwszy adres od prawej spoza ich listy.
 */
export function resolveClientIp(
  headers: Headers,
  { headerName = 'x-forwarded-for', trustedProxies = [] }: { headerName?: string; trustedProxies?: string[] } = {},
): string | null {
  const raw = headers.get(headerName)
  if (!raw) return null
  const addresses = raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (addresses.length === 0) return null
  if (trustedProxies.length === 0) return addresses.length === 1 ? (addresses[0] ?? null) : null
  for (let i = addresses.length - 1; i >= 0; i--) {
    const address = addresses[i]
    if (address && !isTrustedProxy(address, trustedProxies)) return address
  }
  return null
}
