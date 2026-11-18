import Link from 'next/link'
import { ArrowRight, CircleArrowDown } from 'lucide-react'
import { getPublishedPosts, getVehicles } from '@/lib/data'
import { JoinCta, OrangeLink, Paragraphs, StatGrid } from '@/components/site/section'
import { PostCard } from '@/components/site/post-card'

const records = [
  { label: 'Kategoria Prototype ICE', value: '837', unit: 'km/l' },
  { label: 'Kategoria Prototype Battery Electric', value: '2267', unit: 'km/l SP95' },
]

export default async function HomePage() {
  const [vehicles, posts] = await Promise.all([getVehicles(), getPublishedPosts(3)])
  const featured = vehicles.filter((v) => v.featured)

  return (
    <>
      <section className="relative isolate flex min-h-[80vh] items-center justify-center overflow-hidden text-center">
        <img src="/images/eco-arrow-3-2.jpg" alt="" className="absolute inset-0 -z-10 size-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-black/70" />
        <div className="flex w-full max-w-5xl flex-col items-center gap-6 px-4">
          <h1 className="text-balance text-5xl font-bold md:text-7xl">Iron Warriors Team</h1>
          <div className="flex w-full items-center gap-4">
            <span className="h-0.5 flex-1 bg-foreground" aria-hidden="true" />
            <p className="text-sm font-semibold md:text-base">Rekordziści Polski w jeździe na kropelkę benzyny</p>
            <span className="h-0.5 flex-1 bg-foreground" aria-hidden="true" />
          </div>
          <a
            href="#o-nas"
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <CircleArrowDown className="size-4" aria-hidden="true" />O nas
          </a>
        </div>
      </section>

      <section id="o-nas" className="scroll-mt-20 py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 md:px-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-5xl font-bold">O nas</h2>
            <p className="max-w-4xl text-pretty leading-relaxed text-muted-foreground">
              Jesteśmy Rekordzistami Polski, grupą młodych, ambitnych studentów Politechniki Łódzkiej, robiących coś
              ponadprzeciętnego, a przede wszystkim wykorzystujących w praktyce wiedzę zdobywaną na studiach. Nasza
              drużyna powstała pod koniec 2012 roku i od tego czasu pracuje nad pojazdem, który ma za zadanie przejechać
              jak najwięcej kilometrów w przeliczeniu na jednostkę paliwa.
            </p>
            <p className="font-bold">Jesteśmy najszybciej rozwijającą się polską drużyną startującą w zawodach typu eco-marathon.</p>
          </div>

          <div className="grid items-center gap-10 md:grid-cols-2">
            <Paragraphs text={`W ciągu 14 lat zbudowaliśmy trzy bolidy i osiągnęliśmy naprawdę wiele m.in. zajęliśmy 1. miejsce podczas zawodów Educ Eco we Francji czy dwukrotnie ustanowiliśmy Rekord Polski w jeździe na kropelce benzyny – 837 km w przeliczeniu na 1 l benzyny.\n\nOd 2022 roku pracujemy także nad pojazdem elektrycznym, powstałym na bazie Eco Arrow 2. W ten sposób staliśmy się jedyną w Polsce drużyną mogącą startować w kategorii pojazdów prototypowych napędzanych silnikiem elektrycznym. W 2026 roku udało nam się natomiast ustanowić Rekord Polski w kategorii pojazdów zasilanych energią elektryczną – 2267 km w przeliczeniu na 1 l benzyny.`} />
            <img src="/images/team-1.jpg" alt="Zespół Iron Warriors z bolidem podczas Shell Eco-marathon" className="aspect-video w-full rounded-md object-cover" />
          </div>

          <div className="grid items-center gap-10 md:grid-cols-2">
            <img src="/images/team-3.jpg" alt="Członkowie zespołu Iron Warriors przy pracy nad bolidem" className="aspect-video w-full rounded-md object-cover md:order-first" />
            <Paragraphs text={`Ciągle dążymy do łamania barier, dlatego aktualnie pracujemy nad modernizacją bolidów w zakresie elektryki i silników. Dzięki szkoleniom możemy rozwijać nasze umiejętności, dzięki którym możemy uzyskiwać coraz lepsze wyniki poprzez projektowanie nowych rozwiązań czy całych pojazdów.\n\nPoza działalnością związaną z budową oraz ulepszaniem naszych pojazdów, działamy także na polu naukowym, tworząc publikacje naukowe. Bierzemy udział również w wielu konferencjach międzynarodowych, które umożliwiają nam prezentowanie naszych osiągnięć. Odwiedziliśmy już m.in. Cambridge, Melbourne, Helsinki czy Bangkok.`} />
          </div>

          <div className="flex flex-col gap-8 rounded-md bg-card p-8 md:p-10">
            <h2 className="text-3xl font-bold">O nas w liczbach</h2>
            <StatGrid
              stats={[
                { label: 'Członków zespołu', value: '40', unit: '+' },
                ...records,
                { label: 'Bolidy', value: String(vehicles.length), unit: '' },
              ]}
            />
            <div>
              <OrangeLink href="/bolidy">
                Nasze bolidy <ArrowRight className="size-4" aria-hidden="true" />
              </OrangeLink>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 md:px-6">
          <h2 className="text-5xl font-bold">Nasze bolidy</h2>
          {featured.map((v, i) => (
            <article key={v.id} className="grid items-center gap-10 md:grid-cols-2">
              <img
                src={v.imageUrl ?? '/images/eco-arrow-3-1.jpg'}
                alt={`Bolid ${v.name}`}
                className={`aspect-[4/3] w-full rounded-md object-cover ${i % 2 ? 'md:order-last' : ''}`}
              />
              <div className="flex flex-col gap-6">
                <h3 className="text-3xl font-bold text-primary">{v.name}</h3>
                <StatGrid stats={v.stats} />
                <Paragraphs text={v.description.split(/\n{2,}/)[0] ?? ''} />
                {v.goal && <p className="font-semibold">{v.goal}</p>}
                <Link href={`/bolidy/${v.slug}`} className="inline-flex items-center gap-2 font-semibold text-primary hover:underline">
                  Więcej o {v.name} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {posts.length > 0 && (
        <section className="py-20">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 md:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-5xl font-bold">Aktualności</h2>
              <Link href="/blog" className="inline-flex items-center gap-2 font-semibold text-primary hover:underline">
                Wszystkie wpisy <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <JoinCta />
    </>
  )
}
