'use client'

import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'

const STORAGE_KEY = 'iw-admin-theme'
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

function emit() {
  for (const listener of listeners) listener()
}

function isDark() {
  return document.documentElement.classList.contains('dark')
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false)

  function toggleTheme() {
    const nextDark = !isDark()
    document.documentElement.classList.toggle('dark', nextDark)
    try {
      localStorage.setItem(STORAGE_KEY, nextDark ? 'dark' : 'light')
    } catch {
      // localStorage może być zablokowany — motyw nadal działa w tej sesji.
    }
    emit()
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'}
      aria-pressed={dark}
      title={dark ? 'Jasny motyw' : 'Ciemny motyw'}
      className="fixed bottom-4 right-4 z-50 flex size-11 items-center justify-center rounded-full border border-border bg-card text-heading shadow-lg transition-colors hover:border-primary hover:text-primary"
    >
      {dark ? <Sun className="size-5" aria-hidden="true" /> : <Moon className="size-5" aria-hidden="true" />}
    </button>
  )
}
