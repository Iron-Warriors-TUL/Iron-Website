'use client'

import { useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2, UploadCloud } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MediaLibraryDialog } from './media-library-dialog'
import { uploadImageFile } from './upload-image'

function parseImages(initial: string): string[] {
  return initial
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

/** Lista zdjęć zapisywana jako adresy w osobnych liniach (np. pole `imageUrls`). */
export function ImageListField({
  name,
  label,
  defaultValue = '',
}: {
  name: string
  label: string
  defaultValue?: string | null
}) {
  const [images, setImages] = useState<string[]>(() => parseImages(defaultValue ?? ''))
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= images.length) return
    const next = [...images]
    ;[next[index], next[target]] = [next[target], next[index]]
    setImages(next)
  }

  async function upload(files: FileList | File[] | null) {
    if (!files) return
    const valid = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (valid.length === 0) {
      setError('Wybierz pliki graficzne (JPG, PNG, WEBP lub AVIF).')
      return
    }
    setError(null)
    setUploading(true)
    const urls: string[] = []
    try {
      for (const file of valid) {
        const result = await uploadImageFile(file)
        if (result.url) urls.push(result.url)
        else if (result.error) setError(result.error)
      }
    } finally {
      setUploading(false)
    }
    if (urls.length > 0) setImages((current) => [...current, ...urls])
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <input type="hidden" name={name} value={images.join('\n')} />

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {images.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="group relative aspect-square overflow-hidden rounded-sm border border-border bg-secondary"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Przesuń w lewo"
                className="rounded-sm p-1 text-white hover:bg-white/20 disabled:opacity-30"
              >
                <ArrowUp className="size-4 -rotate-90" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === images.length - 1}
                aria-label="Przesuń w prawo"
                className="rounded-sm p-1 text-white hover:bg-white/20 disabled:opacity-30"
              >
                <ArrowDown className="size-4 -rotate-90" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                aria-label="Usuń zdjęcie"
                className="rounded-sm p-1 text-white hover:bg-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-border px-1 text-center text-[11px] text-muted-foreground hover:border-primary hover:text-primary"
        >
          <Plus className="size-5" aria-hidden="true" />
          Dodaj zdjęcia
        </button>
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
        <span className="text-xs text-muted-foreground">{images.length} zdjęć</span>
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
        multiple
        className="sr-only"
        onChange={(event) => {
          void upload(event.target.files)
          event.target.value = ''
        }}
      />

      <MediaLibraryDialog
        open={open}
        multiple
        onClose={() => setOpen(false)}
        onSelect={(urls) => {
          setImages((current) => [...current, ...urls])
          setOpen(false)
        }}
      />
    </div>
  )
}
