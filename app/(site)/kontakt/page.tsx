import type { Metadata } from 'next'
import { Mail, MapPin } from 'lucide-react'
import { PageHeader } from '@/components/site/section'

export const metadata: Metadata = { title: 'Kontakt' }

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Kontakt" subtitle="Chcesz dołączyć do zespołu lub zostać partnerem? Napisz do nas!" />
      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-2 md:px-6">
          <div className="flex gap-4 rounded-md bg-card p-6">
            <Mail className="size-6 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-bold">E-mail</h2>
              <a href="mailto:kontakt@ironwarriors.p.lodz.pl" className="mt-1 block text-muted-foreground hover:text-primary">
                kontakt@ironwarriors.p.lodz.pl
              </a>
            </div>
          </div>
          <div className="flex gap-4 rounded-md bg-card p-6">
            <MapPin className="size-6 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-bold">Adres</h2>
              <address className="mt-1 not-italic text-muted-foreground">
                Politechnika Łódzka, Instytut Maszyn Przepływowych
                <br />
                ul. Wólczańska 217/221, 93-005 Łódź
              </address>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
