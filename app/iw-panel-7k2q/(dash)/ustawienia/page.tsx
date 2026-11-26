import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { UserCog } from 'lucide-react'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { ADMIN_PATH, requireCmsPage } from '@/lib/admin'
import { isRole, ROLE_LABELS } from '@/lib/roles'
import { SecuritySettings } from '@/components/admin/security-settings'

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
          <Link
            href={`${ADMIN_PATH}/konta`}
            className="flex items-center gap-3 rounded-md border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <UserCog className="size-6 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="font-medium">Zarządzaj kontami zespołu</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Dodawaj konta, nadawaj role administratora i edytora, resetuj hasła oraz 2FA.
              </p>
            </div>
          </Link>
        </Section>
      )}
    </div>
  )
}
