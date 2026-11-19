import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildNavTree, collectDescendantIds, validateNavParent, type NavLike } from '../lib/navigation'

const items: NavLike[] = [
  { id: 1, parentId: null, sortOrder: 2 },
  { id: 2, parentId: null, sortOrder: 1 },
  { id: 3, parentId: 1, sortOrder: 1 },
  { id: 4, parentId: 3, sortOrder: 1 },
  { id: 5, parentId: 2, sortOrder: 0 },
]

describe('buildNavTree', () => {
  it('sortuje rodziców według sortOrder i przypisuje dzieci', () => {
    const tree = buildNavTree(items)
    assert.deepEqual(
      tree.map((node) => node.id),
      [2, 1],
    )
    assert.deepEqual(
      tree[1].children.map((child) => child.id),
      [3],
    )
  })
})

describe('validateNavParent', () => {
  it('pozwala na element główny', () => {
    assert.equal(validateNavParent(items, 1, null), null)
  })

  it('blokuje ustawienie samego siebie jako rodzica', () => {
    assert.match(validateNavParent(items, 1, 1) ?? '', /cyklu/)
  })

  it('blokuje cykl dwupoziomowy', () => {
    assert.match(validateNavParent(items, 1, 3) ?? '', /cyklu/)
  })

  it('blokuje trzeci poziom nawigacji', () => {
    assert.match(validateNavParent(items, 9, 4) ?? '', /dwa poziomy/)
  })

  it('blokuje nieistniejącego rodzica', () => {
    assert.match(validateNavParent(items, 9, 999) ?? '', /Nie znaleziono/)
  })
})

describe('collectDescendantIds', () => {
  it('zbiera element oraz całe poddrzewo', () => {
    assert.deepEqual(new Set(collectDescendantIds(items, 1)), new Set([1, 3, 4]))
  })

  it('dla elementu bez dzieci zwraca tylko jego id', () => {
    assert.deepEqual(collectDescendantIds(items, 5), [5])
  })
})
