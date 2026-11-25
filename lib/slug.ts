const PL_MAP: Record<string, string> = {
  ą: 'a',
  ć: 'c',
  ę: 'e',
  ł: 'l',
  ń: 'n',
  ó: 'o',
  ś: 's',
  ź: 'z',
  ż: 'z',
}

/** Zamienia nazwę strony na poprawny adres (slug): małe litery, cyfry i myślniki. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (char) => PL_MAP[char] ?? char)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
    .replace(/-+$/g, '')
}
