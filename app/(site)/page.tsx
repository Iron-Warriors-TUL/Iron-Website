import { getContent } from '@/lib/content'
import { BlockRenderer } from '@/components/site/block-renderer'
import { blockStr, parseBlocks } from '@/lib/blocks'

export default async function HomePage() {
  const home = await getContent('home')
  const blocks = parseBlocks(home.blocks)
  const hasH1 = blocks.some(
    (block) => block.type === 'hero' || (block.type === 'heading' && blockStr(block, 'level') === 'h1'),
  )

  return (
    <div className="flex flex-col">
      {!hasH1 && <h1 className="sr-only">{String(home.heroTitle || 'Iron Warriors Team')}</h1>}
      <BlockRenderer blocks={blocks} />
    </div>
  )
}
