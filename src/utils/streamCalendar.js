const formatStamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
const escapeText = (value) => value.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n')
  .replace(/,/g, '\\,').replace(/;/g, '\\;')

function foldLine(line) {
  const encoder = new TextEncoder()
  const parts = []
  let part = ''
  let bytes = 0
  for (const character of line) {
    const size = encoder.encode(character).length
    if (bytes + size > 75) {
      parts.push(part)
      part = ' '
      bytes = 1
    }
    part += character
    bytes += size
  }
  parts.push(part)
  return parts.join('\r\n')
}

export function formatStreamDate(stream) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: stream.timeZone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(stream.startsAt)
}

export function createStreamCalendar(stream, channel, now = new Date()) {
  if (!(stream.startsAt instanceof Date) || !Number.isFinite(stream.startsAt.getTime()) ||
      !Number.isFinite(stream.durationMinutes) || stream.durationMinutes <= 0 ||
      !stream.title || !channel) {
    throw new Error('Invalid stream calendar configuration')
  }
  const start = stream.startsAt
  const end = new Date(start.getTime() + stream.durationMinutes * 60_000)
  const twitchUrl = `https://www.twitch.tv/${encodeURIComponent(channel)}`
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Festivall//Livestream//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:stream-${formatStamp(start)}-${encodeURIComponent(channel)}@festivall.ca`,
    `DTSTAMP:${formatStamp(now)}`,
    `DTSTART:${formatStamp(start)}`,
    `DTEND:${formatStamp(end)}`,
    `SUMMARY:${escapeText(stream.title)}`,
    `DESCRIPTION:${escapeText(`Watch live: ${twitchUrl}`)}`,
    `URL:${twitchUrl}`,
    ...['-P1D', '-PT4H'].flatMap((trigger) => [
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Festivall livestream reminder',
      `TRIGGER:${trigger}`,
      'END:VALARM',
    ]),
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(foldLine).join('\r\n') + '\r\n'
}
