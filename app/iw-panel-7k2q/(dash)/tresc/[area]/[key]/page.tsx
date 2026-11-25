import { notFound, redirect } from 'next/navigation'
import { contentAreaByKey } from '@/lib/content-registry'
import { getEntryKeys, getPartnerCardMap, getPeopleMap, getStoredContent } from '@/lib/content'
import { getVehicles } from '@/lib/data'
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
  const key = decodeURIComponent(rawKey)
  const definition = contentAreaByKey.get(area)
  if (!definition) notFound()
  const session = await requireCmsPage()
  if (!canEditContentArea(session.user.role, area)) redirect(`${ADMIN_PATH}?brak-uprawnien=1`)
  const keys = await getEntryKeys(area)
  if (!keys.includes(key)) notFound()

  const stored = await getStoredContent(area, key)
  const data = { ...definition.defaults(key), ...stored }
  const references = await loadReferences(definition.fields.flatMap((f) => (f.type === 'lines' ? f.columns : [])))
  const label = definition.entryLabel?.(key, data) ?? definition.label

  return (
    <div className="flex flex-col gap-6">
      <BackLink href={`${ADMIN_PATH}/tresc/${area}`} />
      <h1 className="text-3xl font-bold">{label}</h1>
      <ContentForm areaKey={area} entryKey={key} data={data} isDefault={!Object.keys(stored).length} references={references} />
    </div>
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
