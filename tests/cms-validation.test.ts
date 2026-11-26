import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { z } from 'zod'
import type { Field } from '../lib/content-registry'
import {
  ContentFieldError,
  fail,
  isValidEntryKey,
  navSchema,
  parseAccountInput,
  parseFieldValue,
  parseVehicleLists,
  pipeLines,
  postSchema,
  projectSchema,
  reorderNavSiblings,
  vehicleSchema,
} from '../lib/cms-validation'

function form(values: Record<string, string>) {
  const fd = new FormData()
  for (const [key, value] of Object.entries(values)) fd.set(key, value)
  return fd
}

describe('navSchema', () => {
  it('akceptuje ścieżkę, kotwicę i https', () => {
    for (const href of ['/kontakt', '#o-nas', 'https://example.com']) {
      const data = navSchema.parse({ label: 'Kontakt', href, parentId: '', isButton: false })
      assert.equal(data.href, href)
      assert.equal(data.parentId, null)
    }
  })

  it('zamienia parentId na liczbę', () => {
    const data = navSchema.parse({ label: 'A', href: '/a', parentId: '7', isButton: true })
    assert.equal(data.parentId, 7)
  })

  it('odrzuca niebezpieczne linki i pustą etykietę', () => {
    for (const href of ['javascript:alert(1)', 'http://example.com', '//evil.com']) {
      assert.throws(() => navSchema.parse({ label: 'A', href, parentId: '', isButton: false }))
    }
    assert.throws(() => navSchema.parse({ label: '  ', href: '/a', parentId: '', isButton: false }))
  })
})

describe('postSchema', () => {
  const base = {
    slug: 'Nowy-Wpis',
    title: 'Tytuł',
    excerpt: '',
    content: 'Treść',
    coverImage: '',
    published: true,
    publishedAt: '2026-01-01',
  }

  it('normalizuje slug i puste zdjęcie', () => {
    const data = postSchema.parse(base)
    assert.equal(data.slug, 'nowy-wpis')
    assert.equal(data.coverImage, null)
    assert.ok(data.publishedAt instanceof Date)
  })

  it('odrzuca zły slug i niebezpieczny adres zdjęcia', () => {
    assert.throws(() => postSchema.parse({ ...base, slug: 'zły slug' }))
    assert.throws(() => postSchema.parse({ ...base, coverImage: 'javascript:alert(1)' }))
  })
})

describe('vehicleSchema', () => {
  const base = {
    slug: 'eco-arrow-4',
    name: 'Eco Arrow 4',
    debutYear: '2026',
    imageUrl: '/images/a.jpg',
    description: '',
    goal: '',
    bestResult: '',
    featured: false,
    sortOrder: '0',
  }

  it('parsuje rok debiutu i puste pola opcjonalne', () => {
    const data = vehicleSchema.parse(base)
    assert.equal(data.debutYear, 2026)
    assert.equal(data.bestResult, null)
    assert.equal(vehicleSchema.parse({ ...base, debutYear: '' }).debutYear, null)
  })

  it('odrzuca rok spoza zakresu', () => {
    assert.throws(() => vehicleSchema.parse({ ...base, debutYear: '1800' }))
    assert.throws(() => vehicleSchema.parse({ ...base, debutYear: 'abc' }))
  })
})

describe('projectSchema', () => {
  it('wymaga kategorii i tytułu', () => {
    const base = {
      category: 'MNiSW',
      title: 'Projekt',
      program: '',
      funding: '',
      ownContribution: '',
      totalValue: '',
      period: '',
      description: '',
      heading: '',
      imageUrls: '',
      fundingBar: false,
      fundingBarText: '',
      fundingBarLogo: '',
      sortOrder: '5',
    }
    assert.equal(projectSchema.parse(base).sortOrder, 5)
    assert.equal(projectSchema.parse(base).fundingBarLogo, '')
    assert.equal(projectSchema.parse({ ...base, fundingBarLogo: '/images/logo-mnisw.png' }).fundingBarLogo, '/images/logo-mnisw.png')
    assert.throws(() => projectSchema.parse({ ...base, fundingBarLogo: 'javascript:alert(1)' }))
    assert.throws(() => projectSchema.parse({ ...base, category: '' }))
    assert.throws(() => projectSchema.parse({ ...base, title: '' }))
  })
})

describe('pipeLines / parseVehicleLists', () => {
  it('dzieli wiersze, przycina i dopełnia kolumny', () => {
    assert.deepEqual(pipeLines(' a | b \n\n c ', 3), [
      ['a', 'b', ''],
      ['c', '', ''],
    ])
  })

  it('ogranicza liczbę wierszy do 50', () => {
    assert.equal(pipeLines(Array.from({ length: 80 }, (_, i) => `w${i}`).join('\n'), 1).length, 50)
  })

  it('buduje listy bolidu', () => {
    const lists = parseVehicleLists(
      form({
        specs: 'Masa | 30 kg',
        stats: 'Spalanie | 500 | km/l',
        achievements: 'Shell Eco | Nogaro | 1. miejsce | fr\nInny | X | 2.',
      }),
    )
    assert.deepEqual(lists.specs, [{ label: 'Masa', value: '30 kg' }])
    assert.deepEqual(lists.stats, [{ label: 'Spalanie', value: '500', unit: 'km/l' }])
    assert.equal(lists.achievements[0].countryCode, 'fr')
    assert.equal(lists.achievements[1].countryCode, undefined)
  })
})

