// Streams new Firestore `live_inputs` docs to TouchDesigner over WebSocket.
// Run: node scripts/live-bridge.js   (needs scripts/serviceAccount.json, gitignored)
// TouchDesigner: WebSocket DAT -> address localhost, port 9980
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { WebSocketServer } from 'ws'
import { readFileSync } from 'fs'
import { execFileSync } from 'child_process'

const key = JSON.parse(readFileSync(new URL('./serviceAccount.json', import.meta.url)))
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

db.collection('live_inputs')
  .where('createdAt', '>', Timestamp.now())
  .onSnapshot((snap) => {
    snap.docChanges().forEach((c) => {
      if (c.type !== 'added') return
      const d = c.doc.data()
      const msg = JSON.stringify({
        id: c.doc.id,
        name: d.name || '',
        text: d.text || '',
        font: FONT_SET.has(d.font) ? d.font : 'Arial',
        color: d.color || '#ffffff',
        fx: d.fx || 'none'
      })
      console.log(msg)
      wss.clients.forEach((ws) => ws.readyState === 1 && ws.send(msg))
    })
  })
