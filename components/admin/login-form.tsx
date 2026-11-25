'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Field, inputClass } from './fields'

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email'))
    const password = String(fd.get('password'))

    setPending(true)
    const res = await authClient.signIn.email(
      { email, password },
      {
        onSuccess(context) {
          if ('twoFactorRedirect' in context.data && context.data.twoFactorRedirect) {
            router.push('/iw-panel-7k2q/two-factor')
          } else {
            router.push(redirectTo)
          }
          router.refresh()
        },
      },
    )
    setPending(false)

    if (res.error) {
      setError(
        res.error.status === 429
          ? 'Zbyt wiele prób. Spróbuj ponownie za kilka minut.'
          : 'Nieprawidłowy e-mail lub hasło.',
      )
      return
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="E-mail" htmlFor="email">
        <input id="email" name="email" type="email" autoComplete="username" required maxLength={254} className={inputClass} />
      </Field>
      <Field label="Hasło" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={1}
          maxLength={128}
          className={inputClass}
        />
      </Field>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-sm bg-primary px-4 py-2.5 font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? 'Proszę czekać…' : 'Zaloguj się'}
      </button>
    </form>
  )
}
