import 'server-only'
import { and, asc, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { navItems, posts, projects, vehicles, type NavItem } from '@/lib/db/schema'
import { buildNavTree } from '@/lib/navigation'

export type NavNode = ReturnType<typeof buildNavTree<NavItem>>[number]

export async function getNavTree(): Promise<NavNode[]> {
  const items = await db.select().from(navItems).orderBy(asc(navItems.sortOrder), asc(navItems.id))
  return buildNavTree(items)
}

export function getVehicles() {
  return db.select().from(vehicles).orderBy(asc(vehicles.sortOrder), desc(vehicles.debutYear))
}

export async function getVehicle(slug: string) {
  const [row] = await db.select().from(vehicles).where(eq(vehicles.slug, slug)).limit(1)
  return row ?? null
}

export function getProjects() {
  return db.select().from(projects).orderBy(asc(projects.sortOrder), desc(projects.period))
}

export function getPublishedPosts(limit?: number) {
  const q = db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.publishedAt), desc(posts.id))
  return limit ? q.limit(limit) : q
}

export async function getPublishedPost(slug: string) {
  const [row] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.published, true)))
    .limit(1)
  return row ?? null
}
