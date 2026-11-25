import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { BLOCKS, blockCards, blockImages, blockStats, blockStr, createBlock, parseBlocks } from '../lib/blocks'

describe('parseBlocks', () => {
  it('zwraca pustą listę dla nieprawidłowego wejścia', () => {
    assert.deepEqual(parseBlocks('to nie jest json'), [])
    assert.deepEqual(parseBlocks(''), [])
    assert.deepEqual(parseBlocks(null), [])
    assert.deepEqual(parseBlocks(42), [])
    assert.deepEqual(parseBlocks({ type: 'text' }), [])
  })

  it('parsuje JSON i zachowuje znane bloki', () => {
    const blocks = parseBlocks(JSON.stringify([{ type: 'text', text: 'Cześć' }]))
    assert.equal(blocks.length, 1)
    assert.equal(blocks[0].type, 'text')
    assert.equal(blockStr(blocks[0], 'text'), 'Cześć')
    assert.equal(typeof blocks[0].id, 'string')
    assert.ok(blocks[0].id.length > 0)
  })

  it('odrzuca nieznane typy bloków', () => {
    assert.deepEqual(parseBlocks([{ type: 'evil', text: 'x' }]), [])
  })

  it('zachowuje podane id i uzupełnia brakujące pola wartościami domyślnymi', () => {
    const [block] = parseBlocks([{ id: 'abc', type: 'heading' }])
    assert.equal(block.id, 'abc')
    assert.equal(blockStr(block, 'level'), 'h2')
    assert.equal(blockStr(block, 'align'), 'left')
  })

  it('czyści niebezpieczne adresy obrazów i linków', () => {
    const [image] = parseBlocks([{ type: 'image', src: 'javascript:alert(1)', alt: 'x' }])
    assert.equal(blockStr(image, 'src'), '')
    const [cta] = parseBlocks([{ type: 'cta', href: 'javascript:alert(1)' }])
    assert.equal(blockStr(cta, 'href'), '')
  })

  it('przepuszcza ścieżki lokalne, kotwice i https', () => {
    const [cta] = parseBlocks([{ type: 'cta', href: '#sekcja' }])
    assert.equal(blockStr(cta, 'href'), '#sekcja')
    const [hero] = parseBlocks([{ type: 'hero', ctaHref: '/kontakt', image: '/images/a.jpg' }])
    assert.equal(blockStr(hero, 'ctaHref'), '/kontakt')
    assert.equal(blockStr(hero, 'image'), '/images/a.jpg')
  })

  it('ogranicza liczbę zdjęć w galerii i odrzuca błędne adresy', () => {
    const images = Array.from({ length: 40 }, (_, index) => `/images/${index}.jpg`)
    images.push('javascript:alert(1)')
    const [block] = parseBlocks([{ type: 'gallery', images }])
    const result = blockImages(block, 'images')
    assert.equal(result.length, 24)
    assert.ok(result.every((src) => src.startsWith('/images/')))
  })

  it('normalizuje statystyki i pomija puste wiersze', () => {
    const [block] = parseBlocks([
      { type: 'stats', items: [{ label: 'Moc', value: '120', unit: 'KM' }, 'x', { label: '', value: '' }, { label: 'Masa', value: '250' }] },
    ])
    const items = blockStats(block, 'items')
    assert.deepEqual(items, [
      { label: 'Moc', value: '120', unit: 'KM' },
      { label: 'Masa', value: '250', unit: '' },
    ])
  })

  it('normalizuje karty i odrzuca niebezpieczne linki', () => {
    const [block] = parseBlocks([
      {
        type: 'cards',
        items: [
          { image: '/images/a.jpg', title: 'A', text: 'Opis', href: 'javascript:alert(1)' },
          { image: 'https://example.com/b.jpg', title: 'B', href: '/kontakt' },
          'x',
        ],
      },
    ])
    const cards = blockCards(block, 'items')
    assert.equal(cards.length, 2)
    assert.equal(cards[0].image, '/images/a.jpg')
    assert.equal(cards[0].href, '')
    assert.equal(cards[1].image, 'https://example.com/b.jpg')
    assert.equal(cards[1].href, '/kontakt')
  })

  it('ogranicza liczbę bloków', () => {
    const many = Array.from({ length: 150 }, () => ({ type: 'divider' }))
    assert.equal(parseBlocks(many).length, 100)
  })
})

describe('createBlock', () => {
  it('każdy typ ma definicję i tworzy blok z domyślnymi polami', () => {
    for (const type of Object.keys(BLOCKS) as (keyof typeof BLOCKS)[]) {
      const block = createBlock(type)
      assert.equal(block.type, type)
      assert.equal(typeof block.id, 'string')
      for (const field of BLOCKS[type].fields) {
        assert.ok(field.name in block, `brak pola ${field.name} w bloku ${type}`)
      }
    }
  })

  it('nadaje unikalne identyfikatory', () => {
    assert.notEqual(createBlock('text').id, createBlock('text').id)
  })
})
