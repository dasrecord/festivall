function parseCsvRows(csv) {
  const rows = []
  let row = []
  let field = ''
  let insideQuotes = false

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index]

    if (character === '"') {
      if (insideQuotes && csv[index + 1] === '"') {
        field += '"'
        index += 1
      } else {
        insideQuotes = !insideQuotes
      }
    } else if (character === ',' && !insideQuotes) {
      row.push(field)
      field = ''
    } else if ((character === '\n' || character === '\r') && !insideQuotes) {
      if (character === '\r' && csv[index + 1] === '\n') index += 1
      row.push(field)
      if (row.some((value) => value !== '')) rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field)
    if (row.some((value) => value !== '')) rows.push(row)
  }

  return rows
}

function formatTimelineDate(year, month, day) {
  if (!year) return ''
  if (!month) return String(year)

  const date = new Date(Date.UTC(year, month - 1, day || 1))
  const options = day
    ? { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }
    : { month: 'long', year: 'numeric', timeZone: 'UTC' }

  return new Intl.DateTimeFormat('en-US', options).format(date)
}

function parseHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : ''
  } catch {
    return ''
  }
}

function getMediaUrl(value) {
  const iframeSource = value.match(/<iframe\b[^>]*\bsrc=(?:"([^"]+)"|'([^']+)')/i)
  return parseHttpUrl(iframeSource ? iframeSource[1] || iframeSource[2] : value)
}

function getSpotifyEmbedUrl(value) {
  const mediaUrl = parseHttpUrl(value)
  if (!mediaUrl) return ''

  const url = new URL(mediaUrl)
  if (url.hostname !== 'open.spotify.com') return ''

  const [, type, id] = url.pathname.match(/^\/(?:intl-[a-z]{2}\/)?(track)\/([a-zA-Z0-9]+)\/?$/) || []
  return type === 'track' && id ? `https://open.spotify.com/embed/track/${id}?utm_source=generator` : ''
}

function parseLocalReferenceImage(value) {
  if (!value.startsWith('/images/career-references/') || value.includes('..')) return ''
  return value
}

export function parseCareerTimelineCsv(csv) {
  const [headerRow, ...dataRows] = parseCsvRows(csv)
  if (!headerRow) return []

  const headers = headerRow.map((header) => header.trim())
  const records = dataRows.map((values, sourceIndex) => {
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index] || '']))
    const year = Number.parseInt(record.Year, 10)
    const month = Number.parseInt(record.Month, 10) || 0
    const day = Number.parseInt(record.Day, 10) || 0
    const endYear = Number.parseInt(record['End Year'], 10) || 0
    const endMonth = Number.parseInt(record['End Month'], 10) || 0
    const endDay = Number.parseInt(record['End Day'], 10) || 0

    if (!Number.isFinite(year) || !record.Headline?.trim() || record.Type === 'title') return null

    const startDate = formatTimelineDate(year, month, day)
    const endDate = endYear ? formatTimelineDate(endYear, endMonth, endDay) : ''
    const media = (record.Media || '').trim()
    const image = (record['Reference Image'] || '').trim()

    return {
      id: sourceIndex,
      year,
      headline: record.Headline.trim(),
      text: (record.Text || '').trim(),
      group: (record.Group || '').trim(),
      date: (record['Display Date'] || '').trim() || (endDate && endDate !== startDate
        ? `${startDate} — ${endDate}`
        : startDate),
      mediaUrl: getMediaUrl(media),
      spotifyEmbedUrl: getSpotifyEmbedUrl(media),
      mediaCaption: (record['Media Caption'] || '').trim(),
      referenceImage: parseLocalReferenceImage(image),
      referenceImageAlt: (record['Reference Image Alt'] || '').trim(),
      referenceImageAttribution: (record['Reference Image Attribution'] || '').trim(),
      referenceImageLicense: (record['Reference Image License'] || '').trim(),
      referenceImageLicenseUrl: parseHttpUrl((record['Reference Image License URL'] || '').trim()),
      referenceImageSourceUrl: parseHttpUrl((record['Reference Image Source URL'] || '').trim()),
      sourceIndex
    }
  }).filter(Boolean)

  return records.sort((first, second) =>
    first.year - second.year || first.sourceIndex - second.sourceIndex
  )
}
