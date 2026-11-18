import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Exo_2 } from 'next/font/google'
import './globals.css'

const exo = Exo_2({ subsets: ['latin', 'latin-ext'], variable: '--font-exo' })

export const metadata: Metadata = {
  title: {
    default: 'Iron Warriors – Rekordziści Polski w jeździe na kropelkę benzyny',
    template: '%s – Iron Warriors',
  },
  description:
    'Iron Warriors – studenckie koło naukowe Politechniki Łódzkiej budujące superoszczędne bolidy Eco Arrow. Rekord Polski: 837 km/l benzyny i 2267 km/l w kategorii elektrycznej.',
  generator: 'v0.app',
  icons: { icon: '/images/logo-iron-warriors-svg.svg' },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#1b1b1f',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className={exo.variable}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
