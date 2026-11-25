'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, ImagePlus, Search, Upload, UploadCloud, X } from 'lucide-react'
import { inputClass } from './fields'
import { uploadImageFile } from './upload-image'

type MediaItem = { url: string; name: string; group: 'upload' | 'library' }
type GroupFilter = 'all' | 'upload' | 'library'

export function MediaLibraryDialog({
  open,
  onClose,
  onSelect,
  multiple = false,
  title,
}: {
  open: boolean
  onClose: () => void
  onSelect: (urls: string[]) => void
  multiple?: boolean
  title?: string
}) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<GroupFilter>('all')
  const [selected, setSelected] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loading = open && !loaded && !error

  const close = useCallback(() => {
    setSelected([])
    setDragging(false)
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    fetch('/api/media-library')
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status))
        return response.json()
      })
      .then((data) => {
        if (cancelled) return
        setItems(Array.isArray(data.items) ? data.items : [])
        setLoaded(true)
        setError(null)
      })
      .catch(() => {
        if (!cancelled) setError('Nie udało się wczytać biblioteki mediów.')
      })
    return () => {
      cancelled = true
    }
  }, [open, refreshKey])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return items.filter((item) => {
      if (filter !== 'all' && item.group !== filter) return false
      return needle ? item.name.toLowerCase().includes(needle) : true
    })
  }, [items, query, filter])

  async function handleFiles(fileList: FileList | File[] | null) {
    if (!fileList) return
    const files = Array.from(fileList).filter((file) => file.type.startsWith('image/'))
    if (files.length === 0) {
      setError('Wybierz pliki graficzne (JPG, PNG, WEBP lub AVIF).')
      return
    }
    setError(null)
    setUploading(true)
    const uploaded: string[] = []
    try {
      for (const file of files) {
        const result = await uploadImageFile(file)
        const url = result.url
        if (url) {
          uploaded.push(url)
          setItems((current) => [{ url, name: url, group: 'upload' }, ...current])
        } else if (result.error) {
          setError(result.error)
        }
      }
    } finally {
      setUploading(false)
    }
    if (uploaded.length === 0) return
    if (multiple) {
      setSelected((current) => [...current, ...uploaded])
      setLoaded(true)
    } else {
      onSelect([uploaded[0]])
      close()
    }
  }

  function toggle(url: string) {
    setSelected((current) => (current.includes(url) ? current.filter((item) => item !== url) : [...current, url]))
  }

  function pick(item: MediaItem) {
    if (multiple) {
      toggle(item.url)
      return
    }
    onSelect([item.url])
    close()
  }

  function confirm() {
    if (selected.length === 0) return
    onSelect(selected)
    close()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Biblioteka mediów'}
    >
      <button type="button" aria-label="Zamknij" onClick={close} className="absolute inset-0 cursor-default bg-black/60" />
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-md border border-border bg-background shadow-xl"
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
          void handleFiles(event.dataTransfer.files)
        }}
      >
        <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
          <div>
            <h2 className="text-base font-semibold">{title ?? (multiple ? 'Dodaj zdjęcia' : 'Wybierz zdjęcie')}</h2>
            <p className="text-xs text-muted-foreground">
              {multiple ? 'Zaznacz zdjęcia lub przeciągnij nowe pliki.' : 'Kliknij zdjęcie, aby je wybrać.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <Upload className="size-4" aria-hidden="true" />
              {uploading ? 'Przesyłanie…' : 'Prześlij'}
            </button>
            <button
              type="button"
              onClick={close}
              aria-label="Zamknij"
              className="rounded-sm p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="sr-only"
          onChange={(event) => {
            void handleFiles(event.target.files)
            event.target.value = ''
          }}
        />

        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center">
          <label className="relative block flex-1">
            <span className="sr-only">Szukaj zdjęć</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Szukaj po nazwie pliku…"
              className={`${inputClass} pl-9`}
            />
          </label>
          <div className="flex items-center gap-1 rounded-sm border border-border p-0.5">
            {(['all', 'upload', 'library'] as GroupFilter[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-sm px-2.5 py-1 text-xs font-medium transition-colors ${
                  filter === value ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {value === 'all' ? 'Wszystkie' : value === 'upload' ? 'Wgrane' : 'Biblioteka'}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 border-b border-border bg-destructive/10 px-4 py-2 text-xs text-destructive"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => {
                setError(null)
                setRefreshKey((value) => value + 1)
              }}
              className="font-medium underline underline-offset-2"
            >
              Spróbuj ponownie
            </button>
          </div>
        )}

        <div className="relative min-h-[200px] flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Wczytywanie…</p>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                {items.length === 0 ? 'Biblioteka jest pusta.' : 'Brak zdjęć pasujących do wyszukiwania.'}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-sm border border-dashed border-border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
              >
                <ImagePlus className="size-4" aria-hidden="true" />
                Prześlij pierwsze zdjęcie
              </button>
            </div>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {filtered.map((item) => {
                const isSelected = selected.includes(item.url)
                return (
                  <li key={`${item.group}-${item.url}`}>
                    <button
                      type="button"
                      onClick={() => pick(item)}
                      aria-pressed={multiple ? isSelected : undefined}
                      title={item.name}
                      className={`group relative block w-full overflow-hidden rounded-sm border bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                        isSelected ? 'border-primary ring-2 ring-primary' : 'border-border'
                      }`}
                    >
                      <span className="block aspect-square w-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      </span>
                      <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-1.5 py-1 text-left text-[10px] text-white">
                        {item.name}
                      </span>
                      <span
                        className={`absolute right-1 top-1 flex size-5 items-center justify-center rounded-full text-primary-foreground transition-opacity ${
                          isSelected ? 'bg-primary opacity-100' : 'bg-primary opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <Check className="size-3" aria-hidden="true" />
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {dragging && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-primary/10 text-primary">
              <UploadCloud className="size-10" aria-hidden="true" />
              <p className="text-sm font-semibold">Upuść zdjęcia, aby je przesłać</p>
            </div>
          )}
        </div>

        {multiple && (
          <footer className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {selected.length === 0 ? 'Nie wybrano zdjęć' : `Wybrano: ${selected.length}`}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={close}
                className="rounded-sm border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={selected.length === 0}
                className="rounded-sm bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                Dodaj zaznaczone
              </button>
            </div>
          </footer>
        )}
      </div>
    </div>
  )
}
