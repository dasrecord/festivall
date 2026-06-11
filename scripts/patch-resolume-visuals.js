#!/usr/bin/env node

import { readFile, writeFile, copyFile } from 'fs/promises'
import { existsSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { DOMParser, XMLSerializer } from '@xmldom/xmldom'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'
import dotenv from 'dotenv'
import { REUNION_FESTIVAL } from '../src/config/festivalConfig.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

dotenv.config({ path: resolve(__dirname, '../.env.festivall') })
dotenv.config()

const DRIVE = 'D:'
const AVC_PATH = 'C:\\Users\\Reunion\\Documents\\Resolume Arena\\Compositions\\REUNION_2026_TEMPLATE.avc'
const CATALOG_PATH = resolve(__dirname, '../src/data/visuals_catalog.json')
const PARTICIPANTS_COLLECTION = REUNION_FESTIVAL.participantsCollection
const TOTAL_LAYERS = 5
const TOTAL_COLUMNS = 13
const LOGO_WIDTH = 792
const LOGO_HEIGHT = 290
const VIDEO_WIDTH = 1920
const VIDEO_HEIGHT = 1080
const DEFAULT_VIDEO_DURATION_MS = 20000
const DEFAULT_VIDEO_BEATS = 32
const SOLID_COLOR_VALUE = '4278190335'

const REQUIRED_ENV = [
  'VITE_APP_REUNION_API_KEY',
  'VITE_APP_REUNION_AUTH_DOMAIN',
  'VITE_APP_REUNION_PROJECT_ID',
  'VITE_APP_REUNION_APP_ID',
]

const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key])
if (missingEnv.length) {
  console.error(`\nMissing required env vars:\n  ${missingEnv.join('\n  ')}`)
  console.error('\nEnsure .env.festivall or .env contains VITE_APP_REUNION_* variables.\n')
  process.exit(1)
}

const ReunionConfig = {
  apiKey: process.env.VITE_APP_REUNION_API_KEY?.trim(),
  authDomain: process.env.VITE_APP_REUNION_AUTH_DOMAIN?.trim(),
  projectId: process.env.VITE_APP_REUNION_PROJECT_ID?.trim(),
  storageBucket: process.env.VITE_APP_REUNION_STORAGE_BUCKET?.trim(),
  messagingSenderId: process.env.VITE_APP_REUNION_MESSAGING_SENDER_ID?.trim(),
  appId: process.env.VITE_APP_REUNION_APP_ID?.trim(),
}

const app = initializeApp(ReunionConfig, 'reunion-resolume-patcher')
const db = getFirestore(app)

let uid = Date.now()
const nextUid = () => String(++uid)

function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_{2,}/g, '_')
}

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function getNested(source, path) {
  return path.split('.').reduce((current, key) => current?.[key], source)
}

function textNameFromDeck(deck) {
  const params = directChildren(deck, 'Params').find((node) => node.getAttribute('name') === 'Params')
  const nameParam = params
    ? directChildren(params, 'Param').find((node) => node.getAttribute('name') === 'Name')
    : null

  return nameParam?.getAttribute('value') || nameParam?.getAttribute('default') || ''
}

function isPlaceholderDeck(deck) {
  const name = textNameFromDeck(deck)
  return name === 'empty' || (
    deck.getAttribute('numLayersWithContent') === '0' &&
    deck.getAttribute('numColumnsWithContent') === '0'
  )
}

function directChildren(node, tagName = null) {
  return Array.from(node.childNodes).filter(
    (child) => child.nodeType === 1 && (!tagName || child.tagName === tagName),
  )
}

function removeDirectChildren(node, tagName) {
  for (const child of directChildren(node, tagName)) {
    node.removeChild(child)
  }
}

function createElement(doc, tagName, attrs = {}, children = []) {
  const node = doc.createElement(tagName)
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== undefined && value !== null) node.setAttribute(key, String(value))
  }
  for (const child of children) node.appendChild(child)
  return node
}

