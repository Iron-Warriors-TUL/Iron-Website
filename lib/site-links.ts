import 'server-only'
import { getContent, getEntryKeys, getPublishedCustomPages } from '@/lib/content'
import { getPublishedPosts, getVehicles } from '@/lib/data'

export type SiteLink = { label: string; href: string; group: string }

/** Strony serwisu dostępne do wyboru jako pozycje menu. */
export async function getSiteLinks(): Promise<SiteLink[]> {
  const [customPages, vehicles, posts, teamYears, partnerYears, settings] = await Promise.all([
    getPublishedCustomPages(),
    getVehicles(),
    getPublishedPosts(),
    getEntryKeys('team-years'),
    getEntryKeys('partner-years'),
    getContent('settings'),
  ])

  const teams = await Promise.all(teamYears.map((year) => getContent('team-years', year)))
  const projectRows = Array.isArray(settings.projectCategories) ? (settings.projectCategories as unknown[][]) : []

  const links: SiteLink[] = []
  const seen = new Set<string>()
  const add = (label: string, href: string, group: string) => {
    if (!href || seen.has(href)) return
    seen.add(href)
    links.push({ label, href, group })
  }

  add('Strona główna', '/', 'Podstawowe')
  add('Bolidy', '/bolidy', 'Podstawowe')
  add('Blog', '/blog', 'Podstawowe')
  add('Projekty', '/projekty', 'Podstawowe')
  add('Kontakt', '/kontakt', 'Podstawowe')
  add('Dołącz do nas', '/dolacz-do-nas', 'Podstawowe')
  add('Zostań partnerem', '/zostan-partnerem', 'Podstawowe')

  for (const page of customPages) {
    add(String(page.data.title ?? '') || page.slug, `/${page.slug}`, 'Podstrony')
  }

  teamYears.forEach((year, index) => {
    add(String(teams[index]?.label ?? '') || `Zespół ${year}`, `/zespol-${year}`, 'Zespoły')
  })

  for (const year of partnerYears) {
    add(`Partnerzy ${year}`, `/partnerzy-${year}`, 'Partnerzy')
  }

  for (const row of projectRows) {
    const slug = String(row[0] ?? '')
    const title = String(row[1] ?? '')
    if (slug) add(title || slug, `/projekty/${slug}`, 'Projekty')
  }

  for (const vehicle of vehicles) {
    add(vehicle.name, `/bolidy/${vehicle.slug}`, 'Bolidy')
  }

  for (const post of posts) {
    add(post.title, `/blog/${post.slug}`, 'Blog')
  }

  return links
}
