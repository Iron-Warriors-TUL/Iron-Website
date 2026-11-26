import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { isHttpsUrl, isSafePath } from '../lib/safe-url'

describe('isSafePath', () => {
  it('akceptuje lokalne ścieżki', () => {
    assert.equal(isSafePath('/'), true)
    assert.equal(isSafePath('/images/logo.png'), true)
    assert.equal(isSafePath('/api/media?pathname=cms/x.jpg'), true)
  })

  it('odrzuca protokołowo-względne i bezwzględne adresy', () => {
    assert.equal(isSafePath('//evil.example/x'), false)
    assert.equal(isSafePath('https://evil.example'), false)
    assert.equal(isSafePath('foo/bar'), false)
    assert.equal(isSafePath(''), false)
  })

  it('odrzuca backslash, białe znaki i cudzysłowy', () => {
    assert.equal(isSafePath('/\\evil.example/x'), false)
    assert.equal(isSafePath('/a b'), false)
    assert.equal(isSafePath('/a"b'), false)
    assert.equal(isSafePath('/a\tb'), false)
  })
})

describe('isHttpsUrl', () => {
  it('akceptuje wyłącznie adresy HTTPS', () => {
    assert.equal(isHttpsUrl('https://example.com/a.png'), true)
    assert.equal(isHttpsUrl('http://example.com/a.png'), false)
    assert.equal(isHttpsUrl('//example.com/a.png'), false)
    assert.equal(isHttpsUrl('/images/a.png'), false)
    assert.equal(isHttpsUrl('https://'), false)
    assert.equal(isHttpsUrl('javascript:alert(1)'), false)
    assert.equal(isHttpsUrl('https://user:pass@example.com'), false)
    assert.equal(isHttpsUrl('https://example.com\\@evil.example'), false)
    assert.equal(isHttpsUrl('https://example.com/a b'), false)
  })
})

describe('walidacja adresu obrazu/linku', () => {
  const allowed = (value: string) => isSafePath(value) || isHttpsUrl(value)

  it('blokuje open-redirect przez //', () => {
    assert.equal(allowed('//evil.example'), false)
    assert.equal(allowed('http://evil.example'), false)
  })

  it('przepuszcza poprawne wartości', () => {
    assert.equal(allowed('/uploads/a.png'), true)
    assert.equal(allowed('https://cdn.example/a.png'), true)
  })
})
