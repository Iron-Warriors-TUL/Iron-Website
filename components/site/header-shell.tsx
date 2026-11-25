'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Nagłówek targetu jest fixed, nakłada się na treść i kurczy się po przewinięciu > 100 px. */
export function HeaderShell({ logo, navigation }: { logo: ReactNode; navigation: ReactNode }) {
  const [shrink, setShrink] = useState(false)

  useEffect(() => {
    const update = () => setShrink(window.scrollY > 100)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <header
      className={cn(
        'site-header fixed inset-x-0 top-0 z-[99] h-[100px] border-b-4 border-primary bg-header transition-all duration-500 min-[768px]:h-[118px] min-[1200px]:h-[142px]',
        shrink && 'shrink h-[100px] min-[1200px]:h-[100px]',
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-[1218px] items-stretch px-[10px] py-[5px] min-[1025px]:px-[50px] min-[1025px]:py-[15px]">
        <div className="flex w-[33%] shrink-0 items-center min-[768px]:w-[240px] min-[1100px]:w-[200px]">{logo}</div>
        <div className="flex min-w-0 flex-1 items-stretch justify-end">{navigation}</div>
      </div>
    </header>
  )
}
