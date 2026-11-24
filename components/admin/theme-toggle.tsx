'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const STORAGE_KEY = 'iw-admin-theme'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setDark(isDark)

    return () => document.documentElement.classList.remove('dark')
  }, [])

  function toggleTheme() {
    const nextDark = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', nextDark)
    localStorage.setItem(STORAGE_KEY, nextDark ? 'dark' : 'light')
    setDark(nextDark)
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'}
      title={dark ? 'Jasny motyw' : 'Ciemny motyw'}
      className="fixed bottom-4 right-4 z-50 flex size-11 items-center justify-center rounded-full border border-border bg-card text-heading shadow-lg transition-colors hover:border-primary hover:text-primary"
    >
      {dark ? <Sun className="size-5" aria-hidden="true" /> : <Moon className="size-5" aria-hidden="true" />}
    </button>
  )
}
