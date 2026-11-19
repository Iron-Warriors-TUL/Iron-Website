export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024

export function imageExtension(mimeType: string): string | null {
  return ALLOWED_IMAGE_TYPES[mimeType] ?? null
}

/** Podstawowa weryfikacja „magic bytes" — chroni przed zapisaniem dowolnego pliku jako obraz. */
export function hasValidImageSignature(bytes: Uint8Array, ext: string): boolean {
  if (bytes.length < 12) return false

  switch (ext) {
    case 'jpg':
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    case 'png':
      return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
    case 'webp':
      return (
        String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
        String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
      )
    case 'avif':
      return String.fromCharCode(...bytes.slice(4, 8)) === 'ftyp'
    default:
      return false
  }
}
