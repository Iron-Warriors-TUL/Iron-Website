'use client'

import { useState } from 'react'
import type { NavItem } from '@/lib/db/schema'
import type { SiteLink } from '@/lib/site-links'
import { Checkbox, inputClass } from './fields'

const CUSTOM = '__custom__'

export function NavFields({
  item,
  parents,
  defaultParentId,
  links,
}: {
  item?: NavItem
  parents: NavItem[]
  defaultParentId?: number | null
  links: SiteLink[]
}) {
  const p = item ? `n${item.id}` : 'new'
  const [label, setLabel] = useState(item?.label ?? '')
  const [href, setHref] = useState(item?.href ?? '')
  const [custom, setCustom] = useState(Boolean(item?.href && !links.some((link) => link.href === item.href)))

  const groups = links.reduce<Record<string, SiteLink[]>>((acc, link) => {
    ;(acc[link.group] ??= []).push(link)
    return acc
  }, {})

  function selectLink(value: string) {
    if (value === CUSTOM) {
      setCustom(true)
      return
    }
    setCustom(false)
    setHref(value)
    const match = links.find((link) => link.href === value)
    if (match && (!label.trim() || label === item?.label)) setLabel(match.label)
  }

  return (
    <div className="flex flex-col gap-4">
      {item && (
        <>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="sortOrder" value={item.sortOrder} />
        </>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground" htmlFor={`${p}-label`}>
          Etykieta
          <input
            id={`${p}-label`}
            name="label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            required
            maxLength={60}
            placeholder="np. Bolidy"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground" htmlFor={`${p}-href`}>
          Strona w menu
          <input type="hidden" name="href" value={href} />
          <select
            id={`${p}-href`}
            value={custom ? CUSTOM : href}
            onChange={(event) => selectLink(event.target.value)}
            required={!custom}
            className={inputClass}
          >
            <option value="" disabled>
              Wybierz stronę…
            </option>
            {Object.entries(groups).map(([group, groupLinks]) => (
              <optgroup key={group} label={group}>
                {groupLinks.map((link) => (
                  <option key={link.href} value={link.href}>
                    {link.label} ({link.href})
                  </option>
                ))}
              </optgroup>
            ))}
            <option value={CUSTOM}>Własny adres (np. link zewnętrzny)</option>
          </select>
          {custom && (
            <input
              value={href}
              onChange={(event) => setHref(event.target.value)}
              required
              maxLength={500}
              placeholder="/adres lub https://…"
              aria-label="Własny adres"
              className={`${inputClass} mt-1`}
            />
          )}
          {!custom && (
            <span className="font-normal text-muted-foreground">
              Adres wybranej strony: <code>{href || '—'}</code>
            </span>
          )}
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground" htmlFor={`${p}-parent`}>
          Rodzic
          <select
            id={`${p}-parent`}
            name="parentId"
            defaultValue={item?.parentId ?? defaultParentId ?? ''}
            className={inputClass}
          >
            <option value="">— element główny —</option>
            {parents
              .filter((parent) => parent.id !== item?.id)
              .map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.label}
                </option>
              ))}
          </select>
        </label>
        <div className="pb-2">
          <Checkbox name="isButton" label="Przycisk CTA" defaultChecked={item?.isButton} />
        </div>
      </div>
    </div>
  )
}
