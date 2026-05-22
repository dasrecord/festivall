import { v4 as uuidv4 } from 'uuid'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  arrayUnion,
  increment
} from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import {
  sendEmail,
  sendSMS,
  sendReunionApplications
} from '/scripts/notifications.js'

const COLLECTION = 'participants_2026'

async function loadTransferTemplate() {
  const resp = await fetch('/email_templates/ticket_transfer_template.txt')
  if (!resp.ok) throw new Error('Failed to load transfer email template')
  return resp.text()
}

/**
 * Transfer `nTickets` from an existing participant to a recipient.
 *
 * @param {object} params
 * @param {string} params.originalIdCode       - id_code of the holder transferring tickets
 * @param {string} params.fromName             - Display name of the holder
 * @param {string} params.recipientFullname    - Full name of the recipient
 * @param {string} params.recipientEmail       - Email of the recipient
 * @param {string} params.recipientPhone       - Phone of the recipient (for SMS)
 * @param {string} [params.recipientIdCode]    - Optional: existing id_code of the recipient
 * @param {number} params.nTickets             - Number of tickets to transfer
 * @param {object} params.originalOrder        - The original participant's order object (for ticket_type, selected_day, etc.)
 */
export async function transferTicket({
  originalIdCode,
  fromName,
  recipientFullname,
  recipientEmail,
  recipientPhone,
  recipientIdCode,
  nTickets,
  originalOrder
}) {
  if (!nTickets || nTickets < 1) throw new Error('Must transfer at least 1 ticket.')
  if (!recipientFullname?.trim()) throw new Error('Recipient full name is required.')
  if (!recipientEmail?.trim()) throw new Error('Recipient email is required.')
  if (!recipientPhone?.trim()) throw new Error('Recipient phone is required.')

  const nowIso = new Date().toISOString()
  const normalizedEmail = recipientEmail.toLowerCase().trim()

  // ─── 1. Look up recipient ─────────────────────────────────────────────────
  let recipientRef = null
  let recipientExists = false
  let resolvedRecipientIdCode = ''

  if (recipientIdCode?.trim()) {
    // Try by supplied id_code first
    const snap = await getDoc(doc(reunion_db, COLLECTION, recipientIdCode.trim().toLowerCase()))
    if (snap.exists()) {
      recipientRef = snap.ref
      recipientExists = true
      resolvedRecipientIdCode = recipientIdCode.trim().toLowerCase()
    }
  }

  if (!recipientExists) {
    // Fall back to email lookup
    const emailQuery = query(
      collection(reunion_db, COLLECTION),
      where('contact.email', '==', normalizedEmail)
    )
    const emailSnap = await getDocs(emailQuery)
    if (!emailSnap.empty) {
      recipientRef = emailSnap.docs[0].ref
      resolvedRecipientIdCode = emailSnap.docs[0].data().id_code
      recipientExists = true
    }
  }

  // ─── 2. Write to recipient ────────────────────────────────────────────────
  const incomingEntry = {
    from_id_code: originalIdCode,
    from_fullname: fromName,
    tickets_received: nTickets,
    transferred_at: nowIso
  }

  if (recipientExists) {
    // Recipient already has a doc — increment their ticket count
    await updateDoc(recipientRef, {
      'order.ticket_quantity': increment(nTickets),
      'order.original_ticket_quantity': increment(nTickets),
      'transfer.transferred_from': arrayUnion(incomingEntry),
      updatedAt: nowIso
    })
  } else {
    // New participant — create a full doc
    const newIdCodeLong = uuidv4()
    resolvedRecipientIdCode = newIdCodeLong.slice(0, 5).toLowerCase()

    // Ensure id_code uniqueness (simple retry once)
    const existingCheck = await getDoc(doc(reunion_db, COLLECTION, resolvedRecipientIdCode))
    if (existingCheck.exists()) {
      resolvedRecipientIdCode = uuidv4().slice(0, 5).toLowerCase()
    }

    recipientRef = doc(reunion_db, COLLECTION, resolvedRecipientIdCode)
    await setDoc(recipientRef, {
      id_code: resolvedRecipientIdCode,
      id_code_long: newIdCodeLong,
      status: 'customer',
      createdAt: nowIso,
      updatedAt: nowIso,
      contact: {
        fullname: recipientFullname.trim(),
        email: normalizedEmail,
        phone: recipientPhone.trim(),
        phone_raw: recipientPhone.replace(/\D/g, '')
      },
      roles: { applicant_types: [] },
      order: {
        ticket_type: originalOrder?.ticket_type || '',
        selected_day: originalOrder?.selected_day || '',
        payment_type: 'transfer',
        currency: 'CAD',
        fiat_total_price_cad: 0,
        ticket_quantity: nTickets,
        original_ticket_quantity: nTickets,
        meal_packages: 0,
        meal_tickets_remaining: 0,
        paid: true,
        checked_in: false,
        payment_reference: null,
        entrance_activity_history: [],
        last_entrance_activity: null,
        meal_redemption_history: [],
        last_meal_redemption: null
      },
      referral: { referral_id_code: null },
      transfer: {
        transferred_from: [incomingEntry],
        transferred_to: []
      }
    })
  }

  // ─── 3. Update original holder ────────────────────────────────────────────
  const originalRef = doc(reunion_db, COLLECTION, originalIdCode)
  const outgoingEntry = {
    to_id_code: resolvedRecipientIdCode,
    to_fullname: recipientFullname.trim(),
    to_email: normalizedEmail,
    tickets_transferred: nTickets,
    transferred_at: nowIso
  }

  const newOriginalQty = (originalOrder?.ticket_quantity || 0) - nTickets
  const statusUpdate = newOriginalQty <= 0 ? { status: 'transferred' } : {}

  await updateDoc(originalRef, {
    'order.ticket_quantity': increment(-nTickets),
    'transfer.transferred_to': arrayUnion(outgoingEntry),
    updatedAt: nowIso,
    ...statusUpdate
  })

  // ─── 4. Send transfer email ───────────────────────────────────────────────
  try {
    const template = await loadTransferTemplate()
    const emailBody = template
      .replace('{name}', recipientFullname.trim())
      .replace('{id_code}', resolvedRecipientIdCode)
      .replace('{from_name}', fromName || 'a fellow attendee')
    await sendEmail(normalizedEmail, 'Reunion 2026 — Your Ticket Has Arrived!', emailBody)
  } catch (err) {
    console.error('Transfer email failed:', err)
  }

  // ─── 5. Send SMS ──────────────────────────────────────────────────────────
  try {
    const smsMessage =
      `Hi ${recipientFullname.trim()}, ${fromName || 'someone'} has transferred a Reunion 2026 ticket to you!\n` +
      `Your ID_CODE is: ${resolvedRecipientIdCode}\n` +
      `Access your ticket at: https://festivall.ca/reunionticket`
    await sendSMS(recipientPhone.trim(), smsMessage)
  } catch (err) {
    console.error('Transfer SMS failed:', err)
  }

  // ─── 6. Slack audit ───────────────────────────────────────────────────────
  try {
    await sendReunionApplications(
      `:ticket: TICKET TRANSFER\n` +
      `:bust_in_silhouette: From: ${fromName} (${originalIdCode})\n` +
      `:arrow_right: To: ${recipientFullname.trim()} (${resolvedRecipientIdCode})\n` +
      `:email: ${normalizedEmail}\n` +
      `:hash: ${nTickets} ticket(s) transferred`
    )
  } catch (err) {
    console.error('Transfer Slack notification failed:', err)
  }

  return { recipientIdCode: resolvedRecipientIdCode, recipientExists }
}
