'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import QRCode from 'qrcode'
import { ShieldCheck, ShieldOff } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { disableTwoFactor } from '@/app/iw-panel-7k2q/security-actions'
import { Field, inputClass } from './fields'

type Step = 'idle' | 'scan' | 'done'

const primaryButton =
  'rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50'
const secondaryButton = 'rounded-sm border border-border px-4 py-2 text-sm font-medium hover:border-primary disabled:opacity-50'

/** Klucz w czytelnych grupach po 4 znaki, do ręcznego wpisania w aplikacji. */
function formatSecret(secret: string) {
  return secret.replace(/(.{4})/g, '$1 ').trim()
}

function BackupCodes({ codes }: { codes: string[] }) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <p className="text-sm font-semibold">Kody zapasowe</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Każdego kodu można użyć raz, gdy nie masz dostępu do telefonu. Zapisz je teraz w bezpiecznym miejscu,
        później nie będzie ich widać.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-sm">
        {codes.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(codes.join('\n'))}
        className="mt-3 text-xs text-primary underline underline-offset-4"
      >
        Kopiuj wszystkie
      </button>
    </div>
  )
}

/**
 * Konfiguracja 2FA (TOTP: Google Authenticator, Microsoft Authenticator, Authy…).
 * Włączenie: hasło → kod QR i klucz do ręcznego wpisania → potwierdzenie kodem z aplikacji.
 * Wyłączenie: hasło + aktualny kod z aplikacji lub kod zapasowy (sprawdzane na serwerze).
 */
export function SecuritySettings({ enabled }: { enabled: boolean }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('idle')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [qr, setQr] = useState('')
  const [secret, setSecret] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const reset = () => {
    setPassword('')
    setCode('')
    setError(null)
  }

  async function startSetup() {
    setPending(true)
    setError(null)
    setMessage(null)
    const res = await authClient.twoFactor.enable({ password, issuer: 'Iron Warriors CMS' })
    setPending(false)
    if (res.error || !res.data || !('totpURI' in res.data)) {
      setError('Nie udało się rozpocząć konfiguracji. Sprawdź hasło.')
      return
    }
    setQr(await QRCode.toDataURL(res.data.totpURI, { margin: 1, width: 240 }))
    setSecret(new URL(res.data.totpURI).searchParams.get('secret') ?? '')
    setBackupCodes(res.data.backupCodes)
    setPassword('')
    setStep('scan')
  }

  async function confirmSetup() {
    setPending(true)
    setError(null)
    const res = await authClient.twoFactor.verifyTotp({ code })
    setPending(false)
    if (res.error) {
      setError('Nieprawidłowy kod. Sprawdź, czy czas w telefonie jest ustawiony automatycznie.')
      return
    }
    setCode('')
    setStep('done')
    setMessage('Gotowe. Od teraz przy logowaniu panel zapyta o kod z aplikacji.')
    router.refresh()
  }

  async function turnOff() {
    setPending(true)
    setError(null)
    setMessage(null)
    const res = await disableTwoFactor(password, code)
    setPending(false)
    if (res.error) {
      setError(res.error)
      return
    }
    reset()
    setStep('idle')
    setMessage('Uwierzytelnianie dwuskładnikowe zostało wyłączone.')
    router.refresh()
  }

  return (
    <section className="flex max-w-2xl flex-col gap-5 rounded-md border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        {enabled ? (
          <ShieldCheck className="mt-0.5 size-6 shrink-0 text-green-600" aria-hidden="true" />
        ) : (
          <ShieldOff className="mt-0.5 size-6 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
        <div>
          <h2 className="text-xl font-semibold">Logowanie dwuetapowe (2FA)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {enabled
              ? 'Włączone. Przy logowaniu oprócz hasła potrzebny jest kod z aplikacji w telefonie.'
              : 'Wyłączone. Włącz je, żeby do logowania oprócz hasła był potrzebny kod z aplikacji, np. Google Authenticator.'}
          </p>
        </div>
      </div>

      {!enabled && step === 'idle' && (
        <div className="flex flex-col gap-3">
          <Field label="Aktualne hasło" htmlFor="setup-password">
            <input
              id="setup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className={inputClass}
            />
          </Field>
          <button type="button" onClick={startSetup} disabled={pending || !password} className={`${primaryButton} self-start`}>
            Skonfiguruj 2FA
          </button>
        </div>
      )}

      {step === 'scan' && (
        <div className="flex flex-col gap-5">
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            <li>Otwórz Google Authenticator (lub inną aplikację 2FA) i dodaj nowe konto.</li>
            <li>Zeskanuj kod QR albo wpisz klucz ręcznie.</li>
            <li>Wpisz poniżej 6-cyfrowy kod, który pokaże aplikacja.</li>
          </ol>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {qr && <Image src={qr} alt="Kod QR do aplikacji uwierzytelniającej" width={200} height={200} unoptimized className="size-[200px] rounded-md bg-white p-2" />}
            <div className="flex min-w-0 flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Klucz do wpisania ręcznie:</span>
              <code className="break-all rounded-sm bg-secondary px-2 py-1 font-mono">{formatSecret(secret)}</code>
              <span className="text-xs text-muted-foreground">Typ: oparty na czasie, 6 cyfr, 30 s.</span>
            </div>
          </div>
          <BackupCodes codes={backupCodes} />
          <Field label="Kod z aplikacji" htmlFor="setup-code">
            <input
              id="setup-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              className={`${inputClass} max-w-48 text-center text-lg tracking-[0.4em]`}
            />
          </Field>
          <div className="flex gap-2">
            <button type="button" onClick={confirmSetup} disabled={pending || code.length !== 6} className={primaryButton}>
              Potwierdź i włącz
            </button>
            <button type="button" onClick={() => { reset(); setStep('idle') }} disabled={pending} className={secondaryButton}>
              Anuluj
            </button>
          </div>
        </div>
      )}

      {enabled && step !== 'scan' && (
        <div className="flex flex-col gap-3 border-t border-border pt-5">
          <h3 className="font-semibold">Usuń klucz 2FA</h3>
          <p className="text-sm text-muted-foreground">
            Żeby wyłączyć 2FA, podaj hasło i aktualny kod z aplikacji. Gdy nie masz telefonu, użyj jednego z kodów
            zapasowych. Gdy nie masz ani jednego, ani drugiego, poproś administratora o reset 2FA.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Aktualne hasło" htmlFor="off-password">
              <input
                id="off-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className={inputClass}
              />
            </Field>
            <Field label="Kod z aplikacji lub kod zapasowy" htmlFor="off-code">
              <input
                id="off-code"
                value={code}
                onChange={(e) => setCode(e.target.value.trim().slice(0, 32))}
                autoComplete="one-time-code"
                className={`${inputClass} font-mono`}
              />
            </Field>
          </div>
          <button type="button" onClick={turnOff} disabled={pending || !password || !code} className={`${secondaryButton} self-start hover:border-destructive hover:text-destructive`}>
            Wyłącz 2FA
          </button>
        </div>
      )}

      {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
      {message && <p role="status" className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm">{message}</p>}
    </section>
  )
}
