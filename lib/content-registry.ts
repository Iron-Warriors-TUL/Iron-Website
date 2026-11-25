import {
  homeStats,
  homeVehicles,
  joinCta,
  aboutGallery,
  aboutLeft,
  aboutRight,
  aboutTop,
  becomePartnerPage,
  contactPage,
  footerAddress,
  footerCopyright,
  footerSocials,
  recruitmentPage,
  vehicleLayout,
  vehiclesPage,
} from '@/lib/page-content'
import {
  partners,
  recruitment,
  sponsorPdf,
  projectCategories,
  teamSectionOverlay,
  teams,
  type TeamSection,
} from '@/lib/site-content'

export type Data = Record<string, unknown>

export type Field =
  | { name: string; label: string; type: 'text' | 'url' | 'image'; hint?: string }
  | { name: string; label: string; type: 'textarea'; rows?: number; hint?: string }
  | { name: string; label: string; type: 'checkbox'; hint?: string }
  | { name: string; label: string; type: 'select'; options: string[]; hint?: string }
  | { name: string; label: string; type: 'lines'; columns: string[]; hint?: string }

export type ContentArea = {
  key: string
  label: string
  description?: string
  single?: boolean
  keys: string[]
  fields: Field[]
  defaults: (key: string) => Data
  entryLabel?: (key: string, data: Data) => string
}

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
const bool = (v: unknown) => v === true || v === 'true'

/* ---------- Biblioteki: elementy powtarzalne zdefiniowane raz ---------- */

type PersonCard = { key: string; name: string; photo: string; portrait: boolean }
type PartnerCard = { key: string; name: string; logo: string; href: string }

const personIndex = new Map<string, string>()
const people: PersonCard[] = []
for (const team of teams) {
  for (const section of team.sections) {
    for (const member of section.members) {
      const signature = `${member.name}|${member.photo}|${member.portrait ? 1 : 0}`
      if (personIndex.has(signature)) continue
      const key = `p${String(people.length + 1).padStart(3, '0')}`
      personIndex.set(signature, key)
      people.push({ key, name: member.name, photo: member.photo, portrait: Boolean(member.portrait) })
    }
  }
}

const partnerIndex = new Map<string, string>()
const partnerCards: PartnerCard[] = []
for (const year of partners) {
  for (const section of year.sections) {
    for (const group of section.groups) {
      for (const partner of group.items) {
        const signature = `${partner.name}|${partner.logo}|${partner.href}`
        if (partnerIndex.has(signature)) continue
        const key = `c${String(partnerCards.length + 1).padStart(3, '0')}`
        partnerIndex.set(signature, key)
        partnerCards.push({ key, name: partner.name, logo: partner.logo, href: partner.href })
      }
    }
  }
}

const personKey = (name: string, photo: string, portrait = false) =>
  personIndex.get(`${name}|${photo}|${portrait ? 1 : 0}`) ?? ''
const partnerKey = (name: string, logo: string, href: string) =>
  partnerIndex.get(`${name}|${logo}|${href}`) ?? ''

export const peopleDefaults: Data = {
  items: people.map((p) => [p.key, p.name, p.photo, p.portrait ? 'tak' : '']),
}

export const partnerCatalogDefaults: Data = {
  items: partnerCards.map((p) => [p.key, p.name, p.logo, p.href]),
}

/* ---------- Zespoły ---------- */

const teamYearKeys = teams.map((t) => t.year)
const teamSectionKeys = teams.flatMap((t) => t.sections.map((_, i) => `${t.year}::${i}`))

function teamYearDefaults(key: string): Data {
  const team = teams.find((t) => t.year === key)
  if (!team) return {}
  return {
    label: team.label,
    intro: team.intro,
    heroBackground: team.heroBackground,
    seasonTag: team.seasonTag,
    overlay: team.year === '2022-2023' ? '#ffffffcc' : '#ffffffde',
    jumps: team.jumps.map((j) => [j.label, j.id]),
  }
}

