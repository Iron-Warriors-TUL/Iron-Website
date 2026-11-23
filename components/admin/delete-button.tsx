'use client'

import { Trash2 } from 'lucide-react'

export function DeleteButton({ action, id, label = 'Usuń' }: { action: (fd: FormData) => Promise<void>; id: string | number; label?: string }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('Na pewno usunąć? Tej operacji nie można cofnąć.')) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10">
        <Trash2 className="size-4" aria-hidden="true" />
        {label}
      </button>
    </form>
  )
}