describe('reorderNavSiblings', () => {
  const items = [
    { id: 1, parentId: null, sortOrder: 10 },
    { id: 2, parentId: null, sortOrder: 20 },
    { id: 3, parentId: null, sortOrder: 30 },
    { id: 4, parentId: 1, sortOrder: 10 },
  ]

  it('zamienia z sąsiadem i renumeruje', () => {
    assert.deepEqual(reorderNavSiblings(items, 2, 'up'), [
      { id: 2, sortOrder: 0 },
      { id: 1, sortOrder: 10 },
      { id: 3, sortOrder: 20 },
    ])
  })

  it('nie rusza elementów skrajnych ani nieistniejących', () => {
    assert.equal(reorderNavSiblings(items, 1, 'up'), null)
    assert.equal(reorderNavSiblings(items, 3, 'down'), null)
    assert.equal(reorderNavSiblings(items, 4, 'down'), null)
    assert.equal(reorderNavSiblings(items, 99, 'up'), null)
  })
})

describe('isValidEntryKey', () => {
  it('akceptuje dozwolone znaki', () => {
    assert.equal(isValidEntryKey('home:hero'), true)
    assert.equal(isValidEntryKey('zespol/2025-2026_a'), true)
  })

  it('odrzuca puste, za długie i dziwne klucze', () => {
    assert.equal(isValidEntryKey(''), false)
    assert.equal(isValidEntryKey('a'.repeat(121)), false)
    assert.equal(isValidEntryKey('<script>'), false)
    assert.equal(isValidEntryKey('a b'), false)
  })
})

describe('parseFieldValue', () => {
  it('obsługuje checkbox, lines i textarea', () => {
    const fd = form({ on: 'on', rows: 'a | b | c\nd', long: 'x'.repeat(200_000) })
    assert.equal(parseFieldValue({ name: 'on', label: '', type: 'checkbox' }, fd), true)
    assert.equal(parseFieldValue({ name: 'missing', label: '', type: 'checkbox' }, fd), false)
    assert.deepEqual(parseFieldValue({ name: 'rows', label: '', type: 'lines', columns: ['x', 'y'] }, fd), [
      ['a', 'b'],
      ['d', ''],
    ])
    assert.equal((parseFieldValue({ name: 'long', label: '', type: 'textarea' }, fd) as string).length, 100_000)
  })

  it('waliduje pola url', () => {
    const field: Field = { name: 'link', label: '', type: 'url' }
    assert.equal(parseFieldValue(field, form({ link: '/kontakt' })), '/kontakt')
    assert.equal(parseFieldValue(field, form({ link: '' })), '')
    assert.throws(() => parseFieldValue(field, form({ link: 'javascript:alert(1)' })), ContentFieldError)
  })

  it('parsuje bloki z formularza i odrzuca nieznane typy', () => {
    const field: Field = { name: 'blocks', label: '', type: 'blocks' }
    const raw = JSON.stringify([{ id: 'a', type: 'text', text: 'Cześć' }, { type: 'evil' }])
    const result = parseFieldValue(field, form({ blocks: raw })) as { type: string; text: string }[]
    assert.equal(result.length, 1)
    assert.equal(result[0].type, 'text')
    assert.equal(result[0].text, 'Cześć')
    assert.deepEqual(parseFieldValue(field, form({ blocks: '' })), [])
  })
})

describe('parseAccountInput', () => {
  const base = { name: 'Jan', email: ' Jan@Example.com ', password: 'T7!kL9#pQ2@w', role: 'editor', id: '' }

  it('normalizuje e-mail przy poprawnych danych', () => {
    const result = parseAccountInput(form(base))
    assert.ok('data' in result)
    assert.equal(result.data.email, 'jan@example.com')
  })

  it('wymaga hasła min. 12 znaków przy tworzeniu', () => {
    assert.deepEqual(parseAccountInput(form({ ...base, password: 'short' })), {
      error: 'Hasło musi mieć co najmniej 12 znaków.',
    })
  })

  it('pozwala na puste hasło przy edycji, ale nie na krótkie', () => {
    assert.ok('data' in parseAccountInput(form({ ...base, id: 'u1', password: '' })))
    assert.ok('error' in parseAccountInput(form({ ...base, id: 'u1', password: 'short' })))
  })

  it('odrzuca hasła z przykładów i oczywiste wzorce', () => {
    assert.ok('error' in parseAccountInput(form({ ...base, password: 'password123456' })))
    assert.ok('error' in parseAccountInput(form({ ...base, password: 'aaaaaaaaaaaa' })))
    assert.ok('error' in parseAccountInput(form({ ...base, password: 'change-me-to-a-long-random-string' })))
  })

  it('odrzuca złą rolę, e-mail i imię', () => {
    assert.ok('error' in parseAccountInput(form({ ...base, role: 'root' })))
    assert.ok('error' in parseAccountInput(form({ ...base, email: 'nie-email' })))
    assert.ok('error' in parseAccountInput(form({ ...base, name: '' })))
  })
})

describe('fail', () => {
  it('zwraca komunikat z ZodError i obsługuje duplikat sluga', () => {
    const zodError = z.string().min(1, 'Wymagane').safeParse('').error
    assert.deepEqual(fail(zodError), { error: 'Wymagane' })
    assert.deepEqual(fail(Object.assign(new Error('dup'), { code: '23505' })), { error: 'Taki slug już istnieje.' })
  })
})
