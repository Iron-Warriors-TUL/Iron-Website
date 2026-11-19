'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FillImage } from './smart-image'

export type CarouselProps = {
  images: string[]
  alt: string
  effect?: 'fade' | 'slide'
  autoplay?: boolean
  autoplaySpeed?: number
  className?: string
  imageClassName?: string
  sizes?: string
  showArrows?: boolean
  showDots?: boolean
  forceControls?: boolean
  priority?: boolean
}

/** Karuzela w stylu Elementor/Swiper: fade lub slide, autoplay 5 s, strzałki i kropki. */
export function Carousel({
  images,
  alt,
  effect = 'fade',
  autoplay = true,
  autoplaySpeed = 5000,
  className,
  imageClassName = 'aspect-video',
  sizes = '(min-width: 1024px) 652px, 100vw',
  showArrows = true,
  showDots = true,
  forceControls = false,
  priority = false,
}: CarouselProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = images.length

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return
      setIndex(((next % count) + count) % count)
    },
    [count],
  )

  useEffect(() => {
    if (!autoplay || paused || count < 2) return
    const id = window.setInterval(() => setIndex((current) => (current + 1) % count), autoplaySpeed)
    return () => window.clearInterval(id)
  }, [autoplay, paused, count, autoplaySpeed])

  if (count === 0) return null

  return (
    <div
      data-reveal
      className={cn('relative w-full select-none', className)}
      role="region"
      aria-roledescription="karuzela"
      aria-label={alt}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false)
      }}
    >
      <div className={cn('relative overflow-hidden bg-neutral-100', imageClassName)}>
        {images.map((src, slideIndex) => {
          const active = slideIndex === index
          return (
            <div
              key={`${src}-${slideIndex}`}
              className={cn(
                'absolute inset-0',
                effect === 'fade'
                  ? 'transition-opacity duration-1000 ease-in-out'
                  : 'transition-transform duration-1000 ease-in-out',
                active ? 'z-10' : 'z-0',
              )}
              style={
                effect === 'slide'
                  ? { transform: `translateX(${(slideIndex - index) * 100}%)` }
                  : { opacity: active ? 1 : 0 }
              }
              aria-hidden={!active}
            >
              <FillImage
                src={src}
                alt={active ? `${alt} – zdjęcie ${slideIndex + 1} z ${count}` : ''}
                sizes={sizes}
                priority={priority && slideIndex === 0}
              />
            </div>
          )
        })}

        {showArrows && (count > 1 || forceControls) && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Poprzednie zdjęcie"
              className="absolute left-2.5 top-1/2 z-20 flex size-[25px] -translate-y-1/2 items-center justify-center text-[#ededed]/90 drop-shadow transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <ChevronLeft className="size-[25px]" strokeWidth={2.25} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Następne zdjęcie"
              className="absolute right-2.5 top-1/2 z-20 flex size-[25px] -translate-y-1/2 items-center justify-center text-[#ededed]/90 drop-shadow transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <ChevronRight className="size-[25px]" strokeWidth={2.25} aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {showDots && (count > 1 || forceControls) && (
        <div className="flex h-[30px] items-center justify-center gap-3" role="tablist" aria-label={`Wybierz zdjęcie: ${alt}`}>
          {images.map((src, dotIndex) => (
            <button
              key={`dot-${src}-${dotIndex}`}
              type="button"
              role="tab"
              aria-selected={dotIndex === index}
              aria-label={`Zdjęcie ${dotIndex + 1}`}
              onClick={() => goTo(dotIndex)}
              className={cn(
                'size-1.5 rounded-full transition-all duration-300',
                dotIndex === index ? 'scale-100 bg-black' : 'bg-black/30 hover:bg-black/60',
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
