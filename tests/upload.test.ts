import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { hasValidImageSignature, imageExtension, MAX_IMAGE_BYTES } from '../lib/upload'

const bytes = (...values: number[]) => new Uint8Array(values)

describe('imageExtension', () => {
  it('mapuje dozwolone typy MIME', () => {
    assert.equal(imageExtension('image/jpeg'), 'jpg')
    assert.equal(imageExtension('image/png'), 'png')
    assert.equal(imageExtension('image/webp'), 'webp')
    assert.equal(imageExtension('image/avif'), 'avif')
  })

  it('odrzuca inne typy', () => {
    assert.equal(imageExtension('text/html'), null)
    assert.equal(imageExtension('image/svg+xml'), null)
  })
})

describe('hasValidImageSignature', () => {
  it('rozpoznaje prawidłowe nagłówki', () => {
    assert.equal(hasValidImageSignature(bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0), 'jpg'), true)
    assert.equal(hasValidImageSignature(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0), 'png'), true)
    const webp = new Uint8Array(12)
    webp.set(new TextEncoder().encode('RIFF'), 0)
    webp.set(new TextEncoder().encode('WEBP'), 8)
    assert.equal(hasValidImageSignature(webp, 'webp'), true)
  })

  it('wymaga marki avif/avis w kontenerze AVIF', () => {
    const avif = new Uint8Array(20)
    new DataView(avif.buffer).setUint32(0, 20)
    avif.set(new TextEncoder().encode('ftyp'), 4)
    avif.set(new TextEncoder().encode('avif'), 8)
    avif.set(new TextEncoder().encode('mif1'), 16)
    assert.equal(hasValidImageSignature(avif, 'avif'), true)

    const heic = new Uint8Array(20)
    new DataView(heic.buffer).setUint32(0, 20)
    heic.set(new TextEncoder().encode('ftyp'), 4)
    heic.set(new TextEncoder().encode('heic'), 8)
    heic.set(new TextEncoder().encode('heic'), 16)
    assert.equal(hasValidImageSignature(heic, 'avif'), false)
  })

  it('odrzuca pliki z fałszywym MIME', () => {
    const html = new TextEncoder().encode('<script>alert(1)</script>'.padEnd(16, ' '))
    assert.equal(hasValidImageSignature(html, 'jpg'), false)
    assert.equal(hasValidImageSignature(html, 'png'), false)
    assert.equal(hasValidImageSignature(bytes(1, 2, 3), 'png'), false)
  })
})

describe('MAX_IMAGE_BYTES', () => {
  it('wynosi 4 MB', () => {
    assert.equal(MAX_IMAGE_BYTES, 4 * 1024 * 1024)
  })
})
