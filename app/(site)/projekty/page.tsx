import type { Metadata } from 'next'
import { BlockRenderer } from '@/components/site/block-renderer'
import { getContent } from '@/lib/content'
import { blockStr, parseBlocks } from '@/lib/blocks'

export const metadata: Metadata = { title: 'Projekty' }

export default async function ProjectsPage() {
  const page = await getContent('projects-list')
  const blocks = parseBlocks(page.blocks)
  const hasH1 = blocks.some(
    (block) =>
      block.type === 'hero' ||
      block.type === 'pageHeader' ||
      block.type === 'projectList' ||
      (block.type === 'heading' && blockStr(block, 'level') === 'h1'),
  )

  return (
    <div className="flex flex-col">
      {!hasH1 && <h1 className="sr-only">Projekty</h1>}
      <BlockRenderer blocks={blocks} />
    </div>
  )
}