function params(doc, children = []) {
  return createElement(doc, 'Params', { name: 'Params' }, children)
}

function phaseStatic(doc) {
  return createElement(doc, 'PhaseSourceStatic', { name: 'PhaseSourceStatic' })
}

function param(doc, attrs) {
  return createElement(doc, 'Param', attrs)
}

function paramRange(doc, attrs, children = [phaseStatic(doc)]) {
  return createElement(doc, 'ParamRange', attrs, children)
}

function paramChoice(doc, attrs) {
  return createElement(doc, 'ParamChoice', attrs)
}

function columnStub(doc, columnIndex) {
  return createElement(doc, 'Column', {
    uniqueId: nextUid(),
    columnIndex,
  })
}

function emptyClip(doc, layerIndex, columnIndex) {
  return createElement(doc, 'Clip', {
    name: 'Clip',
    uniqueId: nextUid(),
    layerIndex,
    columnIndex,
  })
}

function transport(doc, milliseconds = DEFAULT_VIDEO_DURATION_MS, beats = DEFAULT_VIDEO_BEATS) {
  return createElement(doc, 'Transport', { name: 'Transport' }, [
    params(doc, [
      paramRange(doc, { name: 'Position', T: 'DOUBLE', default: '0', value: '0' }, [
        createElement(doc, 'DurationSource', {
          name: 'DurationSource',
          defaultDuration: `${milliseconds / 1000}s`,
        }),
        createElement(doc, 'PhaseSourceTransportTimeline', {
          name: 'PhaseSourceTransportTimeline',
          phase: '0',
          defaultMillisecondsDuration: milliseconds,
          defaultBeatsDuration: beats,
        }, [
          params(doc, [
            paramRange(doc, {
              name: 'Max Distance',
              altName: 'Distance',
              T: 'DOUBLE',
              default: '2',
              value: '2',
            }),
          ]),
          createElement(doc, 'Beats_double', {
            name: 'Beats_double',
            numDetectedBeats: '-1',
            numManualBeats: beats,
            detectedTempo: '-1',
          }),
        ]),
        createElement(doc, 'ValueRange', { name: 'minMax', min: '0', max: milliseconds }),
      ]),
    ]),
  ])
}

function clipView(doc) {
  return createElement(doc, 'ClipView', { name: 'ClipView' }, [
    createElement(doc, 'FoldParams', { name: 'FoldParams' }),
  ])
}

function videoTrack(doc, { width, height, source, renderPass } = {}) {
  const mixerId = nextUid()
  const children = [
    params(doc, [
      paramRange(doc, { name: 'Width', T: 'DOUBLE', default: width, value: width }),
      paramRange(doc, { name: 'Height', T: 'DOUBLE', default: height, value: height }),
      param(doc, { name: 'RScale', T: 'BOOL', default: '1', value: '1' }),
      param(doc, { name: 'GScale', T: 'BOOL', default: '1', value: '1' }),
      param(doc, { name: 'BScale', T: 'BOOL', default: '1', value: '1' }),
      param(doc, { name: 'AScale', T: 'BOOL', default: '1', value: '1' }),
    ]),
    createElement(doc, 'RenderPass', { name: 'RenderPassChain' }, [
      createElement(doc, 'RenderPass', {
        storage: '0',
        name: 'Transform',
        type: 'TransformEffect',
        uniqueTypeId: '17122039101699797593',
        uniqueId: nextUid(),
        baseType: 'Effect',
      }, [createElement(doc, 'View', { name: 'View', bCanBeDisabled: '0', bCanBeRemoved: '0' })]),
    ]),
    createElement(doc, 'ChoosableMixer', { name: 'Blend' }, [
      createElement(doc, 'VideoMixerStateID', { uniqueId: mixerId }),
    ]),
  ]

  if (source || renderPass) {
    const videoSource = renderPass
      ? createElement(doc, 'VideoSource', {
        storage: '0',
        name: 'VideoSource',
        width,
        height,
        type: 'GeneratorVideoSource',
      }, [renderPass])
      : createElement(doc, 'VideoSource', {
        name: 'VideoSource',
        width,
        height,
        type: 'VideoFormatReaderSource',
      }, [createElement(doc, 'VideoFormatReaderSource', { fileName: source })])

    children.push(createElement(doc, 'PrimarySource', {}, [videoSource]))
    children.push(createElement(doc, 'ChoosableMixer', { name: 'Blend' }, [
      createElement(doc, 'VideoMixerStateID', { uniqueId: mixerId }),
    ]))
  }

  return createElement(doc, 'VideoTrack', { name: 'VideoTrack' }, children)
}

