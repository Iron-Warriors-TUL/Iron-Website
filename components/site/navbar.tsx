import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { getNavTree } from '@/lib/data'
import { MobileNav } from './mobile-nav'

export async function Navbar() {
  const nav = await getNavTree()
  const links = nav.filter((n) => !n.isButton)
  const buttons = nav.filter((n) => n.isButton)

  return (
    <header className="sticky top-0 z-50 border-b-2 border-primary bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 md:px-6">
        <Link href="/" className="shrink-0" aria-label="Iron Warriors – strona główna">
          <img src="/images/logo-iron-warriors-poziome.png" alt="Iron Warriors" className="h-12 w-auto" />
        </Link>

        <nav aria-label="Główna nawigacja" className="hidden items-center gap-1 lg:flex">
          {links.map((item) =>
            item.children.length > 0 ? (
              <div key={item.id} className="group relative">
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:text-primary"
                >
                  {item.label}
                  <ChevronDown className="size-3.5" aria-hidden="true" />
                </Link>
                <div className="invisible absolute left-0 top-full min-w-56 translate-y-1 border-t-2 border-primary bg-card opacity-0 shadow-xl transition-all group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {item.children.map((child) => (
                    <Link
                      key={child.id}
                      href={child.href}
                      className="block px-4 py-3 text-sm text-foreground transition-colors hover:bg-secondary hover:text-primary"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                className="px-3 py-2 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ),
          )}
          {buttons.map((b) => (
            <Link
              key={b.id}
              href={b.href}
              className="ml-3 rounded-sm bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-opacity hover:opacity-90"
            >
              {b.label}
            </Link>
          ))}
        </nav>

        <MobileNav nav={nav} />
      </div>
    </header>
  )
}
