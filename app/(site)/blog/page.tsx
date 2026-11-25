import type { Metadata } from 'next'
import { BlockRenderer } from '@/components/site/block-renderer'
import { getContent } from '@/lib/content'
import { blockStr, parseBlocks } from '@/lib/blocks'

export const metadata: Metadata = { title: 'Blog' }

export default async function BlogPage() {
  const page = await getContent('blog-list')
  const blocks = parseBlocks(page.blocks)
  const hasH1 = blocks.some(
    (block) =>
      block.type === 'hero' ||
      block.type === 'pageHeader' ||
      block.type === 'postList' ||
      (block.type === 'heading' && blockStr(block, 'level') === 'h1'),
  )

  return (
    <div className="flex flex-col">
      {!hasH1 && <h1 className="sr-only">Blog</h1>}
      <BlockRenderer blocks={blocks} />
    </div>
  )
}
