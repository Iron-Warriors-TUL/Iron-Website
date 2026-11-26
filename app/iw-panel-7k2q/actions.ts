'use server'

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import type { PoolClient } from 'pg'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { put } from '@vercel/blob'
import { db, pool } from '@/lib/db'
import { auth } from '@/lib/auth'
import { writeAuditLog } from '@/lib/audit'
import { navItems, posts, projects, siteContent, user, vehicles } from '@/lib/db/schema'
import { contentAreaByKey } from '@/lib/content-registry'
import { parseBlocks } from '@/lib/blocks'
import { ADMIN_PATH, requireAdmin, requireCms } from '@/lib/admin'
import { hashPassword } from 'better-auth/crypto'
import { collectDescendantIds, validateNavParent } from '@/lib/navigation'
import { hasValidImageSignature, imageExtension, MAX_IMAGE_BYTES } from '@/lib/upload'
import { reencodeImage } from '@/lib/image-processing'
import { isValidPageSlug } from '@/lib/page-slug'
import { canEditContentArea } from '@/lib/roles'
import {
  bool,
  ContentFieldError,
  fail,
  id,
  int,
  isValidEntryKey,
  navSchema,
  parseAccountInput,
  parseFieldValue,
  parseVehicleLists,
  postSchema,
  projectSchema,
  reorderNavSiblings,
  s,
  vehicleSchema,
  type FormState,
} from '@/lib/cms-validation'

export type { FormState }

function refresh() {
  revalidatePath('/', 'layout')
}

type AdminSession = Awaited<ReturnType<typeof requireAdmin>>

const ADMIN_GUARD_LOCK = 'iw:user-admin-guard'
const UPLOAD_WINDOW_LIMIT = 20
const UPLOAD_DAILY_LIMIT = 100

async function lockAdminGuard(client: { query: (text: string, values?: unknown[]) => Promise<unknown> }) {
  await client.query('SELECT pg_advisory_xact_lock(hashtext($1)::bigint)', [ADMIN_GUARD_LOCK])
}

async function revokeUserSessions(
  client: PoolClient,
  userId: string,
  exceptToken?: string,
) {
  if (exceptToken) {
    await client.query('DELETE FROM "session" WHERE "userId" = $1 AND "token" <> $2', [
      userId,
      exceptToken,
    ])
  } else {
    await client.query('DELETE FROM "session" WHERE "userId" = $1', [userId])
  }
}

async function revokeTrustedDevices(
  client: PoolClient,
  userId: string,
) {
  await client.query(
    `DELETE FROM "verification"
     WHERE "value" = $1 AND "identifier" LIKE 'trust-device-%'`,
    [userId],
  )
}

async function requestMeta() {
  const requestHeaders = await headers()
  const forwarded = requestHeaders.get('x-forwarded-for')
  return {
    ipAddress: forwarded?.split(',')[0]?.trim() || requestHeaders.get('x-real-ip'),
    userAgent: requestHeaders.get('user-agent'),
  }
}

/** Wymaga ponownego potwierdzenia hasła i (jeśli włączone) kodu 2FA aktualnego administratora. */
async function verifyAdminReauth(fd: FormData, session: AdminSession) {
  const password = s(fd, 'currentPassword')
  const code = s(fd, 'currentCode').trim()
  if (!password) return { error: 'Podaj aktualne hasło administratora.' }

  const requestHeaders = await headers()
  try {
    await auth.api.verifyPassword({ body: { password }, headers: requestHeaders })
  } catch {
    return { error: 'Nieprawidłowe hasło administratora.' }
  }

  if (session.user.twoFactorEnabled) {
    if (!code) return { error: 'Podaj aktualny kod 2FA administratora.' }
    try {
      if (/^\d{6}$/.test(code)) {
        await auth.api.verifyTOTP({ body: { code }, headers: requestHeaders })
      } else {
        await auth.api.verifyBackupCode({ body: { code }, headers: requestHeaders })
      }
    } catch {
      return { error: 'Nieprawidłowy kod 2FA administratora.' }
    }
  }

  return {}
}

