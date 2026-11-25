import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getVehicle } from '@/lib/data'
import { getContent } from '@/lib/content'
import { BlockRenderer } from '@/components/site/block-renderer'
import { JoinCta } from '@/components/site/section'
import { FixedImage } from '@/components/site/smart-image'
import { blockStr, parseBlocks } from '@/lib/blocks'
import { vehicleBlocks } from '@/lib/entity-blocks'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const v = await getVehicle((await params).slug)
  return { title: v?.name ?? 'Bolid' }
}

export default async function VehiclePage({ params }: Props) {
  const v = await getVehicle((await params).slug)
  if (!v) notFound()

  const layout = await getContent('vehicle-layout', v.slug)
  const gallery = (Array.isArray(layout.gallery) ? (layout.gallery as unknown[][]) : [])
    .map((row) => String(row[0] ?? ''))
    .filter(Boolean)
  const heroAspect = String(layout.heroAspect ?? '')
  const stored = parseBlocks(v.blocks)
  const blocks = stored.length > 0 ? stored : vehicleBlocks(v, gallery)
  const hasH1 = blocks.some(
    (block) =>
      block.type === 'hero' ||
      block.type === 'pageHeader' ||
      (block.type === 'heading' && blockStr(block, 'level') === 'h1'),
  )

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

      {v.imageUrl && heroAspect && !hasH1 && <h1 className="sr-only">{v.name}</h1>}

      <section className="bg-[#ffffffeb] pb-16">
        <BlockRenderer blocks={blocks} />
      </section>

      <JoinCta />
    </>
  )
}
