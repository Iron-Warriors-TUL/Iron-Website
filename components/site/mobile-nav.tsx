'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import type { NavNode } from '@/lib/data'

export function MobileNav({ nav }: { nav: NavNode[] }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="flex size-10 items-center justify-center text-foreground"
      >
        {open ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
        <span className="sr-only">{open ? 'Zamknij menu' : 'Otwórz menu'}</span>
      </button>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Menu mobilne"
          className="absolute inset-x-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto border-b-2 border-primary bg-background px-4 pb-6"
        >
          <ul className="flex flex-col">
            {nav.map((item) => (
              <li key={item.id} className="border-b border-border">
                <Link
                  href={item.href}
                  onClick={close}
                  className={
                    item.isButton
                      ? 'my-4 block rounded-sm bg-primary px-4 py-3 text-center font-bold uppercase text-primary-foreground'
                      : 'block py-3 font-semibold uppercase tracking-wide hover:text-primary'
                  }
                >
                  {item.label}
                </Link>
                {item.children.length > 0 && (
                  <ul className="pb-2 pl-4">
                    {item.children.map((c) => (
                      <li key={c.id}>
                        <Link href={c.href} onClick={close} className="block py-2 text-sm text-muted-foreground hover:text-primary">
                          {c.label}
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
