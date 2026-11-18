import { desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { ADMIN_PATH } from '@/lib/admin'
import { ListHeader, ListRow } from '@/components/admin/list'

export default async function BlogAdmin() {
  const rows = await db.select().from(posts).orderBy(desc(posts.publishedAt))
  return (
    <div className="flex flex-col gap-6">
      <ListHeader title="Blog" newHref={`${ADMIN_PATH}/blog/nowy`} />
      <ul className="flex flex-col gap-2">
        {rows.map((p) => (
          <ListRow
            key={p.id}
            href={`${ADMIN_PATH}/blog/${p.id}`}
            title={p.title}
            meta={`${p.published ? 'Opublikowany' : 'Szkic'} · ${p.publishedAt.toLocaleDateString('pl-PL')}`}
          />
        ))}
        {rows.length === 0 && <p className="text-muted-foreground">Brak wpisów.</p>}
      </ul>
    </div>
  )
}
