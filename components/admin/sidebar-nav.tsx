'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  Car,
  FileText,
  FolderKanban,
  Handshake,
  LayoutDashboard,
  Menu,
  PencilLine,
  Settings,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ADMIN_PATH = '/iw-panel-7k2q'

type NavLink = { href: string; label: string; icon: typeof LayoutDashboard; adminOnly?: boolean; exact?: boolean }

const groups: { title?: string; links: NavLink[] }[] = [
  { links: [{ href: ADMIN_PATH, label: 'Pulpit', icon: LayoutDashboard, exact: true }] },
  {
    title: 'Strona',
    links: [
      { href: `${ADMIN_PATH}/tresc`, label: 'Teksty i zdjęcia', icon: PencilLine },
      { href: `${ADMIN_PATH}/partnerzy`, label: 'Partnerzy', icon: Handshake },
      { href: `${ADMIN_PATH}/tresc/people/main`, label: 'Osoby', icon: Users },
      { href: `${ADMIN_PATH}/nawigacja`, label: 'Menu strony', icon: Menu, adminOnly: true },
    ],
  },
  {
    title: 'Wpisy',
    links: [
      { href: `${ADMIN_PATH}/blog`, label: 'Blog', icon: FileText },
      { href: `${ADMIN_PATH}/bolidy`, label: 'Bolidy', icon: Car },
      { href: `${ADMIN_PATH}/projekty`, label: 'Projekty', icon: FolderKanban },
    ],
  },
  { title: 'Pomoc', links: [{ href: `${ADMIN_PATH}/instrukcja`, label: 'Instrukcja obsługi', icon: BookOpen }] },
]

function isActive(pathname: string, link: NavLink) {
  if (link.exact) return pathname === link.href
  return pathname === link.href || pathname.startsWith(`${link.href}/`)
}

export function SidebarNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const visible = groups
    .map((group) => ({ ...group, links: group.links.filter((link) => isAdmin || !link.adminOnly) }))
    .filter((group) => group.links.length)
  const all = visible.flatMap((group) => group.links)
  // Najdłuższy pasujący link jest aktywny (np. „Osoby” zamiast „Teksty i zdjęcia”).
  const active = all.filter((link) => isActive(pathname, link)).sort((a, b) => b.href.length - a.href.length)[0]

  return (
    <nav aria-label="Panel" className="flex flex-wrap gap-1 md:flex-col md:flex-nowrap md:gap-4">
      {visible.map((group, index) => (
        <div key={group.title ?? index} className="contents md:flex md:flex-col md:gap-0.5">
          {group.title && (
            <p className="hidden px-3 pb-1 text-[11px] md:block font-semibold uppercase tracking-wider text-muted-foreground">{group.title}</p>
          )}
          {group.links.map((link) => {
            const Icon = link.icon
            const current = active?.href === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors hover:bg-secondary hover:text-primary',
                  current && 'bg-primary/10 font-semibold text-primary',
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {link.label}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

/** Kafelek użytkownika na dole menu: okrągły awatar z inicjałami, e-mail i zębatka do ustawień. */
export function UserTile({ name, email, roleLabel }: { name: string; email: string; roleLabel: string }) {
  const pathname = usePathname()
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || email[0]?.toUpperCase()
  const settingsHref = `${ADMIN_PATH}/ustawienia`
  const current = pathname.startsWith(settingsHref) || pathname.startsWith(`${ADMIN_PATH}/konta`)

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-background p-3 md:flex-col md:gap-2 md:p-4 md:text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
        {initials}
      </span>
      <div className="min-w-0 max-w-full flex-1 md:flex-none">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="truncate text-xs text-muted-foreground" title={email}>
          {email}
        </p>
        <p className="text-[11px] text-muted-foreground">{roleLabel}</p>
      </div>
      <Link
        href={settingsHref}
        aria-label="Ustawienia konta, role i bezpieczeństwo"
        title="Ustawienia konta, role i bezpieczeństwo"
        aria-current={current ? 'page' : undefined}
        className={cn(
          'flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary',
          current && 'border-primary text-primary',
        )}
      >
        <Settings className="size-4" aria-hidden="true" />
      </Link>
    </div>
  )
}
