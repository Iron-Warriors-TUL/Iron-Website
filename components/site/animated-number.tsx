'use client'

import { useEffect, useRef, useState } from 'react'

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

    const start = () => {
      if (animated.current) return
      animated.current = true
      if (reduceMotion) {
        setDisplay(format(numericValue))
        return
      }

      const startedAt = performance.now()
      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1)
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

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          start()
          observer.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [value, duration])

  return (
    <span ref={ref} className={className} aria-label={value}>
      {display}
    </span>
  )
}
