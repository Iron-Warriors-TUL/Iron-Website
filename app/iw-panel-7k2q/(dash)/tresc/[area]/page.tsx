import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { contentAreaByKey } from '@/lib/content-registry'
import { listEntries } from '@/lib/content'
import { ADMIN_PATH } from '@/lib/admin'
import { BackLink } from '@/components/admin/list'
import { addContentEntry } from '../../../actions'
import { inputClass } from '@/components/admin/fields'

export default async function ContentAreaPage({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params
  const definition = contentAreaByKey.get(area)
  if (!definition) notFound()
  if (definition.single) redirect(`${ADMIN_PATH}/tresc/${area}/main`)

  const entries = await listEntries(area)
  return (
    <div className="flex flex-col gap-6">
      <BackLink href={`${ADMIN_PATH}/tresc`} />
      <div>
        <h1 className="text-3xl font-bold">{definition.label}</h1>
        {definition.description && <p className="mt-2 text-sm text-muted-foreground">{definition.description}</p>}
      </div>
      {!definition.single && (
        <form action={addContentEntry} className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-card p-4">
          <input type="hidden" name="area" value={area} />
          <label htmlFor="new-entry" className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
            Dodaj nowy wpis
            <input
              id="new-entry"
              name="entryKey"
              required
              maxLength={120}
              placeholder={area === 'team-sections' ? '2025-2026::64' : 'klucz-wpisu'}
              className={inputClass}
            />
          </label>
          <button type="submit" className="rounded-sm bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90">
            Dodaj i edytuj
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
              {entry.isDefault ? 'domyślne' : entry.key}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
