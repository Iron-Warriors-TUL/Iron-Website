import Link from 'next/link'
import { cn } from '@/lib/utils'

export function PageHeader({ title, subtitle, image }: { title: string; subtitle?: string; image?: string }) {
  return (
    <section className="relative isolate flex min-h-64 items-center overflow-hidden">
      <img
        src={image ?? '/images/team-2.jpg'}
        alt=""
        className="absolute inset-0 -z-10 size-full object-cover opacity-30"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
        <h1 className="text-balance text-4xl font-bold uppercase tracking-tight md:text-6xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-pretty text-lg text-muted-foreground">{subtitle}</p>}
      </div>
    </section>
  )
}

export function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-4 leading-relaxed text-muted-foreground', className)}>
      {text
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className="text-pretty">
            {p}
          </p>
        ))}
    </div>
  )
}

export function OrangeLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-opacity hover:opacity-90"
    >
      {children}
    </Link>
  )
}

export function JoinCta() {
  return (
    <section className="bg-brand-maroon py-24 text-center">
      <h2 className="text-balance text-4xl font-bold md:text-6xl">Dołącz do nas!</h2>
      <div className="mt-10 flex flex-wrap justify-center gap-4 px-4">
        <Link href="/kontakt" className="min-w-48 border-2 border-foreground px-8 py-3 font-bold transition-colors hover:bg-foreground hover:text-brand-maroon">
          Zostań członkiem
        </Link>
        <Link href="/kontakt" className="min-w-48 border-2 border-foreground px-8 py-3 font-bold transition-colors hover:bg-foreground hover:text-brand-maroon">
          Zostań partnerem
        </Link>
      </div>
    </section>
  )
}

export function StatGrid({ stats }: { stats: { label: string; value: string; unit: string }[] }) {
  if (stats.length === 0) return null
  return (
    <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col-reverse items-start gap-1 border-l-2 border-primary pl-4">
          <dt className="text-sm text-muted-foreground">{s.label}</dt>
          <dd className="flex items-start gap-1 text-4xl font-bold md:text-5xl">
            {s.value}
            <span className="pt-1 text-base font-semibold text-primary">{s.unit}</span>
          </dd>
        </div>
      ))}
    </dl>
  )
}
