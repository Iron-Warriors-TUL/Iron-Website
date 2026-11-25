'use client'

import { useEffect, useRef, useState } from 'react'
import { slugify } from '@/lib/slug'
import { cn } from '@/lib/utils'
import { inputClass } from './fields'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function SlugField({
  sourceId,
  name = 'slug',
  id = 'slug',
  label = 'Slug (adres URL)',
  defaultValue = '',
  maxLength = 120,
  validate,
  hint = 'Uzupełni się automatycznie z nazwy.',
}: {
  sourceId: string
  name?: string
  id?: string
  label?: string
  defaultValue?: string
  maxLength?: number
  validate?: (value: string) => boolean
  hint?: string
}) {
  const [value, setValue] = useState(defaultValue)
  const touched = useRef(defaultValue !== '')

  useEffect(() => {
    const source = document.getElementById(sourceId) as HTMLInputElement | null
    if (!source) return
    const update = () => {
      if (!touched.current) setValue(slugify(source.value))
    }
    source.addEventListener('input', update)
    update()
    return () => source.removeEventListener('input', update)
  }, [sourceId])

  const valid = value === '' || (validate ? validate(value) : SLUG_RE.test(value))
  const hintId = `${id}-hint`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        value={value}
        onChange={(event) => {
          touched.current = true
          setValue(event.target.value)
        }}
        required
        pattern="[a-z0-9]+(-[a-z0-9]+)*"
        maxLength={maxLength}
        aria-invalid={!valid}
        aria-describedby={hintId}
        className={cn(inputClass, !valid && 'border-destructive focus-visible:border-destructive')}
      />
      <p id={hintId} className={cn('text-xs', valid ? 'text-muted-foreground' : 'text-destructive')}>
        {valid ? (value ? `Adres: /${value}` : hint) : 'Adres może zawierać tylko małe litery, cyfry i myślniki i nie może kolidować z istniejącą stroną.'}
      </p>
    </div>
  )
}
