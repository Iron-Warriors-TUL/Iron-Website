import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { defaultContent } from '../lib/content-registry'
import { parseBlocks } from '../lib/blocks'
import {
  becomePartnerBlocks,
  blogListBlocks,
  contactBlocks,
  customPageBlocks,
  homeBlocks,
  partnerYearBlocks,
  projectsListBlocks,
  recruitmentBlocks,
  teamYearBlocks,
  vehicleListBlocks,
} from '../lib/page-blocks'

const types = (blocks: { type: string }[]) => blocks.map((block) => block.type)

describe('page blocks', () => {
  it('buduje stronę główną z bloków i wyróżnionych bolidów', () => {
    const home = { ...defaultContent('home', 'main'), blocks: [] }
    const featured = [
      { slug: 'eco-arrow-3', data: defaultContent('home-vehicles', 'eco-arrow-3') },
      { slug: 'eco-arrow-2-electric', data: defaultContent('home-vehicles', 'eco-arrow-2-electric') },
    ]
    const blocks = parseBlocks(homeBlocks(home, featured))
    assert.deepEqual(types(blocks), [
      'hero',
      'about',
      'stats',
      'heading',
      'vehicleFeature',
      'vehicleFeature',
      'joinCta',
    ])
    assert.equal(blocks.filter((block) => block.type === 'vehicleFeature').length, 2)
  })

  it('przenosi klasyczne pola kontaktu i strony partnerskiej do bloków', () => {
    assert.deepEqual(types(contactBlocks(defaultContent('contact', 'main'))), ['contact'])
    assert.deepEqual(types(becomePartnerBlocks(defaultContent('become-partner', 'main'))), [
      'partnerOffer',
      'joinCta',
    ])
  })

  it('buduje rekrutację z formularza, list i działów', () => {
    const departments = [0, 1, 2].map((index) => defaultContent('recruitment-departments', String(index)))
    const blocks = parseBlocks(recruitmentBlocks(defaultContent('recruitment', 'main'), departments))
    assert.equal(blocks[0].type, 'formCta')
    assert.equal(blocks[1].type, 'features')
    assert.equal(blocks[2].type, 'features')
    assert.equal(blocks.filter((block) => block.type === 'section').length, departments.length)
    assert.equal(blocks.at(-1)?.type, 'joinCta')
  })

  it('tworzy listy bolidów, bloga i projektów', () => {
    assert.deepEqual(types(vehicleListBlocks(defaultContent('vehicle-list', 'main'))), ['vehicleList', 'joinCta'])
    assert.deepEqual(types(blogListBlocks()), ['pageHeader', 'postList'])
    assert.deepEqual(types(projectsListBlocks()), ['pageHeader', 'projectList', 'joinCta'])
  })

  it('zamienia klasyczną podstronę na nagłówek i treść', () => {
    const blocks = parseBlocks(customPageBlocks({ title: 'O nas', lead: 'Wstęp', content: 'Treść' }))
    assert.deepEqual(types(blocks), ['pageHeader', 'text'])
  })

  it('buduje strony roczników zespołu i partnerów', () => {
    assert.deepEqual(
      types(teamYearBlocks({ ...defaultContent('team-years', '2025-2026'), blocks: [] }, '2025-2026')),
      ['teamSeason', 'joinCta'],
    )
    assert.deepEqual(
      types(partnerYearBlocks({ ...defaultContent('partner-years', '2026'), blocks: [] }, '2026')),
      ['partnerSeason', 'joinCta'],
    )
  })
})
