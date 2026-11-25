import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { BackToTop } from '@/components/site/back-to-top'
import { PageMotion } from '@/components/site/page-motion'
import { SplashScreen } from '@/components/site/splash-screen'

// Strona jest statycznie generowana, a treść odświeżana przez revalidatePath()
// w akcjach panelu CMS. Dzięki temu nie każde wejście uderza do bazy.

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SplashScreen />
      {/* Bez JavaScriptu ekran ładowania nie zniknie sam, więc go nie pokazujemy. */}
      <noscript>
        <style>{'.iw-splash{display:none}'}</style>
      </noscript>
      <Navbar />
      <main className="pt-[104px] min-[768px]:pt-[122px] min-[1200px]:pt-[146px]">
        <PageMotion>{children}</PageMotion>
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
