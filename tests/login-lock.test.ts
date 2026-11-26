import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createLoginLock, parseTrustedProxies, resolveClientIp } from '../lib/login-lock'

test('blokuje konto po limicie błędów i odblokowuje po czasie', () => {
  let t = 0
  const lock = createLoginLock({ maxFailures: 3, windowMs: 1000, now: () => t })
  for (let i = 0; i < 3; i++) lock.recordFailure('Admin@Test.pl ')
  assert.equal(lock.isLocked('admin@test.pl'), true)
  t = 1001
  assert.equal(lock.isLocked('admin@test.pl'), false)
})

test('udane logowanie zeruje licznik', () => {
  const lock = createLoginLock({ maxFailures: 2, windowMs: 1000 })
  lock.recordFailure('a@b.pl')
  lock.reset('a@b.pl')
  lock.recordFailure('a@b.pl')
  assert.equal(lock.isLocked('a@b.pl'), false)
})

test('pusty e-mail nigdy nie jest blokowany', () => {
  const lock = createLoginLock({ maxFailures: 1, windowMs: 1000 })
  lock.recordFailure('')
  assert.equal(lock.isLocked(''), false)
})

test('parsuje listę zaufanych proxy', () => {
  assert.deepEqual(parseTrustedProxies(' 10.0.0.1, 172.16.0.0/12 ,'), ['10.0.0.1', '172.16.0.0/12'])
  assert.deepEqual(parseTrustedProxies(undefined), [])
})

test('bierze pojedynczy adres klienta, gdy nie ma zaufanych proxy', () => {
  assert.equal(resolveClientIp(new Headers({ 'x-forwarded-for': '203.0.113.7' })), '203.0.113.7')
  // Łańcuch bez listy zaufanych proxy da się podrobić — nie ufamy mu.
  assert.equal(resolveClientIp(new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' })), null)
  assert.equal(resolveClientIp(new Headers()), null)
})

test('przy zaufanych proxy bierze pierwszy adres od prawej spoza listy', () => {
  const headers = new Headers({ 'x-forwarded-for': '203.0.113.7, 172.16.0.5, 10.0.0.1' })
  assert.equal(resolveClientIp(headers, { trustedProxies: ['10.0.0.0/8', '172.16.0.0/12'] }), '203.0.113.7')
})

test('obsługuje własny nagłówek adresu klienta', () => {
  const headers = new Headers({ 'x-real-ip': '198.51.100.9' })
  assert.equal(resolveClientIp(headers, { headerName: 'x-real-ip' }), '198.51.100.9')
})
