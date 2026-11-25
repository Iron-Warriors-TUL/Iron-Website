'use client'

import { useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { isMediaColumn } from '@/lib/media-columns'
import { cn } from '@/lib/utils'
import { inputClass } from './fields'
import { MediaPicker } from './media-picker'

const cleanCell = (value: string) => value.replaceAll('|', ' ').replace(/\r?\n/g, ' ')

function parseRows(initial: string, columns: number): string[][] {
  return initial
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const cells = line.split('|').map((cell) => cell.trim())
      while (cells.length < columns) cells.push('')
      return cells.slice(0, columns)
    })
}

function serialize(rows: string[][]): string {
  return rows.map((row) => row.join(' | ')).join('\n')
}

/**
 * Edytor pól typu „lines” z kolumnami. Kolumny opisujące zdjęcia dostają
 * przycisk otwierający serwerową bibliotekę mediów, więc zdjęcie można wybrać
 * wszędzie, a nie tylko w głównym polu obrazu.
 */
export function LinesField({
  name,
  columns,
  initial,
}: {
  name: string
  columns: string[]
  initial: string
}) {
  const [rows, setRows] = useState<string[][]>(() => parseRows(initial, columns.length))

  function update(rowIndex: number, cellIndex: number, value: string) {
    setRows((current) =>
      current.map((row, r) => (r === rowIndex ? row.map((cell, c) => (c === cellIndex ? value : cell)) : row)),
    )
  }

  function move(rowIndex: number, direction: -1 | 1) {
    setRows((current) => {
      const target = rowIndex + direction
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[rowIndex], next[target]] = [next[target], next[rowIndex]]
      return next
    })
  }

  function add() {
    setRows((current) => [...current, columns.map(() => '')])
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={serialize(rows)} />

      {rows.length === 0 && (
        <p className="rounded-md border border-dashed border-border bg-background p-4 text-center text-xs text-muted-foreground">
          Brak wpisów. Dodaj pierwszy wiersz.
        </p>
      )}

      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex flex-col gap-3 rounded-md border border-border bg-background p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">Wiersz {rowIndex + 1}</span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => move(rowIndex, -1)}
                disabled={rowIndex === 0}
                aria-label="Przesuń wiersz wyżej"
                className="rounded-sm p-1 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
              >
                <ArrowUp className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => move(rowIndex, 1)}
                disabled={rowIndex === rows.length - 1}
                aria-label="Przesuń wiersz niżej"
                className="rounded-sm p-1 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
              >
                <ArrowDown className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setRows((current) => current.filter((_, index) => index !== rowIndex))}
                aria-label="Usuń wiersz"
                className="rounded-sm p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className={cn('grid gap-3', columns.length > 1 && 'sm:grid-cols-2')}>
            {columns.map((label, cellIndex) => (
              <label key={label} className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground">
                {label}
                {isMediaColumn(label) ? (
                  <div className="flex flex-col gap-1.5">
                    <MediaPicker
                      value={row[cellIndex]}
                      onChange={(url) => update(rowIndex, cellIndex, url)}
                      label="Wybierz zdjęcie"
                    />
                    <input
                      value={row[cellIndex]}
                      onChange={(event) => update(rowIndex, cellIndex, cleanCell(event.target.value))}
                      placeholder="/images/… lub https://…"
                      className={`${inputClass} font-mono text-xs`}
                    />
                  </div>
                ) : (
                  <input
                    value={row[cellIndex]}
                    onChange={(event) => update(rowIndex, cellIndex, cleanCell(event.target.value))}
                    className={inputClass}
                  />
                )}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="inline-flex w-fit items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary"
      >
        <Plus className="size-4" aria-hidden="true" />
        Dodaj wiersz
      </button>
    </div>
  )
}
