import { isHttpsUrl, isSafePath } from './safe-url'

/*
 * Model bloków treści używany zarówno przez panel (edytor bloków), jak i stronę
 * publiczną (renderer). Plik jest czysty (bez zależności serwerowych), dzięki
 * czemu działa w komponentach klienckich, serwerowych i w testach jednostkowych.
 */

export type BlockType =
  | 'hero'
  | 'pageHeader'
  | 'section'
  | 'about'
  | 'vehicleFeature'
  | 'partnerOffer'
  | 'teamSeason'
  | 'partnerSeason'
  | 'heading'
  | 'text'
  | 'image'
  | 'gallery'
  | 'cards'
  | 'list'
  | 'features'
  | 'stats'
  | 'specs'
  | 'achievements'
  | 'imageRow'
  | 'cta'
  | 'formCta'
  | 'contact'
  | 'vehicleList'
  | 'postList'
  | 'projectList'
  | 'youtube'
  | 'joinCta'
  | 'quote'
  | 'divider'

export type Block = { id: string; type: BlockType } & Record<string, unknown>

export type StatItem = { label: string; value: string; unit: string }

export type SpecItem = { label: string; value: string }

export type AchievementItem = { title: string; location: string; result: string; countryCode: string }

export type CardItem = { image: string; title: string; text: string; href: string }

type SelectOption = { value: string; label: string }

