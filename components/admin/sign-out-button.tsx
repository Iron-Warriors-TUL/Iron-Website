'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

export function SignOutButton({ redirectTo }: { redirectTo: string }) {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut()
        router.push(redirectTo)
        router.refresh()
      }}
      className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
    >
      <LogOut className="size-4" aria-hidden="true" />
      Wyloguj
    </button>
  )
}
