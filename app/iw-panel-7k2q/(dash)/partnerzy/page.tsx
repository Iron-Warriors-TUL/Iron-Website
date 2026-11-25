import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { ADMIN_PATH, requireCmsPage } from '@/lib/admin'
import { getContent, getEntryKeys } from '@/lib/content'
import { keysForYear } from '@/lib/cms-helpers'
import { AdminForm } from '@/components/admin/admin-form'
import { Checkbox, Field, inputClass } from '@/components/admin/fields'
import { ImageField } from '@/components/admin/image-field'
import { addPartner, createSeason } from '../../shortcut-actions'

function Card({ id, title, description, children }: { id?: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="flex scroll-mt-20 flex-col gap-4 rounded-md border border-border bg-card p-5">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  )
}

export default async function PartnersAdminPage({ searchParams }: { searchParams: Promise<{ sezon?: string }> }) {
  const session = await requireCmsPage()
  const isAdmin = session.user.role === 'admin'
  const { sezon } = await searchParams
  const [years, groupKeys, teamSeasons] = await Promise.all([
    getEntryKeys('partner-years'),
    getEntryKeys('partner-groups'),
    getEntryKeys('team-years'),
  ])
  const sortedYears = [...years].sort((a, b) => b.localeCompare(a))

  const groupsByYear = await Promise.all(
    sortedYears.map(async (year) => ({
      year,
      groups: await Promise.all(
        keysForYear(groupKeys, year).map(async (key) => {
          const data = await getContent('partner-groups', key)
          const [, section, group] = key.split('::')
          const count = Array.isArray(data.items) ? data.items.length : 0
          const title = typeof data.title === 'string' && data.title ? data.title : `Sekcja ${Number(section) + 1}`
          return { key, label: `${title}, rząd ${Number(group) + 1} (${count} log.)` }
        }),
      ),
    })),
  )
  const latestTeam = [...teamSeasons].sort((a, b) => b.localeCompare(a))[0] ?? ''
  const nextPartnerYear = String(Number(sortedYears[0] ?? new Date().getFullYear()) + 1)
  const nextTeam = latestTeam ? `${Number(latestTeam.slice(0, 4)) + 1}-${Number(latestTeam.slice(5, 9)) + 1}` : ''

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Partnerzy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Dodaj sponsora w jednym kroku albo edytuj, kto jest w danym roku.</p>
      </div>

      {sezon && (
        <p role="status" className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          Utworzono: {sezon}. Uzupełnij skład poniżej.
        </p>
      )}

      <Card title="Dodaj partnera" description="Nazwa, logo i link trafią do katalogu, a partner od razu pojawi się w wybranym roku.">
        <AdminForm action={addPartner} submitLabel="Dodaj partnera" resetOnSuccess>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nazwa firmy" htmlFor="name">
              <input id="name" name="name" required maxLength={120} className={inputClass} />
            </Field>
            <Field label="Strona www (opcjonalnie)" htmlFor="href">
              <input id="href" name="href" type="url" placeholder="https://…" maxLength={500} className={inputClass} />
            </Field>
          </div>
          <ImageField name="logo" label="Logo" />
          <Field label="Gdzie pokazać" htmlFor="group" hint="Rok i rząd logotypów na stronie partnerów.">
            <select id="group" name="group" defaultValue={groupsByYear[0]?.groups[0]?.key ?? ''} className={inputClass}>
              {groupsByYear.map(({ year, groups }) => (
                <optgroup key={year} label={`Partnerzy ${year}`}>
                  {groups.map((group) => (
                    <option key={group.key} value={group.key}>
                      {year}: {group.label}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value="">Tylko do katalogu (bez pokazywania)</option>
            </select>
          </Field>
        </AdminForm>
      </Card>

      <Card title="Partnerzy w poszczególnych latach" description="Kliknij rząd, aby zmienić kolejność logotypów albo kogoś usunąć.">
        <div className="flex flex-col gap-4">
          {groupsByYear.map(({ year, groups }) => (
            <div key={year} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-semibold">{year}</h3>
                <Link href={`/partnerzy/${year}`} target="_blank" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  Zobacz na stronie <ExternalLink className="size-3" aria-hidden="true" />
                </Link>
                <Link href={`${ADMIN_PATH}/tresc/partner-years/${year}`} className="text-xs text-muted-foreground hover:text-primary hover:underline">
                  Tło i wygląd
                </Link>
              </div>
              <ul className="flex flex-wrap gap-2">
                {groups.map((group) => (
                  <li key={group.key}>
                    <Link
                      href={`${ADMIN_PATH}/tresc/partner-groups/${encodeURIComponent(group.key)}`}
                      className="inline-block rounded-sm border border-border px-3 py-1.5 text-sm hover:border-primary hover:text-primary"
                    >
                      {group.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Link href={`${ADMIN_PATH}/tresc/partner-catalog/main`} className="self-start text-sm text-primary hover:underline">
          Katalog wszystkich partnerów (nazwy, logo, linki) →
        </Link>
      </Card>

      {isAdmin && (
        <Card
          id="nowy-sezon"
          title="Nowy sezon"
          description="Zakłada nowy rok partnerów i zespołu na wzór ostatniego (tła, sekcje, układ) i dodaje je do menu strony."
        >
          <AdminForm action={createSeason} submitLabel="Utwórz sezon">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Rok partnerów" htmlFor="partnerYear" hint="Np. 2027. Puste = pomiń.">
                <input id="partnerYear" name="partnerYear" defaultValue={nextPartnerYear} pattern="\d{4}" className={inputClass} />
              </Field>
              <Field label="Sezon zespołu" htmlFor="teamSeason" hint="Np. 2026-2027. Puste = pomiń.">
                <input id="teamSeason" name="teamSeason" defaultValue={nextTeam} pattern="\d{4}-\d{4}" className={inputClass} />
              </Field>
            </div>
            <Checkbox name="copyMembers" label="Skopiuj obecnych partnerów i skład zespołu (potem tylko poprawiasz zmiany)" defaultChecked />
            <Checkbox name="addToMenu" label="Dodaj do menu strony i ustaw jako bieżący" defaultChecked />
          </AdminForm>
        </Card>
      )}
    </div>
  )
}
