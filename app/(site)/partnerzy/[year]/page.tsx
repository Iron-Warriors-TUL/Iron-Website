import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BlockRenderer } from '@/components/site/block-renderer'
import { blockStr, parseBlocks } from '@/lib/blocks'
import { getContent, getEntryKeys } from '@/lib/content'

type Props = { params: Promise<{ year: string }> }

export async function generateStaticParams() {
  const years = await getEntryKeys('partner-years')
  return years.map((year) => ({ year }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params
  return { title: `Partnerzy ${year}` }
}

export default async function PartnersPage({ params }: Props) {
  const year = (await params).year
  const settings = await getContent('partner-years', year)
  const blocks = parseBlocks(settings.blocks)
  if (!settings.background && blocks.length === 0) notFound()
  const hasH1 = blocks.some(
    (block) =>
      block.type === 'hero' ||
      block.type === 'pageHeader' ||
      block.type === 'partnerSeason' ||
      (block.type === 'heading' && blockStr(block, 'level') === 'h1'),
  )

  return (
    <div className="flex flex-col">
      {!hasH1 && <h1 className="sr-only">Partnerzy {year}</h1>}
      <BlockRenderer blocks={blocks} />
    </div>
  )
}
