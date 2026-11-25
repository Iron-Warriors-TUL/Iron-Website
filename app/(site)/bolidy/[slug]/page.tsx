import { AnimatedNumber } from '@/components/site/animated-number'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getVehicle } from '@/lib/data'
import { getContent } from '@/lib/content'
import type { Achievement } from '@/lib/db/schema'
import { CountryFlag } from '@/components/site/country-flag'
import { BlockRenderer } from '@/components/site/block-renderer'
import { Gallery, JoinCta, Paragraphs, StatGrid } from '@/components/site/section'
import { FixedImage } from '@/components/site/smart-image'
import { blockStr, parseBlocks } from '@/lib/blocks'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const v = await getVehicle((await params).slug)
  return { title: v?.name ?? 'Bolid' }
}

const rowClasses: Record<number, string> = {
  1: 'flex justify-center',
  2: 'grid grid-cols-1 min-[768px]:grid-cols-2',
  3: 'grid grid-cols-1 min-[768px]:grid-cols-3',
  4: 'grid grid-cols-1 min-[768px]:grid-cols-4',
}

function chunk<T>(items: T[], sizes: number[]): T[][] {
  const rows: T[][] = []
  let start = 0
  sizes.forEach((size) => {
    rows.push(items.slice(start, start + size))
    start += size
  })
  if (start < items.length) rows.push(items.slice(start))
  return rows
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <article data-reveal className="flex flex-col items-center gap-3 text-center">
      <CountryFlag code={achievement.countryCode} />
      <h3 className="text-[19px] font-semibold leading-[1.2] text-heading">{achievement.title}</h3>
      <p className="-my-[10px] text-[13px] font-extralight leading-[25.2px] text-[#868990]">
        {achievement.location}
      </p>
      <p className="mt-[10px] text-[15px] font-medium leading-[25.2px] text-heading">{achievement.result}</p>
    </article>
  )
}

export default async function VehiclePage({ params }: Props) {
  const v = await getVehicle((await params).slug)
  if (!v) notFound()

  const blocks = parseBlocks(v.blocks)
  if (blocks.length > 0) {
    const hasH1 = blocks.some(
      (block) => block.type === 'hero' || (block.type === 'heading' && blockStr(block, 'level') === 'h1'),
    )
    return (
      <div className="flex flex-col">
        {!hasH1 && <h1 className="sr-only">{v.name}</h1>}
        <BlockRenderer blocks={blocks} />
      </div>
    )
  }

  const layout = await getContent('vehicle-layout', v.slug)
  const gallery = (Array.isArray(layout.gallery) ? (layout.gallery as unknown[][]) : [])
    .map((row) => String(row[0] ?? ''))
    .filter(Boolean)
  const heroAspect = String(layout.heroAspect ?? '')
  const achievementRows = String(layout.achievementRows ?? '')
    .split(',')
    .map((n) => Number(n.trim()))
    .filter((n) => Number.isInteger(n) && n > 0)

  const rows = chunk(v.achievements, achievementRows.length ? achievementRows : [v.achievements.length])

  return (
    <>
      <section className="bg-[#ffffffeb] pb-10 pt-[105px] max-[1024px]:pt-[calc(35px+10vw)]">
        <div className="w-full">
          {v.imageUrl && heroAspect ? (
            <FixedImage
              src={v.imageUrl}
              alt=""
              width={2560}
              height={1006}
              priority
              sizes="100vw"
              className={`w-full object-cover ${heroAspect}`}
            />
          ) : (
            <h1 className="text-center text-[42px] font-extralight uppercase leading-[1.2] text-heading md:text-[59px]">
              {v.name}
            </h1>
          )}
        </div>
      </section>

      <section className="bg-[#ffffffeb] pb-16">
        <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-12 px-[10px]">
          <Paragraphs text={v.description} className="max-w-[1140px] text-left sm:text-justify text-[15px] leading-[25.2px]" />

          <div data-reveal className="flex flex-col gap-4">
            <h2 className="text-[19px] font-semibold text-heading">Parametry techniczne</h2>
            <dl className="divide-y divide-[#c4c4c4] border-y border-[#c4c4c4]">
              {v.specs.map((s) => (
                <div key={s.label} className="grid grid-cols-[45%_55%] gap-0 py-3 text-[15px]">
                  <dt className="text-heading">{s.label}</dt>
                  <dd className="text-right text-[#7a7a7a]">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <Gallery
            images={gallery}
            alt={v.name}
            effect="fade"
            className="w-full"
            imageClassName="aspect-video"
            sizes="(min-width: 1200px) 1140px, 100vw"
          />

          <StatGrid stats={v.stats} className="grid-cols-2 lg:grid-cols-4" />

          <div className="border-t border-black py-[15px]" />

          <div className="flex flex-col gap-8">
            <div className="hidden grid-cols-[31.973%_35.386%_31.974%] items-center min-[1100px]:grid">
              <div />
              <h2 className="text-center text-[39px] font-extralight text-heading">Osiągnięcia</h2>
              {v.bestResult && (
                <div className="flex flex-row-reverse items-center justify-center gap-2.5">
                  <span className="text-[20px] text-[#868990]">Najlepszy wynik</span>
                  <span className="text-[40px] font-semibold text-[#868990]"><AnimatedNumber value={v.bestResult} /></span>
                </div>
              )}
            </div>
            <h2 className="text-center text-[29px] font-extralight text-heading min-[1100px]:hidden">Osiągnięcia</h2>
            {v.bestResult && (
              <div className="flex flex-row-reverse items-center justify-center gap-2.5 min-[768px]:hidden">
                <span className="text-[20px] text-[#868990]">Najlepszy wynik</span>
                <span className="text-[40px] font-semibold text-[#868990]"><AnimatedNumber value={v.bestResult} /></span>
              </div>
            )}

            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className={`${rowClasses[row.length] ?? 'grid grid-cols-4'} gap-x-5 gap-y-8`}>
                {row.map((achievement, index) => (
                  <AchievementCard key={`${achievement.title}-${index}`} achievement={achievement} />
                ))}
              </div>
            ))}
          </div>

          {v.goal && <p className="border-l-4 border-primary pl-5 text-lg font-semibold text-heading">{v.goal}</p>}
        </div>
      </section>
      <JoinCta />
    </>
  )
}
