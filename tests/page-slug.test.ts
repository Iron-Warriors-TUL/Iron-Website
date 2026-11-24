import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { isReservedPageSlug, isValidPageSlug } from '../lib/page-slug'

describe('isValidPageSlug', () => {
  it('akceptuje poprawne adresy podstron', () => {
    assert.equal(isValidPageSlug('o-nas'), true)
    assert.equal(isValidPageSlug('2026'), true)
    assert.equal(isValidPageSlug('eco-arrow'), true)
    assert.equal(isValidPageSlug('nasze-projekty-2025'), true)
  })

  it('odrzuca niepoprawny format', () => {
    assert.equal(isValidPageSlug(''), false)
    assert.equal(isValidPageSlug('O-nas'), false)
    assert.equal(isValidPageSlug('o_nas'), false)
    assert.equal(isValidPageSlug('o nas'), false)
    assert.equal(isValidPageSlug('-o-nas'), false)
    assert.equal(isValidPageSlug('o-nas-'), false)
  })

  it('odrzuca adresy zajęte przez trasy, rewrite lub pliki', () => {
    assert.equal(isValidPageSlug('blog'), false)
    assert.equal(isValidPageSlug('kontakt'), false)
    assert.equal(isValidPageSlug('iw-panel-7k2q'), false)
    assert.equal(isValidPageSlug('zespol-2025-2026'), false)
    assert.equal(isValidPageSlug('partnerzy-2026'), false)
    assert.equal(isValidPageSlug('projekty-mnisw'), false)
    assert.equal(isValidPageSlug('eco-arrow-3'), false)
  })
})

describe('isReservedPageSlug', () => {
  it('rozpoznaje kolizje niezależnie od formatu', () => {
    assert.equal(isReservedPageSlug('blog'), true)
    assert.equal(isReservedPageSlug('zespol-2024-2025'), true)
    assert.equal(isReservedPageSlug('o-nas'), false)
  })
})
