'use server'

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { put } from '@vercel/blob'
import { db, pool } from '@/lib/db'
import { navItems, posts, projects, siteContent, user, vehicles } from '@/lib/db/schema'
import { contentAreaByKey } from '@/lib/content-registry'
import { parseBlocks } from '@/lib/blocks'
import { ADMIN_PATH, requireAdmin, requireCms } from '@/lib/admin'
import { hashPassword } from 'better-auth/crypto'
import { collectDescendantIds, validateNavParent } from '@/lib/navigation'
import { hasValidImageSignature, imageExtension, MAX_IMAGE_BYTES } from '@/lib/upload'
import { isValidPageSlug } from '@/lib/page-slug'
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
  await requireCms()
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
  await requireCms()
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
  await requireCms()
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
      blocks: parseBlocks(s(fd, 'blocks')),
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
  await requireCms()
  try {
    const areaKey = s(fd, 'area')
    const entryKey = s(fd, 'entryKey')
    const area = contentAreaByKey.get(areaKey)
    if (!area) return { error: 'Nieznany obszar treści.' }
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
  } catch (e) {
    if (e instanceof ContentFieldError) return { error: e.message }
    return fail(e)
  }
  refresh()
  return { ok: true }
}

export async function addContentEntry(fd: FormData) {
  await requireCms()
  const areaKey = s(fd, 'area')
  const entryKey = s(fd, 'entryKey').trim()
  const name = s(fd, 'name').trim().slice(0, 160)
  const area = contentAreaByKey.get(areaKey)
  if (!area) return
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
  refresh()
  redirect(`${ADMIN_PATH}/tresc/${areaKey}/${encodeURIComponent(entryKey)}`)
}

export async function deleteContentEntry(fd: FormData) {
  await requireCms()
  const areaKey = s(fd, 'area')
  const entryKey = s(fd, 'entryKey')
  if (!contentAreaByKey.has(areaKey)) return
  await db
    .delete(siteContent)
    .where(and(eq(siteContent.area, areaKey), eq(siteContent.entryKey, entryKey)))
  refresh()
}

/* ---------- Image upload ---------- */

export async function uploadImage(fd: FormData): Promise<{ url?: string; error?: string }> {
  await requireCms()
  const file = fd.get('file')
  if (!(file instanceof File)) return { error: 'Brak pliku.' }

  const ext = imageExtension(file.type)
  if (!ext) return { error: 'Dozwolone formaty: JPG, PNG, WEBP, AVIF.' }
  if (file.size > MAX_IMAGE_BYTES) return { error: 'Maksymalny rozmiar pliku to 4 MB.' }

  const bytes = new Uint8Array(await file.arrayBuffer())
  if (!hasValidImageSignature(bytes, ext)) return { error: 'Plik nie jest prawidłowym obrazem.' }

  const filename = `${randomUUID()}.${ext}`

  // Lokalny tryb developerski: bez tokenu Vercel Blob zapisujemy do public/uploads/.
  // Dzięki temu panel działa w pełni także bez konta Vercel.
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const dir = join(process.cwd(), 'public', 'uploads')
      await mkdir(dir, { recursive: true })
      await writeFile(join(dir, filename), bytes)
      return { url: `/api/uploads/${filename}` }
    } catch (e) {
      console.error('[cms] local upload failed', e)
      return { error: 'Nie udało się zapisać pliku lokalnie.' }
    }
  }

  // Produkcja: prywatny bucket, serwowany przez /api/media (zob. route.ts).
  try {
    const blob = await put(`cms/${filename}`, file, { access: 'private', contentType: file.type })
    return { url: `/api/media?pathname=${encodeURIComponent(blob.pathname)}` }
  } catch (e) {
    console.error('[cms] upload failed', e)
    return { error: 'Nie udało się przesłać pliku.' }
  }
}

/* ---------- Accounts ---------- */

export async function saveAccount(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin()
  const parsed = parseAccountInput(fd)
  if ('error' in parsed) return { error: parsed.error }
  const { name, email, password, role, id: rawId } = parsed.data

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    if (rawId) {
      const { rows } = await client.query<{ id: string; role: string }>(
        'SELECT "id", "role" FROM "user" WHERE "id" = $1',
        [rawId],
      )
      if (!rows[0]) {
        await client.query('ROLLBACK')
        return { error: 'Nie znaleziono konta.' }
      }
      if (rows[0].role === 'admin' && role !== 'admin') {
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
        await client.query(
          `UPDATE "account" SET "password" = $1, "updatedAt" = NOW()
           WHERE "userId" = $2 AND "providerId" = 'credential'`,
          [passwordHash, rawId],
        )
      }
    } else {
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

  refresh()
  redirect(`${ADMIN_PATH}/konta`)
  return { ok: true }
}

export async function deleteAccount(fd: FormData) {
  const session = await requireAdmin()
  const userId = s(fd, 'id')
  if (!userId) return
  if (session.user.id === userId) return

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query<{ role: string }>(
      'SELECT "role" FROM "user" WHERE "id" = $1',
      [userId],
    )
    if (rows[0]?.role === 'admin') {
      const { rows: admins } = await client.query<{ count: string }>(
        `SELECT count(*)::text AS count FROM "user" WHERE "role" = 'admin'`,
      )
      if (Number(admins[0]?.count ?? 0) <= 1) {
        await client.query('ROLLBACK')
        return
      }
    }
    await client.query('DELETE FROM "user" WHERE "id" = $1', [userId])
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
  refresh()
  redirect(`${ADMIN_PATH}/konta`)
}

export async function resetAccountSecurity(fd: FormData) {
  await requireAdmin()
  const userId = s(fd, 'id')
  if (!userId) return

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM "passkey" WHERE "userId" = $1', [userId])
    await client.query('DELETE FROM "twoFactor" WHERE "userId" = $1', [userId])
    await client.query(
      'UPDATE "user" SET "twoFactorEnabled" = FALSE, "updatedAt" = NOW() WHERE "id" = $1',
      [userId],
    )
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }

  refresh()
  redirect(`${ADMIN_PATH}/konta/${encodeURIComponent(userId)}`)
}
