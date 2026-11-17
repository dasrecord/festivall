import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { parseCareerTimelineCsv } from './careerTimeline.js'

test('parses quoted commas, escaped quotes, and embedded newlines', () => {
  const events = parseCareerTimelineCsv([
    'Year,Month,Day,Headline,Text,Media,Media Caption,Type',
    '2001,3,9,"A milestone, indeed","Line one',
    'Line two with ""quoted"" text",https://example.com/story,Story,',
    ',,,Timeline title,,,,title'
  ].join('\n'))

  assert.equal(events.length, 1)
  assert.equal(events[0].headline, 'A milestone, indeed')
  assert.equal(events[0].text, 'Line one\nLine two with "quoted" text')
  assert.equal(events[0].date, 'March 9, 2001')
  assert.equal(events[0].mediaUrl, 'https://example.com/story')
})

test('turns Spotify track links into embedded previews and keeps other media links', () => {
  const events = parseCareerTimelineCsv([
    'Year,Headline,Media,Media Caption',
    '2017,Track,https://open.spotify.com/track/1abc?si=example,Listen',
    '2017,Playlist,https://open.spotify.com/playlist/playlist-id,Playlist'
  ].join('\n'))

  assert.equal(events[0].spotifyEmbedUrl, 'https://open.spotify.com/embed/track/1abc?utm_source=generator')
  assert.equal(events[1].spotifyEmbedUrl, '')
  assert.equal(events[1].mediaUrl, 'https://open.spotify.com/playlist/playlist-id')
})

test('formats year ranges and excludes undated or non-HTTP media', () => {
  const events = parseCareerTimelineCsv([
    'Year,End Year,Headline,Text,Media,Type',
    '1996,1997,Piano,First lessons,javascript:alert(1),',
    ',,Timeline title,,,title'
  ].join('\n'))

  assert.equal(events.length, 1)
  assert.equal(events[0].date, '1996 — 1997')
  assert.equal(events[0].mediaUrl, '')
})

test('ships every dated milestone and attributed open-license image in the local CSV', async () => {
  const csv = await readFile(new URL('../../public/data/prasenjit-das-career-timeline.csv', import.meta.url), 'utf8')
  const events = parseCareerTimelineCsv(csv)

  assert.equal(events.length, 69)
  assert.equal(events.filter((event) => event.spotifyEmbedUrl).length, 18)
  assert.equal(events.filter((event) => event.referenceImage).length, 3)
  assert.ok(events.every((event) => event.headline && event.date))
  assert.ok(events.every((event) =>
    !event.referenceImage || (
      event.referenceImageAttribution &&
      event.referenceImageLicense &&
      event.referenceImageLicenseUrl &&
      event.referenceImageSourceUrl
    )
  ))
})
