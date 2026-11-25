import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProjects } from '@/lib/data'
import { getContent } from '@/lib/content'
import { BlockRenderer } from '@/components/site/block-renderer'
import { JoinCta } from '@/components/site/section'
import { FillImage } from '@/components/site/smart-image'
import { parseBlocks } from '@/lib/blocks'
import { projectBlocks } from '@/lib/entity-blocks'

type Props = { params: Promise<{ slug: string }> }

const categoryBySlug: Record<string, string> = {
  mnisw: 'MNiSW',
  'rada-kol': 'Rada Kół Naukowych PŁ',
  'fundacja-pl': 'Fundacja Politechniki Łódzkiej',
  'miasto-lodz': 'Miasto Łódź',
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
  if (!category || !categoryBySlug[slug]) notFound()

  const projects = (await getProjects()).filter((p) => p.category === categoryBySlug[slug])

  return (
    <>
      <section className="relative isolate overflow-hidden pb-[50px] pt-[100px]">
        <FillImage src="/images/20221006-212150_resize.jpg" alt="" priority sizes="100vw" className="-z-10" />
        <div className="absolute inset-0 -z-10 bg-[#fffffff2]" />
        <div className="mx-auto w-full max-w-[1140px] px-[10px] min-[1200px]:px-0">
          <h1 className="sr-only">Projekty</h1>
          <h2 data-reveal className="pt-[10px] text-center text-[42px] font-semibold text-black md:text-[59px] md:leading-[59px]">
            Projekty
          </h2>

          <div className="mt-[50px] flex flex-col">
            {projects.map((project, index) => {
              const stored = parseBlocks(project.blocks)
              const blocks = stored.length > 0 ? stored : projectBlocks(project)
              return (
                <div key={project.id}>
                  {index > 0 && <div className="my-[15px] h-[1.5px] w-full bg-[#999999]" />}
                  <BlockRenderer blocks={blocks} />
                </div>
              )
            })}
          </div>
        </div>
      </section>
      <JoinCta />
    </>
  )
}
