import { isHttpsUrl, isSafePath } from './safe-url'

/*
 * Model bloków treści używany zarówno przez panel (edytor bloków), jak i stronę
 * publiczną (renderer). Plik jest czysty (bez zależności serwerowych), dzięki
 * czemu działa w komponentach klienckich, serwerowych i w testach jednostkowych.
 */

export type BlockType =
  | 'hero'
  | 'section'
  | 'heading'
  | 'text'
  | 'image'
  | 'gallery'
  | 'cards'
  | 'list'
  | 'stats'
  | 'cta'
  | 'youtube'
  | 'quote'
  | 'divider'

export type Block = { id: string; type: BlockType } & Record<string, unknown>

export type StatItem = { label: string; value: string; unit: string }

export type CardItem = { image: string; title: string; text: string; href: string }

type SelectOption = { value: string; label: string }

export type BlockField =
  | { name: string; label: string; type: 'text' | 'textarea' | 'url'; placeholder?: string; rows?: number; hint?: string }
  | { name: string; label: string; type: 'select'; options: SelectOption[]; hint?: string }
  | { name: string; label: string; type: 'checkbox'; hint?: string }
  | { name: string; label: string; type: 'image'; hint?: string }
  | { name: string; label: string; type: 'images'; hint?: string }
  | { name: string; label: string; type: 'stats'; hint?: string }
  | { name: string; label: string; type: 'cards'; hint?: string }

export type BlockDef = {
  type: BlockType
  label: string
  description: string
  fields: BlockField[]
  defaults: () => Record<string, unknown>
}

const MAX_BLOCKS = 100
const MAX_IMAGES = 24
const MAX_STATS = 12

