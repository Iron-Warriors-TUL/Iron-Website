import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowDown } from 'lucide-react'
import { JoinCta } from '@/components/site/section'
import { FillImage, FixedImage } from '@/components/site/smart-image'
import type { Member, TeamSection } from '@/lib/site-content'
import { getContent, getEntryKeys, getPeopleMap } from '@/lib/content'

type Props = { params: Promise<{ year: string }> }

export async function generateStaticParams() {
  const years = await getEntryKeys('team-years')
  return years.map((year) => ({ year }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params
  const team = await getContent('team-years', year)
  return { title: typeof team.label === 'string' ? team.label : 'Zespół' }
}

const columnClasses: Record<TeamSection['columns'], string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-2 min-[768px]:grid-cols-4',
  5: 'grid-cols-2 min-[768px]:grid-cols-3 min-[1025px]:grid-cols-5',
  6: 'grid-cols-2 min-[768px]:grid-cols-3 min-[1025px]:grid-cols-6',
}

function TeamCard({ member, index }: { member: Member; index: number }) {
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
      <span className="sr-only">#{index + 1}</span>
    </div>
  )
}

function TeamRow({ section }: { section: TeamSection }) {
  return (
    <section
      id={section.id}
      className={`relative isolate scroll-mt-[150px] overflow-hidden ${section.background ? 'py-12' : 'py-8'}`}
    >
      {section.background && (
        <>
          <FillImage src={section.background} alt="" sizes="100vw" className="-z-10" />
          <div className="absolute inset-0 -z-10" style={{ backgroundColor: section.overlay ?? '#ffffffde' }} />
        </>
      )}
      <div className="mx-auto w-full px-[10px] max-[767px]:px-4" style={{ maxWidth: section.maxWidth ?? 1210 }}>
        {section.title && (
          <h2 data-reveal className="mb-9 text-center text-[29px] font-extralight leading-[1.2] text-heading md:text-[39px]">
            {section.title}
          </h2>
        )}
        <div className={`grid gap-x-5 gap-y-10 ${columnClasses[section.columns]}`}>
          {Array.from({ length: section.offset ?? 0 }, (_, i) => (
            <div key={`offset-${i}`} aria-hidden="true" className="hidden min-[768px]:block" />
          ))}
          {section.members.map((member, index) => (
            <TeamCard key={`${member.name}-${index}`} member={member} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default async function TeamPage({ params }: Props) {
  const { year } = await params
  const [team, sectionKeys, people] = await Promise.all([
    getContent('team-years', year),
    getEntryKeys('team-sections'),
    getPeopleMap(),
  ])
  if (!team.label) notFound()

  const season = String(team.label).replace('Zespół ', '')
  const SeasonTag = team.seasonTag === 'h1' ? 'h1' : 'h2'
  const jumps = Array.isArray(team.jumps) ? (team.jumps as unknown[][]).map(([label, id]) => ({ label: String(label), id: String(id) })) : []

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

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <FillImage src={String(team.heroBackground ?? '')} alt="" priority sizes="100vw" className="-z-10" />
        <div
          className="absolute inset-0 -z-10"
          style={{ backgroundColor: String(team.overlay ?? '#ffffffde') }}
        />
        <div className="mx-auto w-full max-w-[1210px] px-4 pb-[70px] pt-[170px] text-center min-[1200px]:pt-[210px]">
          <h1 data-reveal className="text-[42px] font-semibold uppercase leading-[1.2] text-heading md:text-[59px]">
            Zespół
          </h1>
          <SeasonTag data-reveal className="mt-3 text-[29px] font-extralight leading-[1.2] text-heading md:text-[39px]">
            {season}
          </SeasonTag>
          <p data-reveal className="mx-auto mt-7 max-w-[820px] text-[15px] leading-[25.2px] text-black">
            {String(team.intro ?? '')}
          </p>
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

      <JoinCta />
    </>
  )
}
