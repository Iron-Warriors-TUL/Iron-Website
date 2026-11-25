'use client'

import { asLines, contentAreaByKey, linesToString, type ContentArea, type Data } from '@/lib/content-registry'
import { isMediaColumn } from '@/lib/media-columns'
import { AdminForm } from './admin-form'
import { BlockEditor } from './block-editor'
import { Checkbox, Field, inputClass } from './fields'
import { ImageField } from './image-field'
import { LinesField } from './lines-field'
import { PageEditor } from './page-editor'
import { PeopleEditor } from './people-editor'
import { RichTextField } from './rich-text-field'
import { deleteContentEntry, saveContent } from '@/app/iw-panel-7k2q/actions'

export function ContentForm({
  areaKey,
  entryKey,
  data,
  isDefault,
}: {
  areaKey: string
  entryKey: string
  data: Data
  isDefault: boolean
}) {
  const area = contentAreaByKey.get(areaKey) as ContentArea
  const value = (name: string) => (typeof data[name] === 'string' ? (data[name] as string) : '')

  if (areaKey === 'pages') {
    return <PageEditor entryKey={entryKey} data={data} isDefault={isDefault} />
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <AdminForm action={saveContent} submitLabel="Zapisz treść">
        <input type="hidden" name="area" value={areaKey} />
        <input type="hidden" name="entryKey" value={entryKey} />
        {area.fields.map((field) => {
          if (areaKey === 'people' && field.name === 'items' && field.type === 'lines') {
            return <PeopleEditor key={field.name} initial={asLines(data[field.name], field.columns.length)} />
          }
          if (field.type === 'blocks') {
            return (
              <section key={field.name} className="rounded-md border border-border bg-card p-4">
                <BlockEditor initial={data[field.name]} />
                {field.hint && <p className="mt-2 text-xs text-muted-foreground">{field.hint}</p>}
              </section>
            )
          }
          if (field.type === 'lines' && field.columns.some(isMediaColumn)) {
            return (
              <Field key={field.name} label={field.label} htmlFor={`f-${field.name}`} hint={field.hint}>
                <LinesField
                  name={field.name}
                  columns={field.columns}
                  initial={linesToString(data[field.name], field.columns.length)}
                />
              </Field>
            )
          }
          return field.type === 'image' ? (
            <ImageField key={field.name} name={field.name} label={field.label} defaultValue={value(field.name)} />
          ) : (
          <Field key={field.name} label={field.label} htmlFor={`f-${field.name}`} hint={field.hint}>
            {field.type === 'textarea' ? (
              <RichTextField
                id={`f-${field.name}`}
                name={field.name}
                defaultValue={value(field.name)}
                rows={field.rows ?? 5}
              />
            ) : field.type === 'lines' ? (
              <textarea
                id={`f-${field.name}`}
                name={field.name}
                defaultValue={linesToString(data[field.name], field.columns.length)}
                rows={Math.max(4, Math.min(16, linesToString(data[field.name], field.columns.length).split('\n').length + 1))}
                className={`${inputClass} font-mono text-xs leading-relaxed`}
                spellCheck={false}
              />
            ) : field.type === 'checkbox' ? (
              <Checkbox name={field.name} label="Włączone" defaultChecked={data[field.name] === true} />
            ) : field.type === 'select' ? (
              <select id={`f-${field.name}`} name={field.name} defaultValue={value(field.name)} className={inputClass}>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option === '' ? '— brak —' : option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`f-${field.name}`}
                name={field.name}
                type="text"
                defaultValue={value(field.name)}
                className={inputClass}
              />
            )}
          </Field>
          )
        })}
      </AdminForm>

      <form action={deleteContentEntry} className="border-t border-border pt-4">
        <input type="hidden" name="area" value={areaKey} />
        <input type="hidden" name="entryKey" value={entryKey} />
        <button
          type="submit"
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-destructive"
        >
          {isDefault ? 'Przywróć wartości domyślne' : 'Usuń wpis'}
        </button>
      </form>
    </div>
  )
}
