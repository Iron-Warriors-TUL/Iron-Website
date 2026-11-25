'use client'

import { useRef, useState } from 'react'
import { imageMarkdown, parseInlineContent } from '@/lib/inline-content'
import { cn } from '@/lib/utils'
import { inputClass } from './fields'
import { ImageInsertButton } from './media-picker'

/**
 * Pole tekstowe z możliwością wstawienia zdjęcia z serwerowej biblioteki.
 * Zdjęcie trafia do treści jako znacznik `![opis](adres)`, który renderuje
 * publiczny komponent Paragraphs.
 */
export function RichTextField({
  name,
  defaultValue = '',
  rows = 8,
  maxLength,
  id,
  className,
}: {
  name: string
  defaultValue?: string
  rows?: number
  maxLength?: number
  id?: string
  className?: string
}) {
  const [value, setValue] = useState(defaultValue)
  const ref = useRef<HTMLTextAreaElement>(null)
  const images = parseInlineContent(value).flatMap((block) => (block.type === 'image' ? [block] : []))

  function insert(url: string) {
    const snippet = imageMarkdown(url)
    const textarea = ref.current
    if (!textarea) {
      setValue((current) => (current ? `${current}\n\n${snippet}` : snippet))
      return
    }

    const start = textarea.selectionStart ?? value.length
    const end = textarea.selectionEnd ?? start
    const before = value.slice(0, start)
    const after = value.slice(end)
    const prefix = before === '' ? '' : before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n'
    const suffix = after === '' ? '' : after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n'
    const next = `${before}${prefix}${snippet}${suffix}${after}`
    setValue(next)

    requestAnimationFrame(() => {
      const position = start + prefix.length + snippet.length
      textarea.focus()
      textarea.setSelectionRange(position, position)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        ref={ref}
        id={id}
        name={name}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={rows}
        maxLength={maxLength}
        className={cn(inputClass, className)}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Akapity oddzielaj pustą linią. Zdjęcie wstawisz przyciskiem obok.
        </p>
        <ImageInsertButton onInsert={insert} />
      </div>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-sm border border-border bg-secondary/40 p-2">
          {images.map((image, index) => (
            <div key={`${image.src}-${index}`} className="relative h-16 w-24 overflow-hidden rounded-sm border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.src} alt={image.alt} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
