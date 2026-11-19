import { notFound } from 'next/navigation'
import { contentAreaByKey } from '@/lib/content-registry'
import { getEntryKeys, getStoredContent } from '@/lib/content'
import { ADMIN_PATH } from '@/lib/admin'
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
  const keys = await getEntryKeys(area)
  if (!keys.includes(key)) notFound()

  const stored = await getStoredContent(area, key)
  const data = { ...definition.defaults(key), ...stored }
  const label = definition.entryLabel?.(key, data) ?? definition.label

  return (
    <div className="flex flex-col gap-6">
      <BackLink href={`${ADMIN_PATH}/tresc/${area}`} />
      <h1 className="text-3xl font-bold">{label}</h1>
      <ContentForm areaKey={area} entryKey={key} data={data} isDefault={!Object.keys(stored).length} />
    </div>
  )
}
