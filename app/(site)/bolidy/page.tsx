import type { Metadata } from 'next'
import { BlockRenderer } from '@/components/site/block-renderer'
import { getContent } from '@/lib/content'
import { blockStr, parseBlocks } from '@/lib/blocks'

export const metadata: Metadata = { title: 'Bolidy' }

export default async function VehiclesPage() {
  const content = await getContent('vehicle-list')
  const blocks = parseBlocks(content.blocks)
  const hasH1 = blocks.some(
    (block) =>
      block.type === 'hero' ||
      block.type === 'pageHeader' ||
      block.type === 'vehicleList' ||
      (block.type === 'heading' && blockStr(block, 'level') === 'h1'),
  )

  return (
    <div className="flex flex-col">
      {!hasH1 && <h1 className="sr-only">{String(content.heading || 'Bolidy')}</h1>}
      <BlockRenderer blocks={blocks} />
    </div>
  )
}
