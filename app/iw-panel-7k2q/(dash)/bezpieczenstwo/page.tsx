import { SecuritySettings } from '@/components/admin/security-settings'

export default function SecurityPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Bezpieczeństwo</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dodaj TOTP, klucz sprzętowy lub passkey do swojego konta.
        </p>
      </div>
      <SecuritySettings />
    </div>
  )
}
