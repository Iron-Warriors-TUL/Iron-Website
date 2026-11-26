import sharp from 'sharp'
import { MAX_IMAGE_BYTES } from './upload'

const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
}

const MAX_DIMENSIONS = [4096, 2560, 1600] as const

/**
 * Ponownie koduje obraz po stronie serwera: usuwa metadane, normalizuje orientację,
 * ogranicza wymiary i odrzuca pliki, które nie są prawdziwymi obrazami. Dzięki temu
 * samo poprawne „magic bytes” nie wystarczy, żeby zapisać spreparowany plik.
 */
export async function reencodeImage(bytes: Uint8Array, ext: string) {
  const contentType = CONTENT_TYPES[ext]
  if (!contentType) throw new Error('Unsupported image type')

  for (const dimension of MAX_DIMENSIONS) {
    let pipeline = sharp(Buffer.from(bytes), {
      failOn: 'error',
      limitInputPixels: 40_000_000,
      animated: false,
    })
      .rotate()
      .resize({ width: dimension, height: dimension, fit: 'inside', withoutEnlargement: true })

    switch (ext) {
      case 'jpg':
        pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true })
        break
      case 'png':
        pipeline = pipeline.png({ compressionLevel: 9, palette: true })
        break
      case 'webp':
        pipeline = pipeline.webp({ quality: 82 })
        break
      case 'avif':
        pipeline = pipeline.avif({ quality: 55 })
        break
    }

    const data = await pipeline.toBuffer()
    if (data.length <= MAX_IMAGE_BYTES) {
      return { data, contentType, extension: ext }
    }
  }

  throw new Error('Image is too large after re-encoding')
}
