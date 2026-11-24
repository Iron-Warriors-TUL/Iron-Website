import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { contentAreaByKey } from '@/lib/content-registry'
import { listEntries } from '@/lib/content'
import { ADMIN_PATH } from '@/lib/admin'
import { BackLink } from '@/components/admin/list'
import { addContentEntry } from '../../../actions'
import { inputClass } from '@/components/admin/fields'

const PAGE_ERRORS: Record<string, string> = {
  key: 'Nieprawidłowy klucz wpisu. Dozwolone są litery, cyfry oraz znaki : _ / -.',
  slug: 'Podstrona wymaga adresu w formacie slug (małe litery, cyfry, myślniki), np. „o-nas”. Nie można użyć adresu zajętego przez istniejącą stronę.',
}

export default async function ContentAreaPage({
  params,
  searchParams,
}: {
  params: Promise<{ area: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { area } = await params
  const { error } = await searchParams
  const definition = contentAreaByKey.get(area)
  if (!definition) notFound()
  if (definition.single) redirect(`${ADMIN_PATH}/tresc/${area}/main`)

  const isPages = area === 'pages'
  const entries = await listEntries(area)

  return (
    <div className="flex flex-col gap-6">
      <BackLink href={`${ADMIN_PATH}/tresc`} />
      <div>
        <h1 className="text-3xl font-bold">{definition.label}</h1>
        {definition.description && <p className="mt-2 text-sm text-muted-foreground">{definition.description}</p>}
      </div>

      {error && PAGE_ERRORS[error] && (
        <p role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {PAGE_ERRORS[error]}
        </p>
      )}

      {!definition.single && (
        <form action={addContentEntry} className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-card p-4">
          <input type="hidden" name="area" value={area} />
          <label htmlFor="new-entry" className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
            {isPages ? 'Adres nowej podstrony' : 'Dodaj nowy wpis'}
            <input
              id="new-entry"
              name="entryKey"
              required
              maxLength={120}
              pattern={isPages ? '[a-z0-9]+(?:-[a-z0-9]+)*' : undefined}
              title={isPages ? 'Tylko małe litery, cyfry i myślniki, np. o-nas' : undefined}
              placeholder={isPages ? 'o-nas' : area === 'team-sections' ? '2025-2026::64' : 'klucz-wpisu'}
              className={inputClass}
            />
            {isPages && (
              <span className="text-xs font-normal text-muted-foreground">
                Strona będzie dostępna pod adresem <code>{'/{slug}'}</code>, np. <code>/o-nas</code>.
              </span>
            )}
          </label>
          <button type="submit" className="rounded-sm bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90">
            {isPages ? 'Utwórz podstronę' : 'Dodaj i edytuj'}
          </button>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {entries.map((entry) => (
          <Link
            key={entry.key}
            href={`${ADMIN_PATH}/tresc/${area}/${encodeURIComponent(entry.key)}`}
            className="flex items-center justify-between gap-4 rounded-md border border-border bg-card px-4 py-3 transition-colors hover:border-primary"
          >
            <span className="text-sm font-medium">
              {definition.entryLabel?.(entry.key, entry.data) ?? entry.key}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {isPages ? `/${entry.key}` : entry.isDefault ? 'domyślne' : entry.key}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
