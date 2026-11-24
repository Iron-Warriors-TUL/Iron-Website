import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { ADMIN_PATH, requireAdmin } from '@/lib/admin'
import { deleteAccount, resetAccountSecurity, saveAccount } from '../../../actions'
import { AdminForm } from '@/components/admin/admin-form'
import { DeleteButton } from '@/components/admin/delete-button'
import { Field, inputClass } from '@/components/admin/fields'
import { BackLink } from '@/components/admin/list'

export default async function AccountEditor({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const isNew = id === 'nowy'
  const account = isNew
    ? null
    : (await db.select().from(user).where(eq(user.id, id)).limit(1))[0]
  if (!isNew && !account) notFound()

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <BackLink href={`${ADMIN_PATH}/konta`} />
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{isNew ? 'Nowe konto' : 'Edycja konta'}</h1>
        {account && <DeleteButton action={deleteAccount} id={account.id} />}
      </div>
      <AdminForm action={saveAccount} submitLabel={isNew ? 'Dodaj konto' : 'Zapisz konto'}>
        {account && <input type="hidden" name="id" value={account.id} />}
        <Field label="Imię i nazwisko" htmlFor="name">
          <input id="name" name="name" defaultValue={account?.name} required maxLength={80} className={inputClass} />
        </Field>
        <Field label="E-mail" htmlFor="email">
          <input id="email" name="email" type="email" defaultValue={account?.email} required maxLength={254} className={inputClass} />
        </Field>
        <Field label="Rola" htmlFor="role" hint="Administrator może zarządzać kontami. Edytor może edytować treść CMS.">
          <select id="role" name="role" defaultValue={account?.role ?? 'editor'} className={inputClass}>
            <option value="editor">Edytor</option>
            <option value="admin">Administrator</option>
          </select>
        </Field>
        <Field
          label={isNew ? 'Hasło' : 'Resetuj hasło'}
          htmlFor="password"
          hint={isNew ? 'Minimum 12 znaków.' : 'Pozostaw puste, aby nie zmieniać hasła.'}
        >
          <input
            id="password"
            name="password"
            type="password"
            required={isNew}
            minLength={isNew ? 12 : 0}
            maxLength={128}
            autoComplete={isNew ? 'new-password' : 'new-password'}
            className={inputClass}
          />
        </Field>
      </AdminForm>
      {account && (
        <form action={resetAccountSecurity} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-4">
          <input type="hidden" name="id" value={account.id} />
          <div>
            <p className="text-sm font-medium">Reset zabezpieczeń</p>
            <p className="text-xs text-muted-foreground">Usuń wszystkie passkeyi i wyłącz TOTP tego użytkownika.</p>
          </div>
          <button type="submit" className="rounded-sm border border-destructive px-4 py-2 text-sm font-bold text-destructive hover:bg-destructive/5">
            Resetuj 2FA i passkeyi
          </button>
        </form>
      )}
    </div>
  )
}
