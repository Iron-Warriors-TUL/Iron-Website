import type { Pool, PoolClient } from 'pg'

type AuditDb = Pick<Pool | PoolClient, 'query'>

export type AuditEntry = {
  actorId?: string | null
  action: string
  targetType?: string | null
  targetId?: string | null
  details?: Record<string, unknown>
  ipAddress?: string | null
  userAgent?: string | null
}

/** Zapisuje zdarzenie do audit_log. Błąd logowania nie może przerwać właściwej akcji. */
export async function writeAuditLog(db: AuditDb, entry: AuditEntry) {
  try {
    await db.query(
      `INSERT INTO "audit_log"
         ("actorId", "action", "targetType", "targetId", "details", "ipAddress", "userAgent")
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)`,
      [
        entry.actorId ?? null,
        entry.action,
        entry.targetType ?? null,
        entry.targetId ?? null,
        JSON.stringify(entry.details ?? {}),
        entry.ipAddress ?? null,
        entry.userAgent ?? null,
      ],
    )
  } catch (error) {
    console.error('[audit] failed to write entry', error)
  }
}
