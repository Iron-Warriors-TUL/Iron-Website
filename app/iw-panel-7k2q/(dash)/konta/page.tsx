import { redirect } from 'next/navigation'
import { ADMIN_PATH } from '@/lib/admin'

// Lista kont jest teraz częścią „Ustawień”.
export default function AccountsPage() {
  redirect(`${ADMIN_PATH}/ustawienia#konta`)
}
