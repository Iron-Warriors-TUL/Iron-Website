import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { getProjects } from '@/lib/data'
import { JoinCta } from '@/components/site/section'
import { FillImage, FixedImage } from '@/components/site/smart-image'
import { getContent } from '@/lib/content'
import type { Project } from '@/lib/db/schema'

type Props = { params: Promise<{ slug: string }> }

const categoryBySlug: Record<string, string> = {
  mnisw: 'MNiSW',
  'rada-kol': 'Rada Kół Naukowych PŁ',
  'fundacja-pl': 'Fundacja Politechniki Łódzkiej',
  'miasto-lodz': 'Miasto Łódź',
}

type Field = {
  label: string
  key: Exclude<keyof Project, 'id' | 'createdAt' | 'updatedAt'>
  bold?: boolean
}

const detailConfig: Record<
  string,
  { headingPadding: string; fields: Field[] }
> = {
  mnisw: {
    headingPadding: 'pt-[10px]',
    fields: [
      { label: 'Program', key: 'program' },
      { label: 'Nazwa zadania', key: 'title' },
      { label: 'Dofinansowanie', key: 'funding', bold: true },
      { label: 'Całkowita wartość', key: 'totalValue', bold: true },
      { label: 'Data realizacji', key: 'period', bold: true },
    ],
  },
  'rada-kol': {
    headingPadding: 'pt-[10px]',
    fields: [
      { label: 'Tytuł projektu', key: 'title' },
      { label: 'Dofinansowanie', key: 'funding', bold: true },
      { label: 'Data realizacji', key: 'period', bold: true },
    ],
  },
  'fundacja-pl': {
    headingPadding: 'pt-[20px]',
    fields: [
      { label: 'Projekt', key: 'program', bold: true },
      { label: 'Nazwa projektu', key: 'title', bold: true },
      { label: 'Dofinansowanie', key: 'funding', bold: true },
      { label: 'Data realizacji', key: 'period', bold: true },
    ],
  },
  'miasto-lodz': {
    headingPadding: 'pt-[20px]',
    fields: [
      { label: 'Projekt', key: 'program', bold: true },
      { label: 'Nazwa projektu', key: 'title', bold: true },
      { label: 'Dofinansowanie', key: 'funding', bold: true },
      { label: 'Wkład własny', key: 'ownContribution', bold: true },
      { label: 'Data realizacji', key: 'period', bold: true },
    ],
  },
}

const imageDimensions: Record<string, [number, number]> = {
  'FERS_RP_UE_RGB-1-scaled-rr2jk3frr6agsq30ibchu761hbht1gf643ekp3od8g.png': [1088, 150],
  'znaki_strona_www-q8wsp3xqs0em356baxgmhsgv9uybgyrfxx5edqh4ow.png': [451, 150],
  'mein_studenckie_kola_naukowe_tworza_innowacje_logo-q8wspiz5tcz78wkgv3ynloo8s0w6w4f5bzl625utxc.png': [267, 150],
  'logo-fundacja-politechniki-lodzkiej-1000px-q4q1kihv2okpyckxebk80e6tfhbojn7y5k1k4lauww.png': [602, 150],
  'SSPL-stare-logo-rr4nmp5pr58d0u3xzlanyme86r9menhiyx7rul4em8.png': [371, 150],
  'Lodz-Akademicka-2025-kolor-rr48qubzm9oobmgy0gqb0cd8ryfnah6aaohrotn3sw.png': [1000, 150],
  '2024.png': [790, 88],
  '2023-rr4a6fp2qwb9l3j0qrl3vbo2lc4xsdzw21l7zl569s.png': [1000, 150],
  '2022-rr4a50xshuds65kqz5n94oh6ij348qedv2d02n8fls.png': [990, 150],
}

function EntryHeading({ text }: { text: string }) {
  const parts = text.match(/^(Dofinansowanie)( .+)$/)
  return (
    <h3 data-reveal className="text-center text-[24px] font-medium leading-[1.3] text-black md:text-[29px] md:leading-[39px]">
      {parts ? (
        <>
          {parts[1]}
          <strong>{parts[2]}</strong>
        </>
      ) : (
        text
      )}
    </h3>
  )
}

