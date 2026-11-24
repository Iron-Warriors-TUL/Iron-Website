export const PAGE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const RESERVED_PAGE_SLUGS = new Set([
  'blog',
  'bolidy',
  'projekty',
  'kontakt',
  'dolacz-do-nas',
  'zostan-partnerem',
  'rada-kol-naukowych-pl',
  'iw-panel-7k2q',
  'api',
  'images',
  'uploads',
])

/** Adresy zajmowane przez istniejące trasy, rewrite'y lub pliki publiczne. */
export function isReservedPageSlug(slug: string) {
  return RESERVED_PAGE_SLUGS.has(slug) || /^(zespol|partnerzy|projekty|eco-arrow)-/.test(slug)
}

/** Poprawny slug podstrony: małe litery, cyfry, myślniki i brak kolizji z istniejącymi trasami. */
export function isValidPageSlug(slug: string) {
  return PAGE_SLUG_PATTERN.test(slug) && !isReservedPageSlug(slug)
}
