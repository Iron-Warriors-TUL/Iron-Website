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
      <Link href={href} className="flex items-center justify-between gap-4 rounded-md border border-border bg-card px-5 py-4 transition-colors hover:border-primary">
        <span className="font-medium">{title}</span>
        {meta && <span className="shrink-0 text-sm text-muted-foreground">{meta}</span>}
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
