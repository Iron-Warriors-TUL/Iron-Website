import Link from 'next/link'
import { desc } from 'drizzle-orm'
import { Plus, ShieldCheck } from 'lucide-react'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { ADMIN_PATH, requireAdminPage } from '@/lib/admin'
import { isRole, ROLE_LABELS } from '@/lib/roles'
import { ListRow } from '@/components/admin/list'

export default async function AccountsPage() {
  const session = await requireAdminPage()
  const accounts = await db.select().from(user).orderBy(desc(user.createdAt))
  const adminCount = accounts.filter((account) => account.role === 'admin').length

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Konta i role</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Zarządzaj dostępem do panelu. Konta może dodawać, edytować i usuwać tylko administrator.
          </p>
        </div>
        <Link
          href={`${ADMIN_PATH}/konta/nowy`}
          className="inline-flex shrink-0 items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden="true" />
          Dodaj konto
        </Link>
      </div>

      <div className="flex items-start gap-3 rounded-md border border-border bg-card p-4 text-sm">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="font-medium">
            Konta: {accounts.length} · administratorzy: {adminCount}
          </p>
          <p className="text-muted-foreground">
            Administrator ma pełny dostęp, w tym do kont, menu strony i ustawień. Edytor zmienia treści, blog,
            bolidy, projekty i obrazy. Zawsze musi pozostać co najmniej jeden administrator.
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {accounts.map((account) => (
          <ListRow
            key={account.id}
            href={`${ADMIN_PATH}/konta/${encodeURIComponent(account.id)}`}
            title={account.id === session.user.id ? `${account.name} (Ty)` : account.name}
            meta={`${account.email} · ${isRole(account.role) ? ROLE_LABELS[account.role] : account.role} · 2FA ${account.twoFactorEnabled ? 'włączone' : 'wyłączone'}`}
          />
        ))}
      </ul>

      <p className="text-sm text-muted-foreground">
        Własne hasło i logowanie dwuetapowe zmienisz w{' '}
        <Link href={`${ADMIN_PATH}/ustawienia#bezpieczenstwo`} className="font-semibold text-primary hover:underline">
          ustawieniach bezpieczeństwa
        </Link>
        .
      </p>
    </div>
  )
}