export const BLOCKS: Record<BlockType, BlockDef> = {
  hero: {
    type: 'hero',
    label: 'Nagłówek z tłem',
    description: 'Duży tytuł na zdjęciu lub filmie — początek strony.',
    fields: [
      { name: 'title', label: 'Tytuł', type: 'text' },
      { name: 'subtitle', label: 'Podtytuł', type: 'textarea', rows: 3 },
      { name: 'image', label: 'Zdjęcie tła', type: 'image' },
      { name: 'videoId', label: 'Film w tle (ID YouTube)', type: 'text', hint: 'Np. dQw4w9WgXcQ. Ma pierwszeństwo przed zdjęciem.' },
      {
        name: 'overlay',
        label: 'Przyciemnienie tła',
        type: 'select',
        options: [
          { value: 'dark', label: 'Ciemne (biały tekst)' },
          { value: 'light', label: 'Jasne (ciemny tekst)' },
          { value: 'none', label: 'Brak' },
        ],
      },
      { name: 'ctaLabel', label: 'Przycisk — tekst', type: 'text' },
      { name: 'ctaHref', label: 'Przycisk — link', type: 'url', placeholder: '/kontakt lub https://…' },
    ],
    defaults: () => ({
      title: '',
      subtitle: '',
      image: '',
      videoId: '',
      overlay: 'dark',
      ctaLabel: '',
      ctaHref: '',
    }),
  },
  section: {
    type: 'section',
    label: 'Tekst + zdjęcie',
    description: 'Sekcja z nagłówkiem, tekstem i zdjęciem obok.',
    fields: [
      { name: 'heading', label: 'Nagłówek', type: 'text' },
      { name: 'lead', label: 'Krótkie wprowadzenie', type: 'textarea', rows: 2 },
      { name: 'text', label: 'Treść', type: 'textarea', rows: 8 },
      { name: 'image', label: 'Zdjęcie', type: 'image' },
      { name: 'imageAlt', label: 'Opis zdjęcia (alt)', type: 'text' },
      {
        name: 'imagePosition',
        label: 'Położenie zdjęcia',
        type: 'select',
        options: [
          { value: 'right', label: 'Po prawej' },
          { value: 'left', label: 'Po lewej' },
          { value: 'below', label: 'Pod tekstem' },
        ],
      },
      { name: 'ctaLabel', label: 'Przycisk — tekst', type: 'text' },
      { name: 'ctaHref', label: 'Przycisk — link', type: 'url', placeholder: '/kontakt lub https://…' },
    ],
    defaults: () => ({
      heading: '',
      lead: '',
      text: '',
      image: '',
      imageAlt: '',
      imagePosition: 'right',
      ctaLabel: '',
      ctaHref: '',
    }),
  },
  heading: {
    type: 'heading',
    label: 'Nagłówek sekcji',
    description: 'Krótki nagłówek oddzielający części strony.',
    fields: [
      { name: 'text', label: 'Treść nagłówka', type: 'text' },
      {
        name: 'level',
        label: 'Poziom',
        type: 'select',
        options: [
          { value: 'h2', label: 'H2' },
          { value: 'h1', label: 'H1' },
          { value: 'h3', label: 'H3' },
        ],
      },
      {
        name: 'align',
        label: 'Wyrównanie',
        type: 'select',
        options: [
          { value: 'left', label: 'Do lewej' },
          { value: 'center', label: 'Do środka' },
        ],
      },
    ],
    defaults: () => ({ text: '', level: 'h2', align: 'left' }),
  },
  text: {
    type: 'text',
    label: 'Treść',
    description: 'Akapit lub kilka akapitów tekstu.',
    fields: [{ name: 'text', label: 'Tekst', type: 'textarea', rows: 10 }],
    defaults: () => ({ text: '' }),
  },
  image: {
    type: 'image',
    label: 'Zdjęcie',
    description: 'Pojedyncze zdjęcie z podpisem.',
    fields: [
      { name: 'src', label: 'Zdjęcie', type: 'image' },
      { name: 'alt', label: 'Opis (alt)', type: 'text' },
      { name: 'caption', label: 'Podpis', type: 'text' },
      {
        name: 'width',
        label: 'Szerokość',
        type: 'select',
        options: [
          { value: 'wide', label: 'Pełna szerokość' },
          { value: 'narrow', label: 'Wąska (wyśrodkowana)' },
        ],
      },
      {
        name: 'aspect',
        label: 'Proporcje',
        type: 'select',
        options: [
          { value: 'video', label: '16:9' },
          { value: 'square', label: '1:1' },
          { value: 'wide', label: '21:9' },
          { value: 'portrait', label: '4:5' },
        ],
      },
    ],
    defaults: () => ({ src: '', alt: '', caption: '', width: 'wide', aspect: 'video' }),
  },
  gallery: {
    type: 'gallery',
    label: 'Galeria zdjęć',
    description: 'Karuzela wielu zdjęć.',
    fields: [
      { name: 'images', label: 'Zdjęcia', type: 'images' },
      {
        name: 'effect',
        label: 'Efekt',
        type: 'select',
        options: [
          { value: 'slide', label: 'Przesuwanie' },
          { value: 'fade', label: 'Przenikanie' },
        ],
      },
      {
        name: 'aspect',
        label: 'Proporcje',
        type: 'select',
        options: [
          { value: 'video', label: '16:9' },
          { value: 'square', label: '1:1' },
          { value: 'portrait', label: '4:5' },
        ],
      },
    ],
    defaults: () => ({ images: [], effect: 'slide', aspect: 'video' }),
  },
  cards: {
    type: 'cards',
    label: 'Karty',
    description: 'Siatka kart ze zdjęciem, tytułem i opisem.',
    fields: [
      { name: 'heading', label: 'Nagłówek (opcjonalnie)', type: 'text' },
      { name: 'items', label: 'Karty', type: 'cards', hint: 'Dodaj tyle kart, ile potrzebujesz.' },
    ],
    defaults: () => ({ heading: '', items: [] }),
  },
  list: {
    type: 'list',
    label: 'Lista punktowana',
    description: 'Prosta lista punktów.',
    fields: [
      { name: 'heading', label: 'Nagłówek (opcjonalnie)', type: 'text' },
      { name: 'items', label: 'Punkty', type: 'textarea', rows: 8, hint: 'Każdy punkt w nowej linii.' },
    ],
    defaults: () => ({ heading: '', items: '' }),
  },
  stats: {
    type: 'stats',
    label: 'Liczby / statystyki',
    description: 'Siatka liczb (np. osiągnięcia, parametry).',
    fields: [
      { name: 'heading', label: 'Nagłówek (opcjonalnie)', type: 'text' },
      { name: 'items', label: 'Pozycje', type: 'stats' },
    ],
    defaults: () => ({ heading: '', items: [] }),
  },
  cta: {
    type: 'cta',
    label: 'Wezwanie do działania',
    description: 'Nagłówek, tekst i przycisk.',
    fields: [
      { name: 'heading', label: 'Nagłówek', type: 'text' },
      { name: 'text', label: 'Tekst', type: 'textarea', rows: 4 },
      { name: 'label', label: 'Przycisk — tekst', type: 'text' },
      { name: 'href', label: 'Przycisk — link', type: 'url', placeholder: '/kontakt lub https://…' },
      {
        name: 'style',
        label: 'Styl przycisku',
        type: 'select',
        options: [
          { value: 'primary', label: 'Wypełniony' },
          { value: 'outline', label: 'Kontur' },
        ],
      },
    ],
    defaults: () => ({
      heading: '',
      text: '',
      label: 'Dowiedz się więcej',
      href: '/kontakt',
      style: 'primary',
    }),
  },
  youtube: {
    type: 'youtube',
    label: 'Film',
    description: 'Osadzony odtwarzacz YouTube.',
    fields: [
      { name: 'videoId', label: 'ID filmu', type: 'text', hint: 'Np. dQw4w9WgXcQ.' },
      { name: 'title', label: 'Tytuł (opcjonalnie)', type: 'text' },
    ],
    defaults: () => ({ videoId: '', title: '' }),
  },
  quote: {
    type: 'quote',
    label: 'Cytat',
    description: 'Wyróżniony cytat z podpisem.',
    fields: [
      { name: 'text', label: 'Cytat', type: 'textarea', rows: 4 },
      { name: 'author', label: 'Autor', type: 'text' },
    ],
    defaults: () => ({ text: '', author: '' }),
  },
  divider: {
    type: 'divider',
    label: 'Separator',
    description: 'Cienka linia oddzielająca sekcje.',
    fields: [],
    defaults: () => ({}),
  },
}

