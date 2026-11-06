import test from 'node:test'
import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import ICAL from 'ical.js'
import { REUNION_FESTIVAL } from '../config/festivalConfig.js'
import { createStreamCalendar, formatStreamDate } from './streamCalendar.js'

test('stream event has the correct time, duration and two alarms', () => {
  const stream = {
    title: 'Next Stream Featuring Squirrly J',
    startsAt: new Date('2026-11-14T19:00:00-06:00'),
    durationMinutes: 180,
    timeZone: 'America/Regina',
  }
  const output = createStreamCalendar(stream, 'dasrecord', new Date('2026-11-06T00:00:00Z'))
  const event = new ICAL.Component(ICAL.parse(output)).getFirstSubcomponent('vevent')
  assert.equal(event.getFirstPropertyValue('dtstart').toString(), '2026-11-15T01:00:00Z')
  assert.equal(event.getFirstPropertyValue('dtend').toString(), '2026-11-15T04:00:00Z')
  assert.equal(event.getFirstPropertyValue('summary'), stream.title)
  assert.equal(event.getFirstPropertyValue('url'), 'https://www.twitch.tv/dasrecord')
  const alarms = event.getAllSubcomponents('valarm')
  assert.deepEqual(alarms.map((alarm) => alarm.getFirstPropertyValue('trigger').toString()), ['-P1D', '-PT4H'])
  assert.ok(alarms.every((alarm) => alarm.getFirstPropertyValue('action') === 'DISPLAY'))
  assert.match(formatStreamDate(stream), /November 14, 2026.*7:00 p\.m\./i)
})

test('the configured stream can be displayed and exported', () => {
  const stream = REUNION_FESTIVAL.nextStream
  assert.ok(formatStreamDate(stream))
  assert.ok(createStreamCalendar(stream, REUNION_FESTIVAL.offSeason.twitchChannel))
})

test('calendar escapes text and folds multibyte lines without changing event values', () => {
  const title = 'Squirrly, J; \\ Live\n' + '🎵'.repeat(40)
  const output = createStreamCalendar({ ...REUNION_FESTIVAL.nextStream, title }, 'dasrecord')
  assert.ok(output.split('\r\n').every((line) => Buffer.byteLength(line, 'utf8') <= 75))
  const event = new ICAL.Component(ICAL.parse(output)).getFirstSubcomponent('vevent')
  assert.equal(event.getFirstPropertyValue('summary'), title)
})

test('invalid schedule is reported instead of generating an event', () => {
  assert.throws(() => createStreamCalendar({ ...REUNION_FESTIVAL.nextStream, durationMinutes: 0 }, 'dasrecord'), /Invalid/)
})
