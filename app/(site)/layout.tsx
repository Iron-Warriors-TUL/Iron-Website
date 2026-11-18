import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'

export const dynamic = 'force-dynamic'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
