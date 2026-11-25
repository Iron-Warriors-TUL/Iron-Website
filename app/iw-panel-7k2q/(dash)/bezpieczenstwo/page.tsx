import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { requireCmsPage } from '@/lib/admin'
import { SecuritySettings } from '@/components/admin/security-settings'

export default async function SecurityPage() {
  const session = await requireCmsPage()
  // Stan z bazy, nie z pamięci podręcznej sesji, żeby po włączeniu/wyłączeniu od razu był aktualny.
  const [account] = await db
    .select({ twoFactorEnabled: user.twoFactorEnabled })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Bezpieczeństwo</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Zabezpiecz swoje konto logowaniem dwuetapowym z aplikacją w telefonie.
        </p>
      </div>
      <SecuritySettings enabled={Boolean(account?.twoFactorEnabled)} />
    </div>
  )
}
