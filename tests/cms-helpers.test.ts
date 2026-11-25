import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { keysForYear, latestKey, nextRowId, seasonLabel, upsertCatalogPartner } from '../lib/cms-helpers'

describe('cms-helpers', () => {
  it('nadaje kolejne Id', () => {
    assert.equal(nextRowId([['c001'], ['c042'], ['x']], 'c'), 'c043')
    assert.equal(nextRowId([], 'p'), 'p001')
  })

  it('dopisuje partnera tylko raz', () => {
    const rows = [['c001', 'A', '/a.png', 'https://a.pl']]
    const first = upsertCatalogPartner(rows, { name: 'B', logo: '/b.png', href: '' })
    assert.equal(first.id, 'c002')
    assert.equal(first.rows.length, 2)
    const again = upsertCatalogPartner(first.rows, { name: 'B', logo: '/b.png', href: '' })
    assert.equal(again.added, false)
    assert.equal(again.id, 'c002')
  })

  it('wybiera najnowszy rocznik i porządkuje klucze', () => {
    assert.equal(latestKey(['2023', '2026', '2024']), '2026')
    assert.equal(latestKey(['2024-2025', '2025-2026']), '2025-2026')
    assert.deepEqual(keysForYear(['2026::1::0', '2025::0::0', '2026::0::1', '2026::0::0'], '2026'), [
      '2026::0::0',
      '2026::0::1',
      '2026::1::0',
    ])
    assert.equal(seasonLabel('2026-2027'), '2026/2027')
  })
})
