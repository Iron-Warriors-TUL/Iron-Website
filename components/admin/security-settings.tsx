'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { authClient } from '@/lib/auth-client'
import { Field, inputClass } from './fields'

type Passkey = {
  id: string
  name?: string | null
  createdAt?: string | Date
}

export function SecuritySettings() {
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [qr, setQr] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [passkeys, setPasskeys] = useState<Passkey[]>([])
  const [passkeyName, setPasskeyName] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function refreshPasskeys() {
    const res = await authClient.passkey.listUserPasskeys()
    setPasskeys((res.data ?? []) as Passkey[])
  }

  useEffect(() => {
    void refreshPasskeys()
  }, [])

  async function enableTotp() {
    setPending(true)
    setError(null)
    setMessage(null)
    const res = await authClient.twoFactor.enable({
      password,
      method: 'totp',
      issuer: 'Iron Warriors CMS',
    })
    setPending(false)
    if (res.error) {
      setError('Nie udało się uruchomić TOTP. Sprawdź aktualne hasło.')
      return
    }
    if ('totpURI' in res.data) {
      setQr(await QRCode.toDataURL(res.data.totpURI))
      setBackupCodes(res.data.backupCodes)
      setMessage('Zeskanuj kod, a następnie wpisz sześciocyfrowy kod z aplikacji.')
    }
  }

  async function verifyTotp() {
    setPending(true)
    setError(null)
    const res = await authClient.twoFactor.verifyTotp({ code, trustDevice: true })
    setPending(false)
    if (res.error) {
      setError('Nieprawidłowy kod TOTP.')
      return
    }
    setCode('')
    setQr('')
    setMessage('Dwuskładnikowe uwierzytelnianie TOTP zostało włączone.')
  }

  async function disableTotp() {
    setPending(true)
    setError(null)
    const res = await authClient.twoFactor.disable({ password })
    setPending(false)
    if (res.error) {
      setError('Nie udało się wyłączyć TOTP. Sprawdź aktualne hasło.')
      return
    }
    setBackupCodes([])
    setMessage('Dwuskładnikowe uwierzytelnianie TOTP zostało wyłączone.')
  }

  async function addPasskey() {
    setPending(true)
    setError(null)
    setMessage(null)
    const res = await authClient.passkey.addPasskey({
      name: passkeyName.trim() || 'Klucz bezpieczeństwa',
      authenticatorAttachment: 'cross-platform',
    })
    setPending(false)
    if (res.error) {
      setError('Nie udało się zarejestrować klucza lub passkeya.')
      return
    }
    setPasskeyName('')
    setMessage('Klucz lub passkey został dodany.')
    await refreshPasskeys()
  }

  async function deletePasskey(id: string) {
    setPending(true)
    const res = await authClient.passkey.deletePasskey({ id })
    setPending(false)
    if (res.error) {
      setError('Nie udało się usunąć passkeya.')
      return
    }
    await refreshPasskeys()
  }

  return (
    <div className="grid max-w-4xl gap-6 xl:grid-cols-2">
      <section className="rounded-md border border-border bg-card p-5">
        <h2 className="text-xl font-semibold">Aplikacja uwierzytelniająca</h2>
        <p className="mt-1 text-sm text-muted-foreground">TOTP: Google Authenticator, Ente, Authy lub podobna aplikacja.</p>
        <div className="mt-5 flex flex-col gap-4">
          <Field label="Aktualne hasło" htmlFor="security-password">
            <input
              id="security-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className={inputClass}
            />
          </Field>
          {!qr && (
            <div className="flex gap-2">
              <button type="button" onClick={enableTotp} disabled={pending || !password} className="rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">
                Włącz TOTP
              </button>
              <button type="button" onClick={disableTotp} disabled={pending || !password} className="rounded-sm border border-border px-4 py-2 text-sm font-medium hover:border-destructive">
                Wyłącz TOTP
              </button>
            </div>
          )}
          {qr && (
            <div className="flex flex-col items-center gap-4">
              <img src={qr} alt="Kod QR TOTP" className="size-48 rounded-md bg-white p-2" />
              <Field label="Kod z aplikacji" htmlFor="totp-code">
                <input
                  id="totp-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className={`${inputClass} text-center tracking-widest`}
                />
              </Field>
              <button type="button" onClick={verifyTotp} disabled={pending || code.length !== 6} className="rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">
                Potwierdź TOTP
              </button>
            </div>
          )}
          {backupCodes.length > 0 && (
            <div className="rounded-md border border-border p-3">
              <p className="mb-2 text-sm font-medium">Kody odzyskiwania — zachowaj w bezpiecznym miejscu:</p>
              <div className="grid grid-cols-2 gap-1 font-mono text-xs">
                {backupCodes.map((item) => <span key={item}>{item}</span>)}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-md border border-border bg-card p-5">
        <h2 className="text-xl font-semibold">Klucze i passkeyi</h2>
        <p className="mt-1 text-sm text-muted-foreground">YubiKey, Windows Hello, Touch ID lub menedżer hasła.</p>
        <div className="mt-5 flex flex-col gap-4">
          <Field label="Nazwa klucza" htmlFor="passkey-name">
            <input
              id="passkey-name"
              value={passkeyName}
              onChange={(e) => setPasskeyName(e.target.value)}
              placeholder="np. YubiKey biuro"
              maxLength={80}
              className={inputClass}
            />
          </Field>
          <button type="button" onClick={addPasskey} disabled={pending} className="rounded-sm border border-border px-4 py-2 text-sm font-bold hover:border-primary disabled:opacity-50">
            Dodaj klucz lub passkey
          </button>
          <div className="flex flex-col gap-2">
            {passkeys.map((passkey) => (
              <div key={passkey.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
                <span className="text-sm">{passkey.name || 'Passkey'}</span>
                <button type="button" onClick={() => deletePasskey(passkey.id)} disabled={pending} className="text-xs text-destructive hover:underline">
                  Usuń
                </button>
              </div>
            ))}
            {passkeys.length === 0 && <p className="text-sm text-muted-foreground">Brak zarejestrowanych kluczy.</p>}
          </div>
        </div>
      </section>

      {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive xl:col-span-2">{error}</p>}
      {message && <p role="status" className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm xl:col-span-2">{message}</p>}
    </div>
  )
}
