import { getProjects } from '@/lib/data'
import { ADMIN_PATH } from '@/lib/admin'
import { ListHeader, ListRow } from '@/components/admin/list'

export default async function ProjectsAdmin() {
  const rows = await getProjects()
  return (
    <div className="flex flex-col gap-6">
      <ListHeader title="Projekty" newHref={`${ADMIN_PATH}/projekty/nowy`} />
      <ul className="flex flex-col gap-2">
        {rows.map((p) => (
          <ListRow key={p.id} href={`${ADMIN_PATH}/projekty/${p.id}`} title={p.title} meta={`${p.category} · ${p.period}`} />
        ))}
      </ul>
    </div>
  )
}
