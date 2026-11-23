'use client'

import { createAuthClient } from 'better-auth/react'
import { twoFactorClient } from 'better-auth/client/plugins'
import { passkeyClient } from '@better-auth/passkey/client'

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient({
      twoFactorPage: '/iw-panel-7k2q/two-factor',
    }),
    passkeyClient(),
  ],
})
