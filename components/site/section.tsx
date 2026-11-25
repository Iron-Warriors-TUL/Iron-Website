import Link from 'next/link'
import { cn } from '@/lib/utils'
import { parseInlineContent } from '@/lib/inline-content'
import { AnimatedNumber } from './animated-number'
import { Carousel, type CarouselProps } from './carousel'
import { FillImage, FixedImage } from './smart-image'
import { YouTubeBackdrop } from './youtube-video'
import { getContent } from '@/lib/content'

export function PageHeader({ title, subtitle, image }: { title: string; subtitle?: string; image?: string }) {
  return (
    <section className="relative isolate flex min-h-72 items-center overflow-hidden bg-header">
      <FillImage src={image ?? '/images/eco-arrow-3-3.jpg'} alt="" priority sizes="100vw" className="-z-10 opacity-40" />
      <div className="absolute inset-0 -z-10 bg-white/92" />
      <div className="container-iw py-14">
        <h1 data-reveal className="text-balance text-4xl font-semibold uppercase text-heading md:text-[59px] md:leading-[59px]">{title}</h1>
        {subtitle && <p data-reveal className="mt-4 max-w-3xl text-pretty text-[15px] leading-[25.2px] text-black">{subtitle}</p>}
      </div>
    </section>
  )
}

export function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-5 text-left sm:text-justify text-[15px] leading-[25.2px] text-black', className)}>
      {parseInlineContent(text).map((block, i) =>
        block.type === 'image' ? (
          <figure key={i} data-reveal className="overflow-hidden rounded-md bg-secondary">
            <div className="relative aspect-video w-full">
              <FillImage src={block.src} alt={block.alt} sizes="100vw" />
            </div>
          </figure>
        ) : (
          <p key={i} data-reveal className="text-pretty">
            {block.text}
          </p>
        ),
      )}
    </div>
  )
}

export function OrangeLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      data-reveal
      href={href}
      className={cn(
        'inline-flex items-center justify-center rounded-[5px] bg-primary px-7 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90',
        className,
      )}
    >
      {children}
    </Link>
  )
}

export async function JoinCta() {
  const cta = await getContent('cta')
  const text = (name: string) => String(cta[name] ?? '')
  return (
    <section className="relative isolate flex h-[467px] items-center justify-center overflow-hidden">
      <YouTubeBackdrop
        videoId={text('videoId')}
        start={Number(cta.start) || 0}
        end={Number(cta.end) || 0}
        poster={text('poster')}
      />
      <div className="absolute inset-0 -z-0 bg-[#1e1a20]/75" />
      <div className="relative z-10 flex w-full flex-col items-center px-4 text-center">
        <h2 data-reveal className="text-balance text-center text-[38px] font-semibold leading-tight text-white md:text-[65px] md:leading-[65px]">
          {text('heading')}
        </h2>
        <div data-reveal className="mt-11 flex flex-wrap justify-center gap-5 px-4">
          <Link
            href={text('memberHref')}
            className="inline-flex h-[62px] w-[240px] items-center justify-center rounded-[5px] border-2 border-white text-lg font-bold text-white transition-colors hover:bg-white hover:text-heading"
          >
            {text('memberLabel')}
          </Link>
          <Link
            href={text('partnerHref')}
            className="inline-flex h-[62px] w-[240px] items-center justify-center rounded-[5px] border-2 border-white text-lg font-bold text-white transition-colors hover:bg-white hover:text-heading"
          >
            {text('partnerLabel')}
          </Link>
        </div>
      </div>
    </section>
  )
}

export type StatItem = { label: string; value: string; unit?: string }

export function StatGrid({ stats, className }: { stats: StatItem[]; className?: string }) {
  if (stats.length === 0) return null
  return (
    <dl className={cn('grid grid-cols-1 gap-x-5 gap-y-8 text-center sm:grid-cols-2 lg:grid-cols-4', className)}>
      {stats.map((stat) => (
        <div key={stat.label} data-reveal className="flex min-w-0 flex-col items-center">
          <dt className="flex min-h-[48px] items-end text-[17px] leading-[1.35] text-[#868990] sm:text-[19px]">{stat.label}</dt>
          <dd className="flex flex-wrap items-baseline justify-center text-[40px] font-semibold leading-[1.2] text-[#868990] sm:text-[52px] md:text-[60px] xl:text-[69px]">
            <AnimatedNumber value={stat.value} />
            {stat.unit && <span className="ml-1 text-[22px] font-semibold sm:text-[28px]">{stat.unit}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

type GalleryProps = Pick<CarouselProps, 'effect' | 'className' | 'imageClassName' | 'sizes' | 'showArrows' | 'forceControls'> & {
  images: string[]
  alt: string
}

export function Gallery({ images, alt, effect = 'fade', className, imageClassName, sizes, showArrows, forceControls }: GalleryProps) {
  if (images.length === 0) return null
  return (
    <Carousel
      images={images}
      alt={alt}
      effect={effect}
      className={className}
      imageClassName={imageClassName}
      sizes={sizes}
      showArrows={showArrows}
      forceControls={forceControls}
    />
  )
}

export function MemberGrid({ members }: { members: { name: string; role?: string; photo?: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {members.map((member) => (
        <div key={member.name} data-reveal className="flex flex-col items-center gap-3 text-center">
          <div className="relative aspect-square w-full overflow-hidden rounded-full bg-muted">
            <FixedImage
              src={member.photo ?? '/images/avatar-placeholder.webp'}
              alt={member.name}
              width={300}
              height={300}
              sizes="(min-width: 768px) 16vw, 45vw"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-heading">{member.name}</p>
            {member.role && <p className="mt-1 text-xs leading-snug text-foreground">{member.role}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
