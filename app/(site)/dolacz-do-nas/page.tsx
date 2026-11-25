import type { Metadata } from 'next'
import { BlockRenderer } from '@/components/site/block-renderer'
import { getContent } from '@/lib/content'
import { blockStr, parseBlocks } from '@/lib/blocks'

export const metadata: Metadata = { title: 'Dołącz do nas' }

export default async function JoinPage() {
  const recruitment = await getContent('recruitment')
  const blocks = parseBlocks(recruitment.blocks)
  const hasH1 = blocks.some(
    (block) =>
      block.type === 'hero' ||
      block.type === 'pageHeader' ||
      (block.type === 'heading' && blockStr(block, 'level') === 'h1'),
  )

  return (
    <div className="flex flex-col">
      {!hasH1 && <h1 className="sr-only">{String(recruitment.heading || 'Dołącz do nas')}</h1>}
      <BlockRenderer blocks={blocks} />
    </div>
  )
}