export type BlockField =
  | { name: string; label: string; type: 'text' | 'textarea' | 'url'; placeholder?: string; rows?: number; hint?: string }
  | { name: string; label: string; type: 'select'; options: SelectOption[]; hint?: string }
  | { name: string; label: string; type: 'checkbox'; hint?: string }
  | { name: string; label: string; type: 'image'; hint?: string }
  | { name: string; label: string; type: 'images'; hint?: string }
  | { name: string; label: string; type: 'stats'; hint?: string }
  | { name: string; label: string; type: 'specs'; hint?: string }
  | { name: string; label: string; type: 'achievements'; hint?: string }
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
const MAX_ROWS = 40

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
      { name: 'videoStart', label: 'Film — początek (s)', type: 'text', hint: 'Opcjonalnie, np. 0.' },
      { name: 'videoEnd', label: 'Film — koniec (s)', type: 'text', hint: 'Opcjonalnie, np. 41.' },
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
      videoStart: '',
      videoEnd: '',
      overlay: 'dark',
      ctaLabel: '',
      ctaHref: '',
    }),
  },
  pageHeader: {
    type: 'pageHeader',
    label: 'Nagłówek podstrony',
    description: 'Tytuł, opis i zdjęcie w tle — początek podstrony.',
    fields: [
      { name: 'title', label: 'Tytuł', type: 'text' },
      { name: 'subtitle', label: 'Opis', type: 'textarea', rows: 3 },
      { name: 'image', label: 'Zdjęcie tła', type: 'image' },
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
    defaults: () => ({ title: '', subtitle: '', image: '', align: 'left' }),
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
  about: {
    type: 'about',
    label: 'O nas — tekst, galeria i film',
    description: 'Sekcja z wstępem, dwiema kolumnami, galerią i filmem.',
    fields: [
      { name: 'heading', label: 'Nagłówek', type: 'text' },
      { name: 'top', label: 'Wstęp', type: 'textarea', rows: 5 },
      { name: 'left', label: 'Tekst lewy', type: 'textarea', rows: 8 },
      { name: 'right', label: 'Tekst prawy', type: 'textarea', rows: 8 },
      { name: 'images', label: 'Galeria', type: 'images' },
      { name: 'galleryAlt', label: 'Opis galerii (alt)', type: 'text' },
      { name: 'background', label: 'Zdjęcie tła', type: 'image' },
      { name: 'videoId', label: 'Film (ID YouTube)', type: 'text', hint: 'Np. lbf5afd5ik0.' },
    ],
    defaults: () => ({
      heading: '',
      top: '',
      left: '',
      right: '',
      images: [],
      galleryAlt: '',
      background: '',
      videoId: '',
    }),
  },
  vehicleFeature: {
    type: 'vehicleFeature',
    label: 'Bolid — sekcja',
    description: 'Nagłówek, parametry, opis i galeria jednego bolidu.',
    fields: [
      { name: 'slug', label: 'Slug bolidu (opcjonalnie)', type: 'text', hint: 'Np. eco-arrow-3. Puste = bieżąca sekcja bez powiązania.' },
      { name: 'heading', label: 'Nagłówek', type: 'text' },
      { name: 'background', label: 'Zdjęcie tła', type: 'image' },
      { name: 'stats', label: 'Parametry', type: 'stats' },
      { name: 'text', label: 'Opis', type: 'textarea', rows: 10 },
      { name: 'gallery', label: 'Galeria', type: 'images' },
    ],
    defaults: () => ({ slug: '', heading: '', background: '', stats: [], text: '', gallery: [] }),
  },
  partnerOffer: {
    type: 'partnerOffer',
    label: 'Oferta dla partnerów',
    description: 'Nagłówek, opis i przyciski oferty sponsorskiej oraz kontaktu.',
    fields: [
      { name: 'title', label: 'Tytuł', type: 'text' },
      { name: 'image', label: 'Zdjęcie tła', type: 'image' },
      { name: 'text', label: 'Opis', type: 'textarea', rows: 10 },
      { name: 'offerLabel', label: 'Przycisk oferty — tekst', type: 'text' },
      { name: 'contactLabel', label: 'Przycisk kontaktu — tekst', type: 'text' },
      { name: 'contactHref', label: 'Przycisk kontaktu — link', type: 'url', placeholder: '/kontakt' },
    ],
    defaults: () => ({
      title: '',
      image: '',
      text: '',
      offerLabel: 'Oferta sponsorska',
      contactLabel: 'Kontakt',
      contactHref: '/kontakt',
    }),
  },
  teamSeason: {
    type: 'teamSeason',
    label: 'Zespół — rocznik',
    description: 'Nagłówek i składy wybranego rocznika z biblioteki osób.',
    fields: [
      { name: 'year', label: 'Rocznik', type: 'text', hint: 'Np. 2025-2026. Musi istnieć w obszarze „Zespoły – sekcje”.' },
      { name: 'label', label: 'Etykieta rocznika', type: 'text' },
      { name: 'intro', label: 'Opis', type: 'textarea', rows: 6 },
      { name: 'heroBackground', label: 'Tło nagłówka', type: 'image' },
      { name: 'overlay', label: 'Kolor nakładki (hex)', type: 'text' },
      { name: 'seasonTag', label: 'Znacznik sezonu', type: 'select', options: [{ value: 'h2', label: 'H2' }, { value: 'h1', label: 'H1' }] },
      { name: 'jumps', label: 'Przyciski skoków', type: 'textarea', rows: 6, hint: 'Każda linia: Etykieta | Id sekcji' },
    ],
    defaults: () => ({
      year: '',
      label: '',
      intro: '',
      heroBackground: '',
      overlay: '#ffffffde',
      seasonTag: 'h2',
      jumps: '',
    }),
  },
  partnerSeason: {
    type: 'partnerSeason',
    label: 'Partnerzy — rocznik',
    description: 'Logotypy partnerów wybranego rocznika z katalogu partnerów.',
    fields: [
      { name: 'year', label: 'Rocznik', type: 'text', hint: 'Np. 2026. Musi istnieć w obszarze „Partnerzy – grupy”.' },
      { name: 'background', label: 'Tło nagłówka', type: 'image' },
      { name: 'bottomBackground', label: 'Tło dolnego paska', type: 'image' },
      { name: 'overlay', label: 'Kolor nakładki (hex)', type: 'text' },
      { name: 'plainImages', label: 'Zwykłe loga (bez kart)', type: 'checkbox' },
    ],
    defaults: () => ({
      year: '',
      background: '',
      bottomBackground: '',
      overlay: '#ffffffe8',
      plainImages: false,
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
  features: {
    type: 'features',
    label: 'Lista z obrazem',
    description: 'Nagłówek, lista punktów, zdjęcie i opcjonalny przycisk.',
    fields: [
      { name: 'heading', label: 'Nagłówek', type: 'text' },
      { name: 'intro', label: 'Wprowadzenie', type: 'textarea', rows: 4 },
      { name: 'items', label: 'Punkty', type: 'textarea', rows: 8, hint: 'Każdy punkt w nowej linii.' },
      { name: 'image', label: 'Zdjęcie', type: 'image' },
      { name: 'imageAlt', label: 'Opis zdjęcia (alt)', type: 'text' },
      {
        name: 'imagePosition',
        label: 'Położenie zdjęcia',
        type: 'select',
        options: [
          { value: 'right', label: 'Po prawej' },
          { value: 'left', label: 'Po lewej' },
          { value: 'below', label: 'Pod listą' },
        ],
      },
      { name: 'ctaLabel', label: 'Przycisk — tekst', type: 'text' },
      { name: 'ctaHref', label: 'Przycisk — link', type: 'url', placeholder: '/kontakt lub https://…' },
    ],
    defaults: () => ({
      heading: '',
      intro: '',
      items: '',
      image: '',
      imageAlt: '',
      imagePosition: 'right',
      ctaLabel: '',
      ctaHref: '',
    }),
  },
  stats: {
    type: 'stats',
    label: 'Liczby / statystyki',
    description: 'Siatka liczb (np. osiągnięcia, parametry).',
    fields: [
      { name: 'heading', label: 'Nagłówek (opcjonalnie)', type: 'text' },
      { name: 'subheading', label: 'Podtytuł (opcjonalnie)', type: 'text' },
      { name: 'items', label: 'Pozycje', type: 'stats' },
      { name: 'ctaLabel', label: 'Przycisk — tekst', type: 'text' },
      { name: 'ctaHref', label: 'Przycisk — link', type: 'url', placeholder: '/bolidy lub https://…' },
    ],
    defaults: () => ({ heading: '', subheading: '', items: [], ctaLabel: '', ctaHref: '' }),
  },
  specs: {
    type: 'specs',
    label: 'Tabela parametrów',
    description: 'Lista par: etykieta i wartość (np. dane techniczne, informacje o projekcie).',
    fields: [
      { name: 'heading', label: 'Nagłówek (opcjonalnie)', type: 'text' },
      { name: 'items', label: 'Wiersze', type: 'specs' },
    ],
    defaults: () => ({ heading: '', items: [] }),
  },
  achievements: {
    type: 'achievements',
    label: 'Osiągnięcia',
    description: 'Karty z flagą, nazwą, miejscem i wynikiem.',
    fields: [
      { name: 'heading', label: 'Nagłówek (opcjonalnie)', type: 'text' },
      { name: 'items', label: 'Osiągnięcia', type: 'achievements' },
    ],
    defaults: () => ({ heading: '', items: [] }),
  },
  imageRow: {
    type: 'imageRow',
    label: 'Rząd zdjęć / logotypów',
    description: 'Zdjęcia lub loga wyświetlone obok siebie, bez karuzeli.',
    fields: [{ name: 'images', label: 'Zdjęcia', type: 'images' }],
    defaults: () => ({ images: [] }),
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
  formCta: {
    type: 'formCta',
    label: 'Wezwanie do formularza',
    description: 'Duży przycisk formularza, nagłówek, opis i informacja dodatkowa.',
    fields: [
      { name: 'label', label: 'Przycisk — tekst', type: 'text' },
      { name: 'href', label: 'Przycisk — link', type: 'url', placeholder: 'https://forms…' },
      { name: 'heading', label: 'Nagłówek', type: 'text' },
      { name: 'intro', label: 'Opis', type: 'textarea', rows: 6 },
      { name: 'notice', label: 'Informacja dodatkowa', type: 'textarea', rows: 3 },
    ],
    defaults: () => ({
      label: 'Formularz zgłoszeniowy',
      href: '',
      heading: '',
      intro: '',
      notice: '',
    }),
  },
  contact: {
    type: 'contact',
    label: 'Kontakt — osoba i mapa',
    description: 'Dane osoby kontaktowej, zdjęcie, mapa i przycisk oferty sponsorskiej.',
    fields: [
      { name: 'title', label: 'Nagłówek', type: 'text' },
      { name: 'background', label: 'Zdjęcie tła', type: 'image' },
      { name: 'photo', label: 'Zdjęcie osoby', type: 'image' },
      { name: 'photoAlt', label: 'Opis zdjęcia (alt)', type: 'text' },
      { name: 'name', label: 'Imię i nazwisko', type: 'text' },
      { name: 'role', label: 'Stanowisko', type: 'text' },
      { name: 'email', label: 'Adres e-mail', type: 'text' },
      { name: 'sponsorText', label: 'Tekst przy ofercie', type: 'textarea', rows: 4 },
      { name: 'sponsorButtonLabel', label: 'Przycisk oferty — tekst', type: 'text' },
      { name: 'sponsorHref', label: 'Przycisk oferty — link', type: 'url', hint: 'Puste = link z „Ustawień strony”.' },
      { name: 'showMap', label: 'Pokaż mapę', type: 'checkbox' },
    ],
    defaults: () => ({
      title: '',
      background: '',
      photo: '',
      photoAlt: '',
      name: '',
      role: '',
      email: '',
      sponsorText: '',
      sponsorButtonLabel: 'Zobacz ofertę',
      sponsorHref: '',
      showMap: true,
    }),
  },
  vehicleList: {
    type: 'vehicleList',
    label: 'Lista bolidów',
    description: 'Bolidy z bazy z galeriami, opisami i przyciskami.',
    fields: [
      { name: 'heading', label: 'Nagłówek', type: 'text' },
      { name: 'lead', label: 'Wprowadzenie', type: 'textarea', rows: 3 },
      { name: 'slugs', label: 'Slugi bolidów', type: 'textarea', rows: 4, hint: 'Jeden slug w linii. Puste = wszystkie bolidy.' },
      { name: 'background', label: 'Zdjęcie tła', type: 'image' },
      { name: 'moreLabel', label: 'Etykieta przycisku', type: 'text' },
      { name: 'summaries', label: 'Własne opisy bolidów', type: 'textarea', rows: 5, hint: 'Każda linia: slug | opis. Puste = pierwszy akapit opisu bolidu.' },
      { name: 'galleries', label: 'Własne galerie bolidów', type: 'textarea', rows: 5, hint: 'Każda linia: slug | ścieżka zdjęcia. Puste = galeria z panelu „Bolidy”.' },
      { name: 'showGalleries', label: 'Pokaż galerie', type: 'checkbox' },
    ],
    defaults: () => ({
      heading: '',
      lead: '',
      slugs: '',
      background: '',
      moreLabel: 'Zobacz więcej',
      summaries: '',
      galleries: '',
      showGalleries: true,
    }),
  },
  postList: {
    type: 'postList',
    label: 'Lista wpisów bloga',
    description: 'Najnowsze opublikowane wpisy w siatce kart.',
    fields: [
      { name: 'heading', label: 'Nagłówek', type: 'text' },
      { name: 'lead', label: 'Wprowadzenie', type: 'textarea', rows: 3 },
      { name: 'limit', label: 'Liczba wpisów', type: 'text', placeholder: '6' },
      {
        name: 'columns',
        label: 'Kolumny',
        type: 'select',
        options: [
          { value: '2', label: '2 kolumny' },
          { value: '3', label: '3 kolumny' },
        ],
      },
      { name: 'allLabel', label: 'Link „wszystkie” — tekst', type: 'text' },
      { name: 'allHref', label: 'Link „wszystkie” — adres', type: 'url', placeholder: '/blog' },
    ],
    defaults: () => ({
      heading: '',
      lead: '',
      limit: '6',
      columns: '3',
      allLabel: '',
      allHref: '',
    }),
  },
  projectList: {
    type: 'projectList',
    label: 'Lista projektów',
    description: 'Kategorie projektów z Ustawień strony, z opisami i linkami.',
    fields: [
      { name: 'heading', label: 'Nagłówek', type: 'text' },
      { name: 'lead', label: 'Wprowadzenie', type: 'textarea', rows: 3 },
      { name: 'categories', label: 'Slugi kategorii', type: 'textarea', rows: 4, hint: 'Jeden slug w linii. Puste = wszystkie kategorie.' },
      { name: 'moreLabel', label: 'Etykieta linku', type: 'text' },
      { name: 'showImages', label: 'Pokaż obrazki', type: 'checkbox' },
    ],
    defaults: () => ({
      heading: '',
      lead: '',
      categories: '',
      moreLabel: 'Zobacz więcej',
      showImages: true,
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
  joinCta: {
    type: 'joinCta',
    label: 'Dołącz do nas',
    description: 'Sekcja z filmem w tle i przyciskami członka oraz partnera.',
    fields: [],
    defaults: () => ({}),
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

function sanitizeSpecs(raw: unknown, fallback: unknown): SpecItem[] {
  const source = Array.isArray(raw) ? raw : Array.isArray(fallback) ? fallback : []
  return source
    .slice(0, MAX_ROWS)
    .flatMap((row) => {
      if (!row || typeof row !== 'object') return []
      const item = row as Record<string, unknown>
      const label = typeof item.label === 'string' ? item.label.slice(0, 200) : ''
      const value = typeof item.value === 'string' ? item.value.slice(0, 300) : ''
      if (!label && !value) return []
      return [{ label, value }]
    })
}

function sanitizeAchievements(raw: unknown, fallback: unknown): AchievementItem[] {
  const source = Array.isArray(raw) ? raw : Array.isArray(fallback) ? fallback : []
  return source
    .slice(0, MAX_ROWS)
    .flatMap((row) => {
      if (!row || typeof row !== 'object') return []
      const item = row as Record<string, unknown>
      const title = typeof item.title === 'string' ? item.title.slice(0, 300) : ''
      const location = typeof item.location === 'string' ? item.location.slice(0, 200) : ''
      const result = typeof item.result === 'string' ? item.result.slice(0, 300) : ''
      const code = typeof item.countryCode === 'string' ? item.countryCode.toLowerCase() : ''
      const countryCode = /^[a-z]{2}$/.test(code) ? code : ''
      if (!title && !location && !result) return []
      return [{ title, location, result, countryCode }]
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
    case 'specs':
      return sanitizeSpecs(raw, fallback)
    case 'achievements':
      return sanitizeAchievements(raw, fallback)
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

export function blockSpecs(block: Block, key: string): SpecItem[] {
  const value = block[key]
  if (!Array.isArray(value)) return []
  return value.flatMap((row) => {
    if (!row || typeof row !== 'object') return []
    const item = row as Record<string, unknown>
    return [
      {
        label: typeof item.label === 'string' ? item.label : '',
        value: typeof item.value === 'string' ? item.value : '',
      },
    ]
  })
}

export function blockAchievements(block: Block, key: string): AchievementItem[] {
  const value = block[key]
  if (!Array.isArray(value)) return []
  return value.flatMap((row) => {
    if (!row || typeof row !== 'object') return []
    const item = row as Record<string, unknown>
    return [
      {
        title: typeof item.title === 'string' ? item.title : '',
        location: typeof item.location === 'string' ? item.location : '',
        result: typeof item.result === 'string' ? item.result : '',
        countryCode: typeof item.countryCode === 'string' ? item.countryCode : '',
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
