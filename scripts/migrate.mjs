import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import pg from 'pg'

for (const envFile of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(envFile)
  } catch {
    // plik opcjonalny
  }
}

if (!process.env.DATABASE_URL) {
  console.error('Ustaw DATABASE_URL w .env.local (zobacz .env.example).')
  process.exit(1)
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const files = readdirSync('db').filter((f) => f.endsWith('.sql')).sort()

try {
  for (const file of files) {
    await pool.query(readFileSync(join('db', file), 'utf8'))
    console.log(`Zastosowano ${file}`)
  }
  console.log('Migracje zakończone.')
} finally {
  await pool.end()
}
