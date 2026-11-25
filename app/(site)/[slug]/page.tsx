import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlockRenderer } from '@/components/site/block-renderer'
import { blockStr, parseBlocks } from '@/lib/blocks'
import { getCustomPage } from '@/lib/content'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getCustomPage(slug)
  if (!page) return { title: 'Nie znaleziono strony' }
  const description = String(page.seoDescription || page.lead || '')
  return {
    title: String(page.title || slug),
    description: description || undefined,
  }
}

export default async function CustomPage({ params }: Props) {
  const { slug } = await params
  const page = await getCustomPage(slug)
  if (!page) notFound()

  const title = String(page.title ?? '')
  const blocks = parseBlocks(page.blocks)
  const hasH1 = blocks.some(
    (block) =>
      block.type === 'hero' ||
      block.type === 'pageHeader' ||
      (block.type === 'heading' && blockStr(block, 'level') === 'h1'),
  )

  return (
    <div className="flex flex-col">
      {!hasH1 && <h1 className="sr-only">{title || slug}</h1>}
      <BlockRenderer blocks={blocks} />
    </div>
  )
}
