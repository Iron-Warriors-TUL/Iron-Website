'use client'

import { createContext, useContext, useState } from 'react'

export type AdminTheme = 'light' | 'dark'

type ThemeContextValue = {
  theme: AdminTheme
  setTheme: (theme: AdminTheme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function AdminThemeShell({
  initialTheme,
  children,
}: {
  initialTheme: AdminTheme
  children: React.ReactNode
}) {
  const [theme, setTheme] = useState<AdminTheme>(initialTheme)

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={theme === 'dark' ? 'dark min-h-dvh bg-background' : 'min-h-dvh bg-background'}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useAdminTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useAdminTheme must be used within AdminThemeShell')
  return context
}
