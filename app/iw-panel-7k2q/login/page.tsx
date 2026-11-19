import { redirect } from 'next/navigation'
import { ADMIN_PATH, getAdminSession, hasAnyAdmin } from '@/lib/admin'
import { LoginForm } from '@/components/admin/login-form'
import { FixedImage } from '@/components/site/smart-image'

export default async function LoginPage() {
  if (await getAdminSession()) redirect(ADMIN_PATH)
  const setup = !(await hasAnyAdmin())

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-md border border-border bg-card p-8">
        <FixedImage
          src="/images/logo-iron-warriors-poziome.png"
          alt="Iron Warriors"
          width={200}
          height={50}
          sizes="150px"
          className="mx-auto mb-6 h-12 w-auto"
        />
        <h1 className="mb-1 text-center text-xl font-bold">{setup ? 'Utwórz konto administratora' : 'Logowanie'}</h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          {setup ? 'Pierwsze i jedyne konto – rejestracja zostanie potem zablokowana.' : 'Panel zarządzania treścią'}
        </p>
        <LoginForm mode={setup ? 'setup' : 'login'} redirectTo={ADMIN_PATH} />
      </div>
    </div>
  )
}
