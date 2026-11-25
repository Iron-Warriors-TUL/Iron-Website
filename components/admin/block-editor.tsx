'use client'

import { useRef, useState, type ReactNode } from 'react'
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  CalendarDays,
  Car,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Contact,
  Copy,
  FileText,
  FolderKanban,
  Handshake,
  Heading,
  Image as ImageIcon,
  Images,
  LayoutGrid,
  LayoutTemplate,
  List,
  ListChecks,
  Minus,
  MousePointerClick,
  Newspaper,
  PlayCircle,
  Plus,
  Quote,
  Sparkles,
  Trash2,
  Trophy,
  Type,
  UploadCloud,
  Video,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  BLOCKS,
  BLOCK_LIST,
  blockAchievements,
  blockCards,
  blockImages,
  blockSpecs,
  blockStats,
  blockStr,
  createBlock,
  parseBlocks,
  type AchievementItem,
  type Block,
  type BlockField,
  type BlockType,
  type CardItem,
  type SpecItem,
  type StatItem,
} from '@/lib/blocks'
import { imageMarkdown, parseInlineContent } from '@/lib/inline-content'
import { cn } from '@/lib/utils'
import { inputClass } from './fields'
import { ImageField } from './image-field'
import { MediaLibraryDialog } from './media-library-dialog'
import { ImageInsertButton } from './media-picker'
import { uploadImageFile } from './upload-image'

const ICONS: Record<BlockType, LucideIcon> = {
  hero: Sparkles,
  pageHeader: FileText,
  section: LayoutTemplate,
  about: Sparkles,
  vehicleFeature: Car,
  partnerOffer: Handshake,
  teamSeason: CalendarDays,
  partnerSeason: Handshake,
  heading: Heading,
  text: Type,
  image: ImageIcon,
  gallery: Images,
  cards: LayoutGrid,
  list: List,
  features: ListChecks,
  stats: BarChart3,
  specs: ListChecks,
  achievements: Trophy,
  imageRow: Images,
  cta: MousePointerClick,
  formCta: ClipboardList,
  contact: Contact,
  vehicleList: Car,
  postList: Newspaper,
  projectList: FolderKanban,
  youtube: Video,
  joinCta: PlayCircle,
  quote: Quote,
  fundingBar: Handshake,
  divider: Minus,
}

