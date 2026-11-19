import 'server-only'
import { cache } from 'react'
import { and, asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { siteContent } from '@/lib/db/schema'
import { defaultContent, defaultKeys, type Data } from '@/lib/content-registry'

/** Zwraca dane wpisu. Brakujące pola uzupełniają wartości domyślne z rejestru. */
export const getContent = cache(async (area: string, entryKey = 'main'): Promise<Data> => {
  const [row] = await db
    .select({ data: siteContent.data })
    .from(siteContent)
    .where(and(eq(siteContent.area, area), eq(siteContent.entryKey, entryKey)))
    .limit(1)
  return { ...defaultContent(area, entryKey), ...(row?.data ?? {}) }
})

/** Klucze wszystkich wpisów w obszarze — domyślne oraz dodane w CMS. */
export const getEntryKeys = cache(async (area: string): Promise<string[]> => {
  const rows = await db
    .select({ entryKey: siteContent.entryKey })
    .from(siteContent)
    .where(eq(siteContent.area, area))
    .orderBy(asc(siteContent.entryKey))
  return [...new Set([...defaultKeys(area), ...rows.map((r) => r.entryKey)])]
})

export type PersonCard = { name: string; photo: string; portrait: boolean }
export type PartnerCard = { name: string; logo: string; href: string }

export async function getPeopleMap(): Promise<Map<string, PersonCard>> {
  const content = await getContent('people')
  const rows = Array.isArray(content.items) ? (content.items as unknown[][]) : []
  return new Map(
    rows.map((row) => [
      String(row[0] ?? ''),
      { name: String(row[1] ?? ''), photo: String(row[2] ?? ''), portrait: String(row[3] ?? '') === 'tak' },
    ]),
  )
}

export async function getPartnerCardMap(): Promise<Map<string, PartnerCard>> {
  const content = await getContent('partner-catalog')
  const rows = Array.isArray(content.items) ? (content.items as unknown[][]) : []
  return new Map(
    rows.map((row) => [
      String(row[0] ?? ''),
      { name: String(row[1] ?? ''), logo: String(row[2] ?? ''), href: String(row[3] ?? '') },
    ]),
  )
}

export type ContentRow = {
  key: string
  data: Data
  isDefault: boolean
}

export async function listEntries(area: string): Promise<ContentRow[]> {
  const [rows, keys] = await Promise.all([
    db.select({ entryKey: siteContent.entryKey, data: siteContent.data }).from(siteContent).where(eq(siteContent.area, area)),
    getEntryKeys(area),
  ])
  const stored = new Map(rows.map((r) => [r.entryKey, r.data]))
  return keys.map((key) => ({
    key,
    data: { ...defaultContent(area, key), ...(stored.get(key) ?? {}) },
    isDefault: !stored.has(key),
  }))
}

export async function getStoredContent(area: string, entryKey: string): Promise<Data> {
  const [row] = await db
    .select({ data: siteContent.data })
    .from(siteContent)
    .where(and(eq(siteContent.area, area), eq(siteContent.entryKey, entryKey)))
    .limit(1)
  return row?.data ?? {}
}
