import { Fragment } from 'react'
import Link from 'next/link'
import { ArrowDown } from 'lucide-react'
import { blockAchievements, blockBool, blockCards, blockImages, blockSpecs, blockStats, blockStr, type Block } from '@/lib/blocks'
import { getContent, getEntryKeys, getPartnerCardMap, getPeopleMap } from '@/lib/content'
import { getPublishedPosts, getVehicles } from '@/lib/data'
import type { Member, Partner, PartnerGroup, PartnerYear, TeamSection } from '@/lib/site-content'
import { cn } from '@/lib/utils'
import { Gallery, JoinCta, OrangeLink, Paragraphs, StatGrid } from './section'
import { CountryFlag } from './country-flag'
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

const teamColumnClasses: Record<TeamSection['columns'], string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-2 min-[768px]:grid-cols-4',
  5: 'grid-cols-2 min-[768px]:grid-cols-3 min-[1025px]:grid-cols-5',
  6: 'grid-cols-2 min-[768px]:grid-cols-3 min-[1025px]:grid-cols-6',
}

function TeamCard({ member }: { member: Member }) {
  return (
    <div data-reveal className="flex flex-col items-center gap-2 px-[5px] text-center">
      {member.portrait ? (
        <div className="relative aspect-[2/3] w-full max-w-[175px] overflow-hidden rounded-[15px] bg-muted">
          <FixedImage
            src={member.photo}
            alt={member.name}
            width={400}
            height={600}
            sizes="(min-width: 768px) 175px, 45vw"
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="relative aspect-square w-[75%] max-w-[175px] overflow-hidden rounded-full border border-black/10 bg-muted min-[768px]:w-full">
          <FixedImage
            src={member.photo}
            alt={member.name}
            width={300}
            height={300}
            sizes="(min-width: 768px) 175px, 45vw"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <h3 className="whitespace-pre-line font-heading text-[16px] font-semibold leading-[1.2] text-heading min-[1025px]:text-[20px]">
        {member.name}
      </h3>
      {member.role && (
        <p className="whitespace-pre-line text-[13px] leading-[1.35] text-[#868990] min-[1025px]:text-[15px] min-[1025px]:leading-[1.68]">
          {member.role}
        </p>
      )}
    </div>
  )
}

function TeamRow({ section }: { section: TeamSection }) {
  return (
    <section
      id={section.id}
      className={`relative isolate scroll-mt-[150px] overflow-hidden ${section.background ? 'min-h-[300px] py-12' : 'py-8'}`}
    >
      {section.background && (
        <>
          <FillImage src={section.background} alt="" sizes="100vw" zIndex={-10} />
          <div className="absolute inset-0 -z-10" style={{ backgroundColor: section.overlay ?? '#ffffffde' }} />
        </>
      )}
      <div className="mx-auto w-full px-[10px] max-[767px]:px-4" style={{ maxWidth: section.maxWidth ?? 1210 }}>
        {section.title && (
          <h2 data-reveal className="mb-9 text-center text-[29px] font-extralight leading-[1.2] text-heading md:text-[39px]">
            {section.title}
          </h2>
        )}
        <div className={`grid gap-x-5 gap-y-10 ${teamColumnClasses[section.columns]}`}>
          {Array.from({ length: section.offset ?? 0 }, (_, index) => (
            <div key={`offset-${index}`} aria-hidden="true" className="hidden min-[768px]:block" />
          ))}
          {section.members.map((member, index) => (
            <TeamCard key={`${member.name}-${index}`} member={member} />
          ))}
        </div>
      </div>
    </section>
  )
}

const partnerColumnClasses: Record<PartnerGroup['columns'], string> = {
  2: 'grid-cols-2 max-[767px]:grid-cols-1',
  3: 'grid-cols-3 max-[1024px]:grid-cols-4 max-[767px]:grid-cols-2',
  4: 'grid-cols-4 max-[1024px]:grid-cols-4 max-[767px]:grid-cols-2',
}

const partnerHeightClasses: Record<PartnerGroup['height'], string> = {
  240: 'h-[240px] max-[1024px]:h-[291px]',
  291: 'h-[291px]',
}

function PartnerLogo({ partner, height }: { partner: Partner; height: PartnerGroup['height'] }) {
  const external = partner.href.startsWith('http')
  return (
    <a
      data-reveal
      href={partner.href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      title={partner.name}
      className={cn(
        'm-[5px] flex items-center justify-center rounded-[10px] bg-white px-[10px] py-[30px] shadow-[2px_2px_10px_0_rgba(0,0,0,0.5)]',
        partnerHeightClasses[height],
        'max-[767px]:h-[140px]',
      )}
    >
      <FixedImage
        src={partner.logo}
        alt={partner.name}
        width={220}
        height={120}
        sizes="(min-width: 768px) 240px, 160px"
        className="h-full w-auto max-w-full object-contain"
      />
    </a>
  )
}

function PlainPartnerLogo({ partner }: { partner: Partner }) {
  return (
    <a
      data-reveal
      href={partner.href}
      target="_blank"
      rel="noopener noreferrer"
      title={partner.name}
      className="flex h-[140px] items-center justify-center px-3 transition-transform duration-300 hover:scale-110"
    >
      <FixedImage
        src={partner.logo}
        alt={partner.name}
        width={220}
        height={110}
        sizes="(min-width: 768px) 230px, 45vw"
        className="max-h-[110px] w-auto max-w-full object-contain"
      />
    </a>
  )
}

function HeroBlock({ block }: { block: Block }) {
  const title = blockStr(block, 'title')
  const subtitle = blockStr(block, 'subtitle')
  const image = blockStr(block, 'image')
  const videoId = blockStr(block, 'videoId')
  const videoStart = Number(blockStr(block, 'videoStart')) || 0
  const videoEnd = Number(blockStr(block, 'videoEnd')) || 0
  const overlay = blockStr(block, 'overlay')
  const ctaLabel = blockStr(block, 'ctaLabel')
  const ctaHref = blockStr(block, 'ctaHref')
  const light = overlay === 'light'

  return (
    <section className="relative isolate flex min-h-[420px] items-center overflow-hidden bg-header">
      {videoId ? (
        <YouTubeBackdrop videoId={videoId} start={videoStart} end={videoEnd} poster={image || undefined} />
      ) : image ? (
        <FillImage src={image} alt="" sizes="100vw" priority zIndex={-10} />
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

function PageHeaderBlock({ block }: { block: Block }) {
  const title = blockStr(block, 'title')
  if (!title) return null
  const subtitle = blockStr(block, 'subtitle')
  const image = blockStr(block, 'image')
  return (
    <section className="relative isolate flex min-h-72 items-center overflow-hidden bg-header">
      <FillImage src={image || '/images/eco-arrow-3-3.jpg'} alt="" priority sizes="100vw" zIndex={-10} className="opacity-40" />
      <div className="absolute inset-0 -z-10 bg-white/92" />
      <Container className={cn('py-14', blockStr(block, 'align') === 'center' && 'text-center')}>
        <h1 data-reveal className="text-balance text-4xl font-semibold uppercase text-heading md:text-[59px] md:leading-[59px]">
          {title}
        </h1>
        {subtitle && (
          <p data-reveal className="mt-4 max-w-3xl text-pretty text-[15px] leading-[25.2px] text-black">
            {subtitle}
          </p>
        )}
      </Container>
    </section>
  )
}

function AboutBlock({ block }: { block: Block }) {
  const heading = blockStr(block, 'heading')
  const top = blockStr(block, 'top')
  const left = blockStr(block, 'left')
  const right = blockStr(block, 'right')
  const images = blockImages(block, 'images')
  const galleryAlt = blockStr(block, 'galleryAlt')
  const background = blockStr(block, 'background')
  const videoId = blockStr(block, 'videoId')
  if (!heading && !top && !left && !right && images.length === 0) return null

  return (
    <section id="firstFP" className="relative isolate min-h-[600px] overflow-hidden scroll-mt-28 py-5">
      {background && <FillImage src={background} alt="" sizes="100vw" zIndex={-10} />}
      <div className="absolute inset-0 -z-10 bg-white/82" />
      <Container>
        {heading && (
          <h2 data-reveal className="text-[42px] font-semibold leading-[59px] text-heading md:text-[59px]">
            {heading}
          </h2>
        )}
        {top && <Paragraphs text={top} className="mt-6 max-w-[1100px]" />}

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,540px)_minmax(0,540px)] lg:justify-center">
          <div className="flex flex-col gap-5">
            {left && <Paragraphs text={left} />}
            <Gallery
              images={images}
              alt={galleryAlt}
              effect="slide"
              className="w-full max-w-[540px] lg:mt-16"
              sizes="(min-width: 1024px) 540px, 100vw"
            />
          </div>
          <div className="flex flex-col gap-5">
            {videoId && <YouTubeEmbed videoId={videoId} className="w-full max-w-[540px]" />}
            {right && <Paragraphs text={right} />}
          </div>
        </div>
      </Container>
    </section>
  )
}

function FeaturesBlock({ block }: { block: Block }) {
  const heading = blockStr(block, 'heading')
  const intro = blockStr(block, 'intro')
  const items = linesOf(blockStr(block, 'items'))
  const image = blockStr(block, 'image')
  const imageAlt = blockStr(block, 'imageAlt')
  const position = blockStr(block, 'imagePosition')
  const ctaLabel = blockStr(block, 'ctaLabel')
  const ctaHref = blockStr(block, 'ctaHref')
  const hasImage = image !== ''
  const sideBySide = hasImage && position !== 'below'

  if (!heading && !intro && items.length === 0 && !hasImage) return null

  const copy = (
    <div className="flex min-w-0 flex-1 flex-col gap-5">
      {heading && <h2 className="text-balance text-3xl font-semibold uppercase text-heading md:text-4xl">{heading}</h2>}
      {intro && <Paragraphs text={intro} />}
      {items.length > 0 && (
        <ul className="flex flex-col gap-3">
          {items.map((item, index) => (
            <li key={index} className="flex gap-3 text-[15px] leading-[25.2px]">
              <span className="mt-2.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
      {ctaLabel && ctaHref && (
        <div className="mt-2">
          <OrangeLink href={ctaHref}>{ctaLabel}</OrangeLink>
        </div>
      )}
    </div>
  )

  const media = hasImage ? (
    <div className={cn('relative w-full overflow-hidden rounded-md bg-secondary', sideBySide && 'md:w-1/2')}>
      <div className={cn('relative w-full', sideBySide ? 'aspect-[4/3]' : 'aspect-video')}>
        <FillImage src={image} alt={imageAlt} sizes={sideBySide ? '(min-width: 768px) 50vw, 100vw' : '100vw'} />
      </div>
    </div>
  ) : null

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
          {copy}
          {media}
        </div>
      </Container>
    </section>
  )
}

function FormCtaBlock({ block }: { block: Block }) {
  const label = blockStr(block, 'label')
  const href = blockStr(block, 'href')
  const heading = blockStr(block, 'heading')
  const intro = blockStr(block, 'intro')
  const notice = blockStr(block, 'notice')

  return (
    <section className="py-10">
      <Container>
        {label && href && (
          <div className="flex justify-center">
            <a
              data-reveal
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[126px] w-[459px] max-w-full items-center justify-center rounded-[3px] bg-primary px-6 text-center text-[26px] font-bold leading-[26px] text-white transition-opacity hover:opacity-90"
            >
              {label}
            </a>
          </div>
        )}
        {heading && (
          <h2 data-reveal className="mt-32 text-center text-[42px] font-semibold text-heading md:text-[59px] md:leading-[59px]">
            {heading}
          </h2>
        )}
        {intro && <Paragraphs text={intro} className="mt-10 text-[15px] leading-[25.2px] text-[#868990]" />}
        {notice && (
          <h3 data-reveal className="mt-10 text-[24px] font-thin text-heading md:text-[29px] md:leading-[39px]">
            {notice}
          </h3>
        )}
      </Container>
    </section>
  )
}

function PartnerOfferBlock({ block }: { block: Block }) {
  const title = blockStr(block, 'title')
  const image = blockStr(block, 'image')
  const text = blockStr(block, 'text')
  const offerLabel = blockStr(block, 'offerLabel')
  const contactLabel = blockStr(block, 'contactLabel')
  const contactHref = blockStr(block, 'contactHref')
  return (
    <div className="flex flex-col">
      {title && (
        <section className="relative isolate flex min-h-72 items-center overflow-hidden bg-header">
          <FillImage src={image || '/images/team-2.jpg'} alt="" priority sizes="100vw" zIndex={-10} className="opacity-40" />
          <div className="absolute inset-0 -z-10 bg-white/92" />
          <Container className="py-14">
            <h1 data-reveal className="text-balance text-4xl font-semibold uppercase text-heading md:text-[59px] md:leading-[59px]">
              {title}
            </h1>
          </Container>
        </section>
      )}
      <section className="py-16">
        <Container className="flex flex-col items-start gap-8">
          {text && <Paragraphs text={text} className="max-w-4xl text-lg" />}
          <div data-reveal className="flex flex-wrap gap-4">
            <SponsorOfferLink label={offerLabel} />
            {contactLabel && contactHref && (
              <OrangeLink
                href={contactHref}
                className="border-2 border-heading bg-transparent text-heading hover:bg-heading hover:text-white"
              >
                {contactLabel}
              </OrangeLink>
            )}
          </div>
        </Container>
      </section>
    </div>
  )
}

async function SponsorOfferLink({ label }: { label: string }) {
  if (!label) return null
  const settings = await getContent('settings')
  const href = String(settings.sponsorPdf ?? '')
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-sm bg-primary px-7 py-3 text-sm font-bold uppercase text-white transition-opacity hover:opacity-90"
    >
      {label}
    </a>
  )
}

function VehicleFeatureBlock({ block }: { block: Block }) {
  const heading = blockStr(block, 'heading')
  const background = blockStr(block, 'background')
  const text = blockStr(block, 'text')
  const gallery = blockImages(block, 'gallery')
  const stats = blockStats(block, 'stats')
  if (!heading && !text && gallery.length === 0 && stats.length === 0) return null

  return (
    <section className="relative isolate min-h-[600px] overflow-hidden py-5">
      {background && <FillImage src={background} alt="" sizes="100vw" zIndex={-10} />}
      <div className="absolute inset-0 -z-10 bg-white/93" />
      <Container>
        <div className="mt-2 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,540px)_minmax(0,652px)] lg:justify-center">
          <div className="flex flex-col">
            {heading && (
              <h3 data-reveal className="text-[24px] font-semibold text-black/48 md:text-[30px] md:leading-[30px]">
                {heading}
              </h3>
            )}
            <StatGrid
              stats={stats}
              className="mt-5 grid-cols-2 lg:grid-cols-2 [&>div]:items-start [&_dd]:justify-start [&_dt]:text-left"
            />
          </div>
          <Gallery
            images={gallery}
            alt={heading}
            effect="slide"
            className="w-full max-w-[652px]"
            sizes="(min-width: 1024px) 652px, 100vw"
          />
        </div>
        {text && <Paragraphs text={text} className="mt-10 max-w-[1120px] text-[14px] leading-[25.2px]" />}
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
  const subheading = blockStr(block, 'subheading')
  const ctaLabel = blockStr(block, 'ctaLabel')
  const ctaHref = blockStr(block, 'ctaHref')
  return (
    <Container className="py-8">
      {heading && <h2 className="mb-8 text-center text-3xl font-semibold uppercase text-heading">{heading}</h2>}
      {subheading && <h3 className="mb-4 text-center text-[24px] font-semibold text-black/55 md:text-[29px]">{subheading}</h3>}
      <StatGrid stats={items} />
      {ctaLabel && ctaHref && (
        <div className="mt-4 flex justify-end">
          <OrangeLink href={ctaHref} className="h-[39px] px-8 py-0 text-[15px] font-normal">
            {ctaLabel}
          </OrangeLink>
        </div>
      )}
    </Container>
  )
}

function SpecsBlock({ block }: { block: Block }) {
  const items = blockSpecs(block, 'items')
  if (items.length === 0) return null
  const heading = blockStr(block, 'heading')
  return (
    <Container className="py-6">
      <div data-reveal className="flex flex-col gap-4">
        {heading && <h2 className="text-[19px] font-semibold text-heading">{heading}</h2>}
        <dl className="divide-y divide-[#c4c4c4] border-y border-[#c4c4c4]">
          {items.map((item, index) => (
            <div key={`${item.label}-${index}`} className="grid grid-cols-[45%_55%] gap-0 py-3 text-[15px]">
              <dt className="text-heading">{item.label}</dt>
              <dd className="text-right text-[#7a7a7a]">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Container>
  )
}

function AchievementsBlock({ block }: { block: Block }) {
  const items = blockAchievements(block, 'items')
  if (items.length === 0) return null
  const heading = blockStr(block, 'heading')
  return (
    <Container className="py-8">
      {heading && <h2 className="mb-8 text-center text-[29px] font-extralight text-heading md:text-[39px]">{heading}</h2>}
      <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((achievement, index) => (
          <article key={`${achievement.title}-${index}`} data-reveal className="flex flex-col items-center gap-3 text-center">
            {achievement.countryCode && <CountryFlag code={achievement.countryCode} />}
            <h3 className="text-[19px] font-semibold leading-[1.2] text-heading">{achievement.title}</h3>
            <p className="-my-[10px] text-[13px] font-extralight leading-[25.2px] text-[#868990]">{achievement.location}</p>
            <p className="mt-[10px] text-[15px] font-medium leading-[25.2px] text-heading">{achievement.result}</p>
          </article>
        ))}
      </div>
    </Container>
  )
}

function ImageRowBlock({ block }: { block: Block }) {
  const images = blockImages(block, 'images')
  if (images.length === 0) return null
  return (
    <Container className="py-6">
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
        {images.map((src, index) => (
          <FixedImage
            key={`${src}-${index}`}
            src={src}
            alt=""
            width={600}
            height={150}
            sizes="(min-width: 768px) 40vw, 90vw"
            className="h-auto max-h-[150px] w-auto max-w-full object-contain"
          />
        ))}
      </div>
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

async function ContactBlock({ block }: { block: Block }) {
  const title = blockStr(block, 'title')
  const background = blockStr(block, 'background')
  const photo = blockStr(block, 'photo')
  const photoAlt = blockStr(block, 'photoAlt')
  const name = blockStr(block, 'name')
  const role = blockStr(block, 'role')
  const email = blockStr(block, 'email')
  const sponsorText = blockStr(block, 'sponsorText')
  const sponsorButtonLabel = blockStr(block, 'sponsorButtonLabel')
  const sponsorHref = blockStr(block, 'sponsorHref')
  const showMap = blockBool(block, 'showMap')
  const settings = sponsorHref ? null : await getContent('settings')
  const offerHref = sponsorHref || String(settings?.sponsorPdf ?? '')

  return (
    <section className="relative isolate min-h-[500px] overflow-hidden">
      {background && <FillImage src={background} alt="" priority sizes="100vw" zIndex={-10} />}
      <div className="absolute inset-0 -z-10 bg-white/92" />

      <div className="mx-auto w-full max-w-[1140px] px-[10px] pb-[60px] min-[1200px]:pb-[80px]">
        {title && (
          <h1 className="pt-10 text-center text-[42px] min-[768px]:pt-14 font-semibold leading-[59px] text-black min-[1200px]:text-[59px]">
            {title}
          </h1>
        )}

        <div className={cn('mx-[10px] mt-5 grid w-[calc(100%-20px)] grid-cols-1 gap-5 pb-[10px] pt-[10px]', showMap && 'md:grid-cols-2')}>
          <div className="flex flex-col items-center">
            {photo && (
              <FixedImage
                src={photo}
                alt={photoAlt || name}
                width={254}
                height={254}
                sizes="(min-width: 1200px) 297px, 254px"
                priority
                className="mt-[59px] size-[254px] rounded-full object-cover min-[1200px]:mt-[37px] min-[1200px]:size-[297px]"
              />
            )}
            {name && (
              <h2 className="mt-8 text-center text-[24px] font-semibold leading-[29px] text-black">{name}</h2>
            )}
            {role && <p className="mt-1.5 text-center text-[17px] leading-[29px] text-black">{role}</p>}
            {email && (
              <a
                href={`mailto:${email}`}
                className="mt-3 max-w-full break-words text-center text-[16px] font-semibold leading-[24px] text-black hover:underline sm:text-[18px]"
              >
                {email}
              </a>
            )}
          </div>

          {showMap && <MapEmbed className="h-[518px] w-full border-0" />}
        </div>

        {sponsorText && <p className="text-center text-[15px] leading-[25.2px] text-[#868990]">{sponsorText}</p>}

        {sponsorButtonLabel && offerHref && (
          <div className="mt-10 flex justify-center">
            <a
              href={offerHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[58px] w-[257px] items-center justify-center rounded-[5px] bg-primary text-[18px] font-normal text-white transition-opacity hover:opacity-90"
            >
              {sponsorButtonLabel}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

async function VehicleListBlock({ block }: { block: Block }) {
  const heading = blockStr(block, 'heading')
  const lead = blockStr(block, 'lead')
  const background = blockStr(block, 'background')
  const moreLabel = blockStr(block, 'moreLabel')
  const showGalleries = blockBool(block, 'showGalleries')
  const slugs = linesOf(blockStr(block, 'slugs'))

  const summaries = new Map<string, string>()
  for (const line of linesOf(blockStr(block, 'summaries'))) {
    const [slug, ...rest] = line.split('|')
    const summary = rest.join('|').trim()
    if (slug?.trim() && summary) summaries.set(slug.trim(), summary)
  }

  const customGalleries = new Map<string, string[]>()
  for (const line of linesOf(blockStr(block, 'galleries'))) {
    const [slug, ...rest] = line.split('|')
    const src = rest.join('|').trim()
    if (!slug?.trim() || !src) continue
    const key = slug.trim()
    customGalleries.set(key, [...(customGalleries.get(key) ?? []), src])
  }

  const vehicles = await getVehicles()
  const selected = slugs.length > 0 ? vehicles.filter((vehicle) => slugs.includes(vehicle.slug)) : vehicles
  if (selected.length === 0) return null

  const galleries = new Map<string, string[]>()
  if (showGalleries) {
    const layouts = await Promise.all(
      selected.map((vehicle) =>
        customGalleries.has(vehicle.slug) ? Promise.resolve(null) : getContent('vehicle-layout', vehicle.slug),
      ),
    )
    selected.forEach((vehicle, index) => {
      const custom = customGalleries.get(vehicle.slug)
      if (custom) {
        galleries.set(vehicle.slug, custom)
        return
      }
      const layout = layouts[index]
      const rows = layout && Array.isArray(layout.gallery) ? (layout.gallery as unknown[][]) : []
      galleries.set(vehicle.slug, rows.map((row) => String(row[0] ?? '')).filter(Boolean))
    })
  }

  const titleStyle = { WebkitTextStroke: '2px black', textShadow: '0 0 10px rgba(0,0,0,.3)' }

  return (
    <section className="relative isolate min-h-[400px] overflow-hidden pb-14 pt-[110px]">
      {background && <FillImage src={background} alt="" priority sizes="100vw" zIndex={-10} />}
      <div className="absolute inset-0 -z-10 bg-[#ffffffeb]" />
      <div className="mx-auto w-full max-w-[1140px] px-[30px] max-[767px]:px-4">
        {heading && (
          <h1 className="text-[42px] font-thin leading-[59px] text-heading md:text-[59px]" style={titleStyle}>
            {heading}
          </h1>
        )}
        {lead && <Paragraphs text={lead} className="mt-6 max-w-[900px]" />}

        <div className="mt-16 flex flex-col gap-14">
          {selected.map((vehicle) => (
            <article
              key={vehicle.id}
              data-reveal
              className="flex flex-col gap-10 border-b border-black pb-[15px] md:flex-row md:items-center md:gap-[30px]"
            >
              <div className="order-2 flex w-full flex-col md:order-1 md:w-1/2">
                <h2 className="mb-3 hidden text-right text-[39px] font-thin leading-[39px] text-heading md:block">
                  {vehicle.name}
                </h2>
                {showGalleries && (
                  <Gallery
                    images={galleries.get(vehicle.slug) ?? []}
                    alt={vehicle.name}
                    effect="fade"
                    className="w-full"
                    imageClassName="aspect-video"
                    sizes="(min-width: 768px) 555px, 100vw"
                  />
                )}
                <h2 className="mt-3 text-center text-[29px] font-thin text-heading md:hidden">{vehicle.name}</h2>
              </div>

              <div className="order-1 flex w-full flex-col items-start gap-5 md:order-2 md:w-1/2">
                <h2 className="text-left text-[29px] font-thin leading-[39px] text-heading md:text-[39px]" style={titleStyle}>
                  {vehicle.name}
                </h2>
                <Paragraphs
                  text={summaries.get(vehicle.slug) ?? vehicle.description.split(/\n{2,}/)[0]}
                  className="text-[15px] leading-[25.2px] text-[#868990]"
                />
                {moreLabel && (
                  <OrangeLink
                    href={`/${vehicle.slug}`}
                    className="h-[39px] w-[145px] p-0 text-[15px] font-semibold"
                  >
                    {moreLabel}
                  </OrangeLink>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

async function PostListBlock({ block }: { block: Block }) {
  const heading = blockStr(block, 'heading')
  const lead = blockStr(block, 'lead')
  const limit = Number(blockStr(block, 'limit')) || undefined
  const columns = blockStr(block, 'columns') === '2' ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
  const allLabel = blockStr(block, 'allLabel')
  const allHref = blockStr(block, 'allHref')
  const posts = await getPublishedPosts(limit)

  return (
    <section className="py-10">
      <Container>
        {heading && (
          <h1 className="text-balance text-4xl font-semibold uppercase text-heading md:text-[59px] md:leading-[59px]">
            {heading}
          </h1>
        )}
        {lead && <Paragraphs text={lead} className="mt-4 max-w-3xl" />}
        {posts.length === 0 ? (
          <p className="mt-8 text-muted-foreground">Brak wpisów.</p>
        ) : (
          <div className={cn('mt-8 grid gap-6', columns)}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
        {allLabel && allHref && (
          <div className="mt-8 flex justify-end">
            <OrangeLink href={allHref}>{allLabel}</OrangeLink>
          </div>
        )}
      </Container>
    </section>
  )
}

async function ProjectListBlock({ block }: { block: Block }) {
  const heading = blockStr(block, 'heading')
  const lead = blockStr(block, 'lead')
  const moreLabel = blockStr(block, 'moreLabel')
  const showImages = blockBool(block, 'showImages')
  const selected = linesOf(blockStr(block, 'categories'))
  const settings = await getContent('settings')
  const rows = Array.isArray(settings.projectCategories) ? (settings.projectCategories as unknown[][]) : []
  const categories = rows
    .map((row) => ({
      slug: String(row[0] ?? ''),
      title: String(row[1] ?? ''),
      description: String(row[2] ?? ''),
      image: String(row[3] ?? ''),
    }))
    .filter((category) => selected.length === 0 || selected.includes(category.slug))

  if (categories.length === 0) return null

  return (
    <section className="py-10">
      <Container>
        {heading && (
          <h1 className="text-center text-[42px] font-semibold text-heading md:text-[59px] md:leading-[59px]">{heading}</h1>
        )}
        {lead && <Paragraphs text={lead} className="mt-4" />}
        <div className="mt-10 flex flex-col gap-10">
          {categories.map((category) => (
            <article key={category.slug} data-reveal className="flex flex-col gap-6 border-b border-black pb-8 md:flex-row md:items-center">
              {showImages && category.image && (
                <div className="relative h-[160px] w-full max-w-[420px] shrink-0 overflow-hidden rounded-md bg-white md:w-1/2">
                  <FixedImage
                    src={category.image}
                    alt={category.title}
                    width={600}
                    height={200}
                    sizes="(min-width: 768px) 420px, 100vw"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
                <h2 className="text-[24px] font-thin leading-[1.3] text-heading md:text-[29px] md:leading-[39px]">
                  <Link href={`/projekty/${category.slug}`} className="transition-colors hover:text-primary">
                    {category.title}
                  </Link>
                </h2>
                {category.description && (
                  <Paragraphs text={category.description} className="text-[15px] leading-[25.2px] text-[#868990]" />
                )}
                {moreLabel && (
                  <OrangeLink
                    href={`/projekty/${category.slug}`}
                    className="h-[39px] w-[145px] p-0 text-[15px] font-semibold"
                  >
                    {moreLabel}
                  </OrangeLink>
                )}
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}

async function TeamSeasonBlock({ block }: { block: Block }) {
  const year = blockStr(block, 'year')
  if (!year) return null
  const label = blockStr(block, 'label')
  const intro = blockStr(block, 'intro')
  const background = blockStr(block, 'heroBackground')
  const overlay = blockStr(block, 'overlay') || '#ffffffde'
  const seasonTag = blockStr(block, 'seasonTag') === 'h1' ? 'h1' : 'h2'
  const jumps = blockStr(block, 'jumps')
    .split('\n')
    .map((line) => line.split('|').map((part) => part.trim()))
    .filter(([jumpLabel, id]) => jumpLabel && id)
    .map(([jumpLabel, id]) => ({ label: jumpLabel, id }))

  const [sectionKeys, people] = await Promise.all([getEntryKeys('team-sections'), getPeopleMap()])
  const sectionEntries = await Promise.all(
    sectionKeys
      .filter((key) => key.startsWith(`${year}::`))
      .sort((a, b) => Number(a.split('::')[1]) - Number(b.split('::')[1]))
      .map((key) => getContent('team-sections', key)),
  )

  const rows: TeamSection[] = sectionEntries.map((entry) => {
    const members: Member[] = (Array.isArray(entry.members) ? (entry.members as unknown[][]) : []).map((row) => {
      const person = people.get(String(row[0] ?? ''))
      return {
        name: person?.name ?? '',
        role: String(row[1] ?? '') || undefined,
        photo: person?.photo ?? '',
        portrait: person?.portrait ?? false,
      }
    })
    return {
      id: String(entry.id ?? '') || undefined,
      title: String(entry.title ?? ''),
      background: String(entry.background ?? ''),
      overlay: String(entry.overlay ?? ''),
      columns: (Number(entry.columns) || 5) as TeamSection['columns'],
      maxWidth: Number(entry.maxWidth) || 1210,
      offset: Number(entry.offset) || 0,
      members,
    }
  })

  const season = label.replace('Zespół ', '')
  const SeasonTag = seasonTag as 'h1' | 'h2'

  return (
    <div className="flex flex-col">
      <section className="relative isolate min-h-[500px] overflow-hidden">
        {background && <FillImage src={background} alt="" priority sizes="100vw" zIndex={-10} />}
        <div className="absolute inset-0 -z-10" style={{ backgroundColor: overlay }} />
        <div className="mx-auto w-full max-w-[1210px] px-4 pb-[70px] pt-[170px] text-center min-[1200px]:pt-[210px]">
          <h1 data-reveal className="text-[42px] font-semibold uppercase leading-[1.2] text-heading md:text-[59px]">
            Zespół
          </h1>
          <SeasonTag data-reveal className="mt-3 text-[29px] font-extralight leading-[1.2] text-heading md:text-[39px]">
            {season}
          </SeasonTag>
          {intro && <p data-reveal className="mx-auto mt-7 max-w-[820px] text-[15px] leading-[25.2px] text-black">{intro}</p>}
        </div>
      </section>

      <div className="bg-white">
        {rows.map((section, index) => (
          <div key={`${section.title ?? 'section'}-${index}`}>
            <TeamRow section={section} />
            {index === 0 && jumps.length > 0 && (
              <div className="mx-auto flex max-w-[1210px] flex-wrap justify-center gap-3 px-4 py-8">
                {jumps.map((jump) => (
                  <a
                    key={jump.id}
                    href={`#${jump.id}`}
                    className="flex h-[46px] items-center justify-center gap-2 rounded-[3px] bg-primary px-5 font-heading text-[14px] font-semibold text-white transition-colors hover:bg-[#7a7a7a]"
                  >
                    {jump.label}
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

async function PartnerSeasonBlock({ block }: { block: Block }) {
  const year = blockStr(block, 'year')
  if (!year) return null
  const background = blockStr(block, 'background')
  const bottomBackground = blockStr(block, 'bottomBackground')
  const overlay = blockStr(block, 'overlay') || '#ffffffe8'
  const plainImages = blockBool(block, 'plainImages')

  const [groupKeys, partnerCards] = await Promise.all([getEntryKeys('partner-groups'), getPartnerCardMap()])
  const entries = await Promise.all(
    groupKeys
      .filter((key) => key.startsWith(`${year}::`))
      .sort((a, b) => {
        const [, as, ag] = a.split('::').map(Number)
        const [, bs, bg] = b.split('::').map(Number)
        return as - bs || ag - bg
      })
      .map((key) => getContent('partner-groups', key)),
  )

  const sectionMap = new Map<number, { title?: string; groups: PartnerGroup[] }>()
  for (const entry of entries) {
    const sectionIndex = Number(entry.sectionIndex) || 0
    const section: { title?: string; groups: PartnerGroup[] } = sectionMap.get(sectionIndex) ?? { groups: [] }
    if (!section.title && typeof entry.title === 'string' && entry.title) section.title = entry.title
    const items: Partner[] = (Array.isArray(entry.items) ? (entry.items as unknown[][]) : []).flatMap((row) => {
      const card = partnerCards.get(String(row[0] ?? ''))
      return card ? [{ name: card.name, logo: card.logo, href: card.href }] : []
    })
    section.groups = [
      ...section.groups,
      {
        columns: (Number(entry.columns) || 4) as PartnerGroup['columns'],
        height: (Number(entry.height) || 240) as PartnerGroup['height'],
        items,
      },
    ]
    sectionMap.set(sectionIndex, section)
  }

  const data: PartnerYear = {
    year,
    background,
    bottomBackground: bottomBackground || undefined,
    overlay,
    plainImages,
    sections: [...sectionMap.entries()].sort(([a], [b]) => a - b).map(([, section]) => section),
  }

  const headingClass = 'text-center text-[42px] font-extralight leading-[1.2] text-[#7a7a7a] md:text-[59px]'

  return (
    <div className="flex flex-col">
      <section className="relative isolate min-h-[400px] overflow-hidden">
        {data.background && <FillImage src={data.background} alt="" priority sizes="100vw" zIndex={-10} />}
        <div className="absolute inset-0 -z-10" style={{ backgroundColor: data.overlay }} />

        <div className="mx-auto w-full max-w-[1140px] px-[30px] pb-[70px] pt-[70px] max-[767px]:px-4">
          <h1 data-reveal className={headingClass}>Partnerzy</h1>
          <h2 data-reveal className={cn(headingClass, 'mt-5')}>{data.year}</h2>

          {data.sections.map((section, sectionIndex) => (
            <div key={section.title ?? `group-${sectionIndex}`} className="mt-10">
              {sectionIndex > 0 && <div className="mb-[15px] border-t border-[#625252] py-[15px]" />}
              {section.title && <h2 data-reveal className={cn(headingClass, 'mb-5 text-[29px] md:text-[39px]')}>{section.title}</h2>}
              <div className="flex flex-col gap-[15px]">
                {section.groups.map((group, groupIndex) =>
                  data.plainImages ? (
                    <div key={`plain-${groupIndex}`} className="grid grid-cols-2 gap-5 md:grid-cols-4">
                      {group.items.map((partner, index) => (
                        <PlainPartnerLogo key={`${partner.name}-${index}`} partner={partner} />
                      ))}
                    </div>
                  ) : (
                    <div key={`grid-${groupIndex}`} data-reveal className={cn('grid gap-[15px]', partnerColumnClasses[group.columns])}>
                      {group.items.map((partner, index) => (
                        <PartnerLogo key={`${partner.name}-${index}`} partner={partner} height={group.height} />
                      ))}
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {data.bottomBackground && (
        <section className="relative isolate overflow-hidden">
          <FillImage src={data.bottomBackground} alt="" sizes="100vw" zIndex={-10} className="[object-position:center_bottom]" />
          <div className="absolute inset-0 -z-10" style={{ backgroundColor: data.overlay }} />
          <div className="h-[120px]" />
        </section>
      )}
    </div>
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

async function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'hero':
      return <HeroBlock block={block} />
    case 'pageHeader':
      return <PageHeaderBlock block={block} />
    case 'heading':
      return <HeadingBlock block={block} />
    case 'text':
      return <TextBlock block={block} />
    case 'section':
      return <SectionBlock block={block} />
    case 'about':
      return <AboutBlock block={block} />
    case 'features':
      return <FeaturesBlock block={block} />
    case 'formCta':
      return <FormCtaBlock block={block} />
    case 'partnerOffer':
      return <PartnerOfferBlock block={block} />
    case 'vehicleFeature':
      return <VehicleFeatureBlock block={block} />
    case 'vehicleList':
      return <VehicleListBlock block={block} />
    case 'postList':
      return <PostListBlock block={block} />
    case 'projectList':
      return <ProjectListBlock block={block} />
    case 'teamSeason':
      return <TeamSeasonBlock block={block} />
    case 'partnerSeason':
      return <PartnerSeasonBlock block={block} />
    case 'contact':
      return <ContactBlock block={block} />
    case 'joinCta':
      return <JoinCta />
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
    case 'specs':
      return <SpecsBlock block={block} />
    case 'achievements':
      return <AchievementsBlock block={block} />
    case 'imageRow':
      return <ImageRowBlock block={block} />
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

export async function BlockRenderer({ blocks }: { blocks: Block[] }) {
  if (blocks.length === 0) return null
  const rendered = await Promise.all(blocks.map((block) => BlockView({ block })))
  return (
    <div className="flex flex-col">
      {rendered.map((node, index) => (
        <Fragment key={blocks[index]?.id ?? index}>{node}</Fragment>
      ))}
    </div>
  )
}
