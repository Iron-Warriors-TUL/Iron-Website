import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { NextResponse } from 'next/server'
import { list } from '@vercel/blob'
import { getCmsSession } from '@/lib/admin'

export const dynamic = 'force-dynamic'

const IMAGE_RE = /\.(jpe?g|png|webp|avif)$/i

type MediaItem = { url: string; name: string; group: 'upload' | 'library' }

async function localFiles(dir: string, group: MediaItem['group'], toUrl: (file: string) => string) {
  try {
    const files = await readdir(join(process.cwd(), dir))
    return files
      .filter((file) => IMAGE_RE.test(file))
      .map<MediaItem>((file) => ({ url: toUrl(file), name: file, group }))
  } catch {
    return []
  }
}

/** Lista zdjęć dostępnych w CMS: ostatnie uploady (Blob / lokalne) oraz biblioteka w /public. */
export async function GET() {
  const session = await getCmsSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [uploads, library] = await Promise.all([
    localFiles('public/uploads', 'upload', (file) => `/api/uploads/${file}`),
    localFiles('public/images', 'library', (file) => `/images/${file}`),
  ])
  const items: MediaItem[] = [...uploads, ...library]

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: 'cms/', limit: 1000 })
      for (const blob of blobs) {
        if (!IMAGE_RE.test(blob.pathname)) continue
        items.unshift({
          url: `/api/media?pathname=${encodeURIComponent(blob.pathname)}`,
          name: blob.pathname.replace(/^cms\//, ''),
          group: 'upload',
        })
      }
    } catch (error) {
      console.error('[media-library] blob list failed', error)
    }
  }

  items.sort((a, b) => {
    if (a.group !== b.group) return a.group === 'upload' ? -1 : 1
    return a.name.localeCompare(b.name, 'pl')
  })

  return NextResponse.json({ items })
}
