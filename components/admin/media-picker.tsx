'use client'

import { useState } from 'react'
import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MediaLibraryDialog } from './media-library-dialog'

/** Kompaktowy wybór jednego zdjęcia z serwerowej biblioteki mediów. */
export function MediaPicker({
  value,
  onChange,
  label = 'Wybierz zdjęcie',
  className,
}: {
  value: string
  onChange: (url: string) => void
  label?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex min-w-0 flex-1 items-center gap-2 rounded-sm border border-border bg-background p-1.5 text-left text-xs font-medium hover:border-primary"
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="size-10 shrink-0 rounded-sm object-cover" />
            <span className="min-w-0 truncate text-muted-foreground">Zmień zdjęcie</span>
            <RefreshCw className="ml-auto size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          </>
        ) : (
          <>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-secondary text-muted-foreground">
              <ImagePlus className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 truncate text-muted-foreground">{label}</span>
          </>
        )}
      </button>
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Usuń zdjęcie"
          title="Usuń zdjęcie"
          className="rounded-sm p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      )}
      <MediaLibraryDialog
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(urls) => {
          onChange(urls[0] ?? '')
          setOpen(false)
        }}
      />
    </div>
  )
}

/** Przycisk wstawiający zdjęcie (np. do edytora tekstu) bezpośrednio z biblioteki. */
export function ImageInsertButton({
  onInsert,
  label = 'Wstaw zdjęcie',
  className,
}: {
  onInsert: (url: string) => void
  label?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary',
          className,
        )}
      >
        <ImagePlus className="size-3.5" aria-hidden="true" />
        {label}
      </button>
      <MediaLibraryDialog
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(urls) => {
          if (urls[0]) onInsert(urls[0])
          setOpen(false)
        }}
      />
    </>
  )
}