function BlockFieldBox({ field, children }: { field: BlockField; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{field.label}</span>
      {children}
      {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
    </div>
  )
}

function ImagesEditor({ value, onChange }: { value: string[]; onChange: (images: string[]) => void }) {
  const [open, setOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= value.length) return
    const next = [...value]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  async function upload(files: FileList | File[] | null) {
    if (!files) return
    const images = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (images.length === 0) {
      setError('Wybierz pliki graficzne (JPG, PNG, WEBP lub AVIF).')
      return
    }
    setError(null)
    setUploading(true)
    const urls: string[] = []
    try {
      for (const file of images) {
        const result = await uploadImageFile(file)
        if (result.url) urls.push(result.url)
        else if (result.error) setError(result.error)
      }
    } finally {
      setUploading(false)
    }
    if (urls.length > 0) onChange([...value, ...urls])
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          void upload(event.dataTransfer.files)
        }}
        className={cn(
          'relative rounded-md border-2 border-dashed p-2 transition-colors',
          dragging ? 'border-primary bg-primary/5' : 'border-transparent',
        )}
      >
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {value.map((src, index) => (
            <div key={`${src}-${index}`} className="group relative aspect-square overflow-hidden rounded-sm border border-border bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Przesuń w lewo"
                  className="rounded-sm p-1 text-white hover:bg-white/20 disabled:opacity-30"
                >
                  <ArrowUp className="size-4 -rotate-90" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  aria-label="Przesuń w prawo"
                  className="rounded-sm p-1 text-white hover:bg-white/20 disabled:opacity-30"
                >
                  <ArrowDown className="size-4 -rotate-90" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  aria-label="Usuń zdjęcie"
                  className="rounded-sm p-1 text-white hover:bg-destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-border px-1 text-center text-[11px] text-muted-foreground hover:border-primary hover:text-primary"
          >
            <Plus className="size-5" aria-hidden="true" />
            Dodaj zdjęcia
          </button>
        </div>
        {dragging && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-md bg-primary/10 text-primary">
            <UploadCloud className="size-7" aria-hidden="true" />
            <span className="text-sm font-semibold">Upuść zdjęcia</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary disabled:opacity-60"
        >
          <UploadCloud className="size-4" aria-hidden="true" />
          {uploading ? 'Przesyłanie…' : 'Prześlij z komputera'}
        </button>
        <span className="text-xs text-muted-foreground">
          {value.length} zdjęć · możesz też przeciągnąć pliki tutaj
        </span>
      </div>

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="sr-only"
        onChange={(event) => {
          void upload(event.target.files)
          event.target.value = ''
        }}
      />

      <MediaLibraryDialog
        open={open}
        multiple
        onClose={() => setOpen(false)}
        onSelect={(urls) => onChange([...value, ...urls])}
      />
    </div>
  )
}

function StatsEditor({ value, onChange }: { value: StatItem[]; onChange: (items: StatItem[]) => void }) {
  function update(index: number, patch: Partial<StatItem>) {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  return (
    <div className="flex flex-col gap-2">
      {value.map((item, index) => (
        <div key={index} className="grid grid-cols-[1fr_1fr_5rem_auto] items-center gap-2">
          <input
            value={item.label}
            onChange={(event) => update(index, { label: event.target.value })}
            placeholder="Etykieta"
            aria-label="Etykieta"
            className={inputClass}
          />
          <input
            value={item.value}
            onChange={(event) => update(index, { value: event.target.value })}
            placeholder="Wartość"
            aria-label="Wartość"
            className={inputClass}
          />
          <input
            value={item.unit}
            onChange={(event) => update(index, { unit: event.target.value })}
            placeholder="Jedn."
            aria-label="Jednostka"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
            aria-label="Usuń pozycję"
            className="rounded-sm p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { label: '', value: '', unit: '' }])}
        className="inline-flex w-fit items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary"
      >
        <Plus className="size-4" aria-hidden="true" />
        Dodaj pozycję
      </button>
    </div>
  )
}

function SpecsEditor({ value, onChange }: { value: SpecItem[]; onChange: (items: SpecItem[]) => void }) {
  function update(index: number, patch: Partial<SpecItem>) {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  return (
    <div className="flex flex-col gap-2">
      {value.map((item, index) => (
        <div key={index} className="grid grid-cols-[1fr_1.4fr_auto] items-center gap-2">
          <input
            value={item.label}
            onChange={(event) => update(index, { label: event.target.value })}
            placeholder="Etykieta"
            aria-label="Etykieta"
            className={inputClass}
          />
          <input
            value={item.value}
            onChange={(event) => update(index, { value: event.target.value })}
            placeholder="Wartość"
            aria-label="Wartość"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
            aria-label="Usuń wiersz"
            className="rounded-sm p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { label: '', value: '' }])}
        className="inline-flex w-fit items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary"
      >
        <Plus className="size-4" aria-hidden="true" />
        Dodaj wiersz
      </button>
    </div>
  )
}

function AchievementsEditor({
  value,
  onChange,
}: {
  value: AchievementItem[]
  onChange: (items: AchievementItem[]) => void
}) {
  function update(index: number, patch: Partial<AchievementItem>) {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  return (
    <div className="flex flex-col gap-2">
      {value.map((item, index) => (
        <div key={index} className="flex flex-col gap-2 rounded-md border border-border bg-background p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">Osiągnięcie {index + 1}</span>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              aria-label="Usuń osiągnięcie"
              className="rounded-sm p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={item.title}
              onChange={(event) => update(index, { title: event.target.value })}
              placeholder="Zawody / tytuł"
              aria-label="Zawody"
              className={inputClass}
            />
            <input
              value={item.location}
              onChange={(event) => update(index, { location: event.target.value })}
              placeholder="Miejsce"
              aria-label="Miejsce"
              className={inputClass}
            />
            <input
              value={item.result}
              onChange={(event) => update(index, { result: event.target.value })}
              placeholder="Wynik"
              aria-label="Wynik"
              className={inputClass}
            />
            <input
              value={item.countryCode}
              onChange={(event) => update(index, { countryCode: event.target.value })}
              placeholder="Kod flagi (pl, fr, gb…)"
              aria-label="Kod flagi"
              maxLength={2}
              className={inputClass}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { title: '', location: '', result: '', countryCode: '' }])}
        className="inline-flex w-fit items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary"
      >
        <Plus className="size-4" aria-hidden="true" />
        Dodaj osiągnięcie
      </button>
    </div>
  )
}

function CardsEditor({
  value,
  onChange,
  prefix,
}: {
  value: CardItem[]
  onChange: (items: CardItem[]) => void
  prefix: string
}) {
  function update(index: number, patch: Partial<CardItem>) {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= value.length) return
    const next = [...value]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      {value.map((card, index) => (
        <div key={index} className="flex flex-col gap-3 rounded-md border border-border bg-background p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">Karta {index + 1}</span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Przesuń kartę wyżej"
                className="rounded-sm p-1 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
              >
                <ArrowUp className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === value.length - 1}
                aria-label="Przesuń kartę niżej"
                className="rounded-sm p-1 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
              >
                <ArrowDown className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                aria-label="Usuń kartę"
                className="rounded-sm p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="shrink-0 sm:w-52">
              <ImageField
                name={`block-${prefix}-card-${index}-image`}
                label="Zdjęcie karty"
                defaultValue={card.image}
                onChange={(url) => update(index, { image: url })}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <input
                value={card.title}
                onChange={(event) => update(index, { title: event.target.value })}
                placeholder="Tytuł karty"
                aria-label="Tytuł karty"
                className={inputClass}
              />
              <textarea
                value={card.text}
                onChange={(event) => update(index, { text: event.target.value })}
                placeholder="Krótki opis"
                aria-label="Opis karty"
                rows={3}
                className={inputClass}
              />
              <input
                value={card.href}
                onChange={(event) => update(index, { href: event.target.value })}
                placeholder="Link (opcjonalnie), np. /kontakt"
                aria-label="Link karty"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { image: '', title: '', text: '', href: '' }])}
        className="inline-flex w-fit items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary"
      >
        <Plus className="size-4" aria-hidden="true" />
        Dodaj kartę
      </button>
    </div>
  )
}

function BlockFieldInput({
  block,
  field,
  onChange,
}: {
  block: Block
  field: BlockField
  onChange: (value: unknown) => void
}) {
  if (field.type === 'image') {
    return (
      <ImageField
        name={`block-${block.id}-${field.name}`}
        label={field.label}
        defaultValue={blockStr(block, field.name)}
        onChange={onChange}
      />
    )
  }

  if (field.type === 'images') {
    return (
      <BlockFieldBox field={field}>
        <ImagesEditor value={blockImages(block, field.name)} onChange={onChange} />
      </BlockFieldBox>
    )
  }

  if (field.type === 'stats') {
    return (
      <BlockFieldBox field={field}>
        <StatsEditor value={blockStats(block, field.name)} onChange={onChange} />
      </BlockFieldBox>
    )
  }

  if (field.type === 'specs') {
    return (
      <BlockFieldBox field={field}>
        <SpecsEditor value={blockSpecs(block, field.name)} onChange={onChange} />
      </BlockFieldBox>
    )
  }

  if (field.type === 'achievements') {
    return (
      <BlockFieldBox field={field}>
        <AchievementsEditor value={blockAchievements(block, field.name)} onChange={onChange} />
      </BlockFieldBox>
    )
  }

  if (field.type === 'cards') {
    return (
      <BlockFieldBox field={field}>
        <CardsEditor value={blockCards(block, field.name)} onChange={onChange} prefix={block.id} />
      </BlockFieldBox>
    )
  }

  if (field.type === 'checkbox') {
    return (
      <BlockFieldBox field={field}>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={block[field.name] === true}
            onChange={(event) => onChange(event.target.checked)}
            className="size-4 accent-[var(--primary)]"
          />
          Włączone
        </label>
      </BlockFieldBox>
    )
  }

  if (field.type === 'select') {
    return (
      <BlockFieldBox field={field}>
        <select
          value={blockStr(block, field.name)}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        >
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </BlockFieldBox>
    )
  }

  if (field.type === 'textarea') {
    const value = blockStr(block, field.name)
    const images = parseInlineContent(value).flatMap((item) => (item.type === 'image' ? [item] : []))
    return (
      <BlockFieldBox field={field}>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={field.rows ?? 5}
          className={inputClass}
        />
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 rounded-sm border border-border bg-secondary/40 p-2">
            {images.map((image, index) => (
              <div key={`${image.src}-${index}`} className="relative h-14 w-20 overflow-hidden rounded-sm border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.src} alt={image.alt} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end">
          <ImageInsertButton
            label="Wstaw zdjęcie do treści"
            onInsert={(url) => onChange(value ? `${value}\n\n${imageMarkdown(url)}` : imageMarkdown(url))}
          />
        </div>
      </BlockFieldBox>
    )
  }

  return (
    <BlockFieldBox field={field}>
      <input
        type="text"
        value={blockStr(block, field.name)}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        className={inputClass}
      />
    </BlockFieldBox>
  )
}

function BlockPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (type: BlockType) => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Dodaj blok">
      <button type="button" aria-label="Zamknij" onClick={onClose} className="absolute inset-0 cursor-default bg-black/60" />
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-md border border-border bg-background shadow-xl">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="text-base font-semibold">Dodaj blok</h2>
            <p className="text-xs text-muted-foreground">Wybierz sekcję, którą chcesz dodać do strony.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij"
            className="rounded-sm p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>
        <div className="grid gap-2 overflow-y-auto p-4 sm:grid-cols-2">
          {BLOCK_LIST.map((def) => {
            const Icon = ICONS[def.type]
            return (
              <button
                key={def.type}
                type="button"
                onClick={() => onPick(def.type)}
                className="flex items-start gap-3 rounded-sm border border-border bg-card p-3 text-left transition-colors hover:border-primary hover:bg-secondary"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-secondary text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">{def.label}</span>
                  <span className="text-xs text-muted-foreground">{def.description}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function BlockEditor({ initial }: { initial: unknown }) {
  const [blocks, setBlocks] = useState<Block[]>(() => parseBlocks(initial))
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [pickerOpen, setPickerOpen] = useState(false)

  function update(id: string, patch: Record<string, unknown>) {
    setBlocks((current) => current.map((block) => (block.id === id ? { ...block, ...patch } : block)))
  }

  function move(id: string, direction: -1 | 1) {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function remove(id: string) {
    setBlocks((current) => current.filter((block) => block.id !== id))
  }

  function duplicate(id: string) {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === id)
      if (index < 0) return current
      const copy: Block = { ...current[index], id: createBlock(current[index].type).id }
      const next = [...current]
      next.splice(index + 1, 0, copy)
      return next
    })
  }

  function add(type: BlockType) {
    const block = createBlock(type)
    setBlocks((current) => [...current, block])
    setCollapsed((current) => ({ ...current, [block.id]: false }))
    setPickerOpen(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name="blocks" value={JSON.stringify(blocks)} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Bloki strony</p>
          <p className="text-xs text-muted-foreground">
            {blocks.length === 0 ? 'Brak bloków — dodaj pierwszą sekcję.' : `${blocks.length} bloków — kolejność od góry do dołu.`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden="true" />
          Dodaj blok
        </button>
      </div>

      {blocks.length === 0 ? (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground hover:border-primary hover:text-primary"
        >
          <Plus className="size-6" aria-hidden="true" />
          Dodaj pierwszy blok
        </button>
      ) : (
        <ul className="flex flex-col gap-3">
          {blocks.map((block, index) => {
            const def = BLOCKS[block.type]
            const Icon = ICONS[block.type]
            const isCollapsed = collapsed[block.id] === true
            return (
              <li key={block.id} className="rounded-md border border-border bg-card">
                <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                  <span className="flex size-7 items-center justify-center rounded-sm bg-secondary text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{index + 1}</span>
                  <span className="text-sm font-semibold">{def.label}</span>
                  <div className="ml-auto flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => move(block.id, -1)}
                      disabled={index === 0}
                      aria-label="Przesuń wyżej"
                      title="Przesuń wyżej"
                      className="rounded-sm p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowUp className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(block.id, 1)}
                      disabled={index === blocks.length - 1}
                      aria-label="Przesuń niżej"
                      title="Przesuń niżej"
                      className="rounded-sm p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowDown className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicate(block.id)}
                      aria-label="Duplikuj blok"
                      title="Duplikuj"
                      className="rounded-sm p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Copy className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCollapsed((current) => ({ ...current, [block.id]: !isCollapsed }))}
                      aria-label={isCollapsed ? 'Rozwiń blok' : 'Zwiń blok'}
                      title={isCollapsed ? 'Rozwiń' : 'Zwiń'}
                      className="rounded-sm p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      {isCollapsed ? <ChevronDown className="size-4" aria-hidden="true" /> : <ChevronUp className="size-4" aria-hidden="true" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(block.id)}
                      aria-label="Usuń blok"
                      title="Usuń"
                      className="rounded-sm p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="flex flex-col gap-4 p-3">
                    {def.fields.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Ten blok nie ma ustawień.</p>
                    ) : (
                      def.fields.map((field) => (
                        <BlockFieldInput
                          key={field.name}
                          block={block}
                          field={field}
                          onChange={(value) => update(block.id, { [field.name]: value })}
                        />
                      ))
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <BlockPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={add} />
    </div>
  )
}
