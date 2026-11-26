import { betterAuth } from 'better-auth'
import { APIError, createAuthMiddleware, getSessionFromCtx } from 'better-auth/api'
import { twoFactor } from 'better-auth/plugins'
import { nextCookies } from 'better-auth/next-js'
import { pool } from '@/lib/db'
import { createLoginLock, parseTrustedProxies, resolveClientIp } from '@/lib/login-lock'
import { writeAuditLog } from '@/lib/audit'

const isV0Preview = Boolean(
  process.env.V0_RUNTIME_URL ||
    process.env.V0_DEV_APP_URL ||
    process.env.V0_BUILD_URL ||
    process.env.V0_SANDBOX_URL,
)

const authSecret = process.env.BETTER_AUTH_SECRET ?? ''
// Produkcja nie może wystartować z sekretem z repozytorium ani zbyt krótkim —
// niezależnie od tego, czy publiczny adres używa HTTPS, HTTP czy go brakuje.
const KNOWN_DEV_SECRETS = new Set([
  'local-development-secret-change-before-production',
  'change-me-to-a-long-random-string',
  'generate-a-long-random-password',
  'ci-only-secret-not-used-in-production-0123456789',
])
if (
  process.env.NODE_ENV === 'production' &&
  (authSecret.length < 32 || KNOWN_DEV_SECRETS.has(authSecret))
) {
  throw new Error(
    'BETTER_AUTH_SECRET jest pusty, za krótki (min. 32 znaki) albo domyślny. Wygeneruj: openssl rand -base64 48',
  )
}

const AUTH_IP_HEADER = process.env.AUTH_IP_HEADER?.trim().toLowerCase() || 'x-forwarded-for'
const TRUSTED_PROXIES = parseTrustedProxies(process.env.TRUSTED_PROXIES)

// Blokady liczą WYŁĄCZNIE nieudane próby. Dzięki temu poprawne logowania nigdy nie
// wyczerpują limitu, a seria błędnych haseł nadal blokuje konto/adres.
const accountLock = createLoginLock({ maxFailures: 10, windowMs: 15 * 60 * 1000 })
const ipLock = createLoginLock({ maxFailures: 30, windowMs: 15 * 60 * 1000 })

function clientIp(request: Request | undefined): string | null {
  return request ? resolveClientIp(request.headers, { headerName: AUTH_IP_HEADER, trustedProxies: TRUSTED_PROXIES }) : null
}

// Blokada jest już zapisana w dzienniku — kolejne odrzucone próby logujemy najwyżej raz na minutę,
// żeby ktoś nie zapełnił tabeli `audit_log` powtarzaniem zablokowanego żądania.
const blockedLogAt = new Map<string, number>()
function shouldLogBlocked(key: string): boolean {
  const now = Date.now()
  if (now - (blockedLogAt.get(key) ?? 0) < 60_000) return false
  blockedLogAt.set(key, now)
  if (blockedLogAt.size > 5_000) blockedLogAt.clear()
  return true
}