function mediaClip(doc, { layerIndex, columnIndex, id, filePath, width, height }) {
  return createElement(doc, 'Clip', {
    name: 'Clip',
    uniqueId: nextUid(),
    layerIndex,
    columnIndex,
  }, [
    createElement(doc, 'PreloadData', {}, [
      createElement(doc, 'VideoFile', { value: filePath }),
    ]),
    params(doc, [
      param(doc, { name: 'Name', T: 'STRING', default: id, value: id }),
      paramChoice(doc, { name: 'TransportType', default: '0', value: '0', storeChoices: '0' }),
    ]),
    transport(doc),
    clipView(doc),
    videoTrack(doc, { width, height, source: filePath }),
  ])
}

function bgClip(doc, columnIndex, clipId) {
  return mediaClip(doc, {
    layerIndex: 0,
    columnIndex,
    id: clipId,
    filePath: `${DRIVE}\\RESOLUME\\VIDEO_LIBRARY\\${clipId}.mov`,
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
  })
}

function maskClip(doc, columnIndex, maskId) {
  return mediaClip(doc, {
    layerIndex: 1,
    columnIndex,
    id: maskId,
    filePath: `${DRIVE}\\RESOLUME\\MASK_LIBRARY\\${maskId}.mov`,
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
  })
}

function solidColorClip(doc) {
  return createElement(doc, 'Clip', {
    name: 'Clip',
    uniqueId: nextUid(),
    layerIndex: '2',
    columnIndex: '0',
  }, [
    params(doc, [
      param(doc, { name: 'Name', T: 'STRING', default: 'Solid Color', value: 'Solid Color' }),
      paramChoice(doc, { name: 'TransportType', default: '0', value: '0', storeChoices: '0' }),
    ]),
    transport(doc, 5000, 8),
    clipView(doc),
    videoTrack(doc, {
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
      renderPass: createElement(doc, 'RenderPass', {
        name: 'SolidColor',
        type: 'SolidColor',
        uniqueTypeId: 'A403',
        uniqueId: nextUid(),
        baseType: 'Generator',
      }, [
        params(doc, [
          createElement(doc, 'ParamColor', {
            name: 'Color',
            T: 'COLOR',
            default: SOLID_COLOR_VALUE,
            value: SOLID_COLOR_VALUE,
            channelmode: '2',
            paletteEnabled: '0',
            color: SOLID_COLOR_VALUE,
            interpolated: '0',
          }),
        ]),
      ]),
    }),
  ])
}

function logoClip(doc, logoFile, deckName) {
  return createElement(doc, 'Clip', {
    name: 'Clip',
    uniqueId: nextUid(),
    layerIndex: '3',
    columnIndex: '0',
  }, [
    createElement(doc, 'PreloadData', {}, [
      createElement(doc, 'VideoFile', { value: logoFile }),
    ]),
    params(doc, [
      param(doc, { name: 'Name', T: 'STRING', default: deckName, value: deckName }),
      paramChoice(doc, { name: 'TransportType', default: '0', value: '0', storeChoices: '0' }),
    ]),
    transport(doc, 1000, 2),
    clipView(doc),
    videoTrack(doc, { width: LOGO_WIDTH, height: LOGO_HEIGHT, source: logoFile }),
  ])
}

