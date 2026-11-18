'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { put } from '@vercel/blob'
import { z } from 'zod'
import { db } from '@/lib/db'
import { navItems, posts, projects, vehicles } from '@/lib/db/schema'
import { ADMIN_PATH, requireAdmin } from '@/lib/admin'

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
const imageUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === '' || v.startsWith('/') || /^https:\/\//.test(v), 'Nieprawidłowy adres obrazu')
  .transform((v) => (v === '' ? null : v))
const href = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine((v) => v.startsWith('/') || v.startsWith('#') || /^https?:\/\//.test(v), 'Link musi zaczynać się od /, # lub http(s)://')
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
  sortOrder: int,
  isButton: z.boolean(),
})

export async function saveNavItem(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin()
  try {
    const data = navSchema.parse({
      label: s(fd, 'label'),
      href: s(fd, 'href'),
      parentId: s(fd, 'parentId'),
      sortOrder: s(fd, 'sortOrder') || '0',
      isButton: bool(fd, 'isButton'),
    })
    const rawId = s(fd, 'id')
    if (rawId) {
      const itemId = id.parse(rawId)
      if (data.parentId === itemId) return { error: 'Element nie może być swoim rodzicem.' }
      await db.update(navItems).set(data).where(eq(navItems.id, itemId))
    } else {
      await db.insert(navItems).values(data)
    }
  } catch (e) {
    return fail(e)
  }
  refresh()
  return { ok: true }
}

export async function deleteNavItem(fd: FormData) {
  await requireAdmin()
  const itemId = id.parse(s(fd, 'id'))
  await db.delete(navItems).where(eq(navItems.parentId, itemId))
  await db.delete(navItems).where(eq(navItems.id, itemId))
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
  await requireAdmin()
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
  await requireAdmin()
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
  await requireAdmin()
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
      achievements: pipeLines(s(fd, 'achievements'), 3).map(([title, location, result]) => ({ title, location, result })),
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
  await requireAdmin()
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
  sortOrder: int,
})

export async function saveProject(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin()
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
  await requireAdmin()
  await db.delete(projects).where(eq(projects.id, id.parse(s(fd, 'id'))))
  refresh()
  redirect(`${ADMIN_PATH}/projekty`)
}

/* ---------- Image upload ---------- */

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}
const MAX_BYTES = 4 * 1024 * 1024

export async function uploadImage(fd: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin()
  const file = fd.get('file')
  if (!(file instanceof File)) return { error: 'Brak pliku.' }
  const ext = ALLOWED_TYPES[file.type]
  if (!ext) return { error: 'Dozwolone formaty: JPG, PNG, WEBP, AVIF.' }
  if (file.size > MAX_BYTES) return { error: 'Maksymalny rozmiar pliku to 4 MB.' }

  const pathname = `cms/${crypto.randomUUID()}.${ext}`
  try {
    const blob = await put(pathname, file, { access: 'private', contentType: file.type })
    return { url: `/api/media?pathname=${encodeURIComponent(blob.pathname)}` }
  } catch {
    try {
      const blob = await put(pathname, file, { access: 'public', contentType: file.type })
      return { url: blob.url }
    } catch (e) {
      console.error('[cms] upload failed', e)
      return { error: 'Nie udało się przesłać pliku.' }
    }
  }
}
