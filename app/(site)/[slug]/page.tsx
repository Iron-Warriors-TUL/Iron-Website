import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Paragraphs } from '@/components/site/section'
import { FillImage } from '@/components/site/smart-image'
import { getContent, getStoredContent } from '@/lib/content'
import type { Data } from '@/lib/content-registry'

type Props = { params: Promise<{ slug: string }> }

async function getCustomPage(slug: string): Promise<Data | null> {
  const stored = await getStoredContent('pages', slug)
  if (!Object.keys(stored).length) return null
  const page = await getContent('pages', slug)
  if (page.published === false) return null
  return page
}

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
