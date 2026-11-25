'use client'

import { cn } from '@/lib/utils'

type BackdropProps = {
  videoId: string
  start?: number
  end?: number
  poster?: string
  className?: string
}

/**
 * Proporcje obrazu w filmie tła. Film na YouTube ma ramkę 16:9, ale sam obraz jest
 * kinowy (~2.5:1) z wbudowanymi czarnymi pasami u góry i dołu. Skalujemy iframe tak,
 * żeby to właśnie obraz (a nie ramka z pasami) pokrywał sekcję. +2% zapasu chowa krawędzie.
 */
const CONTENT_RATIO = 2.5

/** Odtwarzacz YouTube używany jako tło sekcji - zawsze niemy i zapętlony. */
export function YouTubeBackdrop({ videoId, start, end, poster, className }: BackdropProps) {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '0',
    loop: '1',
    playlist: videoId,
    rel: '0',
    playsinline: '1',
    cc_load_policy: '0',
    iv_load_policy: '3',
    disablekb: '1',
    fs: '0',
    modestbranding: '1',
  })
  if (start !== undefined) params.set('start', String(start))
  if (end !== undefined) params.set('end', String(end))

  return (
    // container-type: size pozwala liczyć wymiary filmu względem sekcji (cqw/cqh), a nie okna:
    // film 16:9 zawsze ją pokrywa (jak object-fit: cover), bez czarnych pasów.
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      style={{ containerType: 'size' }}
      aria-hidden="true"
    >
      {poster && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${poster}")` }}
        />
      )}
      <iframe
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
        style={{ width: `max(102cqw, ${CONTENT_RATIO * 102}cqh)`, height: `max(${CONTENT_RATIO * 102 * 0.5625}cqh, 57.375cqw)` }}
        src={`https://www.youtube.com/embed/${videoId}?${params.toString()}`}
        title=""
        tabIndex={-1}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen={false}
        loading="eager"
      />
    </div>
  )
}

type EmbedProps = {
  videoId: string
  className?: string
}

/** Zwykły odtwarzacz osadzony w treści (z kontrolkami, ale bez dźwięku przy starcie). */
export function YouTubeEmbed({ videoId, className }: EmbedProps) {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '1',
    rel: '0',
    playsinline: '0',
    loop: '1',
    playlist: videoId,
    cc_load_policy: '0',
  })

  return (
    <div className={cn('relative aspect-video w-full overflow-hidden bg-black', className)}>
      <iframe
        className="absolute inset-0 h-full w-full border-0"
        src={`https://www.youtube.com/embed/${videoId}?${params.toString()}`}
        title="Film Iron Warriors"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  )
}
