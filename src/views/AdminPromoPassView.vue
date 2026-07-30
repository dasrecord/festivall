<template>
  <div class="promo-admin">
    <div v-if="!isAuthenticated" class="auth-card">
      <h2>🔒 Authentication Required</h2>
      <p>Please log in to issue promo passes.</p>
      <RouterLink to="/login" class="primary-link">Go to Login</RouterLink>
    </div>

    <div v-else class="shell">
      <header class="hero">
        <div>
          <p class="eyebrow">Dashboard Tool</p>
          <h1>Promo Pass Studio</h1>
          <p class="lede">
            Create a complimentary Reunion ticket, customize the recipient experience, and send it
            directly by email.
          </p>
        </div>
        <RouterLink to="/dashboard" class="secondary-link">Back to Dashboard</RouterLink>
      </header>

      <div v-if="submissionStatus.message" class="status-card" :class="submissionStatus.type">
        {{ submissionStatus.message }}
      </div>

      <div class="grid">
        <section class="panel">
          <h2>Recipient</h2>
          <label>
            Full name
            <input v-model="form.recipientFullname" type="text" placeholder="Jane Smith" />
          </label>
          <label>
            Email
            <input v-model="form.recipientEmail" type="email" placeholder="jane@example.com" />
          </label>
          <label>
            Ticket label
            <input
              v-model="form.customTicketLabel"
              type="text"
              placeholder="Complimentary Guest Pass"
            />
          </label>
          <label>
            Gift note for the ticket
            <textarea
              v-model="form.promoMessage"
              rows="4"
              placeholder="A short note that will appear on the ticket page and in the email."
            ></textarea>
          </label>
          <label>
            Internal note
            <textarea
              v-model="form.internalNote"
              rows="3"
              placeholder="Why this pass was issued, or any internal context."
            ></textarea>
          </label>
          <label>
            Issued by
            <input v-model="form.senderName" type="text" placeholder="Festivall team" />
          </label>
        </section>

        <section class="panel">
          <h2>Pass Details</h2>
          <div class="two-col">
            <label>
              Ticket type
              <select v-model="form.ticketType">
                <option value="Weekend Pass">Weekend Pass</option>
                <option value="Day Pass">Day Pass</option>
              </select>
            </label>
            <label>
              Quantity
              <input v-model.number="form.ticketQuantity" type="number" min="1" max="10" />
            </label>
          </div>
          <label v-if="form.ticketType === 'Day Pass'">
            Selected day
            <input
              v-model="form.selectedDay"
              type="text"
              placeholder="Friday, Sept 4, 2026"
            />
          </label>
          <div class="two-col">
            <label>
              Meal tickets included
              <input v-model.number="form.mealTicketsRemaining" type="number" min="0" max="20" />
            </label>
            <label>
              Seeded ticket code prefix
              <input v-model="form.prefix" type="text" maxlength="2" placeholder="fx" />
            </label>
          </div>
          <label>
            Email subject
            <input v-model="form.emailSubject" type="text" placeholder="Your Reunion pass is ready" />
          </label>
          <label>
            Extra email note
            <textarea
              v-model="form.emailAddon"
              rows="3"
              placeholder="Optional extra copy to include before the closing."
            ></textarea>
          </label>
        </section>

        <section class="panel preview-panel">
          <h2>Preview</h2>
          <div class="preview-card">
            <p class="preview-badge">{{ preview.ticketLabel }}</p>
            <h3>{{ preview.fullname || 'Recipient name' }}</h3>
            <p>{{ preview.summary }}</p>
            <p class="preview-note" v-if="preview.promoMessage">{{ preview.promoMessage }}</p>
            <div class="preview-meta">
              <span>{{ preview.ticketType }}</span>
              <span>x{{ form.ticketQuantity }}</span>
              <span>{{ preview.dayLabel }}</span>
            </div>
          </div>
          <div class="preview-email">
            <h3>Email body</h3>
            <pre>{{ previewEmail }}</pre>
          </div>
        </section>
      </div>

      <footer class="actions">
        <button :disabled="isSubmitting" class="primary-button" @click="sendPromoPass">
          {{ isSubmitting ? 'Issuing pass...' : 'Send Promo Pass' }}
        </button>
        <p class="helper">
          The recipient will get a branded ticket email and can open their ticket with the ID code
          we generate here.
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useHead } from '@vueuse/head'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { reunion_db, festivall_auth } from '@/firebase'
import { REUNION_FESTIVAL } from '@/config/festivalConfig'

