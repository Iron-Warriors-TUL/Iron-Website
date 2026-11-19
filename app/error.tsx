'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[app] error', error)
  }, [error])

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-destructive">Coś poszło nie tak</p>
      <h1 className="text-3xl font-bold">Nie udało się wczytać strony</h1>
      <p className="max-w-md text-muted-foreground">
        Spróbuj ponownie za chwilę. Jeśli problem będzie się powtarzał, skontaktuj się z nami.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-sm bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-opacity hover:opacity-90"
      >
        Spróbuj ponownie
      </button>
    </main>
  )
}
