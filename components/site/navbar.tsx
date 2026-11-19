import Link from 'next/link'
import { getNavTree } from '@/lib/data'
import { DesktopNav } from './desktop-nav'
import { HeaderShell } from './header-shell'
import { MobileNav } from './mobile-nav'
import { FixedImage } from './smart-image'

export async function Navbar() {
  const nav = await getNavTree()

  return (
    <HeaderShell
      logo={
        <Link href="/" className="block w-full" aria-label="Iron Warriors – strona główna">
          <FixedImage
            src="/images/logo-iron-warriors-poziome-300x88.png"
            alt="Iron Warriors"
            width={300}
            height={88}
            sizes="300px"
            priority
            className="header-logo h-auto max-h-[80px] w-full object-contain"
          />
        </Link>
      }
      navigation={
        <>
          <DesktopNav nav={nav} />
          <MobileNav nav={nav} />
        </>
      }
    />
  )
}
