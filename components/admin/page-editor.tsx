'use client'

import { deleteContentEntry, saveContent } from '@/app/iw-panel-7k2q/actions'
import type { Data } from '@/lib/content-registry'
import { AdminForm } from './admin-form'
import { BlockEditor } from './block-editor'
import { Checkbox, Field, inputClass } from './fields'

export function PageEditor({ entryKey, data, isDefault }: { entryKey: string; data: Data; isDefault: boolean }) {
  const value = (name: string) => (typeof data[name] === 'string' ? (data[name] as string) : '')

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <AdminForm action={saveContent} submitLabel="Zapisz stronę">
        <input type="hidden" name="area" value="pages" />
        <input type="hidden" name="entryKey" value={entryKey} />

        <section className="flex flex-col gap-4 rounded-md border border-border bg-card p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Ustawienia strony</h2>
          <Field label="Tytuł strony" htmlFor="page-title">
            <input id="page-title" name="title" defaultValue={value('title')} className={inputClass} />
          </Field>
          <Field label="Opis SEO" htmlFor="page-seo" hint="Wyświetlany w wynikach wyszukiwania.">
            <textarea id="page-seo" name="seoDescription" defaultValue={value('seoDescription')} rows={3} className={inputClass} />
          </Field>
          <Checkbox name="published" label="Opublikowana" defaultChecked={data.published !== false} />
        </section>

        <section className="rounded-md border border-border bg-card p-4">
          <BlockEditor initial={data.blocks} />
        </section>
      </AdminForm>

      <form action={deleteContentEntry} className="border-t border-border pt-4">
        <input type="hidden" name="area" value="pages" />
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
