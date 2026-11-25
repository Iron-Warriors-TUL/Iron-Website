// Tworzenie kont CMS bezpośrednio w bazie — także z wnętrza kontenera, gdy
// rejestracja w przeglądarce jest wyłączona, a nie ma jeszcze konta admina.
//
// Przykłady:
//   node scripts/create-account.mjs --from-env
//   node scripts/create-account.mjs --email jan@example.com --name "Jan Kowalski" --role editor --password-stdin
//   node scripts/create-account.mjs --email jan@example.com --update-password --password-stdin
import pg from 'pg'
import { pathToFileURL } from 'node:url'
import {
  ensureAdminFromEnv,
  normalizeEmail,
  saveAccount,
  validateAccountInput,
} from './lib/accounts.mjs'

const HELP = `Tworzenie konta CMS.

Opcje:
  --from-env              Utwórz/promuj admina z ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME.
                          Idempotentne; brak zmiennych nie jest błędem (kontener wstaje dalej).
  --email <adres>         E-mail nowego konta (wymagane poza --from-env).
  --name <imię nazwisko>  Nazwa wyświetlana (wymagane poza --from-env).
  --role <admin|editor>   Rola konta (domyślnie editor).
  --password <hasło>      Hasło (min. 12 znaków). Nieużywaj w powłoce produkcyjnej —
                          preferuj --password-stdin.
  --password-stdin        Czytaj hasło ze standardowego wejścia (jedna linia).
  --update-password       Ustaw nowe hasło istniejącemu kontu.
  --promote               Nadaj rolę admin istniejącemu kontu (gdy --role admin).
  --help                  Ten tekst.

Przykład w kontenerze:
  docker compose exec -T app node scripts/create-account.mjs \\
    --email jan@example.com --name "Jan Kowalski" --role editor --password-stdin
`

function loadEnvFiles() {
  for (const envFile of ['.env.local', '.env']) {
    try {
      process.loadEnvFile(envFile)
    } catch {
      // plik opcjonalny
    }
  }
}

function parseArgs(argv) {
  const options = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }
    if (arg === '--from-env') {
      options.fromEnv = true
      continue
    }
    if (arg === '--password-stdin') {
      options.passwordStdin = true
      continue
    }
    if (arg === '--update-password') {
      options.updatePassword = true
      continue
    }
    if (arg === '--promote') {
      options.promote = true
      continue
    }
    if (arg.startsWith('--')) {
      const [key, inlineValue] = arg.slice(2).split('=', 2)
      const value = inlineValue ?? argv[++i]
      if (value === undefined) throw new Error(`Brak wartości dla --${key}.`)
      options[key] = value
      continue
    }
    throw new Error(`Nieznany argument: ${arg}`)
  }
  return options
}

async function readPasswordFromStdin() {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8').replace(/\r?\n$/, '')
}

async function withTransaction(pool, fn) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function main(argv = process.argv.slice(2), env = process.env) {
  let options
  try {
    options = parseArgs(argv)
  } catch (error) {
    console.error(error.message)
    console.error(HELP)
    return 1
  }

  if (options.help) {
    console.log(HELP)
    return 0
  }

  loadEnvFiles()

  if (!env.DATABASE_URL) {
    console.error('Brak DATABASE_URL (ustaw w .env lub w środowisku kontenera).')
    return 1
  }

  const pool = new pg.Pool({ connectionString: env.DATABASE_URL })
  try {
    if (options.fromEnv) {
      // Błąd walidacji nie przerywa startu kontenera — wypisujemy go i kończymy sukcesem.
      await withTransaction(pool, (client) => ensureAdminFromEnv(client))
      return 0
    }

    const email = normalizeEmail(options.email)
    const name = String(options.name ?? '').trim()
    const role = options.role ?? 'editor'
    let password = options.password ?? ''
    if (options.passwordStdin) password = await readPasswordFromStdin()

    if (!email) {
      console.error('Podaj --email (albo użyj --from-env).')
      return 1
    }
    if (!name) {
      console.error('Podaj --name (imię i nazwisko widoczne w panelu).')
      return 1
    }
    if (!password) {
      console.error('Podaj hasło przez --password-stdin (zalecane) albo --password.')
      return 1
    }

    const parsed = validateAccountInput({ email, name, password, role })
    if (parsed.error) {
      console.error(parsed.error)
      return 1
    }

    const result = await withTransaction(pool, (client) =>
      saveAccount(client, parsed.data, {
        updatePassword: options.updatePassword,
        promote: options.promote,
      }),
    )

    if (result.created) {
      console.log(`Utworzono konto: ${parsed.data.email} (rola: ${result.role}).`)
    } else if (result.promoted) {
      console.log(`Konto ${parsed.data.email} ma teraz rolę admin.`)
    } else if (result.passwordUpdated) {
      console.log(`Zaktualizowano hasło konta: ${parsed.data.email}.`)
    } else {
      console.log(`Konto ${parsed.data.email} już istnieje (rola: ${result.role}).`)
      console.log('Użyj --update-password, aby zmienić hasło, lub --promote, aby nadać admina.')
    }
    return 0
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      console.error('Konto z takim e-mailem już istnieje.')
      return 1
    }
    console.error('Nie udało się zapisać konta:', error instanceof Error ? error.message : error)
    return 1
  } finally {
    await pool.end()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then((code) => {
    process.exitCode = code
  })
}
