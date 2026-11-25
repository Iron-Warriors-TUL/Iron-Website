import type { Metadata } from 'next'
import { Gallery, JoinCta, OrangeLink, Paragraphs } from '@/components/site/section'
import { FillImage } from '@/components/site/smart-image'
import { getContent, getEntryKeys } from '@/lib/content'

export const metadata: Metadata = { title: 'Dołącz do nas' }

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item} data-reveal className="flex gap-3 text-[15px] leading-[25.2px]">
          <span className="mt-2.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default async function JoinPage() {
  const [recruitment, departmentKeys] = await Promise.all([
    getContent('recruitment'),
    getEntryKeys('recruitment-departments'),
  ])
  const departments = await Promise.all(departmentKeys.map((key) => getContent('recruitment-departments', key)))
  const value = (name: string) => String(recruitment[name] ?? '')
  const items = (name: string): string[] =>
    (Array.isArray(recruitment[name]) ? (recruitment[name] as unknown[][]) : []).map((row) => String(row[0] ?? ''))

  return (
    <>
      <section className="relative isolate overflow-hidden py-10">
        <FillImage src={value('heroImage')} alt="" priority sizes="100vw" className="-z-10" />
        <div className="absolute inset-0 -z-10 bg-white/92" />
        <div className="mx-auto w-full max-w-[985px] px-4">
          <div className="flex justify-center">
            <a
              data-reveal
              href={value('formUrl')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[126px] w-[459px] max-w-full items-center justify-center rounded-[3px] bg-primary px-6 text-center text-[26px] font-bold leading-[26px] text-white transition-opacity hover:opacity-90"
            >
              {value('formLabel')}
            </a>
          </div>

          <h1 data-reveal className="mt-32 text-center text-[42px] font-semibold text-heading md:text-[59px] md:leading-[59px]">
            {value('heading')}
          </h1>
          <Paragraphs text={value('intro')} className="mt-10 text-[15px] leading-[25.2px] text-[#868990]" />
          <h2 data-reveal className="mt-10 text-[24px] font-thin text-heading md:text-[29px] md:leading-[39px]">
            {value('notice')}
          </h2>

          <div className="mt-16 grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,463px)_minmax(0,463px)] md:justify-between">
            <div className="flex flex-col gap-5">
              <h2 data-reveal className="text-[24px] font-thin text-heading md:text-[29px] md:leading-[39px]">{value('gainsHeading')}</h2>
              <BulletList items={items('gains')} />
            </div>
            <Gallery
              images={[value('gainsImage')]}
              alt={value('gainsImageAlt')}
              className="w-full max-w-[463px]"
              sizes="(min-width: 1024px) 463px, 100vw"
              forceControls
            />
          </div>

          <div className="mt-28 grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,463px)_minmax(0,463px)] md:justify-between">
            <Gallery
              images={[value('expectationsImage')]}
              alt={value('expectationsImageAlt')}
              className="w-full max-w-[463px]"
              sizes="(min-width: 1024px) 463px, 100vw"
              forceControls
            />
            <div className="flex flex-col gap-5">
              <h2 data-reveal className="text-[24px] font-thin text-heading md:text-[29px] md:leading-[39px]">{value('expectationsHeading')}</h2>
              <BulletList items={items('expectations')} />
            </div>
          </div>

          <div className="mt-32 flex flex-col gap-28">
            {departments.map((department, index) => {
              const imageOnRight = index % 2 === 1
              const title = String(department.title ?? '')
              const copy = (
                <Paragraphs
                  text={String(department.text ?? '')}
                  className="text-[15px] leading-[25.2px] text-[#868990]"
                />
              )
              const images = (
                <Gallery
                  images={[String(department.image ?? '')]}
                  alt={title}
                  className="w-full max-w-[463px]"
                  imageClassName={String(department.imageClassName ?? '')}
                  sizes="(min-width: 1024px) 463px, 100vw"
                  forceControls
                />
              )
              return (
                <article key={title} data-reveal>
                  <h2 data-reveal className="text-[30px] font-semibold text-heading md:text-[44px] md:leading-[44px]">
                    {title}
                  </h2>
                  <div className="mt-10 grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,463px)_minmax(0,463px)] md:justify-between">
                    {imageOnRight ? (
                      <>
                        {copy}
                        {images}
                      </>
                    ) : (
                      <>
                        {images}
                        {copy}
                      </>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
      <JoinCta />
    </>
  )
}