function buildDeck(doc, artist, deckIndex) {
  const contentColumns = new Set([0])
  const contentLayers = new Set([2, 3])
  artist.video.forEach((_, index) => {
    contentColumns.add(index)
    contentLayers.add(0)
  })
  artist.mask.forEach((_, index) => {
    contentColumns.add(index)
    contentLayers.add(1)
  })

  const deck = createElement(doc, 'Deck', {
    name: 'Deck',
    uniqueId: artist.uniqueId,
    closed: '0',
    numLayersWithContent: contentLayers.size,
    numColumnsWithContent: contentColumns.size,
    numLayers: TOTAL_LAYERS,
    numColumns: TOTAL_COLUMNS,
    deckIndex,
  }, [
    params(doc, [
      param(doc, { name: 'Name', T: 'STRING', default: 'empty', value: artist.deckName }),
    ]),
  ])

  for (let columnIndex = 0; columnIndex < TOTAL_COLUMNS; columnIndex += 1) {
    deck.appendChild(columnStub(doc, columnIndex))
  }

  for (let columnIndex = 0; columnIndex < TOTAL_COLUMNS; columnIndex += 1) {
    for (let layerIndex = 0; layerIndex < TOTAL_LAYERS; layerIndex += 1) {
      if (layerIndex === 0 && artist.video[columnIndex]) {
        deck.appendChild(bgClip(doc, columnIndex, artist.video[columnIndex]))
      } else if (layerIndex === 1 && artist.mask[columnIndex]) {
        deck.appendChild(maskClip(doc, columnIndex, artist.mask[columnIndex]))
      } else if (layerIndex === 2 && columnIndex === 0) {
        deck.appendChild(solidColorClip(doc))
      } else if (layerIndex === 3 && columnIndex === 0) {
        deck.appendChild(logoClip(doc, artist.logoFile, artist.deckName))
      } else {
        deck.appendChild(emptyClip(doc, layerIndex, columnIndex))
      }
    }
  }

  return deck
}

function rebuildDeckInfo(doc, compositionInfo, decks) {
  removeDirectChildren(compositionInfo, 'DeckInfo')

  for (const deck of decks) {
    compositionInfo.appendChild(createElement(doc, 'DeckInfo', {
      name: textNameFromDeck(deck) || 'empty',
      id: deck.getAttribute('uniqueId'),
      closed: deck.getAttribute('closed') || '0',
    }))
  }
}

function parseXml(xml) {
  const errors = []
  const parser = new DOMParser({
    errorHandler: {
      warning: (message) => errors.push(message),
      error: (message) => errors.push(message),
      fatalError: (message) => errors.push(message),
    },
  })
  const doc = parser.parseFromString(xml, 'application/xml')
  if (errors.length) {
    throw new Error(`Could not parse AVC XML:\n${errors.join('\n')}`)
  }
  return doc
}

function ensureUidCounterFromDocument(doc) {
  const allElements = Array.from(doc.getElementsByTagName('*'))
  const maxExistingUid = allElements.reduce((maxUid, node) => {
    const value = Number(node.getAttribute('uniqueId'))
    return Number.isFinite(value) ? Math.max(maxUid, value) : maxUid
  }, 0)

  uid = Math.max(uid, maxExistingUid)
}

async function loadCatalogIds() {
  const raw = await readFile(CATALOG_PATH, 'utf8')
  const catalog = JSON.parse(raw)
  return {
    video: new Set((catalog.video || []).map((item) => item.id)),
    mask: new Set((catalog.mask || []).map((item) => item.id)),
  }
}

