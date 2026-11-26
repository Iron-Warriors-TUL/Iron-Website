import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BlockRenderer } from '@/components/site/block-renderer'
import { blockStr, parseBlocks } from '@/lib/blocks'
import { getContent } from '@/lib/content'

type Props = { params: Promise<{ year: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params
  const team = await getContent('team-years', year)
  return { title: typeof team.label === 'string' ? team.label : 'Zespół' }
}

export default async function TeamPage({ params }: Props) {
  const { year } = await params
  const team = await getContent('team-years', year)
  const blocks = parseBlocks(team.blocks)
  if (!team.label && blocks.length === 0) notFound()
  const hasH1 = blocks.some(
    (block) =>
      block.type === 'hero' ||
      block.type === 'pageHeader' ||
      block.type === 'teamSeason' ||
      (block.type === 'heading' && blockStr(block, 'level') === 'h1'),
  )

  return (
    <div className="flex flex-col">
      {!hasH1 && <h1 className="sr-only">{String(team.label) || 'Zespół'}</h1>}
      <BlockRenderer blocks={blocks} />
    </div>
  )
}
