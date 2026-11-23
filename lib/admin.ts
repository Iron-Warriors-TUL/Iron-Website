import 'server-only'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export const ADMIN_PATH = '/iw-panel-7k2q'

export async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.role === 'admin' ? session : null
}

export async function requireAdmin() {
  const session = await getAdminSession()
  if (!session) throw new Error('Unauthorized')
  return session
}

export async function requireAdminPage() {
  const session = await getAdminSession()
  if (!session) redirect(`${ADMIN_PATH}/login`)
  return session
}

