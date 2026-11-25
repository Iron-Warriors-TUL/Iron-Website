import Link from 'next/link'
import { desc, eq } from 'drizzle-orm'
import { Plus } from 'lucide-react'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { ADMIN_PATH, requireCmsPage } from '@/lib/admin'
import { isRole, ROLE_LABELS } from '@/lib/roles'
import { SecuritySettings } from '@/components/admin/security-settings'
import { ListRow } from '@/components/admin/list'

const ROLE_RIGHTS = [
  { label: 'Teksty, zdjęcia, osoby, partnerzy', admin: true, editor: true },
  { label: 'Blog, bolidy, projekty, obrazy', admin: true, editor: true },
  { label: 'Menu strony (nawigacja)', admin: true, editor: false },
  { label: 'Ustawienia strony', admin: true, editor: false },
  { label: 'Konta, role i reset 2FA innych', admin: true, editor: false },
]

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="flex scroll-mt-20 flex-col gap-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  )
}

export default async function SettingsPage() {
  const session = await requireCmsPage()
  const isAdmin = session.user.role === 'admin'
  const [me] = await db
    .select({ twoFactorEnabled: user.twoFactorEnabled })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)
  const accounts = isAdmin ? await db.select().from(user).orderBy(desc(user.createdAt)) : []

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold">Ustawienia</h1>
        <p className="mt-2 text-sm text-muted-foreground">Twoje konto, logowanie dwuetapowe{isAdmin ? ' oraz konta i role zespołu' : ''}.</p>
      </div>

      <Section id="konto" title="Moje konto">
        <dl className="grid gap-x-6 gap-y-2 rounded-md border border-border bg-card p-5 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-muted-foreground">Imię i nazwisko</dt>
          <dd className="font-medium">{session.user.name}</dd>
          <dt className="text-muted-foreground">E-mail</dt>
          <dd className="break-all font-medium">{session.user.email}</dd>
          <dt className="text-muted-foreground">Rola</dt>
          <dd className="font-medium">{isRole(session.user.role) ? ROLE_LABELS[session.user.role] : session.user.role}</dd>
        </dl>
        {!isAdmin && <p className="text-xs text-muted-foreground">Zmianę imienia, e-maila lub hasła zleć administratorowi.</p>}
      </Section>

      <Section id="bezpieczenstwo" title="Bezpieczeństwo">
        <SecuritySettings enabled={Boolean(me?.twoFactorEnabled)} />
      </Section>

      {isAdmin && (
        <Section id="konta" title="Konta i role">
          <div className="overflow-x-auto rounded-md border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-2 font-medium">Co można robić</th>
                  <th className="px-4 py-2 text-center font-medium">Administrator</th>
                  <th className="px-4 py-2 text-center font-medium">Edytor</th>
                </tr>
              </thead>
              <tbody>
                {ROLE_RIGHTS.map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-0">
                    <td className="px-4 py-2">{row.label}</td>
                    <td className="px-4 py-2 text-center">{row.admin ? '✓' : '—'}</td>
                    <td className="px-4 py-2 text-center">{row.editor ? '✓' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Liczba kont: {accounts.length}. Kliknij konto, aby zmienić rolę, hasło lub je usunąć.</p>
            <Link
              href={`${ADMIN_PATH}/konta/nowy`}
              className="inline-flex shrink-0 items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              <Plus className="size-4" aria-hidden="true" />
              Dodaj konto
            </Link>
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
        </Section>
      )}
    </div>
  )
}
