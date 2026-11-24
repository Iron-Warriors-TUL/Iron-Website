'use server'

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { put } from '@vercel/blob'
import { z } from 'zod'
import { db, pool } from '@/lib/db'
import { navItems, posts, projects, siteContent, user, vehicles } from '@/lib/db/schema'
import { contentAreaByKey, type Field } from '@/lib/content-registry'
import { ADMIN_PATH, requireAdmin, requireCms } from '@/lib/admin'
import { hashPassword } from 'better-auth/crypto'
import { collectDescendantIds, validateNavParent } from '@/lib/navigation'
import { hasValidImageSignature, imageExtension, MAX_IMAGE_BYTES } from '@/lib/upload'
import { isHttpsUrl, isSafePath } from '@/lib/safe-url'

export type FormState = { error?: string; ok?: boolean }

const str = (max: number) => z.string().trim().max(max)
const optStr = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === '' ? null : v))
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Slug jest wymagany')
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug: tylko małe litery, cyfry i myślniki')
// Ścieżka lokalna: pojedynczy '/' na początku (odrzuca protokołowo-względne '//host').
// Zewnętrzne adresy wyłącznie po HTTPS.
const imageUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === '' || isSafePath(v) || isHttpsUrl(v), 'Nieprawidłowy adres obrazu')
  .transform((v) => (v === '' ? null : v))
const href = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine(
    (v) => isSafePath(v) || v.startsWith('#') || isHttpsUrl(v),
    'Link musi być ścieżką (/...), kotwicą (#...) lub adresem https://',
  )
const int = z.coerce.number().int().min(-100000).max(100000)
const id = z.coerce.number().int().positive()

function pipeLines(raw: string, size: number) {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 50)
    .map((l) => {
      const parts = l.split('|').map((p) => p.trim().slice(0, 300))
      while (parts.length < size) parts.push('')
      return parts.slice(0, size)
    })
}

function fail(e: unknown): FormState {
  if (e instanceof z.ZodError) return { error: e.issues[0]?.message ?? 'Nieprawidłowe dane' }
  if (e instanceof Error && 'code' in e && (e as { code?: string }).code === '23505')
    return { error: 'Taki slug już istnieje.' }
  console.error('[cms] action error', e)
  return { error: 'Nie udało się zapisać zmian.' }
}

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

const bool = (fd: FormData, key: string) => fd.get(key) === 'on'
const s = (fd: FormData, key: string) => String(fd.get(key) ?? '')

/* ---------- Navigation ---------- */