async function checkUploadQuota(userId: string) {
  const { rows } = await pool.query<{ recent: number; daily: number }>(
    `SELECT
       count(*) FILTER (WHERE "createdAt" > NOW() - interval '10 minutes')::int AS recent,
       count(*)::int AS daily
     FROM "audit_log"
     WHERE "actorId" = $1
       AND "action" = 'upload.create'
       AND "createdAt" > NOW() - interval '24 hours'`,
    [userId],
  )
  const recent = rows[0]?.recent ?? 0
  const daily = rows[0]?.daily ?? 0
  if (recent >= UPLOAD_WINDOW_LIMIT) {
    return { error: 'Zbyt wiele uploadów w krótkim czasie. Spróbuj ponownie za kilka minut.' }
  }
  if (daily >= UPLOAD_DAILY_LIMIT) {
    return { error: 'Dzienny limit uploadów został osiągnięty.' }
  }
  return {}
}

/* ---------- Preferencje ---------- */

export async function saveTheme(theme: string) {
  const session = await requireCms()
  await db
    .update(user)
    .set({ theme: theme === 'dark' ? 'dark' : 'light', updatedAt: new Date() })
    .where(eq(user.id, session.user.id))
}

/* ---------- Navigation ---------- */

async function nextNavSortOrder(parentId: number | null, excludeId: number) {
  const siblings = await db
    .select({ id: navItems.id, sortOrder: navItems.sortOrder })
    .from(navItems)
    .where(parentId === null ? isNull(navItems.parentId) : eq(navItems.parentId, parentId))
  return siblings.reduce((max, item) => (item.id === excludeId ? max : Math.max(max, item.sortOrder)), 0) + 10
}

export async function saveNavItem(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin()
  try {
    const data = navSchema.parse({
      label: s(fd, 'label'),
      href: s(fd, 'href'),
      parentId: s(fd, 'parentId'),
      isButton: bool(fd, 'isButton'),
    })
    const rawId = s(fd, 'id')
    const itemId = rawId ? id.parse(rawId) : 0
    const allItems = await db.select({ id: navItems.id, parentId: navItems.parentId }).from(navItems)
    const navError = validateNavParent(allItems, itemId, data.parentId)
    if (navError) return { error: navError }

    const rawSortOrder = s(fd, 'sortOrder')
    const sortOrder = rawSortOrder
      ? int.parse(rawSortOrder)
      : await nextNavSortOrder(data.parentId, itemId)

    if (rawId) {
      await db.update(navItems).set({ ...data, sortOrder }).where(eq(navItems.id, itemId))
    } else {
      await db.insert(navItems).values({ ...data, sortOrder })
    }
  } catch (e) {
    return fail(e)
  }
  refresh()
  return { ok: true }
}

export async function moveNavItem(fd: FormData) {
  await requireAdmin()
  const itemId = id.parse(s(fd, 'id'))
  const items = await db
    .select({ id: navItems.id, parentId: navItems.parentId, sortOrder: navItems.sortOrder })
    .from(navItems)
  const reordered = reorderNavSiblings(items, itemId, s(fd, 'direction') === 'up' ? 'up' : 'down')
  if (!reordered) return

  await db.transaction(async (tx) => {
    for (const item of reordered) {
      await tx.update(navItems).set({ sortOrder: item.sortOrder }).where(eq(navItems.id, item.id))
    }
  })
  refresh()
}

export async function deleteNavItem(fd: FormData) {
  await requireAdmin()
  const itemId = id.parse(s(fd, 'id'))
  const allItems = await db.select({ id: navItems.id, parentId: navItems.parentId }).from(navItems)
  const idsToDelete = collectDescendantIds(allItems, itemId)
  await db.delete(navItems).where(inArray(navItems.id, idsToDelete))
  refresh()
}

/* ---------- Blog posts ---------- */

export async function savePost(_: FormState, fd: FormData): Promise<FormState> {
  await requireCms()
  try {
    const data = {
      ...postSchema.parse({
        slug: s(fd, 'slug'),
        title: s(fd, 'title'),
        excerpt: s(fd, 'excerpt'),
        content: s(fd, 'content'),
        coverImage: s(fd, 'coverImage'),
        published: bool(fd, 'published'),
        publishedAt: s(fd, 'publishedAt') || new Date().toISOString(),
      }),
      blocks: parseBlocks(s(fd, 'blocks')),
    }
    const rawId = s(fd, 'id')
    if (rawId) {
      await db.update(posts).set({ ...data, updatedAt: new Date() }).where(eq(posts.id, id.parse(rawId)))
    } else {
      await db.insert(posts).values(data)
    }
  } catch (e) {
    return fail(e)
  }
  refresh()
  redirect(`${ADMIN_PATH}/blog`)
}