function ProjectTable({ project, fields }: { project: Project; fields: Field[] }) {
  return (
    <table className="w-full border-collapse text-[15px] leading-[25.2px] text-black">
      <tbody>
        {fields.map(({ label, key, bold }) => {
          const value = project[key]
          if (!value) return null
          return (
            <tr key={label}>
              <td className="whitespace-nowrap py-[4px] pr-4 text-left align-top">{label}:</td>
              <td className="py-[4px] text-left align-top">{bold ? <strong>{value}</strong> : value}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function Description({ text }: { text: string }) {
  const nodes: ReactNode[] = []
  text
    .split(/\n{2,}/)
    .filter(Boolean)
    .forEach((block, bi) => {
      let list: string[] = []
      const flush = () => {
        if (list.length === 0) return
        const items = list
        list = []
        nodes.push(
          <ul key={`ul-${bi}-${nodes.length}`} data-reveal className="list-disc pl-6">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>,
        )
      }
      block.split('\n').forEach((line, li) => {
        const trimmed = line.trim()
        if (trimmed.startsWith('- ')) {
          list.push(trimmed.slice(2))
          return
        }
        flush()
        if (trimmed) {
          nodes.push(
            <p key={`p-${bi}-${li}`} data-reveal className="text-pretty">
              {trimmed}
            </p>,
          )
        }
      })
      flush()
    })
  return <div className="flex flex-col gap-5 text-justify text-[15px] leading-[25.2px] text-black">{nodes}</div>
}

function EntryImages({ urls, alt }: { urls: string; alt: string }) {
  const images = urls
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  if (images.length === 0) return null
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
      {images.map((src, i) => {
        const dims = imageDimensions[src.split('/').pop() ?? ''] ?? [600, 150]
        return (
          <FixedImage
            key={`${src}-${i}`}
            src={src}
            alt={alt}
            width={dims[0]}
            height={dims[1]}
            sizes="(min-width: 768px) 40vw, 90vw"
            className="h-auto max-h-[150px] w-auto max-w-full"
          />
        )
      })}
    </div>
  )
}

async function getCategories() {
  const settings = await getContent('settings')
  const rows = Array.isArray(settings.projectCategories) ? (settings.projectCategories as unknown[][]) : []
  return rows.map((row) => ({
    slug: String(row[0] ?? ''),
    title: String(row[1] ?? ''),
    description: String(row[2] ?? ''),
    image: String(row[3] ?? ''),
  }))
}

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = (await getCategories()).find((c) => c.slug === slug)
  return { title: category?.title ?? 'Projekty' }
}

export default async function ProjectCategoryPage({ params }: Props) {
  const { slug } = await params
  const category = (await getCategories()).find((c) => c.slug === slug)
  const config = detailConfig[slug]
  if (!category || !config) notFound()

  const projects = (await getProjects()).filter((p) => p.category === categoryBySlug[slug])

  return (
    <>
      <section className="relative isolate overflow-hidden pb-[50px] pt-[100px]">
        <FillImage src="/images/20221006-212150_resize.jpg" alt="" priority sizes="100vw" className="-z-10" />
        <div className="absolute inset-0 -z-10 bg-[#fffffff2]" />
        <div className="mx-auto w-full max-w-[1140px] px-[10px] min-[1200px]:px-0">
          <h1 className="sr-only">Projekty</h1>
          <h2
            data-reveal
            className={`text-center text-[42px] font-semibold text-black md:text-[59px] md:leading-[59px] ${config.headingPadding}`}
          >
            Projekty
          </h2>

          <div className="mt-[50px] flex flex-col">
            {projects.map((project, index) => (
              <div key={project.id}>
                {index > 0 && <div className="my-[15px] h-[1.5px] w-full bg-[#999999]" />}
                <article data-reveal className="flex flex-col gap-8">
                  {project.imageUrls && <EntryImages urls={project.imageUrls} alt={project.title} />}
                  <div className="flex flex-col gap-5">
                    {project.heading && <EntryHeading text={project.heading} />}
                    <ProjectTable project={project} fields={config.fields} />
                    <Description text={project.description} />
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>
      <JoinCta />
    </>
  )
}
