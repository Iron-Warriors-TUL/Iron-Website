import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { parseBlocks } from '../lib/blocks'
import { postBlocks, projectBlocks, vehicleBlocks } from '../lib/entity-blocks'

const types = (blocks: { type: string }[]) => blocks.map((block) => block.type)

describe('entity blocks', () => {
  it('zamienia treść wpisu bloga na blok tekstowy', () => {
    assert.deepEqual(types(postBlocks({ content: 'Cześć' })), ['text'])
    assert.deepEqual(postBlocks({ content: '' }), [])
  })

  it('buduje stronę bolidu z opisu, parametrów, galerii, statystyk i osiągnięć', () => {
    const blocks = parseBlocks(
      vehicleBlocks(
        {
          description: 'Opis bolidu',
          goal: 'Pobić rekord',
          bestResult: '837 km/l',
          specs: [{ label: 'Silnik', value: 'Honda' }],
          stats: [{ label: 'Moc', value: '1.6', unit: 'KM' }],
          achievements: [
            { title: 'Shell', location: 'Nogaro', result: '1. miejsce', countryCode: 'fr' },
          ],
        },
        ['/images/a.jpg'],
      ),
    )
    assert.deepEqual(types(blocks), [
      'text',
      'specs',
      'gallery',
      'stats',
      'stats',
      'divider',
      'achievements',
      'quote',
    ])
    assert.deepEqual(blocks.at(-1), {
      id: 'vehicle-goal',
      type: 'quote',
      text: 'Pobić rekord',
      author: '',
    })
  })

  it('buduje wpis projektu z obrazów, nagłówka, tabeli i opisu', () => {
    const blocks = parseBlocks(
      projectBlocks({
        title: 'Projekt',
        program: 'Program',
        funding: '10 000 zł',
        ownContribution: null,
        totalValue: null,
        period: '2026',
        description: 'Opis projektu',
        heading: 'Dofinansowanie',
        imageUrls: '/images/a.png\n/images/b.png',
      }),
    )
    assert.deepEqual(types(blocks), ['imageRow', 'heading', 'specs', 'text'])
    const specs = blocks.find((block) => block.type === 'specs')
    assert.ok(specs)
    assert.equal((specs.items as unknown[]).length, 4)
  })

  it('czyści wiersze parametrów i osiągnięć', () => {
    const [specs] = parseBlocks([{ type: 'specs', items: [{ label: 'A', value: 'B' }, { label: '', value: '' }] }])
    assert.deepEqual(specs.items, [{ label: 'A', value: 'B' }])
    const [achievements] = parseBlocks([
      { type: 'achievements', items: [{ title: 'A', location: 'B', result: 'C', countryCode: 'FR' }] },
    ])
    assert.deepEqual(achievements.items, [
      { title: 'A', location: 'B', result: 'C', countryCode: 'fr' },
    ])
  })
})