const navSchema = z.object({
  label: str(60).min(1, 'Etykieta jest wymagana'),
  href,
  parentId: z
    .string()
    .transform((v) => (v === '' ? null : Number(v)))
    .pipe(z.number().int().positive().nullable()),
  isButton: z.boolean(),
})

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
  const direction = s(fd, 'direction') === 'up' ? -1 : 1
  const items = await db
    .select({ id: navItems.id, parentId: navItems.parentId, sortOrder: navItems.sortOrder })
    .from(navItems)
  const current = items.find((item) => item.id === itemId)
  if (!current) return

  const siblings = items
    .filter((item) => item.parentId === current.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
  const index = siblings.findIndex((item) => item.id === itemId)
  const targetIndex = index + direction
  if (index < 0 || targetIndex < 0 || targetIndex >= siblings.length) return

  const reordered = [...siblings]
  ;[reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]]

  await db.transaction(async (tx) => {
    for (const [position, item] of reordered.entries()) {
      await tx.update(navItems).set({ sortOrder: position * 10 }).where(eq(navItems.id, item.id))
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

const postSchema = z.object({
  slug,
  title: str(200).min(1, 'Tytuł jest wymagany'),
  excerpt: str(500),
  content: str(50000),
  coverImage: imageUrl,
  published: z.boolean(),
  publishedAt: z.coerce.date(),
})

export async function savePost(_: FormState, fd: FormData): Promise<FormState> {
  await requireCms()
  try {
    const data = postSchema.parse({
      slug: s(fd, 'slug'),
      title: s(fd, 'title'),
      excerpt: s(fd, 'excerpt'),
      content: s(fd, 'content'),
      coverImage: s(fd, 'coverImage'),
      published: bool(fd, 'published'),
      publishedAt: s(fd, 'publishedAt') || new Date().toISOString(),
    })
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

const vehicleSchema = z.object({
  slug,
  name: str(120).min(1, 'Nazwa jest wymagana'),
  debutYear: z
    .string()
    .transform((v) => (v === '' ? null : Number(v)))
    .pipe(z.number().int().min(1990).max(2100).nullable()),
  imageUrl,
  description: str(20000),
  goal: str(1000),
  bestResult: optStr(200),
  featured: z.boolean(),
  sortOrder: int,
})

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
      specs: pipeLines(s(fd, 'specs'), 2).map(([label, value]) => ({ label, value })),
      stats: pipeLines(s(fd, 'stats'), 3).map(([label, value, unit]) => ({ label, value, unit })),
      achievements: pipeLines(s(fd, 'achievements'), 4).map(([title, location, result, countryCode]) => ({
        title,
        location,
        result,
        countryCode: countryCode || undefined,
      })),
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

const projectSchema = z.object({
  category: str(120).min(1, 'Kategoria jest wymagana'),
  title: str(300).min(1, 'Tytuł jest wymagany'),
  program: str(300),
  funding: str(100),
  ownContribution: optStr(100),
  totalValue: optStr(100),
  period: str(50),
  description: str(10000),
  heading: str(500),
  imageUrls: str(4000),
  sortOrder: int,
})

export async function saveProject(_: FormState, fd: FormData): Promise<FormState> {
  await requireCms()
  try {
    const data = projectSchema.parse({
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
    })
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

function parseFieldValue(field: Field, raw: FormData): unknown {
  if (field.type === 'checkbox') return bool(raw, field.name)
  const value = s(raw, field.name)
  if (field.type === 'lines') {
    return value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 200)
      .map((line) => {
        const cells = line.split('|').map((part) => part.trim().slice(0, 8000))
        while (cells.length < field.columns.length) cells.push('')
        return cells.slice(0, field.columns.length)
      })
  }
  if (field.type === 'textarea') return value.slice(0, 100000)
  if (field.type === 'url' && value && !isHttpsUrl(value) && !isSafePath(value)) {
    throw new Error('Link musi zaczynać się od https:// lub /')
  }
  return value.slice(0, 4000)
}

export async function saveContent(_: FormState, fd: FormData): Promise<FormState> {
  await requireCms()
  try {
    const areaKey = s(fd, 'area')
    const entryKey = s(fd, 'entryKey')
    const area = contentAreaByKey.get(areaKey)
    if (!area) return { error: 'Nieznany obszar treści.' }
    if (!entryKey || entryKey.length > 120 || !/^[a-zA-Z0-9:_/-]+$/.test(entryKey)) {
      return { error: 'Nieprawidłowy klucz wpisu.' }
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
    if (e instanceof Error && e.message.startsWith('Link musi')) return { error: e.message }
    return fail(e)
  }
  refresh()
  return { ok: true }
}

const PAGE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const RESERVED_PAGE_SLUGS = new Set([
  'blog',
  'bolidy',
  'projekty',
  'kontakt',
  'dolacz-do-nas',
  'zostan-partnerem',
  'rada-kol-naukowych-pl',
  'iw-panel-7k2q',
  'api',
  'images',
  'uploads',
])
const isReservedPageSlug = (slug: string) =>
  RESERVED_PAGE_SLUGS.has(slug) || /^(zespol|partnerzy|projekty|eco-arrow)-/.test(slug)

export async function addContentEntry(fd: FormData) {
  await requireCms()
  const areaKey = s(fd, 'area')
  const entryKey = s(fd, 'entryKey').trim()
  const area = contentAreaByKey.get(areaKey)
  if (!area) return
  const backToArea = `${ADMIN_PATH}/tresc/${areaKey}`
  if (!entryKey || entryKey.length > 120 || !/^[a-zA-Z0-9:_/-]+$/.test(entryKey)) {
    redirect(`${backToArea}?error=key`)
  }
  if (areaKey === 'pages' && (!PAGE_SLUG.test(entryKey) || isReservedPageSlug(entryKey))) {
    redirect(`${backToArea}?error=slug`)
  }
  await db
    .insert(siteContent)
    .values({ area: areaKey, entryKey, data: {} })
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
  const name = s(fd, 'name').trim()
  const email = s(fd, 'email').trim().toLowerCase()
  const password = s(fd, 'password')
  const role = s(fd, 'role')
  const rawId = s(fd, 'id')

  if (!name || name.length > 80) return { error: 'Podaj prawidłowe imię i nazwisko.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return { error: 'Podaj prawidłowy adres e-mail.' }
  }
  if (role !== 'admin' && role !== 'editor') return { error: 'Nieprawidłowa rola.' }
  if (!rawId && password.length < 12) return { error: 'Hasło musi mieć co najmniej 12 znaków.' }
  if (rawId && password && password.length < 12) return { error: 'Nowe hasło musi mieć co najmniej 12 znaków.' }

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