export const BLOCK_LIST: BlockDef[] = Object.values(BLOCKS)

function makeId(): string {
  const cryptoObj = globalThis.crypto
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') return cryptoObj.randomUUID()
  return `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

function isImageUrl(value: string): boolean {
  return isSafePath(value) || isHttpsUrl(value)
}

function isSafeLink(value: string): boolean {
  return isSafePath(value) || value.startsWith('#') || isHttpsUrl(value)
}

function sanitizeString(raw: unknown, fallback: unknown, max: number): string {
  const value = typeof raw === 'string' ? raw : typeof fallback === 'string' ? fallback : ''
  return value.slice(0, max)
}

function sanitizeImages(raw: unknown, fallback: unknown): string[] {
  const source = Array.isArray(raw) ? raw : Array.isArray(fallback) ? fallback : []
  return source
    .filter((item): item is string => typeof item === 'string' && item !== '' && isImageUrl(item))
    .map((item) => item.slice(0, 2000))
    .slice(0, MAX_IMAGES)
}

function sanitizeStats(raw: unknown, fallback: unknown): StatItem[] {
  const source = Array.isArray(raw) ? raw : Array.isArray(fallback) ? fallback : []
  return source
    .slice(0, MAX_STATS)
    .flatMap((row) => {
      if (!row || typeof row !== 'object') return []
      const item = row as Record<string, unknown>
      const label = typeof item.label === 'string' ? item.label.slice(0, 120) : ''
      const value = typeof item.value === 'string' ? item.value.slice(0, 60) : ''
      const unit = typeof item.unit === 'string' ? item.unit.slice(0, 40) : ''
      if (!label && !value) return []
      return [{ label, value, unit }]
    })
}

function sanitizeCards(raw: unknown, fallback: unknown): CardItem[] {
  const source = Array.isArray(raw) ? raw : Array.isArray(fallback) ? fallback : []
  return source
    .slice(0, 12)
    .flatMap((row) => {
      if (!row || typeof row !== 'object') return []
      const item = row as Record<string, unknown>
      const image = typeof item.image === 'string' && item.image !== '' && isImageUrl(item.image) ? item.image.slice(0, 2000) : ''
      const title = typeof item.title === 'string' ? item.title.slice(0, 160) : ''
      const text = typeof item.text === 'string' ? item.text.slice(0, 2000) : ''
      const href = typeof item.href === 'string' && item.href !== '' && isSafeLink(item.href) ? item.href.slice(0, 2000) : ''
      if (!image && !title && !text) return []
      return [{ image, title, text, href }]
    })
}

function sanitizeField(field: BlockField, raw: unknown, fallback: unknown): unknown {
  switch (field.type) {
    case 'checkbox':
      return typeof raw === 'boolean' ? raw : Boolean(fallback)
    case 'select': {
      const options = field.options.map((option) => option.value)
      const value = typeof raw === 'string' ? raw : typeof fallback === 'string' ? fallback : options[0] ?? ''
      return options.includes(value) ? value : options[0] ?? ''
    }
    case 'image': {
      const value = sanitizeString(raw, fallback, 2000)
      return value === '' || isImageUrl(value) ? value : ''
    }
    case 'images':
      return sanitizeImages(raw, fallback)
    case 'stats':
      return sanitizeStats(raw, fallback)
    case 'cards':
      return sanitizeCards(raw, fallback)
    case 'url': {
      const value = sanitizeString(raw, fallback, 2000)
      return value === '' || isSafeLink(value) ? value : ''
    }
    case 'textarea':
      return sanitizeString(raw, fallback, 50000)
    case 'text':
    default:
      return sanitizeString(raw, fallback, 4000)
  }
}

/** Tworzy nowy blok z domyślnymi wartościami i unikalnym identyfikatorem. */
export function createBlock(type: BlockType): Block {
  const def = BLOCKS[type]
  return { id: makeId(), type, ...def.defaults() } as Block
}

/**
 * Normalizuje dane bloków z formularza lub bazy. Przyjmuje tablicę albo JSON.
 * Odrzuca nieznane typy, czyści adresy i ogranicza rozmiary, więc dane z formularza
 * nigdy nie trafią do bazy w niekontrolowanej postaci.
 */
export function parseBlocks(input: unknown): Block[] {
  let raw: unknown = input
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return []
    try {
      raw = JSON.parse(trimmed)
    } catch {
      return []
    }
  }
  if (!Array.isArray(raw)) return []

  const blocks: Block[] = []
  for (const item of raw.slice(0, MAX_BLOCKS)) {
    if (!item || typeof item !== 'object') continue
    const source = item as Record<string, unknown>
    const type = source.type
    if (typeof type !== 'string' || !(type in BLOCKS)) continue

    const def = BLOCKS[type as BlockType]
    const defaults = def.defaults()
    const id = typeof source.id === 'string' && source.id ? source.id.slice(0, 64) : makeId()
    const block: Block = { id, type: def.type }
    for (const field of def.fields) {
      block[field.name] = sanitizeField(field, source[field.name], defaults[field.name])
    }
    blocks.push(block)
  }
  return blocks
}

export function blockStr(block: Block, key: string): string {
  const value = block[key]
  return typeof value === 'string' ? value : ''
}

export function blockBool(block: Block, key: string): boolean {
  return block[key] === true
}

export function blockImages(block: Block, key: string): string[] {
  const value = block[key]
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

export function blockStats(block: Block, key: string): StatItem[] {
  const value = block[key]
  if (!Array.isArray(value)) return []
  return value.flatMap((row) => {
    if (!row || typeof row !== 'object') return []
    const item = row as Record<string, unknown>
    return [
      {
        label: typeof item.label === 'string' ? item.label : '',
        value: typeof item.value === 'string' ? item.value : '',
        unit: typeof item.unit === 'string' ? item.unit : '',
      },
    ]
  })
}

export function blockCards(block: Block, key: string): CardItem[] {
  const value = block[key]
  if (!Array.isArray(value)) return []
  return value.flatMap((row) => {
    if (!row || typeof row !== 'object') return []
    const item = row as Record<string, unknown>
    return [
      {
        image: typeof item.image === 'string' ? item.image : '',
        title: typeof item.title === 'string' ? item.title : '',
        text: typeof item.text === 'string' ? item.text : '',
        href: typeof item.href === 'string' ? item.href : '',
      },
    ]
  })
}
