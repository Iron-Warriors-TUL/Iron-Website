'use client'

import { useActionState, useEffect, useRef } from 'react'
import type { FormState } from '@/app/iw-panel-7k2q/actions'

export function AdminForm({
  action,
  children,
  submitLabel = 'Zapisz',
  resetOnSuccess = false,
  className,
}: {
  action: (state: FormState, fd: FormData) => Promise<FormState>
  children: React.ReactNode
  submitLabel?: string
  resetOnSuccess?: boolean
  className?: string
}) {
  const [state, formAction, pending] = useActionState(action, {})
  const ref = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok && resetOnSuccess) ref.current?.reset()
  }, [state, resetOnSuccess])

  return (
    <form ref={ref} action={formAction} className={className ?? 'flex flex-col gap-5'}>
      {children}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Zapisywanie…' : submitLabel}
        </button>
        {state.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}
        {state.ok && !pending && (
          <p role="status" className="text-sm text-muted-foreground">
            Zapisano.
          </p>
        )}
      </div>
    </form>
  )
}
