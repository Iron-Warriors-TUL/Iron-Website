'use client'

import { useTransition } from 'react'
import { Moon, Sun } from 'lucide-react'
import { saveTheme } from '@/app/iw-panel-7k2q/actions'
import { useAdminTheme } from './admin-theme-shell'

export function ThemeToggle() {
  const { theme, setTheme } = useAdminTheme()
  const [pending, startTransition] = useTransition()
  const dark = theme === 'dark'

  function toggleTheme() {
    const next = dark ? 'light' : 'dark'
    setTheme(next)
    startTransition(async () => {
      try {
        await saveTheme(next)
      } catch {
        setTheme(dark ? 'dark' : 'light')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={pending}
      aria-label={dark ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'}
      aria-pressed={dark}
      title={dark ? 'Jasny motyw' : 'Ciemny motyw'}
      className="inline-flex size-9 items-center justify-center rounded-sm border border-border bg-card text-heading transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
    >
      {dark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
    </button>
  )
}