useHead({
  title: 'Promo Pass Studio | Festivall',
  meta: [{ name: 'description', content: 'Issue complimentary Reunion promo passes from the dashboard.' }]
})

const isAuthenticated = computed(() => !!festivall_auth.currentUser)
const templateText = ref('')
const isSubmitting = ref(false)
const submissionStatus = ref({ type: '', message: '' })

const form = ref({
  recipientFullname: '',
  recipientEmail: '',
  customTicketLabel: 'Complimentary Guest Pass',
  promoMessage: 'A warm welcome from the team.',
  internalNote: '',
  senderName: 'Reunion Team',
  ticketType: 'Weekend Pass',
  selectedDay: '',
  ticketQuantity: 1,
  mealTicketsRemaining: 0,
  prefix: 'fp',
  emailSubject: 'Your Reunion pass is ready',
  emailAddon: ''
})

const normalize = (value) => value.trim()

const renderTemplate = (template, tokens) =>
  template.replace(/\{([a-z_]+)\}/g, (_, key) => (tokens[key] ?? '').toString())

const preview = computed(() => ({
  fullname: form.value.recipientFullname.trim(),
  ticketLabel: form.value.customTicketLabel.trim() || 'Complimentary Guest Pass',
  ticketType: form.value.ticketType,
  dayLabel: form.value.ticketType === 'Day Pass' ? form.value.selectedDay.trim() || 'Selected day' : 'Weekend access',
  promoMessage: form.value.promoMessage.trim(),
  summary: `${form.value.ticketQuantity} ticket${form.value.ticketQuantity === 1 ? '' : 's'} with ${form.value.mealTicketsRemaining} meal ticket${form.value.mealTicketsRemaining === 1 ? '' : 's'}`
}))

const previewEmail = computed(() =>
  renderTemplate(templateText.value || '', {
    name: form.value.recipientFullname.trim() || 'there',
    ticket_label: form.value.customTicketLabel.trim() || 'Complimentary Guest Pass',
    ticket_type: form.value.ticketType,
    selected_day: form.value.ticketType === 'Day Pass' ? form.value.selectedDay.trim() : 'Weekend access',
    ticket_quantity: String(form.value.ticketQuantity),
    meal_tickets: String(form.value.mealTicketsRemaining),
    id_code: 'pending',
    ticket_url: 'https://festivall.ca/reunionticket/pending',
    recipient_message: form.value.promoMessage.trim() || 'Your ticket has been prepared by the Festivall team.',
    addon: form.value.emailAddon.trim(),
    sender_name: form.value.senderName.trim() || 'Festivall Team',
    support_email: 'reunion@festivall.ca',
    year: String(REUNION_FESTIVAL.year)
  })
)

const ensureTemplateLoaded = async () => {
  const response = await fetch('/email_templates/promo_pass_delivery_template.txt')
  if (!response.ok) {
    throw new Error('Failed to load promo pass template')
  }
  templateText.value = await response.text()
}

const allocateIdCode = async (prefix) => {
  const cleanPrefix = (prefix || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 2)
  const attempts = 8
  for (let index = 0; index < attempts; index += 1) {
    const candidate = `${cleanPrefix || 'fp'}${uuidv4().slice(0, 3)}`.toLowerCase()
    const snap = await getDoc(doc(reunion_db, 'participants_2026', candidate))
    if (!snap.exists()) return candidate
  }
  throw new Error('Unable to allocate a unique ticket code')
}

