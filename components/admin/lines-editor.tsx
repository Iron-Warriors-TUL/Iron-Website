'use client'

import { useState, useTransition } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2, Upload } from 'lucide-react'
import { uploadImage } from '@/app/iw-panel-7k2q/actions'
import { inputClass } from './fields'

/** Opcja listy wyboru: wartość zapisywana w treści i nazwa widoczna dla redaktora. */
export type RefOption = { value: string; label: string }

/** Słowniki do kolumn odwołujących się do innych danych (partnerzy, osoby, bolidy). */
export type LineReferences = Partial<Record<'partner' | 'person' | 'vehicle', RefOption[]>>

type ColumnKind =
  | { kind: 'autoId' }
  | { kind: 'select'; options: RefOption[] }
  | { kind: 'image' }
  | { kind: 'text' }

const SOCIAL_ICONS: RefOption[] = ['facebook', 'instagram', 'youtube', 'linkedin'].map((v) => ({ value: v, label: v }))

/** Rodzaj pola wynika z nazwy kolumny w content-registry, więc nie trzeba zmieniać definicji obszarów. */
function columnKind(column: string, refs: LineReferences): ColumnKind {
  const name = column.toLowerCase()
  if (name.startsWith('id (nie zmieniaj)')) return { kind: 'autoId' }
  if (name === 'id partnera' && refs.partner) return { kind: 'select', options: refs.partner }
  if (name === 'id osoby' && refs.person) return { kind: 'select', options: refs.person }
  if (name === 'slug bolidu' && refs.vehicle) return { kind: 'select', options: refs.vehicle }
  if (name === 'ikona') return { kind: 'select', options: SOCIAL_ICONS }
  if (/^(logo|obraz|zdjęcie|ścieżka obrazu)$/.test(name)) return { kind: 'image' }
  return { kind: 'text' }
}

// Wiersze są zapisywane jako „a | b | c”, więc z komórek usuwamy separator i nowe linie.
const cleanCell = (value: string) => value.replaceAll('|', ' ').replace(/\r?\n/g, ' ')

/** Następny wolny identyfikator w stylu istniejących (np. c042 → c043). */
function nextId(rows: string[][], col: number) {
  let prefix = 'x'
  let width = 3
  let max = 0
  for (const row of rows) {
    const match = /^([a-z]+)(\d+)$/i.exec(row[col] ?? '')
    if (!match) continue
    prefix = match[1]
    width = match[2].length
    max = Math.max(max, Number(match[2]))
  }
  return `${prefix}${String(max + 1).padStart(width, '0')}`
}

/** Przycisk „Prześlij” przy ścieżce obrazu w wierszu listy. */
function UploadButton({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  return (
    <label
      title={error ?? 'Prześlij plik'}
      className={`flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-sm border ${error ? 'border-destructive text-destructive' : 'border-border text-muted-foreground'} hover:border-primary hover:text-primary`}
    >
      <Upload className={`size-4 ${pending ? 'animate-pulse' : ''}`} aria-hidden="true" />
      <span className="sr-only">{pending ? 'Przesyłanie…' : 'Prześlij plik'}</span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        disabled={pending}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (!file) return
          const fd = new FormData()
          fd.append('file', file)
          setError(null)
          startTransition(async () => {
            const res = await uploadImage(fd)
            if (res.url) onUploaded(res.url)
            else setError(res.error ?? 'Błąd przesyłania')
          })
        }}
      />
    </label>
  )
}

function isPreviewable(src: string) {
  return /^\/(?!\/)/.test(src) || src.startsWith('https://')
}

/**
 * Edytor list „wiersz po wierszu” zamiast surowego tekstu z separatorem „|”.
 * Każda kolumna ma własne pole, wiersze można dodawać, usuwać i przesuwać.
 * Wynik trafia do ukrytego pola w tym samym formacie, którego oczekuje akcja zapisu.
 */
