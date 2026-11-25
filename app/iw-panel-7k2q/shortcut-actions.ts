'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { and, eq, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { navItems, siteContent } from '@/lib/db/schema'
import { ADMIN_PATH, requireAdmin, requireCms } from '@/lib/admin'
import { getContent, getEntryKeys } from '@/lib/content'
import type { Data } from '@/lib/content-registry'
import { imageUrl } from '@/lib/cms-validation'
import { isHttpsUrl } from '@/lib/safe-url'
import {
  keysForYear,
  latestKey,
  PARTNER_YEAR,
  seasonLabel,
  TEAM_SEASON,
  upsertCatalogPartner,
  type Rows,
} from '@/lib/cms-helpers'

type Result = { ok?: boolean; error?: string; message?: string }

const rowsOf = (value: unknown): Rows =>
  Array.isArray(value) ? (value as unknown[][]).map((row) => (Array.isArray(row) ? row.map((c) => String(c ?? '')) : [String(row)])) : []

async function saveEntry(area: string, entryKey: string, data: Data) {
  const [existing] = await db
    .select({ id: siteContent.id })
    .from(siteContent)
    .where(and(eq(siteContent.area, area), eq(siteContent.entryKey, entryKey)))
    .limit(1)
  if (existing) {
    await db.update(siteContent).set({ data, updatedAt: new Date() }).where(eq(siteContent.id, existing.id))
  } else {
    await db.insert(siteContent).values({ area, entryKey, data })
  }
}

/**
 * „Dodaj partnera” w jednym kroku: wpis w katalogu + dopięcie do wybranej grupy rocznika.
 * Dotąd trzeba było osobno edytować katalog i grupę, przepisując Id.
 */
export async function addPartner(_: Result, fd: FormData): Promise<Result> {
  await requireCms()
  const name = String(fd.get('name') ?? '').trim().slice(0, 120)
  const href = String(fd.get('href') ?? '').trim().slice(0, 500)
  const groupKey = String(fd.get('group') ?? '')
  const logoParsed = imageUrl.safeParse(String(fd.get('logo') ?? ''))

  if (!name) return { error: 'Podaj nazwę partnera.' }
  if (!logoParsed.success || !logoParsed.data) return { error: 'Dodaj logo (prześlij plik lub podaj ścieżkę /images/…).' }
  if (href && !isHttpsUrl(href)) return { error: 'Link musi zaczynać się od https://' }
  const groupKeys = await getEntryKeys('partner-groups')
  if (groupKey && !groupKeys.includes(groupKey)) return { error: 'Wybrana grupa nie istnieje.' }

  const catalog = await getContent('partner-catalog', 'main')
  const { rows, id, added } = upsertCatalogPartner(rowsOf(catalog.items), { name, logo: logoParsed.data, href })
  if (added) await saveEntry('partner-catalog', 'main', { ...catalog, items: rows })

  if (groupKey) {
    const group = await getContent('partner-groups', groupKey)
    const items = rowsOf(group.items)
    if (!items.some((row) => row[0] === id)) await saveEntry('partner-groups', groupKey, { ...group, items: [...items, [id]] })
  }

  revalidatePath('/', 'layout')
  const year = groupKey.split('::')[0]
  return { ok: true, message: groupKey ? `Dodano „${name}” do partnerów ${year}.` : `Dodano „${name}” do katalogu partnerów.` }
}

async function addNavChild(parentLabelPrefix: string, label: string, href: string, makeCurrent: boolean) {
  const parents = await db.select().from(navItems).where(isNull(navItems.parentId))
  const parent = parents.find((item) => item.label.toLowerCase().startsWith(parentLabelPrefix))
  if (!parent) return
  const children = await db.select().from(navItems).where(eq(navItems.parentId, parent.id))
  if (children.some((child) => child.href === href)) return
  const first = Math.min(0, ...children.map((child) => child.sortOrder))
  await db.insert(navItems).values({ label, href, parentId: parent.id, sortOrder: first - 10 })
  if (makeCurrent) await db.update(navItems).set({ href }).where(eq(navItems.id, parent.id))
}

/**
 * Kreator nowego sezonu: zakłada rocznik partnerów i/lub zespołu na wzór najnowszego,
 * opcjonalnie kopiuje skład i dopisuje linki w menu.
 */
export async function createSeason(_: Result, fd: FormData): Promise<Result> {
  await requireAdmin()
  const partnerYear = String(fd.get('partnerYear') ?? '').trim()
  const teamSeason = String(fd.get('teamSeason') ?? '').trim()
  const copyMembers = fd.get('copyMembers') === 'on'
  const addToMenu = fd.get('addToMenu') === 'on'

  if (!partnerYear && !teamSeason) return { error: 'Podaj rok partnerów lub sezon zespołu.' }
  if (partnerYear && !PARTNER_YEAR.test(partnerYear)) return { error: 'Rok partnerów wpisz jako 4 cyfry, np. 2027.' }
  if (teamSeason && !TEAM_SEASON.test(teamSeason)) return { error: 'Sezon zespołu wpisz jako np. 2026-2027.' }

  const done: string[] = []

  if (partnerYear) {
    const years = await getEntryKeys('partner-years')
    if (years.includes(partnerYear)) return { error: `Partnerzy ${partnerYear} już istnieją.` }
    const source = latestKey(years)
    const groupKeys = await getEntryKeys('partner-groups')
    await saveEntry('partner-years', partnerYear, await getContent('partner-years', source))
    const sourceGroups = keysForYear(groupKeys, source)
    for (const key of sourceGroups.length ? sourceGroups : [`${source}::0::0`]) {
      const group = await getContent('partner-groups', key)
      const newKey = key.replace(`${source}::`, `${partnerYear}::`)
      await saveEntry('partner-groups', newKey, { ...group, year: partnerYear, items: copyMembers ? group.items ?? [] : [] })
    }
    if (addToMenu) await addNavChild('partnerzy', `Partnerzy ${partnerYear}`, `/partnerzy-${partnerYear}`, true)
    done.push(`Partnerzy ${partnerYear}`)
  }

  if (teamSeason) {
    const seasons = await getEntryKeys('team-years')
    if (seasons.includes(teamSeason)) return { error: `Zespół ${seasonLabel(teamSeason)} już istnieje.` }
    const source = latestKey(seasons)
    const sectionKeys = await getEntryKeys('team-sections')
    const yearData = await getContent('team-years', source)
    await saveEntry('team-years', teamSeason, { ...yearData, label: `Zespół ${seasonLabel(teamSeason)}` })
    for (const key of keysForYear(sectionKeys, source)) {
      const section = await getContent('team-sections', key)
      await saveEntry('team-sections', key.replace(`${source}::`, `${teamSeason}::`), {
        ...section,
        year: teamSeason,
        members: copyMembers ? section.members ?? [] : [],
      })
    }
    if (addToMenu) await addNavChild('zespół', `Zespół ${seasonLabel(teamSeason)}`, `/zespol-${teamSeason}`, true)
    done.push(`Zespół ${seasonLabel(teamSeason)}`)
  }

  revalidatePath('/', 'layout')
  redirect(`${ADMIN_PATH}/partnerzy?sezon=${encodeURIComponent(done.join(', '))}`)
}