function teamSectionDefaults(key: string): Data {
  const [year, indexRaw] = key.split('::')
  const team = teams.find((t) => t.year === year)
  const section: TeamSection | undefined = team?.sections[Number(indexRaw)]
  if (!team || !section) return {}
  return {
    year,
    id: section.id ?? '',
    title: section.title ?? '',
    background: section.background ?? '',
    columns: String(section.columns),
    maxWidth: String(section.maxWidth ?? 1210),
    offset: String(section.offset ?? 0),
    overlay: teamSectionOverlay(section, team.year),
    members: section.members.map((m) => [
      personKey(m.name, m.photo, Boolean(m.portrait)),
      m.role ?? '',
    ]),
  }
}

/* ---------- Partnerzy ---------- */

const partnerYearKeys = partners.map((p) => p.year)
const partnerGroupKeys = partners.flatMap((y) =>
  y.sections.flatMap((s, si) => s.groups.map((_, gi) => `${y.year}::${si}::${gi}`)),
)

function partnerYearDefaults(key: string): Data {
  const year = partners.find((p) => p.year === key)
  if (!year) return {}
  return {
    background: year.background,
    bottomBackground: year.bottomBackground ?? '',
    overlay: year.overlay,
    plainImages: year.plainImages ?? false,
  }
}

function partnerGroupDefaults(key: string): Data {
  const [year, sectionRaw, groupRaw] = key.split('::')
  const y = partners.find((p) => p.year === year)
  const sectionIndex = Number(sectionRaw)
  const group = y?.sections[sectionIndex]?.groups[Number(groupRaw)]
  if (!y || !group) return {}
  return {
    year,
    sectionIndex: String(sectionIndex),
    title: y.sections[sectionIndex].title ?? '',
    columns: String(group.columns),
    height: String(group.height),
    items: group.items.map((p) => [partnerKey(p.name, p.logo, p.href)]),
  }
}

/* ---------- Strony ---------- */

const homeDefaults: Data = {
  heroVideoId: 'zlJS0_bf7zo',
  heroStart: '0',
  heroEnd: '41',
  heroPoster: '/images/iron-warriors-team.jpg',
  heroTitle: 'Iron Warriors Team',
  heroCtaLabel: 'O nas',
  heroCtaHref: '#firstFP',
  aboutHeading: 'O nas',
  aboutTop,
  aboutLeft,
  aboutRight,
  aboutGallery: aboutGallery.map((src) => [src]),
  aboutGalleryAlt: 'Zespół Iron Warriors',
  aboutBackground: '/images/team-2.jpg',
  aboutVideoId: 'lbf5afd5ik0',
  statsHeading: 'O nas w liczbach',
  statsSubheading: 'Nasze Rekordy',
  stats: homeStats.map((s) => [s.label, s.value, s.unit]),
  vehiclesHeading: 'Nasze bolidy',
  vehiclesLinkLabel: 'Nasze bolidy',
  vehiclesLinkHref: '/bolidy',
  featured: ['eco-arrow-3', 'eco-arrow-2-electric'].map((slug) => [slug]),
}

const vehiclesPageDefaults: Data = { ...vehiclesPage }
const becomePartnerDefaults: Data = { ...becomePartnerPage }
const ctaDefaults: Data = { ...joinCta }
const contactDefaults: Data = { ...contactPage }

const recruitmentDefaults: Data = {
  ...recruitment,
  gains: recruitment.gains.map((v) => [v]),
  expectations: recruitment.expectations.map((v) => [v]),
  formLabel: recruitmentPage.formLabel,
  heading: recruitmentPage.heading,
  gainsHeading: recruitmentPage.gainsHeading,
  expectationsHeading: recruitmentPage.expectationsHeading,
  gainsImage: recruitmentPage.gainsImage,
  gainsImageAlt: recruitmentPage.gainsImageAlt,
  expectationsImage: recruitmentPage.expectationsImage,
  expectationsImageAlt: recruitmentPage.expectationsImageAlt,
  heroImage: recruitmentPage.heroImage,
}

const footerDefaults: Data = {
  socials: footerSocials.map((s) => [s.label, s.href, s.icon]),
  address: footerAddress,
  copyright: footerCopyright,
  logo: '/images/12431645_1087304941293749_1342854788_n-removebg-preview-riqbwh2hpz3jazv6auesrscoodjxwgde3wxgi8mqkg.png',
}

