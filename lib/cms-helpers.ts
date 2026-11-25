/*
 * Czyste funkcje pomocnicze dla „skrótów” w panelu (dodaj partnera, nowy sezon).
 * Bez bazy i Next.js, testowane w tests/cms-helpers.test.ts.
 */

export type Rows = string[][]

/** Następny wolny identyfikator w stylu istniejących (c042 → c043, p121 → p122). */
export function nextRowId(rows: Rows, prefix: string, width = 3) {
  let max = 0
  for (const row of rows) {
    const match = new RegExp(`^${prefix}(\\d+)$`, 'i').exec(row[0] ?? '')
    if (match) max = Math.max(max, Number(match[1]))
  }
  return `${prefix}${String(max + 1).padStart(width, '0')}`
}

/** Dopisuje partnera do katalogu albo zwraca istniejące Id, jeśli taki sam wpis już jest. */
export function upsertCatalogPartner(rows: Rows, partner: { name: string; logo: string; href: string }) {
  const existing = rows.find(
    (row) => row[1] === partner.name && row[2] === partner.logo && (row[3] ?? '') === partner.href,
  )
  if (existing) return { rows, id: existing[0], added: false }
  const id = nextRowId(rows, 'c')
  return { rows: [...rows, [id, partner.name, partner.logo, partner.href]], id, added: true }
}

/** Rok partnerów (2027) lub sezon zespołu (2026-2027). */
export const PARTNER_YEAR = /^\d{4}$/
export const TEAM_SEASON = /^\d{4}-\d{4}$/

/** Najnowszy klucz rocznika: największy pierwszy rok. */
export function latestKey(keys: string[]) {
  return [...keys].sort((a, b) => Number(b.slice(0, 4)) - Number(a.slice(0, 4)) || b.localeCompare(a))[0]
}

/** Klucze wpisów rocznika w postaci „rok::…”, posortowane po kolejnych liczbach. */
export function keysForYear(keys: string[], year: string) {
  return keys
    .filter((key) => key.startsWith(`${year}::`))
    .sort((a, b) => {
      const pa = a.split('::').slice(1).map(Number)
      const pb = b.split('::').slice(1).map(Number)
      for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const d = (pa[i] ?? 0) - (pb[i] ?? 0)
        if (d) return d
      }
      return 0
    })
}

/** „2026-2027” → „2026/2027” (etykiety w menu i nagłówkach). */
export function seasonLabel(season: string) {
  return season.replace('-', '/')
}
