import Link from 'next/link'
import { blockBool, blockCards, blockImages, blockStats, blockStr, type Block } from '@/lib/blocks'
import { getContent } from '@/lib/content'
import { getPublishedPosts, getVehicles } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Gallery, JoinCta, OrangeLink, Paragraphs, StatGrid } from './section'
import { FixedImage, FillImage } from './smart-image'
import { MapEmbed } from './map-embed'
import { PostCard } from './post-card'
import { YouTubeBackdrop, YouTubeEmbed } from './youtube-video'

const ASPECT: Record<string, string> = {
  video: 'aspect-video',
  square: 'aspect-square',
  wide: 'aspect-[21/9]',
  portrait: 'aspect-[4/5]',
}

function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('container-iw', className)}>{children}</div>
}

function linesOf(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function HeroBlock({ block }: { block: Block }) {
  const title = blockStr(block, 'title')
  const subtitle = blockStr(block, 'subtitle')
  const image = blockStr(block, 'image')
  const videoId = blockStr(block, 'videoId')
  const overlay = blockStr(block, 'overlay')
  const ctaLabel = blockStr(block, 'ctaLabel')
  const ctaHref = blockStr(block, 'ctaHref')
  const light = overlay === 'light'

  return (
    <section className="relative isolate flex min-h-[420px] items-center overflow-hidden bg-header">
      {videoId ? (
        <YouTubeBackdrop videoId={videoId} poster={image || undefined} />
      ) : image ? (
        <FillImage src={image} alt="" sizes="100vw" priority className="-z-10" />
      ) : null}
      <div
        className={cn(
          'absolute inset-0 z-0',
          overlay === 'dark' && 'bg-black/60',
          overlay === 'light' && 'bg-white/75',
          overlay === 'none' && 'bg-transparent',
        )}
      />
      <Container className="relative z-10 py-16">
        {title && (
          <h1
            className={cn(
              'text-balance text-4xl font-semibold uppercase md:text-[59px] md:leading-[59px]',
              light ? 'text-heading' : 'text-white',
            )}
          >
            {title}
          </h1>
        )}
        {subtitle && (
          <p
            className={cn(
              'mt-4 max-w-3xl text-pretty text-[15px] leading-[25.2px]',
              light ? 'text-black' : 'text-white/90',
            )}
          >
            {subtitle}
          </p>
        )}
        {ctaLabel && ctaHref && (
          <div className="mt-8">
            <OrangeLink href={ctaHref}>{ctaLabel}</OrangeLink>
          </div>
        )}
      </Container>
    </section>
  )
}

function HeadingBlock({ block }: { block: Block }) {
  const text = blockStr(block, 'text')
  if (!text) return null
  const level = blockStr(block, 'level')
  const Tag = (level === 'h1' ? 'h1' : level === 'h3' ? 'h3' : 'h2') as 'h1' | 'h2' | 'h3'
  return (
    <Container className="py-6">
      <Tag
        className={cn(
          'text-balance text-3xl font-semibold uppercase text-heading md:text-4xl',
          blockStr(block, 'align') === 'center' && 'text-center',
        )}
      >
        {text}
      </Tag>
    </Container>
  )
}

function TextBlock({ block }: { block: Block }) {
  const text = blockStr(block, 'text')
  if (!text) return null
  return (
    <Container className="py-4">
      <Paragraphs text={text} />
    </Container>
  )
}

function SectionBlock({ block }: { block: Block }) {
  const heading = blockStr(block, 'heading')
  const lead = blockStr(block, 'lead')
  const text = blockStr(block, 'text')
  const image = blockStr(block, 'image')
  const imageAlt = blockStr(block, 'imageAlt')
  const position = blockStr(block, 'imagePosition')
  const ctaLabel = blockStr(block, 'ctaLabel')
  const ctaHref = blockStr(block, 'ctaHref')
  const hasImage = image !== ''
  const sideBySide = hasImage && position !== 'below'

  if (!heading && !lead && !text && !hasImage) return null

  return (
    <section className="py-10">
      <Container>
        <div
          className={cn(
            'flex flex-col gap-8',
            sideBySide && 'md:flex-row md:items-center',
            position === 'left' && 'md:flex-row-reverse',
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {heading && <h2 className="text-balance text-3xl font-semibold uppercase text-heading md:text-4xl">{heading}</h2>}
            {lead && <p className="text-pretty text-lg text-muted-foreground">{lead}</p>}
            {text && <Paragraphs text={text} />}
            {ctaLabel && ctaHref && (
              <div className="mt-2">
                <OrangeLink href={ctaHref}>{ctaLabel}</OrangeLink>
              </div>
            )}
          </div>
          {hasImage && (
            <div className={cn('relative w-full overflow-hidden rounded-md bg-secondary', sideBySide && 'md:w-1/2')}>
              <div className={cn('relative w-full', sideBySide ? 'aspect-[4/3]' : 'aspect-video')}>
                <FillImage
                  src={image}
                  alt={imageAlt}
                  sizes={sideBySide ? '(min-width: 768px) 50vw, 100vw' : '100vw'}
                />
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}

function ImageBlock({ block }: { block: Block }) {
  const src = blockStr(block, 'src')
  if (!src) return null
  const alt = blockStr(block, 'alt')
  const caption = blockStr(block, 'caption')
  const narrow = blockStr(block, 'width') === 'narrow'
  const aspect = ASPECT[blockStr(block, 'aspect')] ?? ASPECT.video
  return (
    <Container className="py-6">
      <figure className={cn(narrow && 'mx-auto max-w-[720px]')}>
        <div className={cn('relative w-full overflow-hidden rounded-md bg-secondary', aspect)}>
          <FillImage src={src} alt={alt} sizes={narrow ? '(min-width: 720px) 720px, 100vw' : '100vw'} />
        </div>
        {caption && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption>}
      </figure>
    </Container>
  )
}

function GalleryBlock({ block }: { block: Block }) {
  const images = blockImages(block, 'images')
  if (images.length === 0) return null
  const aspect = ASPECT[blockStr(block, 'aspect')] ?? ASPECT.video
  return (
    <Container className="py-6">
      <Gallery
        images={images}
        alt=""
        effect={blockStr(block, 'effect') === 'fade' ? 'fade' : 'slide'}
        imageClassName={aspect}
        sizes="100vw"
      />
    </Container>
  )
}

function CardsBlock({ block }: { block: Block }) {
  const heading = blockStr(block, 'heading')
  const cards = blockCards(block, 'items')
  if (cards.length === 0 && !heading) return null
  return (
    <Container className="py-10">
      {heading && <h2 className="mb-8 text-center text-3xl font-semibold uppercase text-heading md:text-4xl">{heading}</h2>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => {
          const body = (
            <>
              {card.image && (
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
                  <FillImage
                    src={card.image}
                    alt={card.title}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2 p-5">
                {card.title && <h3 className="text-lg font-semibold text-heading">{card.title}</h3>}
                {card.text && <p className="text-sm leading-relaxed text-muted-foreground">{card.text}</p>}
                {card.href && <span className="mt-auto pt-2 text-sm font-semibold text-primary">Dowiedz się więcej →</span>}
              </div>
            </>
          )
          const className =
            'group flex flex-col overflow-hidden rounded-md border border-border bg-card transition-shadow hover:shadow-md'
          return card.href ? (
            <Link key={index} href={card.href} className={className}>
              {body}
            </Link>
          ) : (
            <div key={index} className={className}>
              {body}
            </div>
          )
        })}
      </div>
    </Container>
  )
}

function ListBlock({ block }: { block: Block }) {
  const heading = blockStr(block, 'heading')
  const items = blockStr(block, 'items')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  if (items.length === 0 && !heading) return null
  return (
    <Container className="py-6">
      {heading && <h2 className="mb-4 text-2xl font-semibold uppercase text-heading">{heading}</h2>}
      <ul className="flex flex-col gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3 text-[15px] leading-[25.2px] text-black">
            <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Container>
  )
}

function StatsBlock({ block }: { block: Block }) {
  const items = blockStats(block, 'items')
  if (items.length === 0) return null
  const heading = blockStr(block, 'heading')
  return (
    <Container className="py-8">
      {heading && <h2 className="mb-8 text-center text-3xl font-semibold uppercase text-heading">{heading}</h2>}
      <StatGrid stats={items} />
    </Container>
  )
}

function CtaBlock({ block }: { block: Block }) {
  const heading = blockStr(block, 'heading')
  const text = blockStr(block, 'text')
  const label = blockStr(block, 'label')
  const href = blockStr(block, 'href')
  const outline = blockStr(block, 'style') === 'outline'
  return (
    <section className="py-12">
      <Container className="flex flex-col items-center gap-5 text-center">
        {heading && <h2 className="text-balance text-3xl font-semibold uppercase text-heading md:text-4xl">{heading}</h2>}
        {text && <Paragraphs text={text} className="max-w-[720px] text-center sm:text-center" />}
        {label && href && (
          <OrangeLink
            href={href}
            className={outline ? 'border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white' : undefined}
          >
            {label}
          </OrangeLink>
        )}
      </Container>
    </section>
  )
}

function YoutubeBlock({ block }: { block: Block }) {
  const videoId = blockStr(block, 'videoId')
  if (!videoId) return null
  const title = blockStr(block, 'title')
  return (
    <Container className="py-6">
      <YouTubeEmbed videoId={videoId} className="mx-auto max-w-[900px]" />
      {title && <p className="mt-2 text-center text-sm text-muted-foreground">{title}</p>}
    </Container>
  )
}

function QuoteBlock({ block }: { block: Block }) {
  const text = blockStr(block, 'text')
  if (!text) return null
  const author = blockStr(block, 'author')
  return (
    <Container className="py-6">
      <blockquote className="mx-auto max-w-[820px] border-l-4 border-primary pl-6">
        <p className="text-pretty text-[20px] italic leading-relaxed text-heading">{text}</p>
        {author && <footer className="mt-3 text-sm not-italic text-muted-foreground">— {author}</footer>}
      </blockquote>
    </Container>
  )
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'hero':
      return <HeroBlock block={block} />
    case 'heading':
      return <HeadingBlock block={block} />
    case 'text':
      return <TextBlock block={block} />
    case 'section':
      return <SectionBlock block={block} />
    case 'image':
      return <ImageBlock block={block} />
    case 'gallery':
      return <GalleryBlock block={block} />
    case 'cards':
      return <CardsBlock block={block} />
    case 'list':
      return <ListBlock block={block} />
    case 'stats':
      return <StatsBlock block={block} />
    case 'cta':
      return <CtaBlock block={block} />
    case 'youtube':
      return <YoutubeBlock block={block} />
    case 'quote':
      return <QuoteBlock block={block} />
    case 'divider':
      return (
        <Container className="py-6">
          <hr className="border-border" />
        </Container>
      )
    default:
      return null
  }
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  if (blocks.length === 0) return null
  return (
    <div className="flex flex-col">
      {blocks.map((block) => (
        <BlockView key={block.id} block={block} />
      ))}
    </div>
  )
}
