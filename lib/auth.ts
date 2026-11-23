import { betterAuth } from 'better-auth'
import { APIError } from 'better-auth/api'
import { twoFactor } from 'better-auth/plugins'
import { passkey } from '@better-auth/passkey'
import { pool } from '@/lib/db'

const isV0Preview = Boolean(
  process.env.V0_RUNTIME_URL ||
    process.env.V0_DEV_APP_URL ||
    process.env.V0_BUILD_URL ||
    process.env.V0_SANDBOX_URL,
)

export const auth = betterAuth({
  appName: 'Iron Warriors CMS',
  database: pool,
  plugins: [
    twoFactor(),
    passkey({
      rpName: 'Iron Warriors CMS',
      rpID: process.env.BETTER_AUTH_URL
        ? new URL(process.env.BETTER_AUTH_URL).hostname
        : 'localhost',
    }),
  ],
  baseURL:
    process.env.BETTER_AUTH_URL ??
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
      role: { type: 'string', defaultValue: 'admin', input: false },
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
      '/sign-in/email': { window: 300, max: 5 },
      '/sign-up/email': { window: 3600, max: 3 },
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
  ...(process.env.NODE_ENV === 'development' && isV0Preview
    ? {
        advanced: {
          // Tylko dla iframe'a podglądu v0: bez tych atrybutów udane logowanie
          // znika przy kolejnym żądaniu. Zwykły localhost pozostaje przy
          // domyślnych, bezpiecznych ciasteczkach sameSite=lax.
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
          },
        },
      }
    : {}),
})
