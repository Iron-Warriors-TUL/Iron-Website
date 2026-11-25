'use client'

import { useEffect, useState } from 'react'

const LOGO = '/images/12431645_1087304941293749_1342854788_n-removebg-preview-riqbwh2hpz3jazv6auesrscoodjxwgde3wxgi8mqkg.png'
/** Ekran jest widoczny co najmniej tyle, żeby nie mignął przy szybkim łączu. */
const MIN_VISIBLE_MS = 900
/** Bezpiecznik: nie trzymamy użytkownika dłużej, nawet gdy jakieś medium (np. iframe) się wiesza. */
const MAX_VISIBLE_MS = 4000
const FADE_MS = 450

/**
 * Ekran ładowania przy pierwszym wejściu na stronę: tło jak navbar, logo i
 * pomarańczowe kropki krążące po okręgu. Znika po zdarzeniu `load` (wszystkie
 * obrazy i media pobrane), nie wcześniej niż po MIN_VISIBLE_MS.
 * Jest renderowany w HTML z serwera, więc widać go od pierwszej klatki.
 * Przy nawigacji wewnątrz strony layout się nie przeładowuje, więc ekran się nie powtarza.
 */
export function SplashScreen() {
  const [phase, setPhase] = useState<'visible' | 'fading' | 'gone'>('visible')

  useEffect(() => {
    const startedAt = performance.now()
    let fadeTimer: number | undefined
    let removeTimer: number | undefined

    const hide = () => {
      if (fadeTimer !== undefined) return
      const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - startedAt))
      fadeTimer = window.setTimeout(() => {
        setPhase('fading')
        removeTimer = window.setTimeout(() => setPhase('gone'), FADE_MS)
      }, wait)
    }

    if (document.readyState === 'complete') hide()
    else window.addEventListener('load', hide, { once: true })
    const failsafe = window.setTimeout(hide, MAX_VISIBLE_MS)

    return () => {
      window.removeEventListener('load', hide)
      window.clearTimeout(failsafe)
      window.clearTimeout(fadeTimer)
      window.clearTimeout(removeTimer)
    }
  }, [])

  if (phase === 'gone') return null

  return <SplashView fading={phase === 'fading'} />
}

/** Sam wygląd ekranu ładowania. Używany też przez app/loading.tsx podczas strumieniowania strony. */
export function SplashView({ fading = false }: { fading?: boolean }) {
  return (
    <div
      className="iw-splash fixed inset-0 z-[1000] flex flex-col items-center justify-center gap-10 bg-header transition-opacity ease-out"
      style={{ opacity: fading ? 0 : 1, transitionDuration: `${FADE_MS}ms` }}
      role="status"
      aria-live="polite"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- musi być widoczne od razu, bez lazy-loadingu next/image */}
      <img src={LOGO} alt="Iron Warriors" width={151} height={160} className="h-[120px] w-auto md:h-[160px]" fetchPriority="high" />
      <div className="iw-spinner" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} />
        ))}
      </div>
      <span className="sr-only">Wczytywanie strony…</span>
    </div>
  )
}
