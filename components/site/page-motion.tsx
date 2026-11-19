'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Animuje wejście strony przy każdej zmianie trasy i odsłania elementy
 * oznaczone data-reveal w miarę przewijania.
 */
export function PageMotion({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    root.classList.add('iw-reveal-ready')
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))

    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'))
      return () => root.classList.remove('iw-reveal-ready')
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.05 },
    )

    items.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 6, 5) * 45}ms`
      observer.observe(item)
    })

    return () => {
      observer.disconnect()
      root.classList.remove('iw-reveal-ready')
    }
  }, [pathname])

  return (
    <div key={pathname} ref={rootRef} className="iw-page">
      {children}
    </div>
  )
}
