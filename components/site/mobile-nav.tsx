'use client'

import { useState, type MouseEvent } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import type { NavNode } from '@/lib/data'

const normalize = (value: string) => value.replace(/\/+$/, '') || '/'

export function MobileNav({ nav }: { nav: NavNode[] }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const onLinkClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    setOpen(false)
    if (normalize(href) === normalize(pathname)) {
      event.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-[1100px]:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="flex size-10 items-center justify-center text-white"
      >
        {open ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
        <span className="sr-only">{open ? 'Zamknij menu' : 'Otwórz menu'}</span>
      </button>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Menu mobilne"
          className="absolute inset-x-0 top-full z-[100] max-h-[calc(100dvh-5rem)] overflow-y-auto border-b-4 border-primary bg-header px-4 pb-6"
        >
          <ul className="flex flex-col">
            {nav.map((item) => (
              <li key={item.id} className="border-b border-white/20">
                <Link
                  href={item.href}
                  onClick={onLinkClick(item.href)}
                  className={
                    item.isButton
                      ? 'my-4 block rounded-sm bg-primary px-4 py-3 text-center font-bold uppercase text-white'
                      : 'block py-3 font-semibold uppercase tracking-wide text-white hover:text-primary'
                  }
                >
                  {item.label}
                </Link>
                {item.children.length > 0 && (
                  <ul className="pb-2 pl-4">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={child.href}
                          onClick={onLinkClick(child.href)}
                          className="block py-2 text-sm text-white/70 hover:text-primary"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
