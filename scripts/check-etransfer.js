// check-etransfer.js
//
// Polls Gmail for unread Interac e-Transfer confirmation emails.
// When a matching email is found:
//   1. Extracts the buyer's id_code from the message body
//   2. Looks up the order in Firebase (participants_2026)
//   3. Marks order.paid = true
//   4. Sends the ticket delivery email via relay proxy (/email)
//   5. Sends a Slack admin notification via relay proxy (/reunion_slack)
//   6. Marks the Gmail message as read and labels it Processed_2026
//
// Required env vars (add to .env):
//   GMAIL_USER          — Gmail address to poll (e.g. yourname@gmail.com)
//   GMAIL_APP_PASSWORD  — Gmail App Password (not your account password)
//
// Run manually:    node scripts/check-etransfer.js
// Cron (every 10 min) — add via: crontab -e
//   Note: use asterisk-slash-10 as the first field in the cron expression

import { ImapFlow } from 'imapflow'
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

dotenv.config()

// ---------------------------------------------------------------------------
// Configuration — adjust these if needed
// ---------------------------------------------------------------------------
const SUBJECT_KEYWORD = "You've received"  // matches auto-deposit: "You've received $X from [NAME] and it has been automatically deposited."
const GMAIL_LABEL = 'Processed_2026'
const FIREBASE_COLLECTION = 'participants_2026'
const RELAY_BASE = 'https://relayproxy.vercel.app'
const TICKET_EMAIL_SUBJECT = 'Reunion 2026'

