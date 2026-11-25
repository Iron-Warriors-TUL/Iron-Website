import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { canEditContentArea, canManageAccounts, canManageNavigation, isRole } from '../lib/roles'

describe('roles', () => {
  it('administrator może wszystko', () => {
    assert.equal(canEditContentArea('admin', 'settings'), true)
    assert.equal(canEditContentArea('admin', 'home'), true)
    assert.equal(canManageNavigation('admin'), true)
    assert.equal(canManageAccounts('admin'), true)
  })

  it('edytor edytuje treść, ale nie ustawienia, nawigację ani konta', () => {
    assert.equal(canEditContentArea('editor', 'home'), true)
    assert.equal(canEditContentArea('editor', 'partner-catalog'), true)
    assert.equal(canEditContentArea('editor', 'settings'), false)
    assert.equal(canManageNavigation('editor'), false)
    assert.equal(canManageAccounts('editor'), false)
  })

  it('nieznana rola nie ma uprawnień', () => {
    assert.equal(isRole('root'), false)
    assert.equal(canEditContentArea('root', 'home'), false)
    assert.equal(canEditContentArea(undefined, 'home'), false)
  })
})