export const auth = betterAuth({
  appName: 'Iron Warriors CMS',
  database: pool,
  plugins: [
    twoFactor({ issuer: 'Iron Warriors CMS' }),
    // Musi być ostatnia: pozwala akcjom serwerowym (auth.api.*) ustawiać ciasteczka sesji.
    nextCookies(),
  ],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/sign-in/email') {
        const email = String((ctx.body as { email?: unknown } | undefined)?.email ?? '')
        const ip = clientIp(ctx.request)
        const lockedByAccount = accountLock.isLocked(email)
        const lockedByIp = ip ? ipLock.isLocked(ip) : false
        if (lockedByAccount || lockedByIp) {
          if (shouldLogBlocked(`${email}|${ip ?? ''}`)) {
            await writeAuditLog(pool, {
              action: 'auth.login_blocked',
              targetType: 'email',
              targetId: email,
              details: { reason: lockedByAccount ? 'account' : 'ip' },
              ipAddress: ip,
              userAgent: ctx.request?.headers.get('user-agent') ?? null,
            })
          }
          throw new APIError('TOO_MANY_REQUESTS', {
            message: 'Zbyt wiele nieudanych prób logowania. Spróbuj ponownie za 15 minut.',
          })
        }
      }
      // Wyłączenie 2FA wymaga kodu z aplikacji lub kodu zapasowego. Robi to akcja serwerowa
      // disableTwoFactor (sprawdza hasło i kod), więc bezpośrednie wywołanie z przeglądarki blokujemy.
      if (ctx.path === '/two-factor/disable' && ctx.request) {
        throw new APIError('FORBIDDEN', { message: 'Wyłącz 2FA w panelu, podając kod z aplikacji.' })
      }
      // Ponowne „włączenie” przy aktywnym 2FA podmieniłoby klucz bez podania kodu.
      if (ctx.path === '/two-factor/enable') {
        const session = await getSessionFromCtx(ctx)
        if (session?.user?.twoFactorEnabled) {
          throw new APIError('FORBIDDEN', { message: '2FA jest już włączone. Najpierw je wyłącz, podając kod.' })
        }
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/sign-in/email') return
      const email = String((ctx.body as { email?: unknown } | undefined)?.email ?? '')
      const ip = clientIp(ctx.request)
      const userAgent = ctx.request?.headers.get('user-agent') ?? null
      if (ctx.context.returned instanceof APIError) {
        // Odrzucenie przez blokadę zostało już zapisane w hooku `before` — nie licz go ponownie.
        if (ctx.context.returned.statusCode === 429) return
        if (email) accountLock.recordFailure(email)
        if (ip) ipLock.recordFailure(ip)
        await writeAuditLog(pool, {
          action: 'auth.login_failed',
          targetType: 'email',
          targetId: email,
          details: { reason: ctx.context.returned.status },
          ipAddress: ip,
          userAgent,
        })
        return
      }

      accountLock.reset(email)
      if (ip) ipLock.reset(ip)
      let actorId: string | undefined
      try {
        const { rows } = await pool.query<{ id: string }>('SELECT "id" FROM "user" WHERE "email" = $1', [
          email,
        ])
        actorId = rows[0]?.id
      } catch {
        // Logowanie nie może się nie udać tylko dlatego, że nie udało się zapisać audytu.
      }
      if (actorId) {
        await writeAuditLog(pool, {
          actorId,
          action: 'auth.login_success',
          targetType: 'user',
          targetId: actorId,
          details: { email },
          ipAddress: ip,
          userAgent,
        })
      }
    }),
  },
  baseURL:
    process.env.BETTER_AUTH_URL ??
    // Render ustawia publiczny adres usługi automatycznie.
    process.env.RENDER_EXTERNAL_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  user: {
    additionalFields: {
      // Rola jest ustawiana przez bazę; nie można jej zmienić z poziomu API.
      // Domyślnie najmniejsze uprawnienia (rejestracja i tak jest wyłączona).
      role: { type: 'string', defaultValue: 'editor', input: false },
    },
  },
  trustedOrigins: [
    ...(process.env.NODE_ENV === 'development'
      ? [
          'http://localhost:3000',
          ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
          ...(process.env.V0_DEV_APP_URL ? [process.env.V0_DEV_APP_URL] : []),
          ...(process.env.V0_BUILD_URL ? [process.env.V0_BUILD_URL] : []),
          ...(process.env.V0_SANDBOX_URL ? [process.env.V0_SANDBOX_URL] : []),
        ]
      : []),
    ...(process.env.NODE_ENV === 'production'
      ? [
          ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
          ...(process.env.RENDER_EXTERNAL_URL ? [process.env.RENDER_EXTERNAL_URL] : []),
          ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
          ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
            : []),
        ]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 8,
    updateAge: 60 * 60,
  },
  rateLimit: {
    enabled: true,
    storage: 'database',
    modelName: 'rateLimit',
    window: 60,
    max: 60,
    customRules: {
      // Wbudowany limit liczy WSZYSTKIE żądania (także udane logowania), więc po kilku
      // poprawnych logowaniach z jednego IP blokował kolejne. Logowanie ograniczają
      // teraz wyłącznie błędne próby: accountLock/ipLock w hookach poniżej.
      '/sign-in/email': false,
      '/sign-up/email': { window: 3600, max: 3 },
      // Kod z aplikacji ma tylko 6 cyfr: domyślne 3 próby na 10 s to ~26 tys. prób na dobę.
      '/two-factor/verify-totp': { window: 300, max: 5 },
      '/two-factor/verify-backup-code': { window: 300, max: 5 },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async () => {
          throw new APIError('FORBIDDEN', { message: 'Rejestracja jest wyłączona.' })
        },
      },
    },
  },
  advanced: {
    ipAddress: {
      // Adres klienta do limitów logowania. Reverse proxy (Caddy/nginx) musi NADPISYWAĆ ten nagłówek
      // adresem klienta, a aplikacja nie może być dostępna z pominięciem proxy (port tylko na 127.0.0.1).
      ipAddressHeaders: [AUTH_IP_HEADER],
      // Gdy proxy DOPISUJE adres (nginx $proxy_add_x_forwarded_for), podaj jego adresy/CIDR,
      // np. TRUSTED_PROXIES=172.16.0.0/12. Wtedy brany jest pierwszy adres od prawej spoza tej listy.
      trustedProxies: TRUSTED_PROXIES,
    },
    ...(process.env.NODE_ENV === 'development' && isV0Preview
      ? {
          // Tylko dla iframe'a podglądu v0: bez tych atrybutów udane logowanie
          // znika przy kolejnym żądaniu. Zwykły localhost pozostaje przy
          // domyślnych, bezpiecznych ciasteczkach sameSite=lax.
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
          },
        }
      : {}),
  },
})
