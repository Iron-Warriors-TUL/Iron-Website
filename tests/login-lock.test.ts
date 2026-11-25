import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createLoginLock, parseTrustedProxies } from '../lib/login-lock'

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
