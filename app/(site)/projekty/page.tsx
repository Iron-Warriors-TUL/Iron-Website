import type { Metadata } from 'next'
import { Gallery, JoinCta, OrangeLink, Paragraphs } from '@/components/site/section'
import { FillImage } from '@/components/site/smart-image'

export const metadata: Metadata = { title: 'Projekty' }

type ProjectRow = {
  copyOnLeft: boolean
  galleryTitle: string
  galleryTitleHref?: string
  copyTitle?: string
  copyTitleHref?: string
  description: string
  buttonHref: string
  dividerAbove: boolean
  buttonMargin: string
  images: string[]
  imageClassName: string
  showArrows: boolean
}

const rows: ProjectRow[] = [
  {
    copyOnLeft: true,
    galleryTitle: 'Projekty Ministerstwa Nauki i Szkolnictwa Wyższego',
    galleryTitleHref: '/eco-arrow-3',
    description: 'Projekty finansowane przez MNiSW ze środków Budżetu Państwa.',
    buttonHref: '/projekty-mnisw',
    dividerAbove: false,
    buttonMargin: 'mt-10',
    images: ['/images/01_znak_siatka_podstawowy_kolor_biale_tlo-1024x319.png'],
    imageClassName: 'h-[168px] max-[767px]:h-auto max-[767px]:aspect-[1024/319]',
    showArrows: true,
  },
  {
    copyOnLeft: false,
    galleryTitle: 'Eco Arrow 2 Electric',
    copyTitle: 'Konkursy Rady Kół Naukowych Politechniki Łódzkiej',
    copyTitleHref: '/eco-arrow-2-electric',
    description:
      'Konkursy Rady Kół Naukowych Politechniki Łódzkiej to wewnętrzne konkursy grantowe organizowane przez Radę Kół Naukowych, działającą przy Samorządzie Studenckim Politechniki Łódzkiej. Wygrane projekty finansowane są ze środków Prorektora ds. Studenckich Politechniki Łódzkiej.',
    buttonHref: '/rada-kol-naukowych-pl',
    dividerAbove: true,
    buttonMargin: 'mt-0',
    images: ['/images/Untitled-11-sierpnia-2026-17.06.21.png'],
    imageClassName: 'h-[199px] max-[767px]:h-auto max-[767px]:aspect-[1024/377]',
    showArrows: true,
  },
  {
    copyOnLeft: true,
    galleryTitle: 'Projekty Fundacji Politechniki Łódzkiej',
    galleryTitleHref: '/eco-arrow-2',
    description:
      'Fundacja Politechniki Łódzkiej co roku organizuje wewnętrzny konkurs grantowy, do którego przystąpić może każdy podmiot non-profit. W trybie ciągłym – do wykorzystania środków Fundacja PŁ przyznaje też Mikrodotacje na mniejsze projekty badawcze i rozwojowe.',
    buttonHref: '/projekty-fundacja-pl',
    dividerAbove: true,
    buttonMargin: 'mt-[10px]',
    images: ['/images/logo-fundacja-politechniki-lodzkiej-1000px-768x191.png'],
    imageClassName: 'h-[134px] max-[767px]:h-auto max-[767px]:aspect-[768/191]',
    showArrows: true,
  },
  {
    copyOnLeft: false,
    galleryTitle: 'Eco Arrow 1',
    galleryTitleHref: '/eco-arrow-1',
    copyTitle: 'Granty Miasta Łodzi',
    copyTitleHref: '/eco-arrow-1',
    description:
      'Coroczne konkursy grantowe finansowane z budżetu Miasta Łodzi, mające na celu wsparcie inicjatyw akademickich i kulturowych podmiotów związanych z miastem.',
    buttonHref: '/projekty-miasto-lodz',
    dividerAbove: true,
    buttonMargin: 'mt-10',
    images: [
      '/images/logo-lodz-kreuje-1000px-300x163.png',
      '/images/logo-mlodzi-w-lodzi-1000px-300x206.png',
      '/images/logo-centrum-opus-1000px-300x137.png',
    ],
    imageClassName: 'h-[206px] max-[767px]:h-[180px]',
    showArrows: false,
  },
]

const headingClass = 'text-[24px] font-thin leading-[1.3] text-heading md:text-[29px] md:leading-[39px]'
const strokedStyle = { WebkitTextStroke: '2px #000', textShadow: '0 0 10px rgba(0,0,0,.3)' }

function Title({
  text,
  href,
  stroked,
}: {
  text: string
  href?: string
  stroked: boolean
}) {
  const content = href ? (
    <a href={href} className="transition-colors hover:text-primary">
      {text}
    </a>
  ) : (
    text
  )
  return (
    <h2 data-reveal className={headingClass} style={stroked ? strokedStyle : undefined}>
      {content}
    </h2>
  )
}

export default function ProjectsPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden pb-16">
        <FillImage src="/images/eco-arrow-3-3.jpg" alt="" priority sizes="100vw" className="-z-10" />
        <div className="absolute inset-0 -z-10 bg-[#ffffffeb]" />
        <div className="mx-auto w-full max-w-[1140px] px-[10px] pt-[100px] min-[1200px]:px-0">
          <h1 className="sr-only">Projekty</h1>
          <h2 data-reveal className="text-center text-[42px] font-semibold text-heading md:text-[59px] md:leading-[59px]">
            Projekty
          </h2>

          <div className="mt-16 flex flex-col">
            {rows.map((row, index) => {
              const copyTitle = row.copyTitle ?? row.galleryTitle
              const copyTitleHref = row.copyTitle ? row.copyTitleHref : (row.galleryTitleHref ?? undefined)
              const hasWrongLeftHeading = Boolean(row.copyTitle)

              const copy = (
                <div className="flex w-full max-w-[540px] flex-col items-start gap-5">
                  <Title text={copyTitle} href={copyTitleHref} stroked />
                  <Paragraphs text={row.description} className="text-[15px] leading-[25.2px] text-[#868990]" />
                  <OrangeLink
                    href={row.buttonHref}
                    className={`h-[39px] w-[145px] p-0 text-[15px] font-semibold ${row.buttonMargin}`}
                  >
                    Zobacz więcej
                  </OrangeLink>
                </div>
              )

              const images = (
                <div className="flex w-full max-w-[540px] flex-col items-start gap-5">
                  {hasWrongLeftHeading && (
                    <Title text={row.galleryTitle} href={row.galleryTitleHref} stroked={false} />
                  )}
                  <Gallery
                    images={row.images}
                    alt={row.galleryTitle}
                    effect="fade"
                    className="w-full"
                    imageClassName={row.imageClassName}
                    sizes="(min-width: 1024px) 540px, 100vw"
                    showArrows={row.showArrows}
                  />
                </div>
              )

              return (
                <div key={`${row.galleryTitle}-${index}`}>
                  {row.dividerAbove && <div className="my-[15px] h-px w-full bg-black" />}
                  <article data-reveal className="flex flex-col items-start gap-8 md:flex-row md:items-start md:gap-5">
                    {row.copyOnLeft ? copy : images}
                    {row.copyOnLeft ? images : copy}
                  </article>
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
