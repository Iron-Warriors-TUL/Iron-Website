import Link from 'next/link'
import { count } from 'drizzle-orm'
import { db } from '@/lib/db'
import { navItems, posts, projects, siteContent, vehicles } from '@/lib/db/schema'
import { ADMIN_PATH, requireCmsPage } from '@/lib/admin'
import { isRole, ROLE_LABELS } from '@/lib/roles'
import { contentAreas } from '@/lib/content-registry'

export default async function Dashboard({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await requireCmsPage()
  const isAdmin = session.user.role === 'admin'
  const denied = (await searchParams)['brak-uprawnien'] !== undefined
  const [[n], [p], [v], [pr], [sc]] = await Promise.all([
    db.select({ c: count() }).from(navItems),
    db.select({ c: count() }).from(posts),
    db.select({ c: count() }).from(vehicles),
    db.select({ c: count() }).from(projects),
    db.select({ c: count() }).from(siteContent),
  ])
  const cards = [
    { label: 'Edytowalne obszary', value: contentAreas.length, href: `${ADMIN_PATH}/tresc` },
    { label: 'Zapisane zmiany treści', value: sc.c, href: `${ADMIN_PATH}/tresc` },
    ...(isAdmin ? [{ label: 'Elementy nawigacji', value: n.c, href: `${ADMIN_PATH}/nawigacja` }] : []),
    { label: 'Wpisy na blogu', value: p.c, href: `${ADMIN_PATH}/blog` },
    { label: 'Bolidy', value: v.c, href: `${ADMIN_PATH}/bolidy` },
    { label: 'Projekty', value: pr.c, href: `${ADMIN_PATH}/projekty` },
  ]
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Pulpit</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Zalogowano jako {session.user.name} · rola: {isRole(session.user.role) ? ROLE_LABELS[session.user.role] : session.user.role}
        </p>
      </div>
      {denied && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Ta sekcja jest dostępna tylko dla administratora.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-md border border-border bg-card p-5 transition-colors hover:border-primary">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="mt-1 text-4xl font-bold text-primary">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
