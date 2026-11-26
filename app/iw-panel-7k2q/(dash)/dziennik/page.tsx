import { pool } from '@/lib/db'
import { requireAdminPage } from '@/lib/admin'

const ACTION_LABELS: Record<string, string> = {
  'auth.login_success': 'Logowanie: sukces',
  'auth.login_failed': 'Logowanie: nieudane',
  'auth.login_blocked': 'Logowanie: zablokowane',
  'content.save': 'Edycja strony/wpisu',
  'content.create': 'Dodanie wpisu',
  'content.delete': 'Usunięcie wpisu',
  'nav.create': 'Dodanie pozycji menu',
  'nav.update': 'Zmiana pozycji menu',
  'nav.move': 'Zmiana kolejności menu',
  'nav.delete': 'Usunięcie pozycji menu',
  'post.create': 'Dodanie wpisu bloga',
  'post.update': 'Edycja wpisu bloga',
  'post.delete': 'Usunięcie wpisu bloga',
  'vehicle.create': 'Dodanie bolidu',
  'vehicle.update': 'Edycja bolidu',
  'vehicle.delete': 'Usunięcie bolidu',
  'project.create': 'Dodanie projektu',
  'project.update': 'Edycja projektu',
  'project.delete': 'Usunięcie projektu',
  'upload.create': 'Dodanie pliku',
  'account.update': 'Zmiana konta',
  'account.create': 'Utworzenie konta',
  'account.delete': 'Usunięcie konta',
  'account.two_factor_reset': 'Reset 2FA przez administratora',
  'account.two_factor_disabled': 'Wyłączenie 2FA',
}

const DETAILS_LABELS: Record<string, string> = {
  email: 'e-mail',
  role: 'rola',
  reason: 'powód',
  area: 'obszar',
  key: 'klucz',
  name: 'nazwa',
  title: 'tytuł',
  slug: 'slug',
  category: 'kategoria',
  label: 'etykieta',
  href: 'adres',
  direction: 'kierunek',
  items: 'liczba pozycji',
  published: 'opublikowany',
  created: 'utworzono',
  changedFields: 'zmienione pola',
  self: 'własne konto',
  passwordReset: 'reset hasła',
  roleChanged: 'zmiana roli',
  contentType: 'typ',
  bytes: 'rozmiar (B)',
}

type Row = {
  id: number
  action: string
  targetType: string | null
  targetId: string | null
  details: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  actorName: string | null
  actorEmail: string | null
}

function formatDetails(details: Record<string, unknown> | null): string {
  if (!details) return '—'
  const parts = Object.entries(details)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${DETAILS_LABELS[key] ?? key}: ${typeof value === 'boolean' ? (value ? 'tak' : 'nie') : String(value)}`)
  return parts.length ? parts.join(' · ') : '—'
}

export default async function AuditLogPage() {
  await requireAdminPage()

  const { rows } = await pool.query<Row>(
    `SELECT a."id", a."action", a."targetType", a."targetId", a."details", a."ipAddress",
            a."userAgent", a."createdAt", u."name" AS "actorName", u."email" AS "actorEmail"
       FROM "audit_log" a
       LEFT JOIN "user" u ON u."id" = a."actorId"
      ORDER BY a."createdAt" DESC
      LIMIT 500`,
  )

  const dateFormat = new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: 'Europe/Warsaw',
  })

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold">Dziennik zdarzeń</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ostatnie 500 zdarzeń: logowania, zmiany kont, treści i pliki. Widoczne tylko dla administratorów.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-md border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
          Brak zapisanych zdarzeń.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-2 font-medium whitespace-nowrap">Data</th>
                <th className="px-4 py-2 font-medium">Zdarzenie</th>
                <th className="px-4 py-2 font-medium">Kto / czego</th>
                <th className="px-4 py-2 font-medium">Szczegóły</th>
                <th className="px-4 py-2 font-medium whitespace-nowrap">IP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border align-top last:border-0">
                  <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">{dateFormat.format(row.createdAt)}</td>
                  <td className="px-4 py-2 font-medium">{ACTION_LABELS[row.action] ?? row.action}</td>
                  <td className="px-4 py-2">
                    {row.actorName || row.actorEmail ? (
                      <span>{row.actorName ?? row.actorEmail}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                    {row.targetType && row.targetId && (
                      <span className="block break-all text-xs text-muted-foreground">
                        {row.targetType}: {row.targetId}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{formatDetails(row.details)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-muted-foreground">{row.ipAddress ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
