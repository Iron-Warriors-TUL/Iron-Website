import type { Metadata } from 'next'
import { BlockRenderer } from '@/components/site/block-renderer'
import { getContent } from '@/lib/content'
import { blockStr, parseBlocks } from '@/lib/blocks'

export const metadata: Metadata = { title: 'Kontakt' }

export default async function ContactPage() {
  const contact = await getContent('contact')
  const blocks = parseBlocks(contact.blocks)
  const hasH1 = blocks.some(
    (block) =>
      block.type === 'hero' ||
      block.type === 'pageHeader' ||
      block.type === 'contact' ||
      (block.type === 'heading' && blockStr(block, 'level') === 'h1'),
  )

  return (
    <div className="flex flex-col">
      {!hasH1 && <h1 className="sr-only">{String(contact.title || 'Kontakt')}</h1>}
      <BlockRenderer blocks={blocks} />
    </div>
  )
}
