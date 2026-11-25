import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { vehicles } from '@/lib/db/schema'
import { ADMIN_PATH } from '@/lib/admin'
import { deleteVehicle, saveVehicle } from '../../../actions'
import { AdminForm } from '@/components/admin/admin-form'
import { DeleteButton } from '@/components/admin/delete-button'
import { Checkbox, Field, inputClass } from '@/components/admin/fields'
import { BlockEditor } from '@/components/admin/block-editor'
import { ImageField } from '@/components/admin/image-field'
import { RichTextField } from '@/components/admin/rich-text-field'
import { BackLink } from '@/components/admin/list'
import { SlugField } from '@/components/admin/slug-field'

const lines = (rows: Record<string, string>[], keys: string[]) => rows.map((r) => keys.map((k) => r[k] ?? '').join(' | ')).join('\n')

export default async function VehicleEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'nowy'
  const numId = Number(id)
  if (!isNew && !Number.isInteger(numId)) notFound()
  const v = isNew ? null : (await db.select().from(vehicles).where(eq(vehicles.id, numId)).limit(1))[0]
  if (!isNew && !v) notFound()

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <BackLink href={`${ADMIN_PATH}/bolidy`} />
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{isNew ? 'Nowy bolid' : `Edycja: ${v?.name}`}</h1>
        {v && <DeleteButton action={deleteVehicle} id={v.id} />}
      </div>
      <AdminForm action={saveVehicle}>
        {v && <input type="hidden" name="id" value={v.id} />}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nazwa" htmlFor="name">
            <input id="name" name="name" defaultValue={v?.name} required maxLength={120} className={inputClass} />
          </Field>
          <SlugField sourceId="name" defaultValue={v?.slug} />
          <Field label="Rok debiutu" htmlFor="debutYear">
            <input id="debutYear" name="debutYear" type="number" min={1990} max={2100} defaultValue={v?.debutYear ?? ''} className={inputClass} />
          </Field>
          <Field label="Kolejność" htmlFor="sortOrder">
            <input id="sortOrder" name="sortOrder" type="number" defaultValue={v?.sortOrder ?? 0} className={inputClass} />
          </Field>
        </div>
        <Field label="Najlepszy wynik" htmlFor="bestResult">
          <input id="bestResult" name="bestResult" defaultValue={v?.bestResult ?? ''} maxLength={200} className={inputClass} />
        </Field>
        <ImageField name="imageUrl" label="Zdjęcie" defaultValue={v?.imageUrl} />
        <Field label="Opis" htmlFor="description">
          <RichTextField id="description" name="description" defaultValue={v?.description} rows={8} />
        </Field>
        <Field label="Cel rozwoju" htmlFor="goal">
          <input id="goal" name="goal" defaultValue={v?.goal} maxLength={1000} className={inputClass} />
        </Field>
        <Field label="Liczniki (statystyki)" htmlFor="stats" hint="Każda linia: etykieta | wartość | jednostka">
          <textarea id="stats" name="stats" defaultValue={v ? lines(v.stats, ['label', 'value', 'unit']) : ''} rows={4} className={`${inputClass} font-mono`} />
        </Field>
        <Field label="Dane techniczne" htmlFor="specs" hint="Każda linia: parametr | wartość">
          <textarea id="specs" name="specs" defaultValue={v ? lines(v.specs, ['label', 'value']) : ''} rows={8} className={`${inputClass} font-mono`} />
        </Field>
        <Field label="Osiągnięcia" htmlFor="achievements" hint="Każda linia: zawody | miejsce | wynik | kod flagi (pl, fr, gb, fi, nl)">
          <textarea id="achievements" name="achievements" defaultValue={v ? lines(v.achievements, ['title', 'location', 'result', 'countryCode']) : ''} rows={6} className={`${inputClass} font-mono`} />
        </Field>
        <Checkbox name="featured" label="Pokaż na stronie głównej" defaultChecked={v?.featured} />
        <section className="rounded-md border border-border bg-card p-4">
          <BlockEditor initial={v?.blocks} />
        </section>
      </AdminForm>
    </div>
  )
}
