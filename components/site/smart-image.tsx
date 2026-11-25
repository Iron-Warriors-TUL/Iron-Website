import Image from 'next/image'
import { cn } from '@/lib/utils'

type BaseProps = {
  src: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}

const shouldSkipOptimization = (src: string) =>
  src.startsWith('/api/') ||
  /^https?:\/\//.test(src) ||
  /^(data|blob):/i.test(src) ||
  src.toLowerCase().split('?')[0].endsWith('.svg')

/** Obraz wypełniający pozycjonowany (relative) kontener – do tłów i kafli. */
export function FillImage({
  src,
  alt,
  className,
  sizes = '100vw',
  priority,
  zIndex,
}: BaseProps & { zIndex?: number }) {
  if (!src) return null
  return (
    <div className="pointer-events-none absolute inset-0" style={zIndex === undefined ? undefined : { zIndex }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={shouldSkipOptimization(src)}
        className={cn('object-cover', className)}
      />
    </div>
  )
}

/** Obraz o ustawionych wymiarach – do logo i podglądów w panelu. */
export function FixedImage({
  src,
  alt,
  className,
  width = 1200,
  height = 800,
  sizes = '100vw',
  priority,
}: BaseProps & { width?: number; height?: number }) {
  if (!src) return null
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      unoptimized={shouldSkipOptimization(src)}
      className={cn('h-auto w-full', className)}
    />
  )
}
