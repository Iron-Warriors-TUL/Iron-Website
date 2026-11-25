import { redirect } from 'next/navigation'
import { ADMIN_PATH } from '@/lib/admin'

// Bezpieczeństwo jest teraz częścią „Ustawień”.
export default function SecurityPage() {
  redirect(`${ADMIN_PATH}/ustawienia#bezpieczenstwo`)
}
