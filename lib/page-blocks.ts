import type { Block, BlockType, StatItem } from './blocks'
import type { Data } from './content-registry'

/*
 * Konwersja klasycznych danych strony (pola formularza, wartości domyślne)
 * na listę bloków. Dzięki temu każdą stronę można od tego momentu edytować
 * wyłącznie w edytorze bloków, a stare zapisy w bazie nadal wyglądają tak samo.
 */

const text = (value: unknown) => (typeof value === 'string' ? value : '')
const rows = (value: unknown): unknown[][] => (Array.isArray(value) ? (value as unknown[][]) : [])

function block(type: BlockType, id: string, values: Record<string, unknown>): Block {
  return { id, type, ...values } as Block
}

function statsFrom(value: unknown): StatItem[] {
  return rows(value).map((row) => ({
    label: String(row[0] ?? ''),
    value: String(row[1] ?? ''),
    unit: String(row[2] ?? ''),
  }))
}

function imagesFrom(value: unknown): string[] {
  return rows(value).map((row) => String(row[0] ?? '')).filter(Boolean)
}

function listText(value: unknown): string {
  return rows(value)
    .map((row) => String(row[0] ?? ''))
    .filter(Boolean)
    .join('\n')
}

function pairedText(value: unknown, separator = ' | '): string {
  return rows(value)
    .map((row) => row.map((cell) => String(cell ?? '').trim()).join(separator))
    .filter((line) => line.replaceAll(separator, '').trim() !== '')
    .join('\n')
}

export type FeaturedVehicle = { slug: string; data: Data }

export function homeBlocks(data: Data, featured: FeaturedVehicle[]): Block[] {
  const blocks: Block[] = [
    block('hero', 'home-hero', {
      title: text(data.heroTitle),
      subtitle: '',
      image: text(data.heroPoster),
      videoId: text(data.heroVideoId),
      videoStart: text(data.heroStart),
      videoEnd: text(data.heroEnd),
      overlay: 'dark',
      ctaLabel: text(data.heroCtaLabel),
      ctaHref: text(data.heroCtaHref),
    }),
    block('about', 'home-about', {
      heading: text(data.aboutHeading),
      top: text(data.aboutTop),
      left: text(data.aboutLeft),
      right: text(data.aboutRight),
      images: imagesFrom(data.aboutGallery),
      galleryAlt: text(data.aboutGalleryAlt),
      background: text(data.aboutBackground),
      videoId: text(data.aboutVideoId),
    }),
    block('stats', 'home-stats', {
      heading: text(data.statsHeading),
      subheading: text(data.statsSubheading),
      items: statsFrom(data.stats),
      ctaLabel: text(data.vehiclesLinkLabel),
      ctaHref: text(data.vehiclesLinkHref),
    }),
  ]

  if (featured.length > 0) {
    blocks.push(
      block('heading', 'home-vehicles-heading', {
        text: text(data.vehiclesHeading),
        level: 'h2',
        align: 'left',
      }),
    )
    for (const vehicle of featured) {
      blocks.push(
        block('vehicleFeature', `home-vehicle-${vehicle.slug}`, {
          slug: vehicle.slug,
          heading: text(vehicle.data.heading),
          background: text(vehicle.data.background),
          stats: statsFrom(vehicle.data.stats),
          text: text(vehicle.data.text),
          gallery: imagesFrom(vehicle.data.gallery),
        }),
      )
    }
  }

  blocks.push(block('joinCta', 'home-join', {}))
  return blocks
}

export function contactBlocks(data: Data): Block[] {
  return [
    block('contact', 'contact-main', {
      title: text(data.title),
      background: text(data.background),
      photo: text(data.photo),
      photoAlt: text(data.photoAlt),
      name: text(data.name),
      role: text(data.role),
      email: text(data.email),
      sponsorText: text(data.sponsorText),
      sponsorButtonLabel: text(data.sponsorButtonLabel),
      sponsorHref: '',
      showMap: true,
    }),
  ]
}

export function recruitmentBlocks(data: Data, departments: Data[]): Block[] {
  const blocks: Block[] = [
    block('formCta', 'recruitment-form', {
      label: text(data.formLabel),
      href: text(data.formUrl),
      heading: text(data.heading),
      intro: text(data.intro),
      notice: text(data.notice),
    }),
    block('features', 'recruitment-gains', {
      heading: text(data.gainsHeading),
      intro: '',
      items: listText(data.gains),
      image: text(data.gainsImage),
      imageAlt: text(data.gainsImageAlt),
      imagePosition: 'right',
      ctaLabel: '',
      ctaHref: '',
    }),
    block('features', 'recruitment-expectations', {
      heading: text(data.expectationsHeading),
      intro: '',
      items: listText(data.expectations),
      image: text(data.expectationsImage),
      imageAlt: text(data.expectationsImageAlt),
      imagePosition: 'left',
      ctaLabel: '',
      ctaHref: '',
    }),
  ]

  departments.forEach((department, index) => {
    blocks.push(
      block('section', `recruitment-department-${index}`, {
        heading: text(department.title),
        lead: '',
        text: text(department.text),
        image: text(department.image),
        imageAlt: text(department.title),
        imagePosition: index % 2 === 0 ? 'left' : 'right',
        ctaLabel: '',
        ctaHref: '',
      }),
    )
  })

  blocks.push(block('joinCta', 'recruitment-join', {}))
  return blocks
}

export function becomePartnerBlocks(data: Data): Block[] {
  return [
    block('partnerOffer', 'become-partner-main', {
      title: text(data.title),
      image: text(data.image),
      text: text(data.text),
      offerLabel: text(data.offerLabel),
      contactLabel: text(data.contactLabel),
      contactHref: text(data.contactHref),
    }),
    block('joinCta', 'become-partner-join', {}),
  ]
}

export function vehicleListBlocks(data: Data): Block[] {
  return [
    block('vehicleList', 'vehicle-list-main', {
      heading: text(data.heading),
      lead: '',
      slugs: '',
      background: text(data.background),
      moreLabel: text(data.moreLabel) || 'Zobacz więcej',
      summaries: pairedText(data.summaries),
      galleries: pairedText(data.galleries),
      showGalleries: true,
    }),
    block('joinCta', 'vehicle-list-join', {}),
  ]
}

export function blogListBlocks(): Block[] {
  return [
    block('pageHeader', 'blog-header', {
      title: 'Blog',
      subtitle: 'Aktualności z życia zespołu Iron Warriors.',
      image: '/images/team-1.jpg',
      align: 'left',
    }),
    block('postList', 'blog-list', {
      heading: '',
      lead: '',
      limit: '',
      columns: '3',
      allLabel: '',
      allHref: '',
    }),
  ]
}

export function projectsListBlocks(): Block[] {
  return [
    block('pageHeader', 'projects-header', {
      title: 'Projekty',
      subtitle: '',
      image: '/images/eco-arrow-3-3.jpg',
      align: 'center',
    }),
    block('projectList', 'projects-list', {
      heading: '',
      lead: '',
      categories: '',
      moreLabel: 'Zobacz więcej',
      showImages: true,
    }),
    block('joinCta', 'projects-join', {}),
  ]
}

export function customPageBlocks(data: Data): Block[] {
  const title = text(data.title)
  const lead = text(data.lead)
  const image = text(data.image)
  const content = text(data.content)
  const blocks: Block[] = []
  if (title || lead || image) {
    blocks.push(
      block('pageHeader', 'page-header', {
        title,
        subtitle: lead,
        image,
        align: 'left',
      }),
    )
  }
  if (content) blocks.push(block('text', 'page-content', { text: content }))
  return blocks
}

export function teamYearBlocks(data: Data, year: string): Block[] {
  return [
    block('teamSeason', 'team-season-main', {
      year,
      label: text(data.label),
      intro: text(data.intro),
      heroBackground: text(data.heroBackground),
      overlay: text(data.overlay),
      seasonTag: text(data.seasonTag) || 'h2',
      jumps: rows(data.jumps)
        .map((row) => `${String(row[0] ?? '')} | ${String(row[1] ?? '')}`)
        .filter((line) => line.trim() !== '|')
        .join('\n'),
    }),
    block('joinCta', 'team-season-join', {}),
  ]
}

export function partnerYearBlocks(data: Data, year: string): Block[] {
  return [
    block('partnerSeason', 'partner-season-main', {
      year,
      background: text(data.background),
      bottomBackground: text(data.bottomBackground),
      overlay: text(data.overlay),
      plainImages: data.plainImages === true,
    }),
    block('joinCta', 'partner-season-join', {}),
  ]
}
