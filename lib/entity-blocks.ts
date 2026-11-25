import type { Block, BlockType, SpecItem, StatItem } from './blocks'

/*
 * Konwersja klasycznych danych wpisów (blog, bolidy, projekty) na bloki.
 * Działa tylko wtedy, gdy wpis nie ma jeszcze własnych bloków, więc nie
 * nadpisuje pracy wykonanej w nowym edytorze.
 */

export type PostLike = { content: string }

export type VehicleLike = {
  description: string
  goal: string
  bestResult?: string | null
  specs: SpecItem[]
  stats: StatItem[]
  achievements: { title: string; location: string; result: string; countryCode?: string }[]
}

export type ProjectLike = {
  title: string
  program: string
  funding: string
  ownContribution: string | null
  totalValue: string | null
  period: string
  description: string
  heading: string
  imageUrls: string
}

function block(type: BlockType, id: string, values: Record<string, unknown>): Block {
  return { id, type, ...values } as Block
}

export function postBlocks(post: PostLike): Block[] {
  if (!post.content) return []
  return [block('text', 'post-content', { text: post.content })]
}

export function vehicleBlocks(vehicle: VehicleLike, gallery: string[] = []): Block[] {
  const blocks: Block[] = []

  if (vehicle.description) {
    blocks.push(block('text', 'vehicle-description', { text: vehicle.description }))
  }
  if (vehicle.specs.length > 0) {
    blocks.push(
      block('specs', 'vehicle-specs', {
        heading: 'Parametry techniczne',
        items: vehicle.specs,
      }),
    )
  }
  if (gallery.length > 0) {
    blocks.push(
      block('gallery', 'vehicle-gallery', {
        images: gallery,
        effect: 'fade',
        aspect: 'video',
      }),
    )
  }
  if (vehicle.stats.length > 0) {
    blocks.push(block('stats', 'vehicle-stats', { heading: '', subheading: '', items: vehicle.stats }))
  }
  if (vehicle.bestResult) {
    blocks.push(
      block('stats', 'vehicle-best-result', {
        heading: '',
        subheading: 'Najlepszy wynik',
        items: [{ label: '', value: vehicle.bestResult, unit: '' }],
      }),
    )
  }
  if (vehicle.achievements.length > 0) {
    if (blocks.length > 0) blocks.push(block('divider', 'vehicle-divider', {}))
    blocks.push(
      block('achievements', 'vehicle-achievements', {
        heading: 'Osiągnięcia',
        items: vehicle.achievements.map((achievement) => ({
          title: achievement.title,
          location: achievement.location,
          result: achievement.result,
          countryCode: achievement.countryCode ?? '',
        })),
      }),
    )
  }
  if (vehicle.goal) {
    blocks.push(block('quote', 'vehicle-goal', { text: vehicle.goal, author: '' }))
  }

  return blocks
}

export function projectBlocks(project: ProjectLike): Block[] {
  const blocks: Block[] = []
  const images = project.imageUrls
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (images.length > 0) {
    blocks.push(block('imageRow', 'project-images', { images }))
  }
  if (project.heading) {
    blocks.push(block('heading', 'project-heading', { text: project.heading, level: 'h2', align: 'center' }))
  }

  const items: SpecItem[] = [
    { label: 'Program', value: project.program },
    { label: 'Nazwa zadania', value: project.title },
    { label: 'Dofinansowanie', value: project.funding },
    { label: 'Wkład własny', value: project.ownContribution ?? '' },
    { label: 'Całkowita wartość', value: project.totalValue ?? '' },
    { label: 'Data realizacji', value: project.period },
  ].filter((item) => item.value)

  if (items.length > 0) {
    blocks.push(block('specs', 'project-specs', { heading: '', items }))
  }
  if (project.description) {
    blocks.push(block('text', 'project-description', { text: project.description }))
  }

  return blocks
}
