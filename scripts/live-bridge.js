// Streams new Firestore `live_inputs` docs to TouchDesigner over WebSocket.
// Run: node scripts/live-bridge.js   (needs FIREBASE_SERVICE_ACCOUNT in .env)
// TouchDesigner: WebSocket DAT -> address localhost, port 9980
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { WebSocketServer } from 'ws'
import 'dotenv/config'
import { execFileSync } from 'child_process'
import { makeShoutoutMessage } from './shoutout-message.js'

const raw = process.env.FIREBASE_SERVICE_ACCOUNT
if (!raw) {
  console.error('FIREBASE_SERVICE_ACCOUNT is missing from .env')
  process.exit(1)
}
const key = JSON.parse(raw)
initializeApp({ credential: cert(key) })

// Installed font families on this Mac (includes activated Adobe fonts)
function installedFonts() {
  const js =
    'ObjC.import("AppKit"); JSON.stringify(ObjC.deepUnwrap($.NSFontManager.sharedFontManager.availableFontFamilies))'
  try {
    return JSON.parse(execFileSync('osascript', ['-l', 'JavaScript', '-e', js], { encoding: 'utf8' }))
  } catch (e) {
    console.error('Could not read installed fonts:', e.message)
    return []
  }
}
const FONT_FAMILIES = installedFonts()
const FONT_SET = new Set(FONT_FAMILIES)
const db = getFirestore()

const wss = new WebSocketServer({ host: '127.0.0.1', port: 9980 })
console.log('WebSocket on ws://127.0.0.1:9980')

const toTextMsg = (doc) => makeShoutoutMessage(doc, db, FONT_SET)

// Replay the most recent entries to one client: reset, then oldest -> newest
const BACKLOG = 20
async function sendBacklog(ws) {
  try {
    const snap = await db.collection('live_inputs').orderBy('createdAt', 'desc').limit(BACKLOG).get()
    const send = (o) => ws.readyState === 1 && ws.send(JSON.stringify(o))
    const messages = await Promise.all(snap.docs.reverse().map(toTextMsg))
    send({ type: 'reset' })
    messages.forEach(send)
  } catch (e) {
    console.error('Backlog failed:', e.message)
  }
}
wss.on('connection', (ws) => {
  sendBacklog(ws)
  ws.on('message', (data) => {
    if (String(data).trim() === 'refresh') sendBacklog(ws)
  })
})

let liveTextQueue = Promise.resolve()
db.collection('live_inputs')
  .where('createdAt', '>', Timestamp.now())
  .onSnapshot((snap) => {
    snap.docChanges().forEach((c) => {
      if (c.type !== 'added') return
      liveTextQueue = liveTextQueue.then(async () => {
        const msg = JSON.stringify(await toTextMsg(c.doc))
        console.log(msg)
        wss.clients.forEach((ws) => ws.readyState === 1 && ws.send(msg))
      }).catch((error) => console.error('Shout-out badge lookup failed:', error.message))
    })
  }, (error) => console.error('Shout-out listener failed:', error.message))

// ---- Paint pad (supporters only) ----
// Access is enforced here: the ticket must have paint_access === true in Firestore.
const ACCESS_TTL_MS = 30_000
const accessCache = new Map() // id_code -> { ok, at }
const thisYear = new Date().getFullYear()
const TICKET_COLLECTIONS = [thisYear + 1, thisYear, thisYear - 1].map((y) => `participants_${y}`)

async function hasPaintAccess(idCode) {
  const hit = accessCache.get(idCode)
  if (hit && Date.now() - hit.at < ACCESS_TTL_MS) return hit.ok
  let ok = false
  for (const name of TICKET_COLLECTIONS) {
    const snap = await db.collection(name).where('id_code', '==', idCode).limit(1).get()
    if (!snap.empty) {
      ok = snap.docs[0].data().paint_access === true
      break
    }
  }
  accessCache.set(idCode, { ok, at: Date.now() })
  return ok
}

const HEX = /^#[0-9a-fA-F]{6}$/
const clamp01 = (n) => Math.min(1, Math.max(0, n))

db.collection('live_paint')
  .where('createdAt', '>', Timestamp.now())
  .onSnapshot((snap) => {
    snap.docChanges().forEach(async (c) => {
      if (c.type !== 'added') return
      const d = c.doc.data()
      c.doc.ref.delete().catch(() => {})
      const flat = Array.isArray(d.points) ? d.points : []
      if (typeof d.id_code !== 'string' || flat.length === 0 || flat.length % 2 || flat.length > 60) return
      if (!flat.every((n) => typeof n === 'number' && Number.isFinite(n))) return
      try {
        if (!(await hasPaintAccess(d.id_code))) return
      } catch (e) {
        console.error('Access check failed:', e.message)
        return
      }
      const points = []
      for (let i = 0; i < flat.length; i += 2) points.push([clamp01(flat[i]), clamp01(flat[i + 1])])
      const msg = JSON.stringify({
        type: 'paint',
        user: d.id_code,
        name: typeof d.name === 'string' ? d.name.slice(0, 24) : '',
        color: HEX.test(d.color) ? d.color : '#ffffff',
        points,
        end: d.end === true
      })
      wss.clients.forEach((ws) => ws.readyState === 1 && ws.send(msg))
    })
  })
