import type { Metadata } from 'next'
import { MapEmbed } from '@/components/site/map-embed'
import { FillImage, FixedImage } from '@/components/site/smart-image'
import { getContent } from '@/lib/content'

export const metadata: Metadata = { title: 'Kontakt' }

export default async function ContactPage() {
  const [contact, settings] = await Promise.all([getContent('contact'), getContent('settings')])
  const value = (name: string) => String(contact[name] ?? '')

  return (
    <section className="relative isolate overflow-hidden">
      <FillImage src={value('background')} alt="" priority sizes="100vw" className="-z-10" />
      <div className="absolute inset-0 -z-10 bg-white/92" />

      <div className="mx-auto w-full max-w-[1140px] px-[10px] pb-[60px] min-[1200px]:pb-[80px]">
        <h1 className="pt-10 text-center text-[42px] min-[768px]:pt-14 font-semibold leading-[59px] text-black min-[1200px]:text-[59px]">
          {value('title')}
        </h1>

        <div className="mx-[10px] mt-5 grid w-[calc(100%-20px)] grid-cols-1 gap-5 pb-[10px] pt-[10px] md:grid-cols-2">
          <div className="flex flex-col items-center">
            <FixedImage
              src={value('photo')}
              alt={value('photoAlt')}
              width={254}
              height={254}
              sizes="(min-width: 1200px) 297px, 254px"
              priority
              className="mt-[59px] size-[254px] rounded-full object-cover min-[1200px]:mt-[37px] min-[1200px]:size-[297px]"
            />
            <h2 className="mt-8 text-center text-[24px] font-semibold leading-[29px] text-black">
              {value('name')}
            </h2>
            <p className="mt-1.5 text-center text-[17px] leading-[29px] text-black">
              {value('role')}
            </p>
            <a
              href={`mailto:${value('email')}`}
              className="mt-3 max-w-full break-words text-center text-[16px] font-semibold leading-[24px] text-black hover:underline sm:text-[18px]"
            >
              {value('email')}
            </a>
          </div>

          <MapEmbed className="h-[518px] w-full border-0" />
        </div>

        <p className="text-center text-[15px] leading-[25.2px] text-[#868990]">
          {value('sponsorText')}
        </p>

        <div className="mt-10 flex justify-center">
          <a
            href={String(settings.sponsorPdf ?? '')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[58px] w-[257px] items-center justify-center rounded-[5px] bg-primary text-[18px] font-normal text-white transition-opacity hover:opacity-90"
          >
            {value('sponsorButtonLabel')}
          </a>
        </div>
      </div>
    </section>
  )
}
