'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Field, inputClass } from './fields'

export function LoginForm({ mode, redirectTo }: { mode: 'setup' | 'login'; redirectTo: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email'))
    const password = String(fd.get('password'))

    if (mode === 'setup' && password !== String(fd.get('confirm'))) {
      setError('Hasła nie są identyczne.')
      return
    }

    setPending(true)
    const res =
      mode === 'setup'
        ? await authClient.signUp.email({ email, password, name: String(fd.get('name') || 'Administrator') })
        : await authClient.signIn.email({ email, password })
    setPending(false)

    if (res.error) {
      setError(
        res.error.status === 429
          ? 'Zbyt wiele prób. Spróbuj ponownie za kilka minut.'
          : mode === 'setup'
            ? 'Nie udało się utworzyć konta (hasło min. 12 znaków).'
            : 'Nieprawidłowy e-mail lub hasło.',
      )
      return
    }
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {mode === 'setup' && (
        <Field label="Imię i nazwisko" htmlFor="name">
          <input id="name" name="name" autoComplete="name" required maxLength={80} className={inputClass} />
        </Field>
      )}
      <Field label="E-mail" htmlFor="email">
        <input id="email" name="email" type="email" autoComplete="username" required maxLength={254} className={inputClass} />
      </Field>
      <Field label="Hasło" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
          required
          minLength={mode === 'setup' ? 12 : 1}
          maxLength={128}
          className={inputClass}
        />
      </Field>
      {mode === 'setup' && (
        <Field label="Powtórz hasło" htmlFor="confirm">
          <input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={12} maxLength={128} className={inputClass} />
        </Field>
      )}
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
        {pending ? 'Proszę czekać…' : mode === 'setup' ? 'Utwórz konto' : 'Zaloguj się'}
      </button>
    </form>
  )
}
