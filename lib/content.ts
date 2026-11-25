import 'server-only'
import { cache } from 'react'
import { and, asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { siteContent } from '@/lib/db/schema'
import { defaultContent, defaultKeys, type Data } from '@/lib/content-registry'
import { parseBlocks } from '@/lib/blocks'
import {
  becomePartnerBlocks,
  blogListBlocks,
  contactBlocks,
  customPageBlocks,
  homeBlocks,
  partnerYearBlocks,
  projectsListBlocks,
  recruitmentBlocks,
  teamYearBlocks,
  vehicleListBlocks,
} from '@/lib/page-blocks'
import { isValidPageSlug } from '@/lib/page-slug'

const rows = (value: unknown): unknown[][] => (Array.isArray(value) ? (value as unknown[][]) : [])

/**
 * Strony zbudowane wcześniej z klasycznych pól dostają automatycznie listę
 * bloków. Gdy w bazie są już zapisane bloki, nic nie zmieniamy.
 */
export async function applyPageBlocks(area: string, entryKey: string, data: Data): Promise<Data> {
  if (parseBlocks(data.blocks).length > 0) return data

  switch (area) {
    case 'home': {
      const featured = rows(data.featured)
        .map((row) => String(row[0] ?? ''))
        .filter(Boolean)
      const contents = await Promise.all(featured.map((slug) => getContent('home-vehicles', slug)))
      return {
        ...data,
        blocks: homeBlocks(
          data,
          featured.map((slug, index) => ({ slug, data: contents[index] ?? {} })),
        ),
      }
    }
    case 'contact':
      return { ...data, blocks: contactBlocks(data) }
    case 'recruitment': {
      const keys = await getEntryKeys('recruitment-departments')
      const departments = await Promise.all(keys.map((key) => getContent('recruitment-departments', key)))
      return { ...data, blocks: recruitmentBlocks(data, departments) }
    }
    case 'become-partner':
      return { ...data, blocks: becomePartnerBlocks(data) }
    case 'vehicle-list':
      return { ...data, blocks: vehicleListBlocks(data) }
    case 'blog-list':
      return { ...data, blocks: blogListBlocks() }
    case 'projects-list':
      return { ...data, blocks: projectsListBlocks() }
    case 'team-years':
      return { ...data, blocks: teamYearBlocks(data, entryKey) }
    case 'partner-years':
      return { ...data, blocks: partnerYearBlocks(data, entryKey) }
    case 'pages':
      return { ...data, blocks: customPageBlocks(data) }
    default:
      return data
  }
}

/** Zwraca dane wpisu. Brakujące pola uzupełniają wartości domyślne z rejestru. */
export const getContent = cache(async (area: string, entryKey = 'main'): Promise<Data> => {
  const [row] = await db
    .select({ data: siteContent.data })
    .from(siteContent)
    .where(and(eq(siteContent.area, area), eq(siteContent.entryKey, entryKey)))
    .limit(1)
  return applyPageBlocks(area, entryKey, { ...defaultContent(area, entryKey), ...(row?.data ?? {}) })
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
  return Promise.all(
    keys.map(async (key) => ({
      key,
      data: await applyPageBlocks(area, key, { ...defaultContent(area, key), ...(stored.get(key) ?? {}) }),
      isDefault: !stored.has(key),
    })),
  )
}

export async function getStoredContent(area: string, entryKey: string): Promise<Data> {
  const [row] = await db
    .select({ data: siteContent.data })
    .from(siteContent)
    .where(and(eq(siteContent.area, area), eq(siteContent.entryKey, entryKey)))
    .limit(1)
  return row?.data ?? {}
}

/** Podstrona istnieje tylko wtedy, gdy ma zapisane dane i nie jest ukryta. */
export async function getCustomPage(slug: string): Promise<Data | null> {
  const stored = await getStoredContent('pages', slug)
  if (Object.keys(stored).length === 0) return null
  const page = await applyPageBlocks('pages', slug, { ...defaultContent('pages', slug), ...stored })
  return page.published === false ? null : page
}

export async function getPublishedCustomPages(): Promise<{ slug: string; data: Data }[]> {
  const keys = (await getEntryKeys('pages')).filter(isValidPageSlug)
  const pages = await Promise.all(
    keys.map(async (slug) => {
      const data = await getCustomPage(slug)
      return data ? { slug, data } : null
    }),
  )
  return pages.filter((page): page is { slug: string; data: Data } => page !== null)
}
