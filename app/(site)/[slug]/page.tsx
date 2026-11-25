import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlockRenderer } from '@/components/site/block-renderer'
import { Paragraphs } from '@/components/site/section'
import { FillImage } from '@/components/site/smart-image'
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
  const lead = String(page.lead ?? '')
  const content = String(page.content ?? '')
  const image = String(page.image ?? '')

  const blocks = parseBlocks(page.blocks)
  if (blocks.length > 0) {
    const hasH1 = blocks.some(
      (block) => block.type === 'hero' || (block.type === 'heading' && blockStr(block, 'level') === 'h1'),
    )
    return (
      <div className="flex flex-col">
        {!hasH1 && <h1 className="sr-only">{title || slug}</h1>}
        <BlockRenderer blocks={blocks} />
      </div>
    )
  }

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-16 md:px-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-balance text-4xl font-bold md:text-5xl">{title || slug}</h1>
        {lead && <p className="text-lg text-muted-foreground">{lead}</p>}
      </header>
      {image && (
        <div className="relative aspect-video w-full overflow-hidden rounded-md">
          <FillImage
            src={image}
            alt={String(page.imageAlt || title)}
            sizes="(min-width: 768px) 768px, 100vw"
          />
        </div>
      )}
      {content && <Paragraphs text={content} className="text-lg text-foreground/85" />}
    </article>
  )
}
