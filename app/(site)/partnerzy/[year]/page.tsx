import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { cn } from '@/lib/utils'
import { JoinCta } from '@/components/site/section'
import { FillImage, FixedImage } from '@/components/site/smart-image'
import type { Partner, PartnerGroup, PartnerYear } from '@/lib/site-content'
import { getContent, getEntryKeys, getPartnerCardMap } from '@/lib/content'

type Props = { params: Promise<{ year: string }> }

export async function generateStaticParams() {
  const years = await getEntryKeys('partner-years')
  return years.map((year) => ({ year }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params
  return { title: `Partnerzy ${year}` }
}

const columnClasses: Record<PartnerGroup['columns'], string> = {
  2: 'grid-cols-2 max-[767px]:grid-cols-1',
  3: 'grid-cols-3 max-[1024px]:grid-cols-4 max-[767px]:grid-cols-2',
  4: 'grid-cols-4 max-[1024px]:grid-cols-4 max-[767px]:grid-cols-2',
}

const heightClasses: Record<PartnerGroup['height'], string> = {
  240: 'h-[240px] max-[1024px]:h-[291px]',
  291: 'h-[291px]',
}

function PartnerCard({ partner, height }: { partner: Partner; height: PartnerGroup['height'] }) {
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
        heightClasses[height],
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

function PartnerGroupGrid({ group }: { group: PartnerGroup }) {
  return (
    <div data-reveal className={cn('grid gap-[15px]', columnClasses[group.columns])}>
      {group.items.map((partner, index) => (
        <PartnerCard key={`${partner.name}-${index}`} partner={partner} height={group.height} />
      ))}
    </div>
  )
}

export default async function PartnersPage({ params }: Props) {
  const year = (await params).year
  const [settings, groupKeys, partnerCards] = await Promise.all([
    getContent('partner-years', year),
    getEntryKeys('partner-groups'),
    getPartnerCardMap(),
  ])
  if (!settings.background) notFound()

  const entries = await Promise.all(
    groupKeys
      .filter((key) => key.startsWith(`${year}::`))
      .sort((a, b) => {
        const [ay, as, ag] = a.split('::').map(Number)
        const [by, bs, bg] = b.split('::').map(Number)
        return as - bs || ag - bg || ay - by
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
    const group: PartnerGroup = {
      columns: (Number(entry.columns) || 4) as PartnerGroup['columns'],
      height: (Number(entry.height) || 240) as PartnerGroup['height'],
      items,
    }
    section.groups = [...section.groups, group]
    sectionMap.set(sectionIndex, section)
  }

  const data: PartnerYear = {
    year,
    background: String(settings.background),
    bottomBackground: String(settings.bottomBackground ?? '') || undefined,
    overlay: String(settings.overlay ?? '#ffffffe8'),
    plainImages: settings.plainImages === true,
    sections: [...sectionMap.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, section]) => section),
  }

  const headingClass = 'text-center text-[42px] font-extralight leading-[1.2] text-[#7a7a7a] md:text-[59px]'

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <FillImage src={data.background} alt="" priority sizes="100vw" className="-z-10" />
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
                    <PartnerGroupGrid key={`grid-${groupIndex}`} group={group} />
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {data.bottomBackground && (
        <section className="relative isolate overflow-hidden">
          <FillImage
            src={data.bottomBackground}
            alt=""
            sizes="100vw"
            className="-z-10 [object-position:center_bottom]"
          />
          <div className="absolute inset-0 -z-10" style={{ backgroundColor: data.overlay }} />
          <div className="h-[120px]" />
        </section>
      )}

      <JoinCta />
    </>
  )
}