const sendPromoPass = async () => {
  submissionStatus.value = { type: '', message: '' }

  if (!form.value.recipientFullname.trim() || !form.value.recipientEmail.trim()) {
    submissionStatus.value = { type: 'error', message: 'Recipient name and email are required.' }
    return
  }

  if (form.value.ticketType === 'Day Pass' && !form.value.selectedDay.trim()) {
    submissionStatus.value = { type: 'error', message: 'Selected day is required for a day pass.' }
    return
  }

  isSubmitting.value = true

  try {
    if (!templateText.value) {
      await ensureTemplateLoaded()
    }

    const idCode = await allocateIdCode(form.value.prefix)
    const idCodeLong = `${idCode}-${uuidv4()}`
    const nowIso = new Date().toISOString()
    const normalizedEmail = normalize(form.value.recipientEmail).toLowerCase()
    const normalizedName = normalize(form.value.recipientFullname)
    const ticketUrl = `https://festivall.ca/reunionticket/${idCode}`
    const ticketLabel = normalize(form.value.customTicketLabel) || 'Complimentary Guest Pass'
    const promoMessage = normalize(form.value.promoMessage)
    const senderName = normalize(form.value.senderName) || 'Festivall Team'
    const internalNote = normalize(form.value.internalNote)

    const promoDoc = {
      id_code: idCode,
      id_code_long: idCodeLong,
      status: 'customer',
      createdAt: nowIso,
      updatedAt: nowIso,
      contact: {
        fullname: normalizedName,
        email: normalizedEmail,
        phone: '',
        phone_raw: ''
      },
      roles: { applicant_types: [] },
      order: {
        fullname: normalizedName,
        ticket_type: form.value.ticketType,
        selected_day: form.value.ticketType === 'Day Pass' ? normalize(form.value.selectedDay) : '',
        payment_type: 'promo',
        currency: 'CAD',
        fiat_total_price_cad: 0,
        ticket_quantity: Number(form.value.ticketQuantity) || 1,
        original_ticket_quantity: Number(form.value.ticketQuantity) || 1,
        meal_packages: 0,
        meal_tickets_remaining: Number(form.value.mealTicketsRemaining) || 0,
        paid: true,
        checked_in: false,
        payment_reference: 'promo-pass',
        entrance_activity_history: [],
        last_entrance_activity: null,
        meal_redemption_history: [],
        last_meal_redemption: null,
        custom_ticket_label: ticketLabel,
        promo_label: ticketLabel,
        promo_message: promoMessage,
        issued_by: senderName,
        issued_reason: internalNote,
        ticket_url: ticketUrl
      },
      referral: { referral_id_code: null },
      transfer: { transferred_from: [], transferred_to: [] },
      promo: {
        is_promo_pass: true,
        label: ticketLabel,
        message: promoMessage,
        issued_by: senderName,
        issued_reason: internalNote,
        issued_at: nowIso
      }
    }

    await setDoc(doc(reunion_db, 'participants_2026', idCode), promoDoc)

    const { sendEmail } = await import('/scripts/notifications.js')
    const emailBody = renderTemplate(templateText.value, {
      name: normalizedName,
      ticket_label: ticketLabel,
      ticket_type: form.value.ticketType,
      selected_day: form.value.ticketType === 'Day Pass' ? normalize(form.value.selectedDay) : 'Weekend access',
      ticket_quantity: String(form.value.ticketQuantity || 1),
      meal_tickets: String(form.value.mealTicketsRemaining || 0),
      id_code: idCode,
      ticket_url: ticketUrl,
      recipient_message: promoMessage || 'Your pass has been prepared by the Festivall team.',
      addon: normalize(form.value.emailAddon),
      sender_name: senderName,
      support_email: 'reunion@festivall.ca',
      year: String(REUNION_FESTIVAL.year)
    })

    await sendEmail(normalizedEmail, normalize(form.value.emailSubject) || 'Your Reunion pass is ready', emailBody)

    submissionStatus.value = {
      type: 'success',
      message: `Promo pass sent to ${normalizedName} (${normalizedEmail}) with ID code ${idCode}.`
    }

    form.value = {
      recipientFullname: '',
      recipientEmail: '',
      customTicketLabel: 'Complimentary Guest Pass',
      promoMessage: 'A warm welcome from the Festivall team.',
      internalNote: '',
      senderName: 'Festivall Team',
      ticketType: 'Weekend Pass',
      selectedDay: '',
      ticketQuantity: 1,
      mealTicketsRemaining: 0,
      prefix: 'fp',
      emailSubject: 'Your Reunion pass is ready',
      emailAddon: ''
    }
  } catch (error) {
    console.error('Promo pass send failed:', error)
    submissionStatus.value = {
      type: 'error',
      message: error?.message || 'Failed to send promo pass.'
    }
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    await ensureTemplateLoaded()
  } catch (error) {
    submissionStatus.value = {
      type: 'error',
      message: 'Promo email template is missing. Add it before sending passes.'
    }
    console.error(error)
  }
})
</script>

