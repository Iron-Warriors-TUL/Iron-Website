import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { imageMarkdown, parseInlineContent } from '../lib/inline-content'

describe('parseInlineContent', () => {
  it('dzieli tekst na akapity', () => {
    assert.deepEqual(parseInlineContent('Pierwszy akapit.\n\nDrugi akapit.'), [
      { type: 'text', text: 'Pierwszy akapit.' },
      { type: 'text', text: 'Drugi akapit.' },
    ])
  })

  it('rozpoznaje zdjęcie jako osobną linię', () => {
    assert.deepEqual(parseInlineContent('Wstęp\n\n/images/team-1.jpg\n\nKoniec'), [
      { type: 'text', text: 'Wstęp' },
      { type: 'image', src: '/images/team-1.jpg', alt: '' },
      { type: 'text', text: 'Koniec' },
    ])
  })

  it('rozpoznaje znacznik Markdown z opisem', () => {
    assert.deepEqual(parseInlineContent('![Ekipa](/uploads/abc.png)'), [
      { type: 'image', src: '/uploads/abc.png', alt: 'Ekipa' },
    ])
  })

  it('obsługuje adresy https i trasy API mediów', () => {
    assert.deepEqual(parseInlineContent('https://example.com/a.jpg'), [
      { type: 'image', src: 'https://example.com/a.jpg', alt: '' },
    ])
    assert.deepEqual(parseInlineContent('/api/media?pathname=cms%2Fa.jpg'), [
      { type: 'image', src: '/api/media?pathname=cms%2Fa.jpg', alt: '' },
    ])
  })

  it('nie traktuje niebezpiecznych adresów ani zwykłego tekstu jak zdjęcia', () => {
    assert.deepEqual(parseInlineContent('javascript:alert(1)'), [
      { type: 'text', text: 'javascript:alert(1)' },
    ])
    assert.deepEqual(parseInlineContent('To nie jest zdjęcie.jpg'), [
      { type: 'text', text: 'To nie jest zdjęcie.jpg' },
    ])
  })
})

describe('imageMarkdown', () => {
  it('buduje znacznik Markdown i usuwa nawiasy z opisu', () => {
    assert.equal(imageMarkdown('/images/a.jpg', 'Zdjęcie [test]'), '![Zdjęcie test](/images/a.jpg)')
  })
})