// DRY_RUN: set to true to log matches without writing to Firebase or sending emails.
// DATE_FILTER: set to { since, before } (Date objects) to narrow the IMAP search,
//   or null to search all unread emails.
const DRY_RUN = true
const DATE_FILTER = null
// const DATE_FILTER = {
//   since: new Date('2025-08-27T00:00:00-04:00'),
//   before: new Date('2025-08-30T00:00:00-04:00')
// }

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
  await postRelay('/reunion_sales', {
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

// Walk bodyStructure and collect MIME part numbers by content type.
// ImapFlow stores Content-Type as a full string in node.type (e.g. "text/html").
function collectParts(node, plain = [], html = []) {
  if (!node) return { plain, html }
  const type = (node.type || '').toLowerCase()
  if (type === 'text/plain' && node.part) plain.push(node.part)
  else if (type === 'text/html' && node.part) html.push(node.part)
  if (Array.isArray(node.childNodes)) {
    for (const child of node.childNodes) collectParts(child, plain, html)
  }
  return { plain, html }
}

// Strip HTML tags to get readable plain text
function stripHtml(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ---------------------------------------------------------------------------
// Ad hoc meal order helpers
// ---------------------------------------------------------------------------

/**
 * Parse the dollar amount from an Interac subject line.
 * e.g. "You've received $30.00 from Jane Doe" → 30.00
 */
function extractAmountFromSubject(subject) {
  const m = subject.match(/\$([\d]+(?:\.[\d]{1,2})?)/)
  return m ? parseFloat(m[1]) : null
}

async function sendMealConfirmationEmail(email, fullname, id_code, meal_quantity, fiat_total) {
  const body =
    `Hi ${fullname},\n\n` +
    `Your payment of $${fiat_total} CAD has been received and ${meal_quantity} meal ticket(s) have been added to your account.\n\n` +
    `You can view your updated ticket at:\nhttps://festivall.ca/reunionticket\n\n` +
    `Enter your ID code: ${id_code}\n\n` +
    `See you at Reunion 2026!\n\nThe Reunion Team\n\n` +
    `**************************************\nPowered by Festivall\n**************************************`
  await postRelay('/email', {
    value1: email,
    value2: 'Reunion 2026 — Meal Tickets Added',
    value3: body
  })
}

async function sendMealFoodSlack(fullname, id_code, meal_quantity, fiat_total) {
  await postRelay('/reunion_food', {
    blocks: [{
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:fork_and_knife: E-TRANSFER MEAL AUTO-APPROVED\n:bust_in_silhouette: ${fullname}\n:id: ${id_code}\n:knife_fork_plate: +${meal_quantity} meal ticket(s)\n:moneybag: $${fiat_total} CAD received\n:white_check_mark: Approved by: auto_etransfer`
      }
    }]
  })
}

/**
 * Find and approve a matching pending e-transfer meal purchase.
 * Returns 'meal_approved' on success, false if no match found.
 */
async function processPendingMealOrders(docRef, data, amount, dryRun) {
  const pending = (data.order?.pending_meal_purchases || []).filter(
    p => p.payment_type === 'etransfer' && p.status === 'pending'
  )

  if (pending.length === 0) {
    console.log(`[meal] No pending e-transfer meal orders found`)
    return false
  }

  // Match by amount (within 1 cent), fallback to sole entry
  let match = amount != null
    ? pending.find(p => Math.abs(p.fiat_total - amount) < 0.01)
    : null

  if (!match && pending.length === 1) {
    console.warn(`[meal] Amount ${amount} didn't match fiat_total ${pending[0].fiat_total} — using sole pending entry as fallback`)
    match = pending[0]
  }

  if (!match) {
    console.warn(`[meal] Amount $${amount} does not match any pending e-transfer entry (found: ${pending.map(p => `$${p.fiat_total}`).join(', ')}) — skipping meal approval`)
    return false
  }

  const { id_code, meal_quantity, fiat_total } = match
  const fullname = data.contact?.fullname || ''
  const email = data.contact?.email

  console.log(`[meal] Matched pending entry: id_code="${id_code}" qty=${meal_quantity} fiat_total=$${fiat_total}`)

  if (dryRun) {
    console.log(`[dry-run] Would approve ${meal_quantity} meal ticket(s) for "${fullname}" ($${fiat_total}) — skipping all writes`)
    return 'meal_approved'
  }

  const now = new Date().toISOString()
  const approvedEntry = { ...match, status: 'paid', approved_by: 'auto_etransfer', approved_at: now }

  await updateDoc(docRef, {
    'order.meal_tickets_remaining': increment(Number(meal_quantity)),
    'order.pending_meal_purchases': arrayRemove(match),
    'order.ad_hoc_meal_orders': arrayUnion(approvedEntry)
  })
  console.log(`[firebase] Meal order approved: +${meal_quantity} ticket(s) for "${id_code}"`)

  if (email) {
    await sendMealConfirmationEmail(email, fullname, id_code, meal_quantity, fiat_total)
    console.log(`[email] Meal confirmation sent to ${email}`)
  }

  await sendMealFoodSlack(fullname, id_code, meal_quantity, fiat_total)
  console.log(`[slack] Food team notified`)

  return 'meal_approved'
}

// ---------------------------------------------------------------------------
// Core processing
// ---------------------------------------------------------------------------
async function processEmail(client, uid, envelope, dryRun = false) {
  const subject = envelope.subject || ''
  const from = envelope.from?.[0]?.address || ''
  const transferAmount = extractAmountFromSubject(subject)
  console.log(`\n[email] UID ${uid} | From: ${from} | Subject: ${subject}${transferAmount != null ? ` | Amount: $${transferAmount}` : ''}`)

  // Fetch body structure to find HTML/plain part numbers
  const msg = await client.fetchOne(`${uid}`, { bodyStructure: true }, { uid: true })
  const { plain: plainParts, html: htmlParts } = collectParts(msg.bodyStructure)

  let bodyText = ''

  const partNum = (plainParts[0] || htmlParts[0]) ?? null
  if (partNum) {
    // download() automatically handles base64/QP decoding
    const { content } = await client.download(`${uid}`, partNum, { uid: true })
    const chunks = []
    for await (const chunk of content) chunks.push(chunk)
    const raw = Buffer.concat(chunks).toString('utf8')
    bodyText = htmlParts.length > 0 && plainParts.length === 0 ? stripHtml(raw) : raw
  } else {
    // Non-multipart fallback: fetch BODY[TEXT] and strip MIME boundaries manually
    const bodyMsg = await client.fetchOne(`${uid}`, { bodyParts: ['TEXT'] }, { uid: true })
    const rawBody = bodyMsg.bodyParts?.get('TEXT') ?? bodyMsg.bodyParts?.get('text')
    if (rawBody) bodyText = stripHtml(rawBody.toString('utf8'))
  }

  if (!bodyText) {
    console.warn(`[email] UID ${uid} — could not extract body text, skipping`)
    return false
  }

  // Log a snippet so we can verify what the extracted body looks like
  console.log(`[body] UID ${uid} preview: ${bodyText.replace(/\s+/g, ' ').substring(0, 300)}`)

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
      console.log(`[skip] UID ${uid} — id_code "${candidate}" already paid, checking for pending meal orders`)
      // Check for pending e-transfer meal orders — auto-approve if found
      const mealResult = await processPendingMealOrders(docRef, data, transferAmount, dryRun)
      return mealResult || 'already_paid'
    }

    const email = data.contact?.email
    const fullname = data.contact?.fullname || ''

    if (!email) {
      console.error(`[error] UID ${uid} — id_code "${candidate}" has no contact email in Firestore`)
      return false
    }

    console.log(`[match] id_code="${candidate}" | name="${fullname}" | email="${email}" | paid=${data.order?.paid ?? false}`)

    if (dryRun) {
      console.log(`[dry-run] Would mark paid, send ticket email to ${email}, and notify Slack — skipping all writes`)
      // Also check for pending meals in dry-run
      await processPendingMealOrders(docRef, data, transferAmount, dryRun)
      return true
    }

    // 1. Mark paid in Firebase
    await updateDoc(docRef, { 'order.paid': true })
    console.log(`[firebase] order.paid = true for "${candidate}"`)

    // 2. Send ticket delivery email
    await sendTicketEmail(email, fullname, candidate)
    console.log(`[email] Ticket delivery sent to ${email}`)

    // 3. Send Slack notification
    await sendSlackNotification(fullname, candidate)
    console.log(`[slack] Admin notified`)

    // 4. Also check for any pending meal orders (handles both-in-same-run)
    await processPendingMealOrders(docRef, data, transferAmount, dryRun)

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

  console.log(`[start] ${new Date().toISOString()} — polling ${gmailUser}${DRY_RUN ? ' [DRY-RUN]' : ''}${DATE_FILTER ? ` | date filter: ${DATE_FILTER.since.toDateString()} – ${DATE_FILTER.before.toDateString()}` : ''}`)

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

    // For date-filtered test runs, search All Mail AND Spam to find any Interac emails
    const mailboxesToSearch = DATE_FILTER
      ? ['[Gmail]/All Mail', '[Gmail]/Spam']
      : ['INBOX']

    for (const mailbox of mailboxesToSearch) {
      console.log(`\n[mailbox] Searching: ${mailbox}`)
      const lock = await client.getMailboxLock(mailbox)

      try {
        // Search for Interac e-Transfer emails (read or unread when using DATE_FILTER for testing)
        const searchCriteria = {
          ...(DATE_FILTER
            ? { since: DATE_FILTER.since, before: DATE_FILTER.before }  // no subject filter — shows all emails that day for debugging
            : { seen: false, subject: SUBJECT_KEYWORD })
        }
        console.log('[search] Criteria:', JSON.stringify({ ...searchCriteria, since: searchCriteria.since?.toISOString(), before: searchCriteria.before?.toISOString() }))
      const uids = await client.search(searchCriteria, { uid: true })

      if (!uids || uids.length === 0) {
        console.log('[search] No unread matching emails found')
        return
      }

      console.log(`[search] Found ${uids.length} email(s) in date range`)

      for (const uid of uids) {
        const envelope = (await client.fetchOne(`${uid}`, { envelope: true }, { uid: true }))?.envelope
        const subject = envelope?.subject || ''
        const from = envelope?.from?.[0]?.address || ''
        console.log(`  UID ${uid} | From: ${from} | Subject: ${subject}`)

        // When DATE_FILTER is active, manually filter by subject keyword
        if (DATE_FILTER && !subject.toLowerCase().includes(SUBJECT_KEYWORD.toLowerCase())) {
          continue
        }

        let result = false
        try {
          result = await processEmail(client, uid, envelope, DRY_RUN)
        } catch (err) {
          console.error(`[error] UID ${uid} — processing failed: ${err.message}`)
          // Do NOT mark as read — will retry on next poll
          continue
        }

        if (result === true || result === 'already_paid' || result === 'meal_approved') {
          if (DRY_RUN) {
            console.log(`[dry-run] Would mark read and label ${GMAIL_LABEL} — skipping`)
          } else {
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
      }
    } finally {
      lock.release()
    }
    } // end for mailboxesToSearch
  } finally {
    await client.logout()
    console.log(`[end] ${new Date().toISOString()} — done`)
  }
}

main().catch(err => {
  console.error('[fatal]', err)
  process.exit(1)
})
