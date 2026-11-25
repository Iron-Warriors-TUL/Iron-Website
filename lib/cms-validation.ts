import { z } from 'zod'
import type { Field } from './content-registry'
import { isHttpsUrl, isSafePath } from './safe-url'

/*
 * Czysta walidacja i parsowanie danych z formularzy panelu CMS.
 * Bez zależności od bazy, sesji ani Next.js, dzięki czemu da się to testować
 * jednostkowo (tests/cms-validation.test.ts). Akcje serwerowe w
 * app/iw-panel-7k2q/actions.ts tylko z tego korzystają.
 */

export type FormState = { error?: string; ok?: boolean }

const str = (max: number) => z.string().trim().max(max)
const optStr = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === '' ? null : v))

export const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Slug jest wymagany')
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug: tylko małe litery, cyfry i myślniki')

// Ścieżka lokalna: pojedynczy '/' na początku (odrzuca protokołowo-względne '//host').
// Zewnętrzne adresy wyłącznie po HTTPS.
export const imageUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === '' || isSafePath(v) || isHttpsUrl(v), 'Nieprawidłowy adres obrazu')
  .transform((v) => (v === '' ? null : v))

export const href = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine(
    (v) => isSafePath(v) || v.startsWith('#') || isHttpsUrl(v),
    'Link musi być ścieżką (/...), kotwicą (#...) lub adresem https://',
  )

export const int = z.coerce.number().int().min(-100000).max(100000)
export const id = z.coerce.number().int().positive()

export const bool = (fd: FormData, key: string) => fd.get(key) === 'on'
export const s = (fd: FormData, key: string) => String(fd.get(key) ?? '')

/** Wiersze w formacie „a | b | c”, dopełnione do `size` kolumn, max 50 wierszy. */
export function pipeLines(raw: string, size: number) {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 50)
    .map((l) => {
      const parts = l.split('|').map((p) => p.trim().slice(0, 300))
      while (parts.length < size) parts.push('')
      return parts.slice(0, size)
    })
}

export function fail(e: unknown): FormState {
  if (e instanceof z.ZodError) return { error: e.issues[0]?.message ?? 'Nieprawidłowe dane' }
  if (e instanceof Error && 'code' in e && (e as { code?: string }).code === '23505')
    return { error: 'Taki slug już istnieje.' }
  console.error('[cms] action error', e)
  return { error: 'Nie udało się zapisać zmian.' }
}

/* ---------- Schematy formularzy ---------- */

export const navSchema = z.object({
  label: str(60).min(1, 'Etykieta jest wymagana'),
  href,
  parentId: z
    .string()
    .transform((v) => (v === '' ? null : Number(v)))
    .pipe(z.number().int().positive().nullable()),
  isButton: z.boolean(),
})

export const postSchema = z.object({
  slug,
  title: str(200).min(1, 'Tytuł jest wymagany'),
  excerpt: str(500),
  content: str(50000),
  coverImage: imageUrl,
  published: z.boolean(),
  publishedAt: z.coerce.date(),
})

export const vehicleSchema = z.object({
  slug,
  name: str(120).min(1, 'Nazwa jest wymagana'),
  debutYear: z
    .string()
    .transform((v) => (v === '' ? null : Number(v)))
    .pipe(z.number().int().min(1990).max(2100).nullable()),
  imageUrl,
  description: str(20000),
  goal: str(1000),
  bestResult: optStr(200),
  featured: z.boolean(),
  sortOrder: int,
})

export const projectSchema = z.object({
  category: str(120).min(1, 'Kategoria jest wymagana'),
  title: str(300).min(1, 'Tytuł jest wymagany'),
  program: str(300),
  funding: str(100),
  ownContribution: optStr(100),
  totalValue: optStr(100),
  period: str(50),
  description: str(10000),
  heading: str(500),
  imageUrls: str(4000),
  sortOrder: int,
})

/** Specyfikacje, statystyki i osiągnięcia bolidu z pól tekstowych „a | b | …”. */
export function parseVehicleLists(fd: FormData) {
  return {
    specs: pipeLines(s(fd, 'specs'), 2).map(([label, value]) => ({ label, value })),
    stats: pipeLines(s(fd, 'stats'), 3).map(([label, value, unit]) => ({ label, value, unit })),
    achievements: pipeLines(s(fd, 'achievements'), 4).map(([title, location, result, countryCode]) => ({
      title,
      location,
      result,
      countryCode: countryCode || undefined,
    })),
  }
}

/* ---------- Nawigacja ---------- */

type SortableNavItem = { id: number; parentId: number | null; sortOrder: number }

/**
 * Przesuwa pozycję menu o jedno miejsce wśród rodzeństwa.
 * Zwraca nową kolejność rodzeństwa (sortOrder = indeks * 10) albo null, gdy ruch jest niemożliwy.
 */
export function reorderNavSiblings(
  items: SortableNavItem[],
  itemId: number,
  direction: 'up' | 'down',
): { id: number; sortOrder: number }[] | null {
  const current = items.find((item) => item.id === itemId)
  if (!current) return null

  const siblings = items
    .filter((item) => item.parentId === current.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
  const index = siblings.findIndex((item) => item.id === itemId)
  const targetIndex = index + (direction === 'up' ? -1 : 1)
  if (index < 0 || targetIndex < 0 || targetIndex >= siblings.length) return null

  const reordered = [...siblings]
  ;[reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]]
  return reordered.map((item, position) => ({ id: item.id, sortOrder: position * 10 }))
}

/* ---------- Generyczna treść strony ---------- */

export function isValidEntryKey(entryKey: string) {
  return Boolean(entryKey) && entryKey.length <= 120 && /^[a-zA-Z0-9:_/-]+$/.test(entryKey)
}

export class ContentFieldError extends Error {}

export function parseFieldValue(field: Field, raw: FormData): unknown {
  if (field.type === 'checkbox') return bool(raw, field.name)
  const value = s(raw, field.name)
  if (field.type === 'lines') {
    return value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 200)
      .map((line) => {
        const cells = line.split('|').map((part) => part.trim().slice(0, 8000))
        while (cells.length < field.columns.length) cells.push('')
        return cells.slice(0, field.columns.length)
      })
  }
  if (field.type === 'textarea') return value.slice(0, 100000)
  if (field.type === 'url' && value && !isHttpsUrl(value) && !isSafePath(value)) {
    throw new ContentFieldError('Link musi zaczynać się od https:// lub /')
  }
  return value.slice(0, 4000)
}

/* ---------- Konta ---------- */

export type AccountInput = {
  name: string
  email: string
  password: string
  role: 'admin' | 'editor'
  id: string
}

/** Walidacja formularza konta. Hasło jest wymagane przy tworzeniu, opcjonalne przy edycji. */
export function parseAccountInput(fd: FormData): { data: AccountInput } | { error: string } {
  const name = s(fd, 'name').trim()
  const email = s(fd, 'email').trim().toLowerCase()
  const password = s(fd, 'password')
  const role = s(fd, 'role')
  const rawId = s(fd, 'id')

  if (!name || name.length > 80) return { error: 'Podaj prawidłowe imię i nazwisko.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return { error: 'Podaj prawidłowy adres e-mail.' }
  }
  if (role !== 'admin' && role !== 'editor') return { error: 'Nieprawidłowa rola.' }
  if (!rawId && password.length < 12) return { error: 'Hasło musi mieć co najmniej 12 znaków.' }
  if (rawId && password && password.length < 12) return { error: 'Nowe hasło musi mieć co najmniej 12 znaków.' }

  return { data: { name, email, password, role, id: rawId } }
}
