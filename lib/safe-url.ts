// Pomocnicze walidatory adresów używane przy zapisie treści CMS.

// Znaki, które w adresie URL mogą zmienić jego interpretację (np. backslash jest
// normalizowany do '/' przez przeglądarki) albo przedostać się do atrybutów CSS/HTML.
const UNSAFE_URL_CHARS = /[\u0000-\u001f\u007f\s"'<>\\]/

/** Ścieżka lokalna: pojedynczy '/' na początku (odrzuca protokołowo-względne '//host'). */
export function isSafePath(value: string): boolean {
  if (!value.startsWith('/') || value.startsWith('//')) return false
  if (UNSAFE_URL_CHARS.test(value)) return false
  try {
    // Backslash i inne obejścia normalizują się do innego origin niż bazowy.
    const url = new URL(value, 'https://local.invalid')
    return url.origin === 'https://local.invalid' && url.pathname.startsWith('/')
  } catch {
    return false
  }
}

/** Zewnętrzne adresy wyłącznie po HTTPS (bez protokołowo-względnych '//host'). */
export function isHttpsUrl(value: string): boolean {
  if (!value || UNSAFE_URL_CHARS.test(value)) return false
  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      Boolean(url.hostname) &&
      url.username === '' &&
      url.password === ''
    )
  } catch {
    return false
  }
}
