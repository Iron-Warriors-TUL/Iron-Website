// Seed tylko przy pierwszym wdrożeniu (pusta baza).
// Zwykły `pnpm db:seed` czyści menu, bolidy, projekty i aktualności, więc
// uruchamiany przy każdym deployu kasowałby zmiany wprowadzone w panelu.
import { spawnSync } from 'node:child_process'
import pg from 'pg'

for (const envFile of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(envFile)
  } catch {
    // plik opcjonalny
  }
}

if (!process.env.DATABASE_URL) {
  console.error('Ustaw DATABASE_URL (zobacz .env.example).')
  process.exit(1)
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
let empty = true
try {
  const { rows } = await pool.query('SELECT EXISTS (SELECT 1 FROM nav_items) AS has_rows')
  empty = !rows[0].has_rows
} finally {
  await pool.end()
}

if (!empty) {
  console.log('Baza ma już treść: pomijam seed, żeby nie nadpisać zmian z panelu.')
  process.exit(0)
}

const result = spawnSync(process.execPath, ['scripts/seed.mjs'], { stdio: 'inherit' })
process.exit(result.status ?? 1)
