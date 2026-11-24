import { desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin'
import { ADMIN_PATH } from '@/lib/admin'
import { ListHeader, ListRow } from '@/components/admin/list'

export default async function AccountsPage() {
  await requireAdmin()
  const rows = await db.select().from(user).orderBy(desc(user.createdAt))

  return (
    <div className="flex flex-col gap-6">
      <ListHeader title="Konta" newHref={`${ADMIN_PATH}/konta/nowy`} />
      <ul className="flex flex-col gap-2">
        {rows.map((account) => (
          <ListRow
            key={account.id}
            href={`${ADMIN_PATH}/konta/${encodeURIComponent(account.id)}`}
            title={account.name}
            meta={`${account.email} · ${account.role === 'admin' ? 'Administrator' : 'Edytor'}`}
          />
        ))}
      </ul>
    </div>
  )
}
