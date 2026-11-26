import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { BackToTop } from '@/components/site/back-to-top'
import { PageMotion } from '@/components/site/page-motion'
import { SplashScreen } from '@/components/site/splash-screen'
import { headers } from 'next/headers'

// Nonce CSP jest generowany per żądanie, więc strony są renderowane dynamicznie.
// Treść odświeża revalidatePath() w akcjach panelu CMS.

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <>
      <SplashScreen />
      {/* Bez JavaScriptu ekran ładowania nie zniknie sam, więc go nie pokazujemy. */}
      <noscript>
        <style nonce={nonce}>{'.iw-splash{display:none}'}</style>
      </noscript>
      <Navbar />
      <main className="pt-[100px] min-[768px]:pt-[118px] min-[1200px]:pt-[142px]">
        <PageMotion>{children}</PageMotion>
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
