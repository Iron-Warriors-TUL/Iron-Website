'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type AnimatedNumberProps = {
  value: string
  duration?: number
  className?: string
}

/** Licznik 0 -> wartość, uruchamiany gdy wejdzie w pole widzenia. Dopisek po liczbie (np. jednostka) zostaje bez zmian. */
export function AnimatedNumber({ value, duration = 2000, className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const animated = useRef(false)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const element = ref.current
    if (!element || animated.current) return

    // Obsługuje też wartości z dopiskiem, np. „2267 km/l”: animujemy liczbę, dopisek zostaje.
    const match = value.trim().match(/^(\d+(?:[.,]\d+)?)([^]*)$/)
    if (!match) return
    const [, numberPart, suffix] = match
    const numericValue = Number.parseFloat(numberPart.replace(',', '.'))
    if (!Number.isFinite(numericValue)) return

    const decimals = (numberPart.split(/[.,]/)[1] ?? '').length
    const format = (number: number) => number.toFixed(decimals) + suffix
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let waitTimer = 0
    const start = () => {
      if (animated.current) return
      // Pod ekranem ładowania animacji i tak nie widać: czekamy, aż zacznie znikać.
      if (document.querySelector('.iw-splash[data-phase="shown"]')) {
        window.clearTimeout(waitTimer)
        waitTimer = window.setTimeout(start, 150)
        return
      }
      animated.current = true
      if (reduceMotion) {
        setDisplay(format(numericValue))
        return
      }

      const startedAt = performance.now()
      const tick = (now: number) => {
        const progress = Math.min(Math.max((now - startedAt) / duration, 0), 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplay(format(numericValue * eased))
        if (progress < 1) window.requestAnimationFrame(tick)
      }
      setDisplay(format(0))
      window.requestAnimationFrame(tick)
    }

    if (!('IntersectionObserver' in window)) {
      start()
      return
    }

    // Do czasu wejścia w pole widzenia pokazujemy zero, żeby nie mignęła wartość końcowa.
    if (!reduceMotion) setDisplay(format(0))

    // Start, gdy element wejdzie w widok albo zostanie „przeskoczony” szybkim przewinięciem
    // (wtedy IntersectionObserver nic nie zgłosi, a licznik zostałby na zerze).
    const reached = () => element.getBoundingClientRect().top < window.innerHeight * 0.9
    const check = () => {
      if (!reached()) return
      start()
      cleanup()
    }
    const observer = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && check(), {
      threshold: 0.35,
    })
    const cleanup = () => {
      observer.disconnect()
      window.removeEventListener('scroll', check)
    }
    observer.observe(element)
    window.addEventListener('scroll', check, { passive: true })
    check()
    return () => {
      cleanup()
      window.clearTimeout(waitTimer)
    }
  }, [value, duration])

  // Niewidoczna wartość końcowa wyznacza rozmiar, a animowana jest nałożona absolutnie i nie wpływa na układ.
  // Dzięki temu zmieniająca się liczba i szerokość cyfr nie przesuwa treści przy przewijaniu.
  return (
    <span ref={ref} className={cn('relative inline-block whitespace-nowrap tabular-nums', className)} aria-label={value}>
      <span aria-hidden="true" className="invisible">
        {value}
      </span>
      <span aria-hidden="true" className="absolute right-0 top-0">
        {display}
      </span>
    </span>
  )
}
