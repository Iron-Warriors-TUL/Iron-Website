import { uploadImage } from '@/app/iw-panel-7k2q/actions'

/** Przesyła pojedynczy plik przez akcję serwerową i zwraca adres albo błąd. */
export function uploadImageFile(file: File): Promise<{ url?: string; error?: string }> {
  const fd = new FormData()
  fd.append('file', file)
  return uploadImage(fd)
}
