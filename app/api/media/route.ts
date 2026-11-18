import { type NextRequest, NextResponse } from 'next/server'
import { get } from '@vercel/blob'

// Serves CMS images (public site content) uploaded to the private Blob store.
export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get('pathname')
  if (!pathname || !/^cms\/[a-f0-9-]{36}\.(jpg|png|webp|avif)$/.test(pathname)) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const result = await get(pathname, {
      access: 'private',
      ifNoneMatch: request.headers.get('if-none-match') ?? undefined,
    })
    if (!result) return new NextResponse('Not found', { status: 404 })

    const headers = {
      ETag: result.blob.etag,
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    }
    if (result.statusCode === 304) return new NextResponse(null, { status: 304, headers })
    return new NextResponse(result.stream, { headers: { ...headers, 'Content-Type': result.blob.contentType } })
  } catch (e) {
    console.error('[media] error', e)
    return new NextResponse('Not found', { status: 404 })
  }
}
