import { notFound, redirect } from 'next/navigation'
import { contentAreaByKey } from '@/lib/content-registry'
import { applyPageBlocks, getEntryKeys, getPartnerCardMap, getPeopleMap, getStoredContent } from '@/lib/content'
import { getVehicles } from '@/lib/data'
import { pool } from '@/lib/db'
import type { LineReferences } from '@/components/admin/lines-editor'
import { ADMIN_PATH, requireCmsPage } from '@/lib/admin'
import { canEditContentArea } from '@/lib/roles'
import { BackLink } from '@/components/admin/list'
import { ContentForm } from '@/components/admin/content-form'

export default async function ContentEntryPage({
  params,
}: {
  params: Promise<{ area: string; key: string }>
}) {
  const { area, key: rawKey } = await params
  // Next.js nie dekoduje %3A w segmentach trasy, a klucze wpisów zawierają „::”.
  // Malformed percent-encoding nie może wywołać 500.
  let key: string
  try {
    key = decodeURIComponent(rawKey)
  } catch {
    notFound()
  }
  const definition = contentAreaByKey.get(area)
  if (!definition) notFound()
  const session = await requireCmsPage()
  if (!canEditContentArea(session.user.role, area)) redirect(`${ADMIN_PATH}?brak-uprawnien=1`)
  const keys = await getEntryKeys(area)
  if (!keys.includes(key)) notFound()

  const stored = await getStoredContent(area, key)
  const data = await applyPageBlocks(area, key, { ...definition.defaults(key), ...stored })
  const references = await loadReferences(definition.fields.flatMap((f) => (f.type === 'lines' ? f.columns : [])))
  const label = definition.entryLabel?.(key, data) ?? definition.label
  const edits = await loadEditHistory(area, key)

  return (
    <div className="flex flex-col gap-6">
      <BackLink href={`${ADMIN_PATH}/tresc/${area}`} />
      <h1 className="text-3xl font-bold">{label}</h1>
      <ContentForm areaKey={area} entryKey={key} data={data} isDefault={!Object.keys(stored).length} references={references} />
      <EditHistory edits={edits} />
    </div>
  )
}

type EditEntry = {
  createdAt: Date
  details: Record<string, unknown> | null
  actorName: string | null
  actorEmail: string | null
}

const editDateFormat = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'short',
  timeStyle: 'medium',
  timeZone: 'Europe/Warsaw',
})

/** Log edycji tej konkretnej strony/wpisu na podstawie `audit_log`. */
async function loadEditHistory(area: string, key: string): Promise<EditEntry[]> {
  const { rows } = await pool.query<EditEntry>(
    `SELECT a."createdAt", a."details", u."name" AS "actorName", u."email" AS "actorEmail"
       FROM "audit_log" a
       LEFT JOIN "user" u ON u."id" = a."actorId"
      WHERE a."targetType" = 'content'
        AND a."targetId" = $1
        AND a."action" IN ('content.save', 'content.create')
      ORDER BY a."createdAt" DESC
      LIMIT 20`,
    [`${area}/${key}`],
  )
  return rows
}

function EditHistory({ edits }: { edits: EditEntry[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">Historia edycji</h2>
      {edits.length === 0 ? (
        <p className="rounded-md border border-border bg-card px-4 py-4 text-sm text-muted-foreground">
          Brak zapisanych zmian tej strony.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {edits.map((edit, index) => {
            const details = edit.details ?? {}
            const changedFields = Array.isArray(details.changedFields)
              ? details.changedFields.filter((field): field is string => typeof field === 'string')
              : []
            const created = details.created === true
            return (
              <li key={`${edit.createdAt.toISOString()}-${index}`} className="rounded-md border border-border bg-card px-4 py-3 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">{edit.actorName ?? edit.actorEmail ?? 'Nieznany użytkownik'}</span>
                  <time dateTime={edit.createdAt.toISOString()} className="text-xs text-muted-foreground">
                    {editDateFormat.format(edit.createdAt)}
                  </time>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {created
                    ? 'Utworzono wpis'
                    : changedFields.length
                      ? `Zmieniono: ${changedFields.join(', ')}`
                      : 'Zapisano bez zmian'}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

/** Słowniki dla kolumn-odwołań, żeby redaktor wybierał z listy zamiast przepisywać identyfikatory. */
async function loadReferences(columns: string[]): Promise<LineReferences> {
  const names = new Set(columns.map((c) => c.toLowerCase()))
  const refs: LineReferences = {}
  if (names.has('id partnera')) {
    refs.partner = [...(await getPartnerCardMap())]
      .filter(([id]) => id)
      .map(([value, p]) => ({ value, label: `${p.name || '(bez nazwy)'} · ${value}` }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pl'))
  }
  if (names.has('id osoby')) {
    refs.person = [...(await getPeopleMap())]
      .filter(([id]) => id)
      .map(([value, p]) => ({ value, label: `${p.name || '(bez nazwy)'} · ${value}` }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pl'))
  }
  if (names.has('slug bolidu')) {
    refs.vehicle = (await getVehicles()).map((v) => ({ value: v.slug, label: `${v.name} · ${v.slug}` }))
  }
  return refs
}
