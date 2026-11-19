import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { ADMIN_PATH } from '@/lib/admin'
import { deleteProject, saveProject } from '../../../actions'
import { AdminForm } from '@/components/admin/admin-form'
import { DeleteButton } from '@/components/admin/delete-button'
import { Field, inputClass } from '@/components/admin/fields'
import { BackLink } from '@/components/admin/list'

export default async function ProjectEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'nowy'
  const numId = Number(id)
  if (!isNew && !Number.isInteger(numId)) notFound()
  const p = isNew ? null : (await db.select().from(projects).where(eq(projects.id, numId)).limit(1))[0]
  if (!isNew && !p) notFound()

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
        <Field label="Program" htmlFor="program">
          <input id="program" name="program" defaultValue={p?.program} maxLength={300} className={inputClass} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Dofinansowanie" htmlFor="funding">
            <input id="funding" name="funding" defaultValue={p?.funding} maxLength={100} className={inputClass} />
          </Field>
          <Field label="Wkład własny" htmlFor="ownContribution">
            <input id="ownContribution" name="ownContribution" defaultValue={p?.ownContribution ?? ''} maxLength={100} className={inputClass} />
          </Field>
          <Field label="Całkowita wartość" htmlFor="totalValue">
            <input id="totalValue" name="totalValue" defaultValue={p?.totalValue ?? ''} maxLength={100} className={inputClass} />
          </Field>
        </div>
        <Field label="Nagłówek wpisu" htmlFor="heading">
          <input id="heading" name="heading" defaultValue={p?.heading} maxLength={500} className={inputClass} />
        </Field>
        <Field label="Opis" htmlFor="description">
          <textarea id="description" name="description" defaultValue={p?.description} rows={6} maxLength={10000} className={inputClass} />
        </Field>
        <Field label="Obrazy (jedna ścieżka na linię)" htmlFor="imageUrls">
          <textarea id="imageUrls" name="imageUrls" defaultValue={p?.imageUrls ?? ''} rows={3} maxLength={4000} className={inputClass} />
        </Field>
        <Field label="Kolejność" htmlFor="sortOrder">
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={p?.sortOrder ?? 0} className={`${inputClass} max-w-32`} />
        </Field>
      </AdminForm>
    </div>
  )
}
