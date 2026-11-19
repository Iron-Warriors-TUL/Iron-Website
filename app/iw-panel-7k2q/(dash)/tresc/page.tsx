import Link from 'next/link'
import { contentAreas } from '@/lib/content-registry'
import { ADMIN_PATH } from '@/lib/admin'

export default function ContentAreasPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Treść strony</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Edytuj dowolny tekst, obraz i listę na stronie. Elementy używane wielokrotnie (osoby, partnerzy)
          zmieniasz raz w bibliotece.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {contentAreas.map((area) => (
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
