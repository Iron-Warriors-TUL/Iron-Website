import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const globalForDb = globalThis as unknown as { pool?: Pool }

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', 'postgres'])

function poolConfig() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString || process.env.NODE_ENV !== 'production') {
    return { connectionString, max: 5 }
  }

  // Wymuś pełną weryfikację certyfikatu dla zdalnej bazy. Nadpisujemy też
  // słabsze tryby (require/prefer), które pg traktuje łagodniej w starszych wersjach.
  const url = new URL(connectionString)
  const isLocal = LOCAL_HOSTS.has(url.hostname) || url.hostname.endsWith('.local')
  if (!isLocal && url.searchParams.get('sslmode') !== 'verify-full') {
    url.searchParams.set('sslmode', 'verify-full')
  }

  return { connectionString: url.toString(), max: 5 }
}

export const pool = globalForDb.pool ?? new Pool(poolConfig())

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool

export const db = drizzle(pool, { schema })
