import Link from 'next/link'
import { Plus } from 'lucide-react'
import { contentAreas } from '@/lib/content-registry'
import { ADMIN_PATH } from '@/lib/admin'

export default function ContentAreasPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Treść strony</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Edytuj dowolny tekst, obraz i listę na stronie. Elementy używane wielokrotnie (osoby, partnerzy)
            zmieniasz raz w bibliotece.
          </p>
        </div>
        <Link
          href={`${ADMIN_PATH}/tresc/pages`}
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden="true" />
          Dodaj nową podstronę
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {contentAreas.filter((area) => !area.hidden).map((area) => (
          <Link
            key={area.key}
            href={`${ADMIN_PATH}/tresc/${area.key}`}
            className="flex flex-col gap-2 rounded-md border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <span className="text-lg font-semibold">{area.label}</span>
            {area.description && <span className="text-sm text-muted-foreground">{area.description}</span>}
            <span className="mt-auto text-xs text-muted-foreground">
              {area.single ? 'Jeden wpis' : `${area.keys.length} wpisów`}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
