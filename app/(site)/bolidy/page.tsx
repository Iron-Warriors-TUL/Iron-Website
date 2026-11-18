import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { getVehicles } from '@/lib/data'
import { JoinCta, PageHeader } from '@/components/site/section'

export const metadata: Metadata = { title: 'Bolidy' }

export default async function VehiclesPage() {
  const vehicles = await getVehicles()
  return (
    <>
      <PageHeader title="Bolidy" subtitle="Superoszczędne pojazdy zaprojektowane i zbudowane przez studentów Politechniki Łódzkiej." image="/images/eco-arrow-3-3.jpg" />
      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 md:px-6">
          {vehicles.map((v) => (
            <Link key={v.id} href={`/bolidy/${v.slug}`} className="group overflow-hidden rounded-md bg-card">
              <img src={v.imageUrl ?? '/images/eco-arrow-3-1.jpg'} alt={`Bolid ${v.name}`} className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="flex items-end justify-between gap-4 p-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{v.debutYear ? `Debiut ${v.debutYear}` : 'Bolid'}</p>
                  <h2 className="mt-1 text-2xl font-bold group-hover:text-primary">{v.name}</h2>
                  {v.bestResult && <p className="mt-1 text-sm text-muted-foreground">{`Najlepszy wynik: ${v.bestResult}`}</p>}
                </div>
                <ArrowRight className="size-5 shrink-0 text-primary" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <JoinCta />
    </>
  )
}
