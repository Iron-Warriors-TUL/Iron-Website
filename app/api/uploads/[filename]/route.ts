import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { type NextRequest, NextResponse } from 'next/server'

const contentTypes: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
}

/**
 * Serwuje pliki wgrane przez CMS w trybie lokalnym. Next.js w trybie produkcyjnym
 * nie wykrywa plików dodanych do public/ po zbudowaniu aplikacji, dlatego
 * odczytujemy je bezpośrednio z dysku przez osobną trasę API.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params
  const match = /^[a-f0-9-]{36}\.(jpg|jpeg|png|webp|avif)$/.exec(filename)
  if (!match) return new NextResponse('Not found', { status: 404 })

  try {
    const bytes = await readFile(join(process.cwd(), 'public', 'uploads', filename))
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        'Content-Type': contentTypes[match[1]],
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