export async function deletePost(fd: FormData) {
  await requireCms()
  await db.delete(posts).where(eq(posts.id, id.parse(s(fd, 'id'))))
  refresh()
  redirect(`${ADMIN_PATH}/blog`)
}

/* ---------- Vehicles ---------- */

export async function saveVehicle(_: FormState, fd: FormData): Promise<FormState> {
  await requireCms()
  try {
    const blocks = parseBlocks(s(fd, 'blocks'))
    const textBlock = blocks.find((block) => block.type === 'text' && typeof block.text === 'string')
    const quoteBlock = blocks.find((block) => block.type === 'quote' && typeof block.text === 'string')
    const data = {
      ...vehicleSchema.parse({
        slug: s(fd, 'slug'),
        name: s(fd, 'name'),
        debutYear: s(fd, 'debutYear'),
        imageUrl: s(fd, 'imageUrl'),
        description: s(fd, 'description'),
        goal: s(fd, 'goal'),
        bestResult: s(fd, 'bestResult'),
        featured: bool(fd, 'featured'),
        sortOrder: s(fd, 'sortOrder') || '0',
      }),
      ...parseVehicleLists(fd),
      description: textBlock && typeof textBlock.text === 'string' ? textBlock.text : '',
      goal: quoteBlock && typeof quoteBlock.text === 'string' ? quoteBlock.text : '',
      blocks,
    }
    const rawId = s(fd, 'id')
    if (rawId) {
      await db.update(vehicles).set({ ...data, updatedAt: new Date() }).where(eq(vehicles.id, id.parse(rawId)))
    } else {
      await db.insert(vehicles).values(data)
    }
  } catch (e) {
    return fail(e)
  }
  refresh()
  redirect(`${ADMIN_PATH}/bolidy`)
}

export async function deleteVehicle(fd: FormData) {
  await requireCms()
  await db.delete(vehicles).where(eq(vehicles.id, id.parse(s(fd, 'id'))))
  refresh()
  redirect(`${ADMIN_PATH}/bolidy`)
}

/* ---------- Projects ---------- */

export async function saveProject(_: FormState, fd: FormData): Promise<FormState> {
  await requireCms()
  try {
    const data = {
      ...projectSchema.parse({
        category: s(fd, 'category'),
        title: s(fd, 'title'),
        program: s(fd, 'program'),
        funding: s(fd, 'funding'),
        ownContribution: s(fd, 'ownContribution'),
        totalValue: s(fd, 'totalValue'),
        period: s(fd, 'period'),
        description: s(fd, 'description'),
        heading: s(fd, 'heading'),
        imageUrls: s(fd, 'imageUrls'),
        fundingBar: bool(fd, 'fundingBar'),
        fundingBarText: s(fd, 'fundingBarText'),
        fundingBarLogo: s(fd, 'fundingBarLogo'),
        sortOrder: s(fd, 'sortOrder') || '0',
      }),
      blocks: parseBlocks(s(fd, 'blocks')),
    }
    const rawId = s(fd, 'id')
    if (rawId) {
      await db.update(projects).set({ ...data, updatedAt: new Date() }).where(eq(projects.id, id.parse(rawId)))
    } else {
      await db.insert(projects).values(data)
    }
  } catch (e) {
    return fail(e)
  }
  refresh()
  redirect(`${ADMIN_PATH}/projekty`)
}

export async function deleteProject(fd: FormData) {
  await requireCms()
  await db.delete(projects).where(eq(projects.id, id.parse(s(fd, 'id'))))
  refresh()
  redirect(`${ADMIN_PATH}/projekty`)
}

/* ---------- Generyczna treść strony ---------- */

