import Link from 'next/link'
import { ExternalLink, Plus } from 'lucide-react'
import { contentAreaByKey } from '@/lib/content-registry'
import { ADMIN_PATH, requireCmsPage } from '@/lib/admin'
import { canEditContentArea } from '@/lib/roles'

/** Obszary treści pogrupowane tak, jak wyglądają na stronie. */
const GROUPS: { title: string; preview?: string; areas: string[] }[] = [
  { title: 'Strona główna', preview: '/', areas: ['home', 'home-vehicles', 'cta'] },
  { title: 'Zespół', preview: '/zespol-2025-2026', areas: ['people', 'team-years', 'team-sections'] },
  { title: 'Partnerzy', preview: '/partnerzy-2026', areas: ['partner-catalog', 'partner-groups', 'partner-years', 'become-partner'] },
  { title: 'Bolidy', preview: '/bolidy', areas: ['vehicle-list', 'vehicle-layout'] },
  { title: 'Rekrutacja', preview: '/dolacz-do-nas', areas: ['recruitment', 'recruitment-departments'] },
  { title: 'Kontakt i stopka', preview: '/kontakt', areas: ['contact', 'footer'] },
  { title: 'Inne', areas: ['pages', 'settings'] },
]

export default async function ContentAreasPage() {
  const session = await requireCmsPage()
  const groups = GROUPS.map((group) => ({
    ...group,
    areas: group.areas
      .map((key) => contentAreaByKey.get(key))
      .filter((area): area is NonNullable<typeof area> => Boolean(area) && canEditContentArea(session.user.role, area!.key)),
  })).filter((group) => group.areas.length)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Teksty i zdjęcia</h1>
          <p className="mt-2 text-sm text-muted-foreground">Wybierz część strony, którą chcesz zmienić.</p>
        </div>
        <Link
          href={`${ADMIN_PATH}/tresc/pages`}
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden="true" />
          Nowa podstrona
        </Link>
      </div>
      {groups.map((group) => (
        <section key={group.title} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{group.title}</h2>
            {group.preview && (
              <Link href={group.preview} target="_blank" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                Zobacz na stronie <ExternalLink className="size-3" aria-hidden="true" />
              </Link>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {group.areas.map((area) => (
              <Link
                key={area.key}
                href={`${ADMIN_PATH}/tresc/${area.key}`}
                className="flex flex-col gap-1 rounded-md border border-border bg-card p-4 transition-colors hover:border-primary"
              >
                <span className="font-semibold">{area.label}</span>
                {area.description && <span className="text-sm text-muted-foreground">{area.description}</span>}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
