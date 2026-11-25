'use client'

import { useEffect, useRef, useState } from 'react'
import { ImagePlus, RefreshCw, Trash2, UploadCloud } from 'lucide-react'
import { FixedImage } from '@/components/site/smart-image'
import { cn } from '@/lib/utils'
import { MediaLibraryDialog } from './media-library-dialog'
import { uploadImageFile } from './upload-image'

export function ImageField({
  name,
  label,
  defaultValue,
  onChange,
}: {
  name: string
  label: string
  defaultValue?: string | null
  onChange?: (url: string) => void
}) {
  const [url, setUrlState] = useState(defaultValue ?? '')
  const [open, setOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  // Po wyczyszczeniu formularza (np. po dodaniu partnera) wraca wartość początkowa.
  useEffect(() => {
    const form = rootRef.current?.closest('form')
    if (!form) return
    const onReset = () => {
      setUrlState(defaultValue ?? '')
      onChange?.(defaultValue ?? '')
    }
    form.addEventListener('reset', onReset)
    return () => form.removeEventListener('reset', onReset)
  }, [defaultValue, onChange])

  function setUrl(next: string) {
    setUrlState(next)
    onChange?.(next)
  }

  async function upload(file: File | undefined) {
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const result = await uploadImageFile(file)
      if (result.url) setUrl(result.url)
      else setError(result.error ?? 'Nie udało się przesłać pliku.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div ref={rootRef} className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input type="hidden" name={name} value={url} />

      <div
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          void upload(event.dataTransfer.files?.[0])
        }}
        className={cn(
          'relative overflow-hidden rounded-md border-2 border-dashed transition-colors',
          dragging ? 'border-primary bg-primary/5' : 'border-border',
        )}
      >
        {url ? (
          <div className="group relative">
            <FixedImage
              src={url}
              alt=""
              width={720}
              height={405}
              sizes="(min-width: 768px) 720px, 100vw"
              className="h-40 w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-sm bg-white/95 px-3 py-1.5 text-xs font-semibold text-heading hover:bg-white"
              >
                <RefreshCw className="size-3.5" aria-hidden="true" />
                Zmień
              </button>
              <button
                type="button"
                onClick={() => setUrl('')}
                className="inline-flex items-center gap-1.5 rounded-sm bg-white/95 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-white"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Usuń
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={uploading}
            className="flex h-40 w-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground transition-colors hover:text-primary disabled:opacity-60"
          >
            <UploadCloud className="size-8" aria-hidden="true" />
            <span className="font-medium">
              {uploading ? 'Przesyłanie…' : 'Przeciągnij zdjęcie tutaj lub kliknij, aby wybrać z biblioteki'}
            </span>
            <span className="text-xs">JPG, PNG, WEBP, AVIF · do 4 MB</span>
          </button>
        )}

        {dragging && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary/10 text-sm font-semibold text-primary">
            Upuść, aby przesłać
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary"
        >
          <ImagePlus className="size-4" aria-hidden="true" />
          Wybierz z biblioteki
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary disabled:opacity-60"
        >
          <UploadCloud className="size-4" aria-hidden="true" />
          {uploading ? 'Przesyłanie…' : 'Prześlij z komputera'}
        </button>
      </div>

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        onChange={(event) => {
          void upload(event.target.files?.[0])
          event.target.value = ''
        }}
      />

      <MediaLibraryDialog
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(urls) => setUrl(urls[0] ?? '')}
      />
    </div>
  )
}