export async function saveContent(_: FormState, fd: FormData): Promise<FormState> {
  const session = await requireCms()
  try {
    const areaKey = s(fd, 'area')
    const entryKey = s(fd, 'entryKey')
    const area = contentAreaByKey.get(areaKey)
    if (!area) return { error: 'Nieznany obszar treści.' }
    if (!canEditContentArea(session.user.role, areaKey)) return { error: 'Tę sekcję może zmieniać tylko administrator.' }
    if (!isValidEntryKey(entryKey)) {
      return { error: 'Nieprawidłowy klucz wpisu.' }
    }
    if (areaKey === 'pages' && !isValidPageSlug(entryKey)) {
      return {
        error: 'Adres podstrony musi być slugiem (małe litery, cyfry, myślniki) i nie może kolidować z istniejącą trasą.',
      }
    }

    const data: Record<string, unknown> = {}
    for (const field of area.fields) data[field.name] = parseFieldValue(field, fd)
    const now = new Date()
    const [existing] = await db
      .select({ id: siteContent.id })
      .from(siteContent)
      .where(and(eq(siteContent.area, areaKey), eq(siteContent.entryKey, entryKey)))
      .limit(1)
    if (existing) {
      await db.update(siteContent).set({ data, updatedAt: now }).where(eq(siteContent.id, existing.id))
    } else {
      await db.insert(siteContent).values({ area: areaKey, entryKey, data })
    }
    await writeAuditLog(pool, {
      actorId: session.user.id,
      action: 'content.save',
      targetType: 'content',
      targetId: `${areaKey}/${entryKey}`,
      details: { area: areaKey, key: entryKey },
    })
  } catch (e) {
    if (e instanceof ContentFieldError) return { error: e.message }
    return fail(e)
  }
  refresh()
  return { ok: true }
}

export async function addContentEntry(fd: FormData) {
  const session = await requireCms()
  const areaKey = s(fd, 'area')
  const entryKey = s(fd, 'entryKey').trim()
  const name = s(fd, 'name').trim().slice(0, 160)
  const area = contentAreaByKey.get(areaKey)
  if (!area || !canEditContentArea(session.user.role, areaKey)) return
  const backToArea = `${ADMIN_PATH}/tresc/${areaKey}`
  if (!isValidEntryKey(entryKey)) {
    redirect(`${backToArea}?error=key`)
  }
  if (areaKey === 'pages' && !isValidPageSlug(entryKey)) {
    redirect(`${backToArea}?error=slug`)
  }
  await db
    .insert(siteContent)
    .values({ area: areaKey, entryKey, data: name ? { title: name } : {} })
    .onConflictDoNothing()
  await writeAuditLog(pool, {
    actorId: session.user.id,
    action: 'content.create',
    targetType: 'content',
    targetId: `${areaKey}/${entryKey}`,
    details: { area: areaKey, key: entryKey },
  })
  refresh()
  redirect(`${ADMIN_PATH}/tresc/${areaKey}/${encodeURIComponent(entryKey)}`)
}

export async function deleteContentEntry(fd: FormData) {
  const session = await requireCms()
  const areaKey = s(fd, 'area')
  const entryKey = s(fd, 'entryKey')
  if (!contentAreaByKey.has(areaKey) || !canEditContentArea(session.user.role, areaKey)) return
  await db
    .delete(siteContent)
    .where(and(eq(siteContent.area, areaKey), eq(siteContent.entryKey, entryKey)))
  await writeAuditLog(pool, {
    actorId: session.user.id,
    action: 'content.delete',
    targetType: 'content',
    targetId: `${areaKey}/${entryKey}`,
    details: { area: areaKey, key: entryKey },
  })
  refresh()
}

/* ---------- Image upload ---------- */

export async function uploadImage(fd: FormData): Promise<{ url?: string; error?: string }> {
  const session = await requireCms()
  const quota = await checkUploadQuota(session.user.id)
  if ('error' in quota) return quota

  const file = fd.get('file')
  if (!(file instanceof File)) return { error: 'Brak pliku.' }

  const ext = imageExtension(file.type)
  if (!ext) return { error: 'Dozwolone formaty: JPG, PNG, WEBP, AVIF.' }
  if (file.size > MAX_IMAGE_BYTES) return { error: 'Maksymalny rozmiar pliku to 4 MB.' }

  const bytes = new Uint8Array(await file.arrayBuffer())
  if (!hasValidImageSignature(bytes, ext)) return { error: 'Plik nie jest prawidłowym obrazem.' }

  let processed: Awaited<ReturnType<typeof reencodeImage>>
  try {
    processed = await reencodeImage(bytes, ext)
  } catch {
    return { error: 'Nie udało się przetworzyć obrazu. Spróbuj zapisać go ponownie.' }
  }

  const filename = `${randomUUID()}.${processed.extension}`
  const meta = await requestMeta()
  const audit = {
    actorId: session.user.id,
    action: 'upload.create',
    targetType: 'upload',
    targetId: filename,
    details: { bytes: processed.data.length, contentType: processed.contentType },
    ...meta,
  }

  // Lokalny tryb developerski: bez tokenu Vercel Blob zapisujemy do public/uploads/.
  // Dzięki temu panel działa w pełni także bez konta Vercel.
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const dir = join(process.cwd(), 'public', 'uploads')
      await mkdir(dir, { recursive: true })
      await writeFile(join(dir, filename), processed.data)
      await writeAuditLog(pool, audit)
      return { url: `/api/uploads/${filename}` }
    } catch (e) {
      console.error('[cms] local upload failed', e)
      return { error: 'Nie udało się zapisać pliku lokalnie.' }
    }
  }

  // Produkcja: prywatny bucket, serwowany przez /api/media (zob. route.ts).
  try {
    const blob = await put(`cms/${filename}`, processed.data, {
      access: 'private',
      contentType: processed.contentType,
    })
    await writeAuditLog(pool, audit)
    return { url: `/api/media?pathname=${encodeURIComponent(blob.pathname)}` }
  } catch (e) {
    console.error('[cms] upload failed', e)
    return { error: 'Nie udało się przesłać pliku.' }
  }
}

