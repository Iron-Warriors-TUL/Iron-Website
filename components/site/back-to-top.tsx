'use client'

import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 800)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <button
      type="button"
      aria-label="Wróć na górę strony"
      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
      className={`fixed right-[20px] z-[9999] flex size-[46px] items-center justify-center rounded-[2px] bg-primary text-white transition-all duration-500 hover:brightness-110 ${
        visible ? 'visible bottom-[11px] opacity-100' : 'invisible bottom-[-45px] opacity-0'
      } max-[767px]:bottom-[10px]`}
    >
      <ChevronUp className="size-[18px]" strokeWidth={3} aria-hidden="true" />
    </button>
  )
}
