export type NavRelation = {
  id: number
  parentId: number | null
}

export type NavLike = NavRelation & { sortOrder: number }

export type NavNode<T extends NavLike> = T & { children: T[] }

/** Buduje dwupoziomowe drzewo nawigacji, zachowując kolejność sortowania. */
export function buildNavTree<T extends NavLike>(items: T[]): NavNode<T>[] {
  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
  return sorted
    .filter((item) => item.parentId === null)
    .map((item) => ({
      ...item,
      children: sorted.filter((child) => child.parentId === item.id),
    }))
}

/**
 * Sprawdza, czy przypisanie elementu do nowego rodzica nie utworzy cyklu
 * ani nie przekroczy limitu dwóch poziomów. Zwraca komunikat błędu lub null.
 */
export function validateNavParent<T extends NavRelation>(
  items: T[],
  itemId: number,
  newParentId: number | null,
): string | null {
  if (newParentId === null) return null

  const parent = items.find((item) => item.id === newParentId)
  if (!parent) return 'Nie znaleziono elementu nadrzędnego.'

  const visited = new Set<number>([itemId])
  let cursor: number | null = newParentId

  while (cursor !== null) {
    if (visited.has(cursor)) return 'Nie można utworzyć cyklu w nawigacji.'
    visited.add(cursor)
    cursor = items.find((item) => item.id === cursor)?.parentId ?? null
  }

  if (parent.parentId !== null) return 'Nawigacja ma maksymalnie dwa poziomy.'

  return null
}

/** Zwraca identyfikatory elementu oraz wszystkich jego potomków. */
export function collectDescendantIds<T extends NavRelation>(items: T[], rootId: number): number[] {
  const ids = new Set<number>([rootId])
  const queue = [rootId]

  while (queue.length > 0) {
    const current = queue.shift()!
    for (const child of items.filter((item) => item.parentId === current)) {
      if (!ids.has(child.id)) {
        ids.add(child.id)
        queue.push(child.id)
      }
    }
  }

  return [...ids]
}
