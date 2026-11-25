import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { BackToTop } from '@/components/site/back-to-top'
import { PageMotion } from '@/components/site/page-motion'

// Strona jest statycznie generowana, a treść odświeżana przez revalidatePath()
// w akcjach panelu CMS. Dzięki temu nie każde wejście uderza do bazy.

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-[104px] min-[768px]:pt-[122px] min-[1200px]:pt-[146px]">
        <PageMotion>{children}</PageMotion>
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
