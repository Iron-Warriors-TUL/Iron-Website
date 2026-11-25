'use client'

import { isValidPageSlug } from '@/lib/page-slug'
import { inputClass } from './fields'
import { SlugField } from './slug-field'

export function NewPageForm({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  return (
    <form
      action={action}
      className="grid gap-3 rounded-md border border-border bg-card p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
    >
      <input type="hidden" name="area" value="pages" />
      <label htmlFor="new-page-name" className="flex flex-col gap-1.5 text-sm font-medium">
        Nazwa strony
        <input
          id="new-page-name"
          name="name"
          required
          maxLength={160}
          placeholder="np. O nas"
          className={inputClass}
        />
      </label>
      <SlugField
        sourceId="new-page-name"
        name="entryKey"
        id="new-page-slug"
        label="Adres strony (slug)"
        validate={isValidPageSlug}
        hint="Uzupełni się automatycznie z nazwy strony."
      />
      <button
        type="submit"
        className="h-[38px] rounded-sm bg-primary px-5 text-sm font-bold text-primary-foreground hover:opacity-90"
      >
        Utwórz podstronę
      </button>
    </form>
  )
}
