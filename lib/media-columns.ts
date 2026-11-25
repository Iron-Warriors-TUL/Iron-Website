/** Czy etykieta kolumny oznacza zdjęcie/logo, dla którego warto pokazać bibliotekę mediów. */
export function isMediaColumn(label: string): boolean {
  return /obraz|zdję|logo|photo|image|graf|tło|galeri/i.test(label)
}
