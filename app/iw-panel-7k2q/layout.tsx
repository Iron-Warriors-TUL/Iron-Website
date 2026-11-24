import type { Metadata } from 'next'
import { ThemeScript } from '@/components/admin/theme-script'
import { ThemeToggle } from '@/components/admin/theme-toggle'

export const metadata: Metadata = {
  title: 'Panel',
  robots: { index: false, follow: false, nocache: true },
}

export const dynamic = 'force-dynamic'

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <ThemeScript />
      {children}
      <ThemeToggle />
    </div>
  )
}
