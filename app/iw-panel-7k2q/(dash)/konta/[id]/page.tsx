import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { ADMIN_PATH, requireAdminPage } from '@/lib/admin'
import { deleteAccount, resetAccountSecurity, saveAccount } from '../../../actions'
import { AdminForm } from '@/components/admin/admin-form'
import { DeleteButton } from '@/components/admin/delete-button'
import { Field, inputClass } from '@/components/admin/fields'
import { BackLink } from '@/components/admin/list'

export default async function AccountEditor({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminPage()
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
        <Field label="Rola" htmlFor="role" hint="Administrator: wszystko oraz konta i role, nawigacja, ustawienia strony i reset 2FA innych osób. Edytor: treści, osoby, partnerzy, blog, bolidy, projekty i obrazy.">
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
            minLength={12}
            maxLength={128}
            autoComplete="new-password"
            className={inputClass}
          />
        </Field>
        {(!account || account.id !== session.user.id) && (
          <>
            <Field
              label="Twoje hasło"
              htmlFor="currentPassword"
              hint="Wymagane przy zmianie hasła lub roli innego konta oraz przy tworzeniu administratora."
            >
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                className={inputClass}
              />
            </Field>
            {session.user.twoFactorEnabled && (
              <Field label="Twój kod 2FA" htmlFor="currentCode" hint="6 cyfr z aplikacji albo kod zapasowy.">
                <input id="currentCode" name="currentCode" autoComplete="one-time-code" className={inputClass} />
              </Field>
            )}
          </>
        )}
      </AdminForm>
      {account && account.id !== session.user.id && account.twoFactorEnabled && (
        <AdminForm
          action={resetAccountSecurity}
          submitLabel="Resetuj 2FA"
          className="flex flex-col gap-4 rounded-md border border-border p-4"
        >
          <input type="hidden" name="id" value={account.id} />
          <div>
            <p className="text-sm font-medium">Reset zabezpieczeń</p>
            <p className="text-xs text-muted-foreground">Wyłącz uwierzytelnianie dwuskładnikowe (2FA) tego użytkownika, np. gdy zgubił telefon i kody zapasowe.</p>
          </div>
          <Field label="Twoje hasło" htmlFor="resetCurrentPassword">
            <input
              id="resetCurrentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              className={inputClass}
            />
          </Field>
          {session.user.twoFactorEnabled && (
            <Field label="Twój kod 2FA" htmlFor="resetCurrentCode" hint="6 cyfr z aplikacji albo kod zapasowy.">
              <input
                id="resetCurrentCode"
                name="currentCode"
                autoComplete="one-time-code"
                required
                className={inputClass}
              />
            </Field>
          )}
        </AdminForm>
      )}
    </div>
  )
}
