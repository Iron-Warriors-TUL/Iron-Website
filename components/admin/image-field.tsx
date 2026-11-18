'use client'

import { useState, useTransition } from 'react'
import { uploadImage } from '@/app/iw-panel-7k2q/actions'
import { inputClass } from './fields'

export function ImageField({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string | null }) {
  const [url, setUrl] = useState(defaultValue ?? '')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    const fd = new FormData()
    fd.append('file', file)
    startTransition(async () => {
      const res = await uploadImage(fd)
      if (res.url) setUrl(res.url)
      else setError(res.error ?? 'Błąd przesyłania.')
    })
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {url ? (
          <img src={url} alt="Podgląd obrazu" className="h-24 w-36 shrink-0 rounded-sm border border-border object-cover" />
        ) : (
          <div className="flex h-24 w-36 shrink-0 items-center justify-center rounded-sm border border-dashed border-border text-xs text-muted-foreground">
            Brak obrazu
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2">
          <input id={name} name={name} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/images/... lub https://..." className={inputClass} />
          <div className="flex items-center gap-3">
            <label className="cursor-pointer rounded-sm bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-accent">
              {pending ? 'Przesyłanie…' : 'Prześlij plik'}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={onFile} disabled={pending} className="sr-only" />
            </label>
            {url && (
              <button type="button" onClick={() => setUrl('')} className="text-sm text-muted-foreground hover:text-destructive">
                Usuń
              </button>
            )}
          </div>
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