/* ---------- Accounts ---------- */

export async function saveAccount(_: FormState, fd: FormData): Promise<FormState> {
  const session = await requireAdmin()
  const parsed = parseAccountInput(fd)
  if ('error' in parsed) return { error: parsed.error }
  const { name, email, password, role, id: rawId } = parsed.data
  const meta = await requestMeta()
  let auditEntry: Parameters<typeof writeAuditLog>[1] | undefined

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    // Serializuje zmiany ról i reset haseł, żeby dwóch administratorów nie mogło
    // jednocześnie zdegradować/usunąć ostatniego admina (TOCTOU).
    await lockAdminGuard(client)

    if (rawId) {
      const { rows } = await client.query<{ id: string; role: string; email: string }>(
        'SELECT "id", "role", "email" FROM "user" WHERE "id" = $1 FOR UPDATE',
        [rawId],
      )
      const target = rows[0]
      if (!target) {
        await client.query('ROLLBACK')
        return { error: 'Nie znaleziono konta.' }
      }

      const isSelf = rawId === session.user.id
      const passwordChanged = Boolean(password)
      const roleChanged = target.role !== role
      if (!isSelf && (passwordChanged || roleChanged)) {
        const reauth = await verifyAdminReauth(fd, session)
        if ('error' in reauth) {
          await client.query('ROLLBACK')
          return { error: reauth.error }
        }
      }

      if (target.role === 'admin' && role !== 'admin') {
        const { rows: admins } = await client.query<{ count: string }>(
          `SELECT count(*)::text AS count FROM "user" WHERE "role" = 'admin'`,
        )
        if (Number(admins[0]?.count ?? 0) <= 1) {
          await client.query('ROLLBACK')
          return { error: 'Zawsze musi pozostać co najmniej jeden administrator.' }
        }
      }

      await client.query(
        'UPDATE "user" SET "name" = $1, "email" = $2, "role" = $3, "updatedAt" = NOW() WHERE "id" = $4',
        [name, email, role, rawId],
      )

      if (password) {
        const passwordHash = await hashPassword(password)
        const updated = await client.query(
          `UPDATE "account" SET "password" = $1, "updatedAt" = NOW()
           WHERE "userId" = $2 AND "providerId" = 'credential'`,
          [passwordHash, rawId],
        )
        if (updated.rowCount === 0) {
          await client.query(
            `INSERT INTO "account" ("id", "accountId", "providerId", "userId", "password")
             VALUES ($1, $2, 'credential', $3, $4)`,
            [randomUUID(), rawId, rawId, passwordHash],
          )
        }
        await revokeUserSessions(client, rawId, isSelf ? session.session.token : undefined)
        await revokeTrustedDevices(client, rawId)
      }
      if (roleChanged) await revokeUserSessions(client, rawId)

      auditEntry = {
        actorId: session.user.id,
        action: 'account.update',
        targetType: 'user',
        targetId: rawId,
        details: {
          email,
          role,
          passwordReset: passwordChanged,
          roleChanged,
          self: isSelf,
        },
        ...meta,
      }
    } else {
      if (role === 'admin') {
        const reauth = await verifyAdminReauth(fd, session)
        if ('error' in reauth) {
          await client.query('ROLLBACK')
          return { error: reauth.error }
        }
      }

      const userId = randomUUID()
      const passwordHash = await hashPassword(password)
      await client.query(
        `INSERT INTO "user" ("id", "name", "email", "emailVerified", "role")
         VALUES ($1, $2, $3, TRUE, $4)`,
        [userId, name, email, role],
      )
      await client.query(
        `INSERT INTO "account" ("id", "accountId", "providerId", "userId", "password")
         VALUES ($1, $2, 'credential', $3, $4)`,
        [randomUUID(), userId, userId, passwordHash],
      )
      auditEntry = {
        actorId: session.user.id,
        action: 'account.create',
        targetType: 'user',
        targetId: userId,
        details: { email, role },
        ...meta,
      }
    }
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    if (e instanceof Error && 'code' in e && (e as { code?: string }).code === '23505') {
      return { error: 'Konto z takim e-mailem już istnieje.' }
    }
    console.error('[cms] account save failed', e)
    return { error: 'Nie udało się zapisać konta.' }
  } finally {
    client.release()
  }

  if (auditEntry) await writeAuditLog(pool, auditEntry)
  refresh()
  redirect(`${ADMIN_PATH}/ustawienia#konta`)
  return { ok: true }
}

