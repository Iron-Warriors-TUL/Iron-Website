import type { MetadataRoute } from 'next'
import { getPublishedPosts, getVehicles } from '@/lib/data'
import { getPublishedCustomPages } from '@/lib/content'
import { partners, projectCategories, teams } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.BETTER_AUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const [vehicles, posts, customPages] = await Promise.all([
    getVehicles(),
    getPublishedPosts(),
    getPublishedCustomPages(),
  ])

  const staticPaths = [
    '', '/bolidy', '/projekty', '/kontakt', '/dolacz-do-nas', '/zostan-partnerem', '/blog',
    ...teams.map((t) => `/zespol-${t.year}`),
    ...partners.map((p) => `/partnerzy-${p.year}`),
    ...projectCategories.map((c) => `/projekty-${c.slug}`),
  ]

  return [
    ...staticPaths.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.7,
    })),
    ...vehicles.map((v) => ({
      url: `${base}/bolidy/${v.slug}`,
      lastModified: v.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
    ...customPages.map((page) => ({
      url: `${base}/${page.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
