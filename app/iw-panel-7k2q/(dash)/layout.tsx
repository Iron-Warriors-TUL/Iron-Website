import Link from 'next/link'
import { ExternalLink, FileText, KeyRound, LayoutDashboard, Menu, Car, FolderKanban, PencilLine, ShieldCheck, Users } from 'lucide-react'
import { ADMIN_PATH, requireCmsPage } from '@/lib/admin'
import { SignOutButton } from '@/components/admin/sign-out-button'
import { FixedImage } from '@/components/site/smart-image'

const links = [
  { href: ADMIN_PATH, label: 'Pulpit', icon: LayoutDashboard },
  { href: `${ADMIN_PATH}/bezpieczenstwo`, label: 'Bezpieczeństwo', icon: KeyRound },
  { href: `${ADMIN_PATH}/tresc`, label: 'Treść strony', icon: PencilLine },
  { href: `${ADMIN_PATH}/nawigacja`, label: 'Nawigacja (navbar)', icon: Menu },
  { href: `${ADMIN_PATH}/tresc/people/main`, label: 'Osoby', icon: Users },
  { href: `${ADMIN_PATH}/blog`, label: 'Blog', icon: FileText },
  { href: `${ADMIN_PATH}/bolidy`, label: 'Bolidy', icon: Car },
  { href: `${ADMIN_PATH}/projekty`, label: 'Projekty', icon: FolderKanban },
]

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const session = await requireCmsPage()
  const role = session.user.role
  const visibleLinks = role === 'admin'
    ? [...links, { href: `${ADMIN_PATH}/konta`, label: 'Konta', icon: ShieldCheck }]
    : links

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-4 border-b border-border bg-card p-4 md:sticky md:top-0 md:h-dvh md:w-60 md:border-b-0 md:border-r">
        <FixedImage
          src="/images/logo-iron-warriors-poziome.png"
          alt="Iron Warriors"
          width={200}
          height={50}
          sizes="150px"
          className="h-10 w-auto self-start"
        />
        <nav aria-label="Panel" className="flex flex-wrap gap-1 md:flex-col">
          {visibleLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-secondary hover:text-primary">
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
          <p className="truncate px-3 text-xs text-muted-foreground">{session.user.email}</p>
          <Link href="/" target="_blank" className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
            <ExternalLink className="size-4" aria-hidden="true" />
            Zobacz stronę
          </Link>
          <SignOutButton redirectTo={`${ADMIN_PATH}/login`} />
        </div>
      </aside>
      <div className="flex-1 p-4 md:p-8">{children}</div>
    </div>
  )
}
