import { getVehicles } from '@/lib/data'
import { ADMIN_PATH } from '@/lib/admin'
import { ListHeader, ListRow } from '@/components/admin/list'

export default async function VehiclesAdmin() {
  const rows = await getVehicles()
  return (
    <div className="flex flex-col gap-6">
      <ListHeader title="Bolidy" newHref={`${ADMIN_PATH}/bolidy/nowy`} />
      <ul className="flex flex-col gap-2">
        {rows.map((v) => (
          <ListRow
            key={v.id}
            href={`${ADMIN_PATH}/bolidy/${v.id}`}
            title={v.name}
            meta={[v.debutYear, v.featured ? 'Na stronie głównej' : null].filter(Boolean).join(' · ')}
          />
        ))}
      </ul>
    </div>
  )
}
