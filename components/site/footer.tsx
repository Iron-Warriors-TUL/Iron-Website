import Link from 'next/link'
import type { SVGProps } from 'react'
import { getContent } from '@/lib/content'
import { FixedImage } from './smart-image'

type IconProps = SVGProps<SVGSVGElement>

function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.19 2.24.19v2.46h-1.26c-1.24 0-1.63.77-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  )
}

function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function YoutubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.75-1.77C18.25 5 12 5 12 5s-6.25 0-7.85.43A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.75 1.77C5.75 19 12 19 12 19s6.25 0 7.85-.43a2.5 2.5 0 0 0 1.75-1.77c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" />
    </svg>
  )
}

function LinkedinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.45 2H3.55C2.7 2 2 2.7 2 3.55v16.9c0 .85.7 1.55 1.55 1.55h16.9c.85 0 1.55-.7 1.55-1.55V3.55C22 2.7 21.3 2 20.45 2ZM8 18.75H5.1V9.4H8v9.35ZM6.55 8.1a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4ZM18.9 18.75H16v-4.55c0-1.09-.02-2.48-1.52-2.48-1.52 0-1.75 1.18-1.75 2.4v4.63H10.9V9.4h2.78v1.28h.04a3.05 3.05 0 0 1 2.74-1.51c2.93 0 3.44 1.93 3.44 4.44v5.14Z" />
    </svg>
  )
}

const icons: Record<string, (props: IconProps) => React.ReactElement> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  linkedin: LinkedinIcon,
}

export async function Footer() {
  const content = await getContent('footer')
  const socials = (Array.isArray(content.socials) ? (content.socials as unknown[][]) : []).map((row) => ({
    label: String(row[0] ?? ''),
    href: String(row[1] ?? ''),
    Icon: icons[String(row[2] ?? '')] ?? FacebookIcon,
  }))
  const address = String(content.address ?? '').split('\n')

  return (
    <footer className="bg-footer font-heading text-white">
      <div className="mx-auto w-full max-w-[1140px] px-4 pb-[15px] pt-10 md:pt-12">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-3 md:gap-8">
          <div className="flex justify-center">
            <Link href="/" aria-label="Iron Warriors – strona główna">
              <FixedImage
                src={String(content.logo ?? '')}
                alt="Iron Warriors"
                width={151}
                height={160}
                sizes="151px"
                className="h-[160px] w-[151px] object-contain"
              />
            </Link>
          </div>

          <div className="flex flex-col items-center gap-4">
            <h2 className="text-xs font-semibold text-white">SOCIAL MEDIA</h2>
            <ul className="flex flex-wrap justify-center gap-[10px]">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex size-14 items-center justify-center rounded-[10%] bg-[#2b2a2a] text-white transition-colors hover:bg-primary"
                  >
                    <Icon className="size-7" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-xs font-semibold text-white">ADRES</h2>
            <address className="text-[15px] not-italic leading-relaxed text-white">
              {address.map((line, index) => (
                <span key={`${line}-${index}`}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}
            </address>
          </div>
        </div>

        <div className="mt-8 border-t border-[#383838] py-4 text-center text-[13px] font-light text-[#c8c5c5]">
          {String(content.copyright ?? '')}
        </div>
      </div>
    </footer>
  )
}
