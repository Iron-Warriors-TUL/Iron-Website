import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.BETTER_AUTH_URL ?? process.env.RENDER_EXTERNAL_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  // Wersja podglądowa (np. Render) nie powinna trafić do wyszukiwarek.
  if (process.env.SITE_NOINDEX === 'true') {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/iw-panel-7k2q/', '/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
