import test from 'node:test'
import assert from 'node:assert/strict'
import { offSeasonCardsFor } from './offSeasonCards.js'

test('all participants see one poster archive instead of role-specific history', () => {
  for (const roles of [[], ['Volunteer'], ['Artist'], ['Workshop'], ['Artist', 'Volunteer']]) {
    const cards = offSeasonCardsFor(roles)
    assert.equal(cards.filter((card) => card === 'throughTheYears').length, 1)
    assert.equal(cards.includes('volunteerHistory'), false)
    assert.equal(cards.includes('setHistory'), false)
  }
  assert.equal(offSeasonCardsFor(['Artist']).includes('reapply'), true)
  assert.equal(offSeasonCardsFor(['Volunteer']).includes('reapply'), false)
})
