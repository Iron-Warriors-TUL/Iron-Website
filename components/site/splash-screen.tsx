'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

const LOGO = '/images/12431645_1087304941293749_1342854788_n-removebg-preview-riqbwh2hpz3jazv6auesrscoodjxwgde3wxgi8mqkg.png'
/** Ekran jest widoczny co najmniej tyle, żeby nie mignął przy szybkim łączu. */
const MIN_VISIBLE_MS = 1000
/** Bezpiecznik: nie trzymamy użytkownika dłużej, nawet gdy jakieś medium się wiesza. */
const MAX_VISIBLE_MS = 3000
const FADE_MS = 400

type Phase = 'shown' | 'hiding' | 'hidden'

/** Czeka, aż obrazy widoczne na nowej stronie się pobiorą (albo upłynie limit). */
function waitForMedia(timeoutMs: number) {
  const pending = Array.from(document.querySelectorAll('main img')).filter(
    (img) => !(img as HTMLImageElement).complete && (img as HTMLImageElement).loading !== 'lazy',
  ) as HTMLImageElement[]
  const loaded = Promise.all(
    pending.map(
      (img) =>
        new Promise<void>((resolve) => {
          img.addEventListener('load', () => resolve(), { once: true })
          img.addEventListener('error', () => resolve(), { once: true })
        }),
    ),
  )
  return Promise.race([loaded, new Promise<void>((resolve) => window.setTimeout(resolve, timeoutMs))])
}

/** Czy kliknięcie w link prowadzi do innej podstrony tej witryny (a nie np. kotwicy lub nowej karty). */
function isPageNavigation(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) return false
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false
  const anchor = (event.target as Element | null)?.closest?.('a')
  if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return false
  const url = new URL(anchor.href, window.location.href)
  if (url.origin !== window.location.origin) return false
  return url.pathname !== window.location.pathname
}

/**
 * Ekran ładowania: tło jak navbar, logo i pomarańczowy wirujący łuk.
 * Pokazuje się przy pierwszym wejściu i przy każdym przejściu na inną podstronę,
 * znika płynnie (ease-in-out) po pobraniu mediów: min. 1 s, maks. 3 s.
 */
export function SplashScreen() {
  const pathname = usePathname()
  const [phase, setPhase] = useState<Phase>('shown')
  const renderedPath = useRef(pathname)
  const controller = useRef<{ onRouteRendered: () => void } | null>(null)

  useEffect(() => {
    let shownAt = performance.now()
    let timers: number[] = []
    let visible = true

    const clearTimers = () => {
      timers.forEach((id) => window.clearTimeout(id))
      timers = []
    }

    const hideWhenReady = (ready: Promise<unknown>) => {
      let done = false
      const hide = () => {
        if (done) return
        done = true
        clearTimers()
        const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - shownAt))
        timers.push(
          window.setTimeout(() => {
            visible = false
            setPhase('hiding')
            timers.push(window.setTimeout(() => setPhase('hidden'), FADE_MS))
          }, wait),
        )
      }
      ready.then(hide)
      timers.push(window.setTimeout(hide, MAX_VISIBLE_MS))
    }

    const show = () => {
      clearTimers()
      shownAt = performance.now()
      visible = true
      setPhase('shown')
      // Bezpiecznik, gdyby nowa podstrona nie dała znać (np. błąd nawigacji).
      timers.push(window.setTimeout(() => hideWhenReady(Promise.resolve()), MAX_VISIBLE_MS))
    }

    // Pierwsze wejście: czekamy na zdarzenie `load` (wszystkie media strony).
    hideWhenReady(
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true })),
    )

    // Przejścia między podstronami: ekran wchodzi od razu po kliknięciu linku lub „wstecz”.
    const onClick = (event: MouseEvent) => {
      if (isPageNavigation(event)) show()
    }
    const onPopState = () => {
      show()
      // Router mógł już wyrenderować poprzednią podstronę przed tym zdarzeniem.
      if (window.location.pathname === renderedPath.current) hideWhenReady(waitForMedia(MAX_VISIBLE_MS))
    }
    controller.current = {
      onRouteRendered: () => {
        if (!visible) show()
        hideWhenReady(waitForMedia(MAX_VISIBLE_MS))
      },
    }

    document.addEventListener('click', onClick, true)
    window.addEventListener('popstate', onPopState)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('popstate', onPopState)
      clearTimers()
      controller.current = null
    }
  }, [])

  // Nowa podstrona wyrenderowana: czekamy na jej obrazy i chowamy ekran.
  useEffect(() => {
    if (pathname === renderedPath.current) return
    renderedPath.current = pathname
    controller.current?.onRouteRendered()
  }, [pathname])

  return <SplashView phase={phase} />
}

/** Sam wygląd ekranu ładowania. Używany też przez app/loading.tsx podczas strumieniowania strony. */
export function SplashView({ phase = 'shown' }: { phase?: Phase }) {
  return (
    <div
      className="iw-splash fixed inset-0 z-[1000] flex flex-col items-center justify-center gap-8 bg-header"
      data-phase={phase}
      role="status"
      aria-live="polite"
      aria-hidden={phase === 'hidden'}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- musi być widoczne od razu, bez lazy-loadingu next/image */}
      <img src={LOGO} alt="Iron Warriors" width={151} height={160} className="h-[110px] w-auto md:h-[140px]" fetchPriority="high" />
      <svg className="iw-spinner" viewBox="0 0 50 50" aria-hidden="true">
        <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <span className="sr-only">Wczytywanie strony…</span>
    </div>
  )
}
