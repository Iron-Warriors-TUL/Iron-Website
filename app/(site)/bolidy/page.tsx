import type { Metadata } from 'next'
import { getVehicles } from '@/lib/data'
import { getContent } from '@/lib/content'
import { Gallery, JoinCta, OrangeLink, Paragraphs } from '@/components/site/section'
import { FillImage } from '@/components/site/smart-image'

export const metadata: Metadata = { title: 'Bolidy' }

const titleStyle = {
  WebkitTextStroke: '2px black',
  textShadow: '0 0 10px rgba(0,0,0,.3)',
}

export default async function VehiclesPage() {
  const [vehicles, content] = await Promise.all([getVehicles(), getContent('vehicle-list')])
  const value = (name: string) => String(content[name] ?? '')
  const rows = (name: string) => (Array.isArray(content[name]) ? (content[name] as unknown[][]) : [])
  const summaries = new Map(rows('summaries').map((row) => [String(row[0] ?? ''), String(row[1] ?? '')]))
  const galleries = new Map<string, string[]>()
  for (const [slug, src] of rows('galleries')) {
    const key = String(slug ?? '')
    galleries.set(key, [...(galleries.get(key) ?? []), String(src ?? '')])
  }

  return (
    <>
      <section className="relative isolate overflow-hidden pb-14 pt-[110px]">
        <FillImage src={value('background')} alt="" priority sizes="100vw" className="-z-10" />
        <div className="absolute inset-0 -z-10 bg-[#ffffffeb]" />
        <div className="mx-auto w-full max-w-[1140px] px-[30px] max-[767px]:px-4">
          <h1 className="text-[42px] font-thin leading-[59px] text-heading md:text-[59px]" style={titleStyle}>
            {value('heading')}
          </h1>

          <div className="mt-16 flex flex-col gap-14">
            {vehicles.map((vehicle) => (
              <article
                key={vehicle.id}
                data-reveal
                className="flex flex-col gap-10 border-b border-black pb-[15px] md:flex-row md:items-center md:gap-[30px]"
              >
                <div className="order-2 flex w-full flex-col md:order-1 md:w-1/2">
                  <h2 className="mb-3 hidden text-right text-[39px] font-thin leading-[39px] text-heading md:block">
                    {vehicle.name}
                  </h2>
                  <Gallery
                    images={galleries.get(vehicle.slug) ?? []}
                    alt={vehicle.name}
                    effect="fade"
                    className="w-full"
                    imageClassName="aspect-video"
                    sizes="(min-width: 768px) 555px, 100vw"
                  />
                  <h2 className="mt-3 text-center text-[29px] font-thin text-heading md:hidden">
                    {vehicle.name}
                  </h2>
                </div>

                <div className="order-1 flex w-full flex-col items-start gap-5 md:order-2 md:w-1/2">
                  <h2 className="text-left text-[29px] font-thin leading-[39px] text-heading md:text-[39px]" style={titleStyle}>
                    {vehicle.name}
                  </h2>
                  <Paragraphs
                    text={summaries.get(vehicle.slug) ?? vehicle.description.split(/\n{2,}/)[0]}
                    className="text-[15px] leading-[25.2px] text-[#868990]"
                  />
                  <OrangeLink
                    href={`/${vehicle.slug}`}
                    className="h-[39px] w-[145px] p-0 text-[15px] font-semibold"
                  >
                    {value('moreLabel')}
                  </OrangeLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <JoinCta />
    </>
  )
}
