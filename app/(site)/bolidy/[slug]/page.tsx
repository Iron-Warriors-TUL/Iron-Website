import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Trophy } from 'lucide-react'
import { getVehicle } from '@/lib/data'
import { JoinCta, PageHeader, Paragraphs, StatGrid } from '@/components/site/section'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const v = await getVehicle((await params).slug)
  return { title: v?.name ?? 'Bolid' }
}

export default async function VehiclePage({ params }: Props) {
  const v = await getVehicle((await params).slug)
  if (!v) notFound()

  return (
    <>
      <PageHeader title={v.name} subtitle={v.bestResult ? `Najlepszy wynik: ${v.bestResult}` : undefined} image={v.imageUrl ?? undefined} />
      <section className="py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 md:px-6">
          <div className="grid gap-10 md:grid-cols-2">
            <div className="flex flex-col gap-6">
              <Paragraphs text={v.description} />
              {v.goal && <p className="font-semibold">{v.goal}</p>}
            </div>
            {v.imageUrl && <img src={v.imageUrl} alt={`Bolid ${v.name}`} className="w-full rounded-md object-cover" />}
          </div>

          <StatGrid stats={v.stats} />

          {v.specs.length > 0 && (
            <div>
              <h2 className="mb-6 text-3xl font-bold">Dane techniczne</h2>
              <dl className="grid overflow-hidden rounded-md border border-border sm:grid-cols-2">
                {v.specs.map((s) => (
                  <div key={s.label} className="flex justify-between gap-4 border-b border-border px-5 py-3 sm:odd:border-r">
                    <dt className="text-muted-foreground">{s.label}</dt>
                    <dd className="text-right font-semibold">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {v.achievements.length > 0 && (
            <div>
              <h2 className="mb-6 text-3xl font-bold">Osiągnięcia</h2>
              <ol className="flex flex-col gap-4">
                {v.achievements.map((a, i) => (
                  <li key={i} className="flex gap-4 rounded-md bg-card p-5">
                    <Trophy className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <h3 className="font-bold">{a.title}</h3>
                      <p className="text-sm text-muted-foreground">{a.location}</p>
                      <p className="mt-1">{a.result}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </section>
      <JoinCta />
    </>
  )
}