const settingsDefaults: Data = {
  sponsorPdf,
  projectCategories: projectCategories.map((c) => [c.slug, c.title, c.description, c.image]),
}

/* ---------- Rejestr obszarów ---------- */

export const contentAreas: ContentArea[] = [
  {
    key: 'home',
    label: 'Strona główna',
    description: 'Nagłówek, sekcja „O nas\", liczby i lista wyróżnionych bolidów.',
    single: true,
    keys: ['main'],
    fields: [
      { name: 'heroVideoId', label: 'ID filmu tła', type: 'text', hint: 'Id z YouTube (bez parametrów).' },
      { name: 'heroStart', label: 'Początek odtwarzania (s)', type: 'text' },
      { name: 'heroEnd', label: 'Koniec fragmentu (s)', type: 'text' },
      { name: 'heroPoster', label: 'Obraz zastępczy filmu', type: 'image' },
      { name: 'heroTitle', label: 'Nagłówek główny', type: 'text' },
      { name: 'heroCtaLabel', label: 'Etykieta przycisku „O nas”', type: 'text' },
      { name: 'heroCtaHref', label: 'Link przycisku', type: 'text' },
      { name: 'aboutHeading', label: 'Nagłówek sekcji „O nas”', type: 'text' },
      { name: 'aboutTop', label: 'Wstęp', type: 'textarea', rows: 6 },
      { name: 'aboutLeft', label: 'Tekst lewy', type: 'textarea', rows: 8 },
      { name: 'aboutRight', label: 'Tekst prawy', type: 'textarea', rows: 8 },
      {
        name: 'aboutGallery', label: 'Galeria „O nas”', type: 'lines', columns: ['Ścieżka obrazu'],
        hint: 'Jeden obraz na linię. Ścieżka /images/... lub adres https://...',
      },
      { name: 'aboutGalleryAlt', label: 'Opis galerii', type: 'text' },
      { name: 'aboutBackground', label: 'Tło sekcji „O nas”', type: 'image' },
      { name: 'aboutVideoId', label: 'ID filmu w sekcji „O nas”', type: 'text' },
      { name: 'statsHeading', label: 'Nagłówek liczb', type: 'text' },
      { name: 'statsSubheading', label: 'Podtytuł liczb', type: 'text' },
      {
        name: 'stats', label: 'Liczby', type: 'lines', columns: ['Etykieta', 'Wartość', 'Jednostka'],
        hint: 'np. Rekord Polski | 837 | km/l',
      },
      { name: 'vehiclesHeading', label: 'Nagłówek sekcji bolidów', type: 'text' },
      { name: 'vehiclesLinkLabel', label: 'Etykieta linku do bolidów', type: 'text' },
      { name: 'vehiclesLinkHref', label: 'Link do bolidów', type: 'text' },
      {
        name: 'featured', label: 'Wyróżnione bolidy', type: 'lines', columns: ['Slug bolidu'],
        hint: 'Slugi z panelu „Bolidy”, np. eco-arrow-3.',
      },
    ],
    defaults: () => homeDefaults,
  },
  {
    key: 'home-vehicles',
    label: 'Bolidy na stronie głównej',
    description: 'Treści i galerie dwóch wyróżnionych bolidów.',
    keys: Object.keys(homeVehicles),
    fields: [
      { name: 'heading', label: 'Nagłówek', type: 'text' },
      { name: 'background', label: 'Tło sekcji', type: 'image' },
      { name: 'stats', label: 'Parametry', type: 'lines', columns: ['Etykieta', 'Wartość', 'Jednostka'] },
      { name: 'text', label: 'Opis', type: 'textarea', rows: 10 },
      { name: 'gallery', label: 'Galeria', type: 'lines', columns: ['Ścieżka obrazu'] },
    ],
    defaults: (key) => {
      const vehicle = homeVehicles[key]
      if (!vehicle) return {}
      return {
        heading: vehicle.heading,
        background: vehicle.background,
        text: vehicle.text,
        gallery: vehicle.gallery.map((src) => [src]),
        stats: vehicle.stats.map((stat) => [stat.label, stat.value, stat.unit]),
      }
    },
  },
  {
    key: 'people',
    label: 'Osoby',
    description: 'Biblioteka osób — zdefiniuj raz, używaj w sekcjach zespołów.',
    single: true,
    keys: ['main'],
    fields: [
      {
        name: 'items', label: 'Osoby', type: 'lines', columns: ['Id (nie zmieniaj)', 'Imię i nazwisko', 'Zdjęcie', 'Portret (tak)'],
        hint: 'Id służy do odwołań z sekcji zespołów. Nowe osoby dodawaj z wolnym Id, np. p122.',
      },
    ],
    defaults: () => peopleDefaults,
  },
  {
    key: 'team-years',
    label: 'Zespoły – roczniki',
    description: 'Nagłówki, opisy i przyciski skoków dla każdego roku.',
    keys: teamYearKeys,
    fields: [
      { name: 'label', label: 'Etykieta rocznika', type: 'text' },
      { name: 'intro', label: 'Opis', type: 'textarea', rows: 6 },
      { name: 'heroBackground', label: 'Tło nagłówka', type: 'image' },
      { name: 'seasonTag', label: 'Znacznik sezonu', type: 'select', options: ['h1', 'h2'] },
      { name: 'overlay', label: 'Kolor nakładki (hex)', type: 'text' },
      {
        name: 'jumps', label: 'Przyciski skoków', type: 'lines', columns: ['Etykieta', 'Id sekcji'],
        hint: 'Id sekcji bez #, np. zespolKierowcy.',
      },
    ],
    defaults: teamYearDefaults,
    entryLabel: (key, data) => str(data.label) || key,
  },
  {
    key: 'team-sections',
    label: 'Zespoły – sekcje',
    description: 'Grupy osób w poszczególnych rocznikach. Członkowie wybierani z biblioteki „Osoby”.',
    keys: teamSectionKeys,
    fields: [
      { name: 'year', label: 'Rocznik', type: 'text', hint: 'np. 2025-2026' },
      { name: 'id', label: 'Id sekcji (dla przycisków skoków)', type: 'text' },
      { name: 'title', label: 'Tytuł sekcji', type: 'text' },
      { name: 'background', label: 'Tło sekcji', type: 'image' },
      { name: 'columns', label: 'Liczba kolumn', type: 'select', options: ['1', '2', '3', '4', '5', '6'] },
      { name: 'maxWidth', label: 'Maksymalna szerokość (px)', type: 'text' },
      { name: 'offset', label: 'Puste kolumny wyrównania', type: 'text' },
      { name: 'overlay', label: 'Kolor nakładki (hex)', type: 'text' },
      {
        name: 'members', label: 'Członkowie sekcji', type: 'lines', columns: ['Id osoby', 'Rola w tej sekcji'],
        hint: 'Id osoby z biblioteki „Osoby”, np. p001. Rola może być pusta lub wieloliniowa.',
      },
    ],
    defaults: teamSectionDefaults,
    entryLabel: (key, data) => `${str(data.year) || key.split('::')[0]} — ${str(data.title) || 'bez tytułu'}`,
  },
  {
    key: 'partner-catalog',
    label: 'Katalog partnerów',
    description: 'Logo i linki partnerów — zdefiniuj raz, używaj w rocznikach.',
    single: true,
    keys: ['main'],
    fields: [
      {
        name: 'items', label: 'Partnerzy', type: 'lines', columns: ['Id (nie zmieniaj)', 'Nazwa', 'Logo', 'Link'],
        hint: 'Id nadaje się automatycznie po kliknięciu „Dodaj wiersz” i służy do odwołań z roczników.',
      },
    ],
    defaults: () => partnerCatalogDefaults,
  },
  {
    key: 'partner-years',
    label: 'Partnerzy – roczniki',
    description: 'Tła i ustawienia wyglądu dla każdego roku.',
    keys: partnerYearKeys,
    fields: [
      { name: 'background', label: 'Tło nagłówka', type: 'image' },
      { name: 'bottomBackground', label: 'Tło dolnego paska', type: 'image' },
      { name: 'overlay', label: 'Kolor nakładki (hex)', type: 'text' },
      { name: 'plainImages', label: 'Zwykłe loga (bez kart)', type: 'checkbox' },
    ],
    defaults: partnerYearDefaults,
    entryLabel: (key) => `Partnerzy ${key}`,
  },
  {
    key: 'partner-groups',
    label: 'Partnerzy – grupy',
    description: 'Układ i skład grup partnerów w poszczególnych rocznikach.',
    keys: partnerGroupKeys,
    fields: [
      { name: 'year', label: 'Rocznik', type: 'text' },
      { name: 'sectionIndex', label: 'Numer sekcji', type: 'text' },
      { name: 'title', label: 'Tytuł sekcji', type: 'text' },
      { name: 'columns', label: 'Liczba kolumn', type: 'select', options: ['2', '3', '4'] },
      { name: 'height', label: 'Wysokość karty', type: 'select', options: ['240', '291'] },
      {
        name: 'items', label: 'Partnerzy w grupie', type: 'lines', columns: ['Id partnera'],
        hint: 'Wybierz partnera z katalogu. Nowego partnera dodaj najpierw w „Partnerzy – katalog”.',
      },
    ],
    defaults: partnerGroupDefaults,
    entryLabel: (key, data) =>
      `${str(data.year) || key.split('::')[0]} · sekcja ${str(data.sectionIndex) || '?'} · ${str(data.title) || 'bez tytułu'}`,
  },
  {
    key: 'become-partner',
    label: 'Zostań partnerem',
    description: 'Treść strony ofertowej dla sponsorów.',
    single: true,
    keys: ['main'],
    fields: [
      { name: 'title', label: 'Nagłówek', type: 'text' },
      { name: 'image', label: 'Tło nagłówka', type: 'image' },
      { name: 'text', label: 'Opis', type: 'textarea', rows: 10 },
      { name: 'offerLabel', label: 'Etykieta przycisku oferty', type: 'text' },
      { name: 'contactLabel', label: 'Etykieta przycisku kontaktu', type: 'text' },
      { name: 'contactHref', label: 'Link kontaktu', type: 'text' },
    ],
    defaults: () => becomePartnerDefaults,
  },
  {
    key: 'cta',
    label: 'Przycisk „Dołącz do nas”',
    description: 'Sekcja z filmem i przyciskami powtarzająca się na końcu stron.',
    single: true,
    keys: ['main'],
    fields: [
      { name: 'videoId', label: 'ID filmu tła', type: 'text' },
      { name: 'start', label: 'Początek fragmentu (s)', type: 'text' },
      { name: 'end', label: 'Koniec fragmentu (s)', type: 'text' },
      { name: 'poster', label: 'Obraz zastępczy', type: 'image' },
      { name: 'heading', label: 'Nagłówek', type: 'text' },
      { name: 'memberLabel', label: 'Etykieta przycisku członka', type: 'text' },
      { name: 'memberHref', label: 'Link przycisku członka', type: 'text' },
      { name: 'partnerLabel', label: 'Etykieta przycisku partnera', type: 'text' },
      { name: 'partnerHref', label: 'Link przycisku partnera', type: 'text' },
    ],
    defaults: () => ctaDefaults,
  },
  {
    key: 'contact',
    label: 'Kontakt',
    description: 'Nagłówek, dane kontaktowe, zdjęcie i treść przy ofercie sponsorskiej. Link do oferty ustawiasz w „Ustawienia strony”.',
    single: true,
    keys: ['main'],
    fields: [
      { name: 'title', label: 'Nagłówek', type: 'text' },
      { name: 'background', label: 'Tło sekcji', type: 'image' },
      { name: 'photo', label: 'Zdjęcie osoby kontaktowej', type: 'image' },
      { name: 'photoAlt', label: 'Opis zdjęcia', type: 'text' },
      { name: 'name', label: 'Imię i nazwisko', type: 'text' },
      { name: 'role', label: 'Stanowisko', type: 'text' },
      { name: 'email', label: 'Adres e-mail', type: 'text' },
      { name: 'sponsorText', label: 'Tekst przy ofercie sponsorskiej', type: 'textarea', rows: 4 },
      { name: 'sponsorButtonLabel', label: 'Etykieta przycisku oferty', type: 'text' },
    ],
    defaults: () => contactDefaults,
  },
  {
    key: 'recruitment',
    label: 'Dołącz do nas',
    description: 'Opis rekrutacji, link do formularza i zdjęcia.',
    single: true,
    keys: ['main'],
    fields: [
      { name: 'formUrl', label: 'Link do formularza', type: 'url' },
      { name: 'formLabel', label: 'Etykieta przycisku', type: 'text' },
      { name: 'heading', label: 'Nagłówek', type: 'text' },
      { name: 'intro', label: 'Opis', type: 'textarea', rows: 10 },
      { name: 'notice', label: 'Informacja dodatkowa', type: 'textarea', rows: 3 },
      { name: 'gainsHeading', label: 'Nagłówek „Co zyskujesz?”', type: 'text' },
      { name: 'gains', label: 'Co zyskujesz', type: 'lines', columns: ['Punkt'] },
      { name: 'gainsImage', label: 'Zdjęcie przy liście korzyści', type: 'image' },
      { name: 'gainsImageAlt', label: 'Opis zdjęcia korzyści', type: 'text' },
      { name: 'expectationsHeading', label: 'Nagłówek „Czego oczekujemy?”', type: 'text' },
      { name: 'expectations', label: 'Czego oczekujemy', type: 'lines', columns: ['Punkt'] },
      { name: 'expectationsImage', label: 'Zdjęcie przy oczekiwaniach', type: 'image' },
      { name: 'expectationsImageAlt', label: 'Opis zdjęcia oczekiwań', type: 'text' },
      { name: 'heroImage', label: 'Tło nagłówka', type: 'image' },
    ],
    defaults: () => recruitmentDefaults,
  },
  {
    key: 'recruitment-departments',
    label: 'Dołącz do nas – działy',
    description: 'Opisy działów i sekcji w rekrutacji.',
    keys: recruitment.departments.map((_, i) => String(i)),
    fields: [
      { name: 'title', label: 'Nazwa działu', type: 'text' },
      { name: 'text', label: 'Opis', type: 'textarea', rows: 10 },
      { name: 'image', label: 'Zdjęcie', type: 'image' },
      { name: 'imageClassName', label: 'Proporcje zdjęcia (klasa CSS)', type: 'text' },
    ],
    defaults: (key) => ({
      title: recruitment.departments[Number(key)]?.title ?? '',
      text: recruitment.departments[Number(key)]?.text ?? '',
      image: recruitment.departments[Number(key)]?.image ?? '',
      imageClassName: recruitment.departments[Number(key)]?.imageClassName ?? '',
    }),
    entryLabel: (_key, data) => str(data.title) || 'Dział',
  },
  {
    key: 'vehicle-list',
    label: 'Bolidy – lista',
    description: 'Nagłówek, opisy i galerie na stronie z bolidami.',
    single: true,
    keys: ['main'],
    fields: [
      { name: 'heading', label: 'Nagłówek', type: 'text' },
      { name: 'background', label: 'Tło nagłówka', type: 'image' },
      {
        name: 'summaries', label: 'Opisy bolidów', type: 'lines', columns: ['Slug bolidu', 'Opis'],
        hint: 'Slug musi zgadzać się ze slugiem w panelu „Bolidy”.',
      },
      {
        name: 'galleries', label: 'Galerie bolidów', type: 'lines', columns: ['Slug bolidu', 'Ścieżka obrazu'],
      },
      { name: 'moreLabel', label: 'Etykieta przycisku „Zobacz więcej”', type: 'text' },
    ],
    defaults: () => vehiclesPageDefaults,
  },
  {
    key: 'vehicle-layout',
    label: 'Bolidy – galerie i układ',
    description: 'Galerie, proporcje zdjęcia głównego i układ osiągnięć.',
    keys: Object.keys(vehicleLayout),
    fields: [
      { name: 'gallery', label: 'Galeria', type: 'lines', columns: ['Ścieżka obrazu'] },
      {
        name: 'heroAspect', label: 'Proporcje zdjęcia głównego', type: 'select',
        options: ['', 'aspect-[2560/1006]', 'aspect-[2000/789]'],
        hint: 'Pusta wartość = nagłówek tekstowy.',
      },
      {
        name: 'achievementRows', label: 'Układ osiągnięć', type: 'text',
        hint: 'Liczby w wierszach, np. 3,4,4',
      },
    ],
    defaults: (key) => ({
      gallery: vehicleLayout[key]?.gallery.map((src) => [src]) ?? [],
      heroAspect: vehicleLayout[key]?.heroAspect ?? '',
      achievementRows: vehicleLayout[key]?.achievementRows ?? '',
    }),
  },
  {
    key: 'footer',
    label: 'Stopka',
    description: 'Logo, social media, adres i copyright.',
    single: true,
    keys: ['main'],
    fields: [
      { name: 'logo', label: 'Logo', type: 'image' },
      {
        name: 'socials', label: 'Social media', type: 'lines', columns: ['Nazwa', 'Link', 'Ikona'],
        hint: 'Ikonę wybierz z listy.',
      },
      { name: 'address', label: 'Adres', type: 'textarea', rows: 5 },
      { name: 'copyright', label: 'Copyright', type: 'text' },
    ],
    defaults: () => footerDefaults,
  },
  {
    key: 'pages',
    label: 'Dodatkowe podstrony',
    description: 'Twórz nowe podstrony pod własnym adresem (slug). Link dodasz w sekcji „Nawigacja”.',
    keys: [],
    fields: [
      { name: 'title', label: 'Tytuł strony', type: 'text' },
      { name: 'lead', label: 'Krótki wstęp (lead)', type: 'textarea', rows: 3 },
      { name: 'content', label: 'Treść strony', type: 'textarea', rows: 16, hint: 'Akapity oddzielaj pustą linią.' },
      { name: 'image', label: 'Obraz nagłówka', type: 'image' },
      { name: 'imageAlt', label: 'Opis obrazu (alt)', type: 'text' },
      { name: 'seoDescription', label: 'Opis SEO', type: 'textarea', rows: 3, hint: 'Wyświetlany w wynikach wyszukiwania.' },
      { name: 'published', label: 'Opublikowana', type: 'checkbox', hint: 'Odznacz, aby ukryć stronę bez usuwania treści.' },
    ],
    defaults: () => ({
      title: '',
      lead: '',
      content: '',
      image: '',
      imageAlt: '',
      seoDescription: '',
      published: true,
    }),
    entryLabel: (key, data) => str(data.title) || key,
  },
  {
    key: 'settings',
    label: 'Ustawienia strony',
    description: 'Oferta sponsorska i kategorie projektów.',
    single: true,
    keys: ['main'],
    fields: [
      { name: 'sponsorPdf', label: 'Link do oferty sponsorskiej', type: 'url' },
      {
        name: 'projectCategories', label: 'Kategorie projektów', type: 'lines',
        columns: ['Slug', 'Tytuł', 'Opis', 'Obraz'],
        hint: 'Slug musi zgadzać się z linkiem w nawigacji.',
      },
    ],
    defaults: () => settingsDefaults,
  },
]

export const contentAreaByKey = new Map(contentAreas.map((area) => [area.key, area]))

export function defaultContent(areaKey: string, entryKey: string): Data {
  const area = contentAreaByKey.get(areaKey)
  return area?.defaults(entryKey) ?? {}
}

export function defaultKeys(areaKey: string): string[] {
  return contentAreaByKey.get(areaKey)?.keys ?? []
}

export function linesToData(value: Data): Data {
  const out: Data = { ...value }
  for (const key of Object.keys(out)) {
    if (Array.isArray(out[key]) && Array.isArray((out[key] as unknown[])[0])) {
      out[key] = (out[key] as unknown[][]).map((row) => row.map((cell) => String(str(cell))))
    }
  }
  return out
}

export function asLines(value: unknown, columns: number): string[][] {
  if (!Array.isArray(value)) return []
  return value.slice(0, 200).map((row) => {
    const cells = Array.isArray(row) ? row : [row]
    return Array.from({ length: columns }, (_, i) => str(cells[i]))
  })
}

export function linesToString(value: unknown, columns: number): string {
  return asLines(value, columns)
    .map((row) => row.join(' | '))
    .join('\n')
}

export { arr, bool, str }
