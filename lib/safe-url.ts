// Pomocnicze walidatory adresów używane przy zapisie treści CMS.

/** Ścieżka lokalna: pojedynczy '/' na początku (odrzuca protokołowo-względne '//host'). */
export function isSafePath(value: string): boolean {
  return /^\/(?!\/)/.test(value)
}

/** Zewnętrzne adresy wyłącznie po HTTPS (bez protokołowo-względnych '//host'). */
export function isHttpsUrl(value: string): boolean {
  return /^https:\/\/[^\s]+$/.test(value)
}
