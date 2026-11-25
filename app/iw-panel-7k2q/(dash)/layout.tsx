import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { ExternalLink } from 'lucide-react'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { ADMIN_PATH, requireCmsPage } from '@/lib/admin'
import { AdminThemeShell } from '@/components/admin/admin-theme-shell'
import { SignOutButton } from '@/components/admin/sign-out-button'
import { ThemeToggle } from '@/components/admin/theme-toggle'
import { SidebarNav, UserTile } from '@/components/admin/sidebar-nav'
import { isRole, ROLE_LABELS } from '@/lib/roles'
import { FixedImage } from '@/components/site/smart-image'

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const session = await requireCmsPage()
  const role = session.user.role

  const [account] = await db
    .select({ theme: user.theme })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)
  const theme = account?.theme === 'dark' ? 'dark' : 'light'

  return (
    <AdminThemeShell initialTheme={theme}>
      <div className="flex min-h-dvh flex-col md:flex-row">
        <aside className="flex shrink-0 flex-col gap-4 border-b border-border bg-card p-4 md:sticky md:top-0 md:h-dvh md:w-60 md:overflow-y-auto md:border-b-0 md:border-r">
          <FixedImage
            src="/images/logo-iron-warriors-poziome.png"
            alt="Iron Warriors"
            width={200}
            height={50}
            sizes="150px"
            className="h-10 w-auto self-start"
          />
          <SidebarNav isAdmin={role === 'admin'} />
          <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
            <UserTile
              name={session.user.name}
              email={session.user.email}
              roleLabel={isRole(role) ? ROLE_LABELS[role] : String(role)}
            />
            <Link href="/" target="_blank" className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
              <ExternalLink className="size-4" aria-hidden="true" />
              Zobacz stronę
            </Link>
            <SignOutButton redirectTo={`${ADMIN_PATH}/login`} />
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/90 px-4 backdrop-blur md:px-8">
            <p className="text-sm text-muted-foreground">Panel administracyjny</p>
            <ThemeToggle />
          </header>
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </AdminThemeShell>
  )
}
