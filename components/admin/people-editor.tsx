'use client'

import { useMemo, useState } from 'react'
import { Plus, Search, Trash2, UserRound } from 'lucide-react'
import { FixedImage } from '@/components/site/smart-image'
import { inputClass } from './fields'
import { MediaPicker } from './media-picker'

type Person = { id: string; name: string; photo: string; portrait: boolean }

const cleanCell = (value: string) => value.replaceAll('|', ' ').replace(/\r?\n/g, ' ')

function parseRows(rows: string[][]): Person[] {
  return rows
    .map(([id, name, photo, portrait]) => ({
      id: cleanCell(id ?? '').trim(),
      name: cleanCell(name ?? ''),
      photo: cleanCell(photo ?? '').trim(),
      portrait: (portrait ?? '').trim().toLowerCase() === 'tak',
    }))
    .filter((person) => person.id)
}

function serialize(people: Person[]) {
  return people
    .map((person) => [person.id, person.name, person.photo, person.portrait ? 'tak' : ''].join('|'))
    .join('\n')
}

function nextId(people: Person[]) {
  let max = 0
  for (const person of people) {
    const match = /^p(\d+)$/i.exec(person.id)
    if (match) max = Math.max(max, Number(match[1]))
  }
  return `p${String(max + 1).padStart(3, '0')}`
}

export function PeopleEditor({ initial }: { initial: string[][] }) {
  const [people, setPeople] = useState<Person[]>(() => parseRows(initial))
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return people
    return people.filter(
      (person) =>
        person.name.toLowerCase().includes(needle) || person.id.toLowerCase().includes(needle),
    )
  }, [people, query])

  function update(id: string, patch: Partial<Person>) {
    setPeople((current) => current.map((person) => (person.id === id ? { ...person, ...patch } : person)))
  }

  function remove(id: string) {
    setPeople((current) => current.filter((person) => person.id !== id))
  }

  function add() {
    setQuery('')
    setPeople((current) => [...current, { id: nextId(current), name: '', photo: '', portrait: false }])
  }

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name="items" value={serialize(people)} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Biblioteka osób</p>
          <p className="text-xs text-muted-foreground">
            {people.length} osób{query.trim() ? ` • widoczne: ${filtered.length}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden="true" />
          Dodaj osobę
        </button>
      </div>

      <label className="relative block">
        <span className="sr-only">Szukaj osób</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Szukaj po imieniu, nazwisku lub Id…"
          className={`${inputClass} pl-9`}
        />
      </label>

      <p className="text-xs text-muted-foreground">
        Identyfikator jest nadawany automatycznie i służy do odwołań w sekcjach zespołów — nie zmieniaj go ręcznie.
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
          {people.length === 0 ? 'Biblioteka jest pusta. Dodaj pierwszą osobę.' : 'Brak osób pasujących do wyszukiwania.'}
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((person) => (
            <li key={person.id} className="flex flex-col gap-3 rounded-md border border-border bg-background p-3 sm:flex-row">
              <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-secondary sm:w-24">
                {person.photo ? (
                  <FixedImage
                    src={person.photo}
                    alt={person.name || 'Zdjęcie osoby'}
                    width={96}
                    height={112}
                    sizes="96px"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="size-8 text-muted-foreground" aria-hidden="true" />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {person.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(person.id)}
                    aria-label={`Usuń ${person.name || person.id}`}
                    title="Usuń osobę"
                    className="rounded-sm p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>

                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                  Imię i nazwisko
                  <input
                    value={person.name}
                    onChange={(event) => update(person.id, { name: cleanCell(event.target.value) })}
                    placeholder="Imię i nazwisko"
                    className={inputClass}
                  />
                </label>

                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  Zdjęcie
                  <MediaPicker
                    value={person.photo}
                    onChange={(url) => update(person.id, { photo: url })}
                    label="Wybierz zdjęcie"
                  />
                  <input
                    value={person.photo}
                    onChange={(event) => update(person.id, { photo: cleanCell(event.target.value).trim() })}
                    placeholder="/images/…"
                    aria-label="Ścieżka zdjęcia"
                    className={`${inputClass} font-mono text-xs`}
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={person.portrait}
                    onChange={(event) => update(person.id, { portrait: event.target.checked })}
                    className="size-4 accent-[var(--primary)]"
                  />
                  Portret (zdjęcie pionowe)
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
