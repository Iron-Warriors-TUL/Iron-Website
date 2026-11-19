import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.BETTER_AUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/iw-panel-7k2q/', '/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