<style scoped>
.promo-admin {
  min-height: 100vh;
  padding: 2rem;
  background:
    radial-gradient(circle at top left, rgba(247, 230, 163, 0.14), transparent 28%),
    radial-gradient(circle at top right, rgba(74, 144, 217, 0.24), transparent 24%),
    linear-gradient(180deg, #121114 0%, #1b1a1f 45%, #101014 100%);
  color: #f4f4f4;
}

.shell {
  max-width: 1280px;
  margin: 0 auto;
}

.auth-card,
.panel,
.status-card,
.preview-card,
.preview-email {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(20, 20, 24, 0.82);
  backdrop-filter: blur(14px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
}

.auth-card,
.status-card,
.panel,
.preview-card,
.preview-email {
  border-radius: 22px;
}

.auth-card {
  max-width: 560px;
  margin: 6rem auto;
  padding: 2rem;
  text-align: center;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 1.5rem;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: #f7e6a3;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.78rem;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.8rem);
}

.lede {
  margin: 0.5rem 0 0;
  color: rgba(244, 244, 244, 0.82);
  max-width: 60ch;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.panel {
  padding: 1.25rem;
}

.panel h2 {
  margin-top: 0;
  font-size: 1.15rem;
}

label {
  display: block;
  margin-bottom: 0.9rem;
  color: rgba(244, 244, 244, 0.92);
}

input,
select,
textarea {
  width: 100%;
  margin-top: 0.35rem;
  box-sizing: border-box;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(10, 10, 12, 0.75);
  color: #f4f4f4;
  padding: 0.8rem 0.9rem;
  font: inherit;
}

textarea {
  resize: vertical;
}

.two-col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.preview-panel {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.preview-card {
  padding: 1rem;
}

.preview-badge {
  margin: 0 0 0.4rem;
  color: #f7e6a3;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.preview-card h3,
.preview-email h3 {
  margin-top: 0;
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.preview-meta span {
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  background: rgba(74, 144, 217, 0.16);
  border: 1px solid rgba(74, 144, 217, 0.28);
}

.preview-note {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(244, 244, 244, 0.9);
}

.preview-email {
  padding: 1rem;
}

pre {
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  color: rgba(244, 244, 244, 0.9);
  font-family: inherit;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;
}

.primary-button,
.secondary-link,
.primary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.85rem 1.2rem;
  text-decoration: none;
}

.primary-button {
  border: none;
  background: linear-gradient(135deg, #f7e6a3, #f3c969);
  color: #121114;
  font-weight: 700;
  cursor: pointer;
}

.secondary-link,
.primary-link {
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f4f4f4;
  background: rgba(255, 255, 255, 0.04);
}

.helper {
  margin: 0;
  color: rgba(244, 244, 244, 0.72);
  max-width: 56ch;
}

.status-card {
  margin-bottom: 1rem;
  padding: 0.95rem 1rem;
}

.status-card.success {
  border-color: rgba(103, 198, 107, 0.42);
  color: #c9f7cb;
}

.status-card.error {
  border-color: rgba(232, 104, 104, 0.42);
  color: #ffd1d1;
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .hero,
  .actions {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>