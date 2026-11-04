// Streams new Firestore `live_inputs` docs to TouchDesigner over WebSocket.
// Run: node scripts/live-bridge.js   (needs scripts/serviceAccount.json, gitignored)
// TouchDesigner: WebSocket DAT -> address localhost, port 9980
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { WebSocketServer } from 'ws'
import { readFileSync } from 'fs'

const key = JSON.parse(readFileSync(new URL('./serviceAccount.json', import.meta.url)))
initializeApp({ credential: cert(key) })

const wss = new WebSocketServer({ host: '127.0.0.1', port: 9980 })
console.log('WebSocket on ws://127.0.0.1:9980')

getFirestore()
  .collection('live_inputs')
  .where('createdAt', '>', Timestamp.now())
  .onSnapshot((snap) => {
    snap.docChanges().forEach((c) => {
      if (c.type !== 'added') return
      const d = c.doc.data()
      const msg = JSON.stringify({ id: c.doc.id, name: d.name || '', text: d.text || '' })
      console.log(msg)
      wss.clients.forEach((ws) => ws.readyState === 1 && ws.send(msg))
    })
  })
