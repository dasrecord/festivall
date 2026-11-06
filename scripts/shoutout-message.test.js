import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { makeShoutoutMessage } from './shoutout-message.js'

function dbWith(...badges) {
  return { collection: (name) => {
    assert.equal(name, 'participant_badges')
    return { where: (field, operator, value) => {
      assert.equal(field, 'idCodes')
      assert.equal(operator, 'array-contains')
      assert.equal(value, 'abc')
      return { get: async () => ({ docs: badges.map((badge) => ({ data: () => badge })) }) }
    } }
  } }
}
const doc = { id: 'message-id', data: () => ({ id_code: 'abc', text: 'hello', font: 'Arial' }) }

test('sends only the badge number for a matching ticket, preserving message fields', async () => {
  const message = await makeShoutoutMessage(doc, dbWith({ active: true, badgeNumber: 4 }), new Set(['Arial']))
  assert.equal(message.badgeNumber, 4)
  assert.equal('durationSeconds' in message, false)
  assert.equal(message.text, 'hello')
  assert.equal(message.type, 'text')
})

test('sends a null badge for unmatched and inactive records', async () => {
  const message = await makeShoutoutMessage(doc, dbWith({ active: false, badgeNumber: 3 }), new Set())
  assert.equal(message.badgeNumber, null)
  assert.equal('durationSeconds' in message, false)
  assert.equal(message.font, 'Arial')
})

test('rejects ambiguous and invalid badge records', async () => {
  await assert.rejects(makeShoutoutMessage(doc, dbWith(
    { active: true, badgeNumber: 1 }, { active: true, badgeNumber: 2 }
  ), new Set()), /Ambiguous/)
  await assert.rejects(makeShoutoutMessage(doc, dbWith({ active: true, badgeNumber: 0 }), new Set()), /Invalid/)
})
