import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { ADMIN_PATH } from '@/lib/admin'
import { deleteProject, saveProject } from '../../../actions'
import { AdminForm } from '@/components/admin/admin-form'
import { DeleteButton } from '@/components/admin/delete-button'
import { Field, inputClass } from '@/components/admin/fields'
import { BlockEditor } from '@/components/admin/block-editor'
import { BackLink } from '@/components/admin/list'
import { parseBlocks } from '@/lib/blocks'
import { projectBlocks } from '@/lib/entity-blocks'

export default async function ProjectEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'nowy'
  const numId = Number(id)
  if (!isNew && !Number.isInteger(numId)) notFound()
  const p = isNew ? null : (await db.select().from(projects).where(eq(projects.id, numId)).limit(1))[0]
  if (!isNew && !p) notFound()
  const stored = parseBlocks(p?.blocks)
  const initialBlocks = p ? (stored.length > 0 ? stored : projectBlocks(p)) : []

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <BackLink href={`${ADMIN_PATH}/projekty`} />
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{isNew ? 'Nowy projekt' : 'Edycja projektu'}</h1>
        {p && <DeleteButton action={deleteProject} id={p.id} />}
      </div>
      <AdminForm action={saveProject}>
        {p && <input type="hidden" name="id" value={p.id} />}
        <Field label="Nazwa zadania" htmlFor="title">
          <input id="title" name="title" defaultValue={p?.title} required maxLength={300} className={inputClass} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Kategoria / grantodawca" htmlFor="category" hint="np. MNiSW, Miasto Łódź, Fundacja PŁ">
            <input id="category" name="category" defaultValue={p?.category} required maxLength={120} className={inputClass} />
          </Field>
          <Field label="Okres realizacji" htmlFor="period">
            <input id="period" name="period" defaultValue={p?.period} maxLength={50} className={inputClass} />
          </Field>
        </div>
        <Field label="Kolejność" htmlFor="sortOrder">
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={p?.sortOrder ?? 0} className={`${inputClass} max-w-32`} />
        </Field>
        <section className="rounded-md border border-border bg-card p-4">
          <BlockEditor initial={initialBlocks} />
        </section>
        <fieldset className="flex flex-col gap-4 rounded-md border p-4">
          <legend className="px-1 text-sm font-semibold">Belka ministerstwa (wymagana informacja o dofinansowaniu)</legend>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="fundingBar" defaultChecked={p?.fundingBar ?? false} className="size-4" />
            Domyślnie pokaż układ z belką: logotypy na górze, po lewej tytuł i opis, po prawej informacje o sezonie
          </label>
          <Field
            label="Informacje w prawej kolumnie"
            htmlFor="fundingBarText"
            hint="Używane, gdy projekt nie ma własnych bloków. Zostaw puste, aby pokazać „Dofinansowano ze środków budżetu państwa”, program, kwoty i całkowitą wartość. Jedna informacja na linię."
          >
            <textarea id="fundingBarText" name="fundingBarText" defaultValue={p?.fundingBarText ?? ''} rows={3} maxLength={2000} className={inputClass} />
          </Field>
          <Field label="Logo na belce (zapasowe)" htmlFor="fundingBarLogo" hint="Używane, gdy pole „Obrazy” jest puste. Puste = logo ministerstwa.">
            <input id="fundingBarLogo" name="fundingBarLogo" defaultValue={p?.fundingBarLogo ?? ''} maxLength={2000} className={inputClass} />
          </Field>
        </fieldset>
      </AdminForm>
    </div>
  )
}
