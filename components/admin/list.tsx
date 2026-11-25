import Link from 'next/link'
import { Plus } from 'lucide-react'

export function ListHeader({ title, newHref }: { title: string; newHref: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-3xl font-bold">{title}</h1>
      <Link href={newHref} className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90">
        <Plus className="size-4" aria-hidden="true" />
        Dodaj nowy
      </Link>
    </div>
  )
}

export function ListRow({ href, title, meta }: { href: string; title: string; meta?: string }) {
  return (
    <li>
      <Link href={href} className="flex flex-col gap-1 rounded-md border border-border bg-card px-4 py-3 transition-colors hover:border-primary sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-4">
        <span className="min-w-0 break-words font-medium">{title}</span>
        {meta && <span className="min-w-0 text-sm text-muted-foreground sm:max-w-[45%] sm:shrink-0 sm:text-right">{meta}</span>}
      </Link>
    </li>
  )
}

export function BackLink({ href }: { href: string }) {
  return (
    <Link href={href} className="text-sm text-primary hover:underline">
      {'← Wróć do listy'}
    </Link>
  )
}