export async function deleteAccount(fd: FormData) {
  const session = await requireAdmin()
  const userId = s(fd, 'id')
  if (!userId) return
  if (session.user.id === userId) return
  const meta = await requestMeta()
  let auditEntry: Parameters<typeof writeAuditLog>[1] | undefined

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await lockAdminGuard(client)
    const { rows } = await client.query<{ role: string; email: string }>(
      'SELECT "role", "email" FROM "user" WHERE "id" = $1 FOR UPDATE',
      [userId],
    )
    const target = rows[0]
    if (!target) {
      await client.query('ROLLBACK')
      return
    }
    if (target.role === 'admin') {
      const { rows: admins } = await client.query<{ count: string }>(
        `SELECT count(*)::text AS count FROM "user" WHERE "role" = 'admin'`,
      )
      if (Number(admins[0]?.count ?? 0) <= 1) {
        await client.query('ROLLBACK')
        return
      }
    }
    await client.query('DELETE FROM "user" WHERE "id" = $1', [userId])
    auditEntry = {
      actorId: session.user.id,
      action: 'account.delete',
      targetType: 'user',
      targetId: userId,
      details: { email: target.email, role: target.role },
      ...meta,
    }
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
  if (auditEntry) await writeAuditLog(pool, auditEntry)
  refresh()
  redirect(`${ADMIN_PATH}/ustawienia#konta`)
}

export async function resetAccountSecurity(_: FormState, fd: FormData): Promise<FormState> {
  const session = await requireAdmin()
  const userId = s(fd, 'id')
  // Własne 2FA wyłącza się w „Bezpieczeństwo” kodem z aplikacji, nie resetem administratora.
  if (!userId) return { error: 'Brak konta do resetu.' }
  if (userId === session.user.id) {
    return { error: 'Własne 2FA wyłącz w sekcji „Bezpieczeństwo”.' }
  }
  const meta = await requestMeta()
  let auditEntry: Parameters<typeof writeAuditLog>[1] | undefined

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await lockAdminGuard(client)
    const { rows } = await client.query<{ role: string; email: string }>(
      'SELECT "role", "email" FROM "user" WHERE "id" = $1 FOR UPDATE',
      [userId],
    )
    const target = rows[0]
    if (!target) {
      await client.query('ROLLBACK')
      return { error: 'Nie znaleziono konta.' }
    }

    const reauth = await verifyAdminReauth(fd, session)
    if ('error' in reauth) {
      await client.query('ROLLBACK')
      return { error: reauth.error }
    }

    await client.query('DELETE FROM "twoFactor" WHERE "userId" = $1', [userId])
    await client.query(
      'UPDATE "user" SET "twoFactorEnabled" = FALSE, "updatedAt" = NOW() WHERE "id" = $1',
      [userId],
    )
    await revokeUserSessions(client, userId)
    await revokeTrustedDevices(client, userId)
    auditEntry = {
      actorId: session.user.id,
      action: 'account.two_factor_reset',
      targetType: 'user',
      targetId: userId,
      details: { email: target.email, role: target.role },
      ...meta,
    }
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    console.error('[cms] 2FA reset failed', e)
    return { error: 'Nie udało się zresetować 2FA.' }
  } finally {
    client.release()
  }

  if (auditEntry) await writeAuditLog(pool, auditEntry)
  refresh()
  redirect(`${ADMIN_PATH}/konta/${encodeURIComponent(userId)}`)
  return { ok: true }
}
