import { isHttpsUrl, isSafePath } from './safe-url'

/*
 * Lekki parser treści tekstowej używany przez Paragraphs. Pozwala wstawić zdjęcie
 * do zwykłego edytora tekstu: wystarczy osobna linia z adresem obrazu albo
 * znacznik Markdown `![opis](adres)`. Dzięki temu zdjęcie dodane w CMS jest
 * widoczne na stronie bez tworzenia osobnego bloku.
 */

export type InlineBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; src: string; alt: string }

const IMAGE_EXT = /\.(?:jpe?g|png|webp|avif|gif|svg)(?:[?#].*)?$/i
const MEDIA_ROUTE = /^\/api\/(?:uploads\/[^?#\s]+|media\?pathname=[^?#\s]+)$/i

function isImageSrc(value: string): boolean {
  if (!(isSafePath(value) || isHttpsUrl(value))) return false
  return IMAGE_EXT.test(value) || MEDIA_ROUTE.test(value)
}

function parseImageBlock(block: string): InlineBlock | null {
  const trimmed = block.trim()
  const markdown = /^!\[([^\]]*)\]\((\S+?)\)$/.exec(trimmed)
  if (markdown) {
    const src = markdown[2]
    if (!isImageSrc(src)) return null
    return { type: 'image', src, alt: markdown[1].slice(0, 300) }
  }
  if (!/\s/.test(trimmed) && isImageSrc(trimmed)) {
    return { type: 'image', src: trimmed, alt: '' }
  }
  return null
}

/** Dzieli tekst na akapity i bloki obrazów (obrazy muszą stać w osobnych akapitach). */
export function parseInlineContent(text: string): InlineBlock[] {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .flatMap<InlineBlock>((block) => {
      const image = parseImageBlock(block)
      return image ? [image] : [{ type: 'text', text: block }]
    })
}

/** Buduje znacznik Markdown dla obrazu wstawianego z biblioteki mediów. */
export function imageMarkdown(src: string, alt = 'Zdjęcie'): string {
  return `![${alt.replace(/[[\]]/g, '')}](${src})`
}