async function fetchArtists(catalogIds) {
  const snapshot = await getDocs(query(
    collection(db, PARTICIPANTS_COLLECTION),
    where('roles.applicant_types', 'array-contains', 'Artist'),
  ))

  const artists = []
  const skipped = []

  for (const document of snapshot.docs) {
    const data = document.data()
    const selection = getNested(data, 'application.data.visuals_selection') || {}
    const selectedVideo = asArray(selection.video).filter((id) => catalogIds.video.has(id))
    const selectedMask = asArray(selection.mask).filter((id) => catalogIds.mask.has(id))
    const actName = getNested(data, 'roles.act_name') || getNested(data, 'application.data.act_name')
    const idCode = data.id_code || document.id
    const slug = slugify(actName)

    if (!selectedVideo.length || !selectedMask.length) {
      skipped.push(`${idCode}: incomplete visuals selection`)
      continue
    }

    if (!slug) {
      skipped.push(`${idCode}: missing act name`)
      continue
    }

    const deckName = `${idCode}_${slug}`
    artists.push({
      idCode,
      actName,
      deckName,
      video: selectedVideo.slice(0, 6),
      mask: selectedMask.slice(0, 3),
      logoFile: `${DRIVE}\\RESOLUME\\LOGO_LIBRARY\\${deckName}.png`,
    })
  }

  artists.sort((left, right) => left.deckName.localeCompare(right.deckName))
  return { artists, skipped }
}

function patchComposition(doc, artists) {
  const composition = doc.documentElement
  const compositionInfo = directChildren(composition, 'CompositionInfo')[0]
  if (!compositionInfo) throw new Error('CompositionInfo element not found in AVC file.')

  const changes = { added: [], updated: [] }

  for (const artist of artists) {
    const existingDeck = directChildren(composition, 'Deck').find(
      (deck) => textNameFromDeck(deck) === artist.deckName,
    )

    if (existingDeck) {
      artist.uniqueId = existingDeck.getAttribute('uniqueId') || artist.uniqueId
      composition.removeChild(existingDeck)
      changes.updated.push(artist.deckName)
    } else {
      artist.uniqueId = nextUid()
      changes.added.push(artist.deckName)
    }
  }

  for (const artist of artists) {
    const decks = directChildren(composition, 'Deck')
    const insertBefore = decks.find(isPlaceholderDeck) || directChildren(composition, 'Notes')[0] || null
    composition.insertBefore(buildDeck(doc, artist, 0), insertBefore)
  }

  const decks = directChildren(composition, 'Deck')
  decks.forEach((deck, deckIndex) => deck.setAttribute('deckIndex', String(deckIndex)))
  composition.setAttribute('numDecks', String(decks.length))
  rebuildDeckInfo(doc, compositionInfo, decks)

  return changes
}

async function main() {
  if (!existsSync(AVC_PATH)) {
    throw new Error(`AVC file not found: ${AVC_PATH}`)
  }

  const catalogIds = await loadCatalogIds()
  const { artists, skipped } = await fetchArtists(catalogIds)

  if (!artists.length) {
    console.log('No completed artist visuals selections found. Nothing to patch.')
    if (skipped.length) {
      console.log('\nSkipped:')
      skipped.forEach((message) => console.log(`  - ${message}`))
    }
    return
  }

  const originalXml = await readFile(AVC_PATH, 'utf8')
  await copyFile(AVC_PATH, `${AVC_PATH}.bak`)

  const doc = parseXml(originalXml)
  ensureUidCounterFromDocument(doc)
  const changes = patchComposition(doc, artists)
  const output = new XMLSerializer().serializeToString(doc)
  await writeFile(AVC_PATH, output, 'utf8')

  console.log(`Patched ${AVC_PATH}`)
  console.log(`Backup written to ${AVC_PATH}.bak`)

  if (changes.added.length) {
    console.log('\nAdded decks:')
    changes.added.forEach((deckName) => console.log(`  - ${deckName}`))
  }

  if (changes.updated.length) {
    console.log('\nUpdated decks:')
    changes.updated.forEach((deckName) => console.log(`  - ${deckName}`))
  }

  console.log('\nLogo prep warnings:')
  artists.forEach((artist) => {
    console.log(`  - Place ${artist.deckName}.png (${LOGO_WIDTH}x${LOGO_HEIGHT} px PNG) in ${DRIVE}\\RESOLUME\\LOGO_LIBRARY\\`)
  })

  if (skipped.length) {
    console.log('\nSkipped:')
    skipped.forEach((message) => console.log(`  - ${message}`))
  }
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})