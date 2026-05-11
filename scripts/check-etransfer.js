/**
 * check-etransfer.js
 *
 * Polls Gmail for unread Interac e-Transfer confirmation emails.
 * When a matching email is found:
 *   1. Extracts the buyer's id_code from the message body
 *   2. Looks up the order in Firebase (participants_2026)
 *   3. Marks order.paid = true
 *   4. Sends the ticket delivery email via relay proxy (/email)
 *   5. Sends a Slack admin notification via relay proxy (/reunion_slack)
 *   6. Marks the Gmail message as read and labels it Processed_2026
 *
 * Required env vars (add to .env):
 *   GMAIL_USER          — Gmail address to poll (e.g. yourname@gmail.com)
 *   GMAIL_APP_PASSWORD  — Gmail App Password (not your account password)
 *
 * Run manually:    node scripts/check-etransfer.js
 * Cron (every 10 min):
 *   */10 * * * * cd /Users/PD/PROJECTS/WEBSITES/festivall && /usr/local/bin/node scripts/check-etransfer.js >> /tmp/etransfer-cron.log 2>&1
 */

import { ImapFlow } from 'imapflow'
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

dotenv.config()

// ---------------------------------------------------------------------------
// Configuration — adjust these if needed
// ---------------------------------------------------------------------------
const SUBJECT_KEYWORD = 'Interac e-Transfer'
const GMAIL_LABEL = 'Processed_2026'
const FIREBASE_COLLECTION = 'participants_2026'
const RELAY_BASE = 'https://relayproxy.vercel.app'
const TICKET_EMAIL_SUBJECT = 'Reunion 2026'

// id_code is the first 5 chars of a UUID v4 (lowercase hex + digits), e.g. "vaa72"
// The regex scans ALL 5-char lowercase alphanumeric tokens in the email body.
// Firestore lookup is the hard validation gate — non-matching tokens are silently skipped.
const ID_CODE_REGEX = /\b([a-z0-9]{5})\b/gi

// ---------------------------------------------------------------------------
// Firebase init (Reunion project only)
// ---------------------------------------------------------------------------
const ReunionConfig = {
  apiKey: process.env.VITE_APP_REUNION_API_KEY,
  authDomain: process.env.VITE_APP_REUNION_AUTH_DOMAIN,
  projectId: process.env.VITE_APP_REUNION_PROJECT_ID,
  storageBucket: process.env.VITE_APP_REUNION_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_APP_REUNION_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_REUNION_APP_ID,
  measurementId: process.env.VITE_APP_REUNION_MEASUREMENT_ID
}

const reunion_app = initializeApp(ReunionConfig, 'reunion')
const reunion_db = getFirestore(reunion_app)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url))

function loadTicketTemplate() {
  const templatePath = join(__dirname, '..', 'public', 'email_templates', 'ticket_delivery_template.txt')
  return readFileSync(templatePath, 'utf8')
}

async function postRelay(path, body) {
  const response = await fetch(`${RELAY_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!response.ok) {
    throw new Error(`Relay ${path} responded ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

async function sendTicketEmail(email, fullname, id_code) {
  const template = loadTicketTemplate()
  const body = template
    .replace('{name}', fullname || '')
    .replace('{id_code}', id_code || '')

  await postRelay('/email', {
    value1: email,
    value2: TICKET_EMAIL_SUBJECT,
    value3: body
  })
}

async function sendSlackNotification(fullname, id_code) {
  await postRelay('/reunion_slack', {
    text: `:mailbox_with_mail: e-Transfer received — ticket auto-delivered to *${fullname}*.\n:ticket: \`${id_code}\``
  })
}

/**
 * Ensure the Gmail label exists. Creates it if missing.
 * Returns the label name (ImapFlow uses string names for IMAP labels).
 */
async function ensureLabel(client) {
  try {
    const mailboxes = await client.list()
    const exists = mailboxes.some(m => m.name === GMAIL_LABEL || m.path === GMAIL_LABEL)
    if (!exists) {
      await client.mailboxCreate(GMAIL_LABEL)
      console.log(`[label] Created Gmail label: ${GMAIL_LABEL}`)
    }
  } catch (err) {
    // Non-fatal — label may already exist or creation may fail silently on some servers
    console.warn(`[label] Could not verify/create label "${GMAIL_LABEL}": ${err.message}`)
  }
}

/**
 * Extract plain text from a parsed IMAP message.
 * Walks the message structure to find text/plain parts.
 */
function extractPlainText(message) {
  if (!message || !message.bodyStructure) return ''

  const parts = []

  function walk(node) {
    if (!node) return
    if (node.type === 'text' && node.subtype === 'plain' && node.part) {
      parts.push(node.part)
    }
    if (Array.isArray(node.childNodes)) {
      node.childNodes.forEach(walk)
    }
  }

  walk(message.bodyStructure)
  return parts
}

// ---------------------------------------------------------------------------
// Core processing
// ---------------------------------------------------------------------------
async function processEmail(client, uid, envelope) {
  const subject = envelope.subject || ''
  const from = envelope.from?.[0]?.address || ''
  console.log(`\n[email] UID ${uid} | From: ${from} | Subject: ${subject}`)

  // Fetch body structure to find text/plain part numbers
  const msg = await client.fetchOne(`${uid}`, { bodyStructure: true }, { uid: true })
  const plainParts = extractPlainText(msg)

  let bodyText = ''

  if (plainParts.length > 0) {
    // Fetch first plain text part
    const partNum = plainParts[0]
    const bodyMsg = await client.fetchOne(`${uid}`, { bodyParts: [partNum] }, { uid: true })
    const partContent = bodyMsg.bodyParts?.get(partNum)
    bodyText = partContent ? partContent.toString('utf8') : ''
  } else {
    // Fallback: fetch RFC822 text
    const bodyMsg = await client.fetchOne(`${uid}`, { body: true }, { uid: true })
    bodyText = bodyMsg.body ? bodyMsg.body.toString('utf8') : ''
  }

  if (!bodyText) {
    console.warn(`[email] UID ${uid} — could not extract body text, skipping`)
    return false
  }

  // Scan body for all 5-char lowercase alphanumeric tokens
  const candidates = []
  let match
  ID_CODE_REGEX.lastIndex = 0
  while ((match = ID_CODE_REGEX.exec(bodyText)) !== null) {
    const candidate = match[1].toLowerCase()
    if (!candidates.includes(candidate)) {
      candidates.push(candidate)
    }
  }

  if (candidates.length === 0) {
    console.warn(`[email] UID ${uid} — no id_code candidates found in body, skipping`)
    return false
  }

  console.log(`[email] UID ${uid} — candidates: ${candidates.join(', ')}`)

  // Try each candidate against Firebase
  for (const candidate of candidates) {
    const docRef = doc(reunion_db, FIREBASE_COLLECTION, candidate)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      continue // Not a real id_code — try next candidate
    }

    const data = docSnap.data()

    if (data.order?.paid === true) {
      console.log(`[skip] UID ${uid} — id_code "${candidate}" already paid, skipping`)
      // Still mark as read/labeled so it doesn't get re-checked
      return 'already_paid'
    }

    const email = data.contact?.email
    const fullname = data.contact?.fullname || ''

    if (!email) {
      console.error(`[error] UID ${uid} — id_code "${candidate}" has no contact email in Firestore`)
      return false
    }

    console.log(`[match] id_code="${candidate}" | name="${fullname}" | email="${email}"`)

    // 1. Mark paid in Firebase
    await updateDoc(docRef, { 'order.paid': true })
    console.log(`[firebase] order.paid = true for "${candidate}"`)

    // 2. Send ticket delivery email
    await sendTicketEmail(email, fullname, candidate)
    console.log(`[email] Ticket delivery sent to ${email}`)

    // 3. Send Slack notification
    await sendSlackNotification(fullname, candidate)
    console.log(`[slack] Admin notified`)

    return true // Successfully processed
  }

  console.warn(`[email] UID ${uid} — no valid id_code found among candidates, skipping`)
  return false
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const gmailUser = process.env.GMAIL_USER
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD

  if (!gmailUser || !gmailAppPassword) {
    console.error('[error] GMAIL_USER and GMAIL_APP_PASSWORD must be set in .env')
    process.exit(1)
  }

  console.log(`[start] ${new Date().toISOString()} — polling ${gmailUser}`)

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailAppPassword
    },
    logger: false // Set to true for verbose IMAP debug output
  })

  await client.connect()

  try {
    await ensureLabel(client)

    const lock = await client.getMailboxLock('INBOX')

    try {
      // Search for unread Interac e-Transfer emails
      const uids = await client.search({ seen: false, subject: SUBJECT_KEYWORD }, { uid: true })

      if (!uids || uids.length === 0) {
        console.log('[search] No unread matching emails found')
        return
      }

      console.log(`[search] Found ${uids.length} unread email(s) matching "${SUBJECT_KEYWORD}"`)

      for (const uid of uids) {
        const envelope = (await client.fetchOne(`${uid}`, { envelope: true }, { uid: true }))?.envelope

        let result = false
        try {
          result = await processEmail(client, uid, envelope)
        } catch (err) {
          console.error(`[error] UID ${uid} — processing failed: ${err.message}`)
          // Do NOT mark as read — will retry on next poll
          continue
        }

        if (result === true || result === 'already_paid') {
          // Mark as read
          await client.messageFlagsAdd(`${uid}`, ['\\Seen'], { uid: true })
          // Apply Gmail label
          try {
            await client.messageMove(`${uid}`, GMAIL_LABEL, { uid: true })
          } catch (labelErr) {
            // messageMove copies+deletes in IMAP; for labeling only, use messageCopy
            try {
              await client.messageCopy(`${uid}`, GMAIL_LABEL, { uid: true })
            } catch (copyErr) {
              console.warn(`[label] Could not apply label "${GMAIL_LABEL}": ${copyErr.message}`)
            }
          }
          console.log(`[done] UID ${uid} — marked read and labeled ${GMAIL_LABEL}`)
        }
      }
    } finally {
      lock.release()
    }
  } finally {
    await client.logout()
    console.log(`[end] ${new Date().toISOString()} — done`)
  }
}

main().catch(err => {
  console.error('[fatal]', err)
  process.exit(1)
})
