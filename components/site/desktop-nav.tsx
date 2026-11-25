'use client'

import { useState, type MouseEvent } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavNode } from '@/lib/data'

const normalize = (value: string) => value.replace(/\/+$/, '') || '/'

function isActive(pathname: string, href: string) {
  const current = normalize(pathname)
  const target = normalize(href)
  if (target === '/') return current === '/'
  return current === target || current.startsWith(`${target}/`)
}

export function DesktopNav({ nav }: { nav: NavNode[] }) {
  const pathname = usePathname()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const onLinkClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    setOpenIndex(null)
    if (normalize(href) === normalize(pathname)) {
      event.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <nav aria-label="Główna nawigacja" className="hidden h-full w-full min-[1100px]:flex">
      <ul className="flex w-full flex-nowrap items-center justify-end">
        {nav.map((item, index) => {
          const active = isActive(pathname, item.href)
          const childActive = item.children.some((child) => isActive(pathname, child.href))
          const labelClass = cn(
            'flex h-[42.8px] items-center whitespace-nowrap px-[8px] font-heading text-[12.8px] font-semibold uppercase text-white transition-colors duration-300 hover:text-[#f08400] min-[1025px]:h-[46px] min-[1025px]:px-[10px] min-[1025px]:text-sm min-[1280px]:px-[13px] min-[1280px]:text-base',
            !item.isButton && (active || childActive) && '!text-primary',
          )

          return (
            <li
              key={item.id}
              className={cn('relative shrink-0', item.isButton && 'ml-[8px] min-[1280px]:ml-[15px]')}
              onMouseEnter={() => {
                if (!item.isButton && item.children.length > 0) setOpenIndex(index)
              }}
              onMouseLeave={() => setOpenIndex((current) => (current === index ? null : current))}
            >
              {item.isButton ? (
                <Link
                  href={item.href}
                  onClick={onLinkClick(item.href)}
                  className={cn(
                    labelClass,
                    'h-[42.8px] justify-center rounded-[3px] bg-primary px-[14px] font-bold text-white hover:bg-[#7a7a7a] hover:text-white min-[1025px]:h-[43px] min-[1280px]:px-[30px]',
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <Link href={item.href} onClick={onLinkClick(item.href)} className={labelClass}>
                  {item.label}
                  {item.children.length > 0 && <ChevronDown className="ml-1 size-3.5" aria-hidden="true" />}
                </Link>
              )}

              {!item.isButton && item.children.length > 0 && openIndex === index && (
                <ul className="absolute left-0 top-full z-[9999] min-w-[220px] bg-header px-[15px] pb-3 pt-1">
                  {item.children.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={child.href}
                        onClick={onLinkClick(child.href)}
                        className={cn(
                          'block whitespace-nowrap py-1.5 font-heading text-[12.8px] text-white/85 transition-colors hover:text-primary min-[1025px]:text-sm',
                          isActive(pathname, child.href) && 'text-primary',
                        )}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
