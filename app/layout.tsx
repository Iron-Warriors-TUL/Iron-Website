import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Exo } from 'next/font/google'
import './globals.css'

const exo = Exo({ subsets: ['latin', 'latin-ext'], variable: '--font-exo' })

const siteUrl = process.env.BETTER_AUTH_URL ?? process.env.RENDER_EXTERNAL_URL ?? 'http://localhost:3000'
const siteName = 'Iron Warriors'
const siteDescription =
  'Iron Warriors – studenckie koło naukowe Politechniki Łódzkiej budujące superoszczędne bolidy Eco Arrow. Rekord Polski: 837 km/l benzyny i 2267 km/l w kategorii elektrycznej.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} – Rekordziści polski w jeździe na kropelkę benzyny`,
    template: `%s – ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    siteName,
    url: siteUrl,
    title: `${siteName} – Rekordziści polski w jeździe na kropelkę benzyny`,
    description: siteDescription,
    images: [{ url: '/images/eco-arrow-3-2.jpg', width: 1200, height: 800, alt: 'Bolid Eco Arrow' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: ['/images/eco-arrow-3-2.jpg'],
  },
  icons: { icon: '/images/logo-iron-warriors-svg.svg' },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#171616',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className={exo.variable}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && process.env.VERCEL && <Analytics />}
      </body>
    </html>
  )
}
