import { getNavTree } from '@/lib/data'
import type { NavItem } from '@/lib/db/schema'
import { deleteNavItem, saveNavItem } from '../../actions'
import { AdminForm } from '@/components/admin/admin-form'
import { DeleteButton } from '@/components/admin/delete-button'
import { Checkbox, inputClass } from '@/components/admin/fields'

function NavFields({ item, parents }: { item?: NavItem; parents: NavItem[] }) {
  const p = item ? `n${item.id}` : 'new'
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_10rem_5rem_auto] lg:items-end">
      {item && <input type="hidden" name="id" value={item.id} />}
      <label className="flex flex-col gap-1 text-xs text-muted-foreground" htmlFor={`${p}-label`}>
        Etykieta
        <input id={`${p}-label`} name="label" defaultValue={item?.label} required maxLength={60} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground" htmlFor={`${p}-href`}>
        Link
        <input id={`${p}-href`} name="href" defaultValue={item?.href} required maxLength={500} placeholder="/bolidy" className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground" htmlFor={`${p}-parent`}>
        Rodzic
        <select id={`${p}-parent`} name="parentId" defaultValue={item?.parentId ?? ''} className={inputClass}>
          <option value="">— główny —</option>
          {parents
            .filter((x) => x.id !== item?.id)
            .map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground" htmlFor={`${p}-order`}>
        Kolejność
        <input id={`${p}-order`} name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} className={inputClass} />
      </label>
      <div className="pb-2">
        <Checkbox name="isButton" label="Przycisk" defaultChecked={item?.isButton} />
      </div>
    </div>
  )
}

export default async function NavAdminPage() {
  const tree = await getNavTree()
  const parents = tree.filter((t) => !t.isButton)
  const rows = tree.flatMap((t) => [{ item: t, depth: 0 }, ...t.children.map((c) => ({ item: c, depth: 1 }))])

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Nawigacja</h1>

      <section className="rounded-md border border-primary/50 bg-card p-5">
        <h2 className="mb-4 font-semibold">Dodaj element</h2>
        <AdminForm action={saveNavItem} submitLabel="Dodaj" resetOnSuccess>
          <NavFields parents={parents} />
        </AdminForm>
      </section>

      <section className="flex flex-col gap-3">
        {rows.map(({ item, depth }) => (
          <div key={item.id} className={`rounded-md border border-border bg-card p-4 ${depth ? 'ml-6 md:ml-10' : ''}`}>
            <AdminForm action={saveNavItem}>
              <NavFields item={item} parents={parents} />
            </AdminForm>
            <div className="mt-2 flex justify-end">
              <DeleteButton action={deleteNavItem} id={item.id} />
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