export function LinesEditor({
  name,
  columns,
  initial,
  references = {},
}: {
  name: string
  columns: string[]
  initial: string[][]
  references?: LineReferences
}) {
  const [rows, setRows] = useState<string[][]>(initial)
  const kinds = columns.map((column) => columnKind(column, references))
  const autoIdCol = kinds.findIndex((k) => k.kind === 'autoId')
  const serialized = rows.map((row) => row.map((cell) => cleanCell(cell).trim()).join(' | ')).join('\n')

  const setCell = (r: number, c: number, value: string) =>
    setRows((current) => current.map((row, i) => (i === r ? row.map((cell, j) => (j === c ? cleanCell(value) : cell)) : row)))

  const move = (r: number, delta: number) =>
    setRows((current) => {
      const target = r + delta
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[r], next[target]] = [next[target], next[r]]
      return next
    })

  const add = () =>
    setRows((current) => {
      const row = columns.map(() => '')
      if (autoIdCol >= 0) row[autoIdCol] = nextId(current, autoIdCol)
      return [...current, row]
    })

  const single = columns.length === 1

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={serialized} />
      {rows.length === 0 && (
        <p className="rounded-md border border-dashed border-border bg-background p-4 text-center text-sm text-muted-foreground">
          Lista jest pusta.
        </p>
      )}
      <ol className="flex flex-col gap-2">
        {rows.map((row, r) => (
          <li key={r} className="flex items-start gap-2 rounded-md border border-border bg-background p-2">
            <span className="mt-2 w-6 shrink-0 text-right font-mono text-xs text-muted-foreground">{r + 1}.</span>
            <div className={`grid min-w-0 flex-1 gap-2 ${single ? '' : columns.length === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`}>
              {columns.map((column, c) => {
                const kind = kinds[c]
                const value = row[c] ?? ''
                const id = `${name}-${r}-${c}`
                return (
                  <div key={column} className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground">
                    {single ? null : <label htmlFor={id}>{column}</label>}
                    {kind.kind === 'autoId' ? (
                      <input id={id} value={value} readOnly className={`${inputClass} bg-secondary font-mono text-xs`} />
                    ) : kind.kind === 'select' ? (
                      <select id={id} value={value} onChange={(e) => setCell(r, c, e.target.value)} className={inputClass}>
                        <option value="">— wybierz —</option>
                        {!kind.options.some((o) => o.value === value) && value && <option value={value}>{value} (nieznane)</option>}
                        {kind.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : kind.kind === 'image' ? (
                      <span className="flex items-center gap-2">
                        <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-secondary">
                          {value && isPreviewable(value) && (
                            // eslint-disable-next-line @next/next/no-img-element -- podgląd dowolnej ścieżki w panelu
                            <img src={value} alt="" className="max-h-full max-w-full object-contain" />
                          )}
                        </span>
                        <input
                          id={id}
                          value={value}
                          onChange={(e) => setCell(r, c, e.target.value.trim())}
                          placeholder="/images/…"
                          className={`${inputClass} font-mono text-xs`}
                        />
                        <UploadButton onUploaded={(url) => setCell(r, c, url)} />
                      </span>
                    ) : (
                      <input id={id} value={value} onChange={(e) => setCell(r, c, e.target.value)} className={inputClass} />
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
              <button type="button" onClick={() => move(r, -1)} disabled={r === 0} title="Przesuń wyżej" aria-label="Przesuń wyżej" className="rounded-sm p-1 text-muted-foreground hover:bg-secondary disabled:opacity-30">
                <ArrowUp className="size-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => move(r, 1)} disabled={r === rows.length - 1} title="Przesuń niżej" aria-label="Przesuń niżej" className="rounded-sm p-1 text-muted-foreground hover:bg-secondary disabled:opacity-30">
                <ArrowDown className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setRows((current) => current.filter((_, i) => i !== r))}
                title="Usuń wiersz"
                aria-label="Usuń wiersz"
                className="rounded-sm p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-2 self-start rounded-sm border border-border px-3 py-1.5 text-sm font-semibold hover:bg-secondary"
      >
        <Plus className="size-4" aria-hidden="true" />
        Dodaj wiersz
      </button>
    </div>
  )
}
