import Link from 'next/link'
import { count } from 'drizzle-orm'
import { db } from '@/lib/db'
import { navItems, posts, projects, vehicles } from '@/lib/db/schema'
import { ADMIN_PATH } from '@/lib/admin'

export default async function Dashboard() {
  const [[n], [p], [v], [pr]] = await Promise.all([
    db.select({ c: count() }).from(navItems),
    db.select({ c: count() }).from(posts),
    db.select({ c: count() }).from(vehicles),
    db.select({ c: count() }).from(projects),
  ])
  const cards = [
    { label: 'Elementy nawigacji', value: n.c, href: `${ADMIN_PATH}/nawigacja` },
    { label: 'Wpisy na blogu', value: p.c, href: `${ADMIN_PATH}/blog` },
    { label: 'Bolidy', value: v.c, href: `${ADMIN_PATH}/bolidy` },
    { label: 'Projekty', value: pr.c, href: `${ADMIN_PATH}/projekty` },
  ]
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Pulpit</h1>
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
