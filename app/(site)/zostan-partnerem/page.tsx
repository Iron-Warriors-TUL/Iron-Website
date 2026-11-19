import type { Metadata } from 'next'
import { JoinCta, OrangeLink, PageHeader, Paragraphs } from '@/components/site/section'
import { getContent } from '@/lib/content'

export const metadata: Metadata = { title: 'Zostań partnerem' }

export default async function BecomePartnerPage() {
  const [page, settings] = await Promise.all([getContent('become-partner'), getContent('settings')])
  const value = (name: string) => String(page[name] ?? '')

  return (
    <>
      <PageHeader title={value('title')} image={value('image')} />
      <section className="py-16">
        <div className="container-iw flex flex-col items-start gap-8">
          <Paragraphs text={value('text')} className="max-w-4xl text-lg" />
          <div data-reveal className="flex flex-wrap gap-4">
            <a
              href={String(settings.sponsorPdf ?? '')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-sm bg-primary px-7 py-3 text-sm font-bold uppercase text-white transition-opacity hover:opacity-90"
            >
              {value('offerLabel')}
            </a>
            <OrangeLink href={value('contactHref')} className="border-2 border-heading bg-transparent text-heading hover:bg-heading hover:text-white">{value('contactLabel')}</OrangeLink>
          </div>
        </div>
      </section>
      <JoinCta />
    </>
  )
}
