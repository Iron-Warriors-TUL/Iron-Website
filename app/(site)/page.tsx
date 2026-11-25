import { getVehicles } from '@/lib/data'
import { getContent } from '@/lib/content'
import { Gallery, JoinCta, OrangeLink, Paragraphs, StatGrid, type StatItem } from '@/components/site/section'
import { FillImage } from '@/components/site/smart-image'
import { YouTubeBackdrop, YouTubeEmbed } from '@/components/site/youtube-video'

type Lines = unknown[][]

const lines = (value: unknown): Lines => (Array.isArray(value) ? (value as Lines) : [])
const text = (value: unknown) => (typeof value === 'string' ? value : '')

export default async function HomePage() {
  const [home, vehicles] = await Promise.all([getContent('home'), getVehicles()])
  const featuredOrder = lines(home.featured).map((row) => String(row[0] ?? ''))
  const featured = featuredOrder
    .map((slug) => vehicles.find((vehicle) => vehicle.slug === slug))
    .filter((vehicle): vehicle is (typeof vehicles)[number] => Boolean(vehicle))

  const stats: StatItem[] = lines(home.stats).map(([label, value, unit]) => ({
    label: String(label ?? ''),
    value: String(value ?? ''),
    unit: String(unit ?? '') || undefined,
  }))
  const aboutImages = lines(home.aboutGallery).map((row) => String(row[0] ?? '')).filter(Boolean)

  return (
    <>
      <section className="relative isolate flex h-[934px] items-center overflow-hidden text-center">
        <YouTubeBackdrop
          videoId={text(home.heroVideoId)}
          start={Number(home.heroStart) || 0}
          end={Number(home.heroEnd) || 0}
          poster={text(home.heroPoster)}
        />
        <div className="absolute inset-0 -z-0 bg-black/75" />
        <div className="relative z-10 flex w-full animate-in flex-col items-center gap-[109px] px-4 fade-in slide-in-from-bottom-6 duration-700">
          <h1 className="text-balance text-[38px] font-semibold leading-tight text-white md:text-[59px] md:leading-[59px]">
            {text(home.heroTitle)}
          </h1>
          <OrangeLink href={text(home.heroCtaHref)} className="h-12 w-[127px] p-0">
            {text(home.heroCtaLabel)}
          </OrangeLink>
        </div>
      </section>

      <section id="firstFP" className="relative isolate overflow-hidden scroll-mt-28 py-5">
        <FillImage src={text(home.aboutBackground)} alt="" sizes="100vw" className="-z-10" />
        <div className="absolute inset-0 -z-10 bg-white/82" />
        <div className="mx-auto w-full max-w-[1140px] px-4">
          <h2 data-reveal className="text-[42px] font-semibold leading-[59px] text-heading md:text-[59px]">{text(home.aboutHeading)}</h2>
          <Paragraphs text={text(home.aboutTop)} className="mt-6 max-w-[1100px]" />

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,540px)_minmax(0,540px)] lg:justify-center">
            <div className="flex flex-col gap-5">
              <Paragraphs text={text(home.aboutLeft)} />
              <Gallery
                images={aboutImages}
                alt={text(home.aboutGalleryAlt)}
                effect="slide"
                className="w-full max-w-[540px] lg:mt-16"
                sizes="(min-width: 1024px) 540px, 100vw"
              />
            </div>
            <div className="flex flex-col gap-5">
              <YouTubeEmbed videoId={text(home.aboutVideoId)} className="w-full max-w-[540px]" />
              <Paragraphs text={text(home.aboutRight)} />
            </div>
          </div>

          <div className="mt-10">
            <h2 data-reveal className="text-[32px] font-semibold text-heading md:text-[39px] md:leading-[39px]">{text(home.statsHeading)}</h2>
            <h3 data-reveal className="mt-4 text-center text-[24px] font-semibold text-black/55 md:text-[29px] md:leading-[29px]">
              {text(home.statsSubheading)}
            </h3>
            <StatGrid
              className="mt-4 grid-cols-2 lg:grid-cols-4"
              stats={stats}
            />
            <div className="mt-4 flex justify-end">
              <OrangeLink href={text(home.vehiclesLinkHref)} className="h-[39px] px-8 py-0 text-[15px] font-normal">
                {text(home.vehiclesLinkLabel)}
              </OrangeLink>
            </div>
          </div>
        </div>
      </section>

      {await Promise.all(featured.map(async (vehicle) => {
        const content = await getContent('home-vehicles', vehicle.slug)
        if (!content.heading) return null
        const gallery = lines(content.gallery).map((row) => String(row[0] ?? '')).filter(Boolean)
        const vehicleStats: StatItem[] = lines(content.stats).map(([label, value, unit]) => ({
          label: String(label ?? ''),
          value: String(value ?? ''),
          unit: String(unit ?? '') || undefined,
        }))
        return (
          <section key={vehicle.id} className="relative isolate overflow-hidden py-5">
            <FillImage src={text(content.background)} alt="" sizes="100vw" className="-z-10" />
            <div className="absolute inset-0 -z-10 bg-white/93" />
            <div className="mx-auto w-full max-w-[1140px] px-4">
              {vehicle.slug === featured[0]?.slug && (
                <h2 data-reveal className="text-[42px] font-semibold leading-[59px] text-heading md:text-[59px]">{text(home.vehiclesHeading)}</h2>
              )}
              <div className="mt-2 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,540px)_minmax(0,652px)] lg:justify-center">
                <div className="flex flex-col">
                  <h3 data-reveal className="text-[24px] font-semibold text-black/48 md:text-[30px] md:leading-[30px]">
                    {text(content.heading)}
                  </h3>
                  <StatGrid
                    stats={vehicleStats}
                    className="mt-5 grid-cols-2 [&>div]:items-start [&_dd]:justify-start [&_dt]:text-left"
                  />
                </div>
                <Gallery
                  images={gallery}
                  alt={text(content.heading)}
                  effect="slide"
                  className="w-full max-w-[652px]"
                  sizes="(min-width: 1024px) 652px, 100vw"
                />
              </div>
              <Paragraphs
                text={text(content.text)}
                className="mt-10 max-w-[1120px] text-[14px] leading-[25.2px]"
              />
            </div>
          </section>
        )
      }))}

      <JoinCta />
    </>
  )
}
