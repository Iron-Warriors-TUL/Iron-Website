/*
 * Podział ról w panelu CMS. Jedno źródło prawdy dla menu, stron i akcji serwerowych.
 *
 * Administrator: wszystko, co edytor, oraz konta i role, nawigacja (struktura menu),
 *   ustawienia witryny i reset 2FA innych osób.
 * Edytor: treść strony (teksty, osoby, zespoły, partnerzy, rekrutacja, stopka, podstrony),
 *   blog, bolidy, projekty i przesyłanie obrazów. Bez kont, nawigacji i ustawień.
 */

export type Role = 'admin' | 'editor'

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  editor: 'Edytor',
}

/** Obszary treści zmieniające strukturę lub ustawienia całej witryny. */
export const ADMIN_ONLY_CONTENT_AREAS = new Set(['settings'])

export function isRole(value: unknown): value is Role {
  return value === 'admin' || value === 'editor'
}

export function canEditContentArea(role: unknown, area: string) {
  if (role === 'admin') return true
  return role === 'editor' && !ADMIN_ONLY_CONTENT_AREAS.has(area)
}

export function canManageNavigation(role: unknown) {
  return role === 'admin'
}

export function canManageAccounts(role: unknown) {
  return role === 'admin'
}
