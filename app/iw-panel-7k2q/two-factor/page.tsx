'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Field, inputClass } from '@/components/admin/fields'
import { FixedImage } from '@/components/site/smart-image'

export default function TwoFactorPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function verifyTotp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const res = /^\d{6,8}$/.test(code)
      ? await authClient.twoFactor.verifyTotp({ code, trustDevice: true })
      : await authClient.twoFactor.verifyBackupCode({ code, trustDevice: true })
    setPending(false)
    if (res.error) {
      setError('Nieprawidłowy kod weryfikacyjny.')
      return
    }
    router.push('/iw-panel-7k2q')
    router.refresh()
  }

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
        <h1 className="mb-1 text-center text-xl font-bold">Weryfikacja dwuskładnikowa</h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Wpisz kod TOTP lub kod odzyskiwania.
        </p>
        <form onSubmit={verifyTotp} className="flex flex-col gap-4">
          <Field label="Kod TOTP" htmlFor="code">
            <input
              id="code"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20))}
              inputMode="text"
              autoComplete="one-time-code"
              required
              className={`${inputClass} text-center text-lg tracking-widest`}
            />
          </Field>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-sm bg-primary px-4 py-2.5 font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {pending ? 'Sprawdzanie…' : 'Potwierdź'}
          </button>
        </form>
      </div>
    </div>
  )
}
