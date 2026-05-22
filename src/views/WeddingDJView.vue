<template>
  <div class="page">
    <div class="banner">
      <RouterLink to="/services" class="back-link">← Services</RouterLink>
      <h1>WEDDING DJ</h1>
      <span></span>
    </div>

    <div class="content">
      <!-- SUCCESS STATE -->
      <div v-if="submitted" class="budget-card success-card">
        <div class="card-header"><span class="card-title">Inquiry Received!</span></div>
        <p class="muted">Thank you for reaching out. Your inquiry ID is:</p>
        <p class="lead-id">{{ submittedLeadId }}</p>
        <p class="muted">We'll be in touch shortly to discuss your event.</p>
      </div>

      <template v-else>
        <div class="budget-card intro-card">
          <div class="card-header"><span class="card-title">Premium DJ &amp; Production</span></div>
          <p class="muted">Fill out the form below and we'll follow up with availability, pricing, and a personalized contract. All rates are based on a ${{ config.dj_with_gear_rate_per_hour }}/hr DJ+gear rate.</p>
        </div>

        <!-- CONTACT INFO -->
        <div class="section-label">Contact Information</div>
        <div class="budget-card">
          <div class="form-section">
            <label>Your Name</label>
            <input type="text" v-model="form.client_name" required />
          </div>
          <div class="form-section">
            <label>Email</label>
            <input type="email" v-model="form.client_email" required />
          </div>
          <div class="form-section">
            <label>Phone</label>
            <input type="tel" v-model="form.client_phone" />
          </div>
        </div>

        <!-- EVENT DETAILS -->
        <div class="section-label">Event Details</div>
        <div class="budget-card">
          <div class="form-section">
            <label>Event Date</label>
            <input type="date" v-model="form.event_date" required />
          </div>
          <div class="form-section">
            <label>Venue Name</label>
            <input type="text" v-model="form.venue_name" placeholder="e.g. The Westin Hotel" />
          </div>
          <div class="form-section">
            <label>Venue Address</label>
            <input type="text" v-model="form.venue_address" />
          </div>
          <div class="form-section">
            <label>Event Start</label>
            <input type="time" v-model="form.event_start" required />
          </div>
          <div class="form-section">
            <label>Event End</label>
            <input type="time" v-model="form.event_end" required />
          </div>
          <div class="form-section">
            <label>Expected Guests</label>
            <input type="number" v-model="form.guest_count" min="1" />
          </div>
        </div>

        <!-- SERVICES -->
        <div class="section-label">Services Requested</div>
        <div class="budget-card">
          <div class="checkbox-row">
            <label class="check-label">
              <input type="checkbox" v-model="form.dj_needed" />
              DJ Performance (${{ config.dj_with_gear_rate_per_hour }}/hr incl. gear)
            </label>
          </div>
          <div class="checkbox-row">
            <label class="check-label">
              <input type="checkbox" v-model="form.production_needed" />
              Production Management (flat ${{ config.production_flat_rate }})
            </label>
          </div>
          <div class="checkbox-row">
            <label class="check-label">
              <input type="checkbox" v-model="form.lighting_needed" />
              Lighting (included in gear package)
            </label>
          </div>
          <div class="checkbox-row" v-if="form.production_needed">
            <label class="check-label">
              <input type="checkbox" v-model="form.outsourced_dj" />
              Outsource DJ separately (${{ config.outsourced_dj_rate_per_hour }}/hr — I handle production only)
            </label>
          </div>

          <div class="section-sub">Equipment Included</div>
          <div class="chips">
            <span class="chip" v-for="item in config.equipment" :key="item">{{ item }}</span>
          </div>
        </div>

        <!-- MUSIC -->
        <div class="section-label">Music Preferences</div>
        <div class="budget-card">
          <div class="form-section">
            <label>Primary Genre(s)</label>
            <input type="text" v-model="form.music_genres" placeholder="e.g. Top 40, R&B, Bollywood" />
          </div>
          <div class="form-section">
            <label>Do Not Play</label>
            <input type="text" v-model="form.music_avoid" placeholder="Genres or artists to avoid" />
          </div>
          <div class="form-section">
            <label>Must-Play Songs</label>
            <textarea v-model="form.must_play" placeholder="List any songs you definitely want played"></textarea>
          </div>
          <div class="form-section">
            <label>First Dance Song</label>
            <input type="text" v-model="form.first_dance" placeholder="Artist – Track name" />
          </div>
        </div>

        <!-- LOGISTICS -->
        <div class="section-label">Logistics</div>
        <div class="budget-card">
          <div class="form-section">
            <label>Load-In Time</label>
            <input type="time" v-model="form.load_in_time" />
          </div>
          <div class="form-section">
            <label>Meals Provided?</label>
            <select v-model="form.meals_provided">
              <option value="" disabled>Select...</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="TBD">TBD</option>
            </select>
          </div>
          <div class="form-section">
            <label>Additional Notes</label>
            <textarea v-model="form.logistics_notes" placeholder="Parking, load-in instructions, special requests..."></textarea>
          </div>
        </div>

        <!-- PAYMENT -->
        <div class="section-label">Payment Preference</div>
        <div class="budget-card">
          <div class="radio-row">
            <label class="radio-label green" v-for="method in config.payment_methods" :key="method">
              <input type="radio" v-model="form.payment_preference" :value="method" />
              {{ method }}
            </label>
          </div>
          <p class="muted" style="margin-top: 0.5rem;">Deposit required: ${{ config.deposit }}</p>
        </div>

        <!-- OTHER -->
        <div class="section-label">Anything Else?</div>
        <div class="budget-card">
          <div class="form-section">
            <label>Message</label>
            <textarea v-model="form.message" placeholder="Any other info we should know..."></textarea>
          </div>
        </div>

        <div class="budget-card submit-card">
          <p v-if="submitError" class="field-error">{{ submitError }}</p>
          <button class="btn-primary" @click="submitInquiry" :disabled="submitting">
            {{ submitting ? 'Submitting...' : 'SEND INQUIRY' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import { doc, setDoc } from 'firebase/firestore'
import { festivall_db } from '@/firebase'
import { sendFestivallDJSlack } from '/scripts/notifications.js'
import { WEDDING_DJ_CONFIG } from '@/config/weddingDJConfig.js'

const config = WEDDING_DJ_CONFIG
const submitted = ref(false)
const submitting = ref(false)
const submitError = ref('')
const submittedLeadId = ref('')

const form = reactive({
  client_name: '',
  client_email: '',
  client_phone: '',
  event_date: '',
  venue_name: '',
  venue_address: '',
  event_start: '',
  event_end: '',
  guest_count: '',
  dj_needed: true,
  production_needed: false,
  lighting_needed: true,
  outsourced_dj: false,
  music_genres: '',
  music_avoid: '',
  must_play: '',
  first_dance: '',
  load_in_time: '',
  meals_provided: '',
  logistics_notes: '',
  payment_preference: '',
  message: ''
})

const submitInquiry = async () => {
  submitError.value = ''
  if (!form.client_name || !form.client_email || !form.event_date || !form.event_start || !form.event_end) {
    submitError.value = 'Please fill in your name, email, and event date/times.'
    return
  }

  const lead_id = uuidv4().slice(0, 8)
  const payload = { ...form, lead_id, created_at: new Date().toISOString() }

  const text = `💍 *Wedding DJ Inquiry*\n\nLead ID: \`${lead_id}\`\nClient: ${form.client_name}\nEmail: ${form.client_email}\nPhone: ${form.client_phone || 'n/a'}\nDate: ${form.event_date}\nVenue: ${form.venue_name || 'TBD'} — ${form.venue_address || ''}\nTime: ${form.event_start} – ${form.event_end}\nGuests: ${form.guest_count || 'n/a'}\n\nServices: DJ=${form.dj_needed}, Production=${form.production_needed}, Lighting=${form.lighting_needed}, Outsourced DJ=${form.outsourced_dj}\nGenres: ${form.music_genres || 'n/a'}\nFirst Dance: ${form.first_dance || 'n/a'}\nPayment Pref: ${form.payment_preference || 'n/a'}\nMessage: ${form.message || 'n/a'}`

  submitting.value = true
  try {
    await setDoc(doc(festivall_db, 'dj_inquiries', lead_id), payload)
    await sendFestivallDJSlack(text)
    submittedLeadId.value = lead_id
    submitted.value = true
  } catch (err) {
    console.error(err)
    submitError.value = 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page {
  width: 100%;
  min-height: 100vh;
  background-color: #1f1e22;
  color: #e0e0e0;
  padding-bottom: 3rem;
}

.banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  padding: 0.75rem 1rem;
}

.back-link { font-size: 11px; color: var(--festivall-baby-blue); text-decoration: none; }
h1 { font-size: 13px; letter-spacing: 0.12em; color: var(--festivall-baby-blue); margin: 0; }

.content { max-width: 800px; margin: 0 auto; padding: 1rem; }

.section-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: #666; margin: 1rem 0 2px;
}

.section-sub {
  font-size: 10px; font-weight: 600; letter-spacing: 0.07em;
  text-transform: uppercase; color: #555; margin: 0.75rem 0 4px;
}

.budget-card { background-color: #252528; padding: 0.75rem; margin-bottom: 1px; }

.card-header {
  border-bottom: 1px solid #333; padding-bottom: 0.35rem; margin-bottom: 0.5rem;
}
.card-title { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #ccc; }

.muted { font-size: 12px; color: #888; line-height: 1.6; margin: 0 0 0.25rem; }

.lead-id {
  font-size: 18px; font-weight: 700; color: var(--festivall-baby-blue);
  font-family: monospace; letter-spacing: 0.1em; margin: 0.5rem 0;
}

.chips { display: flex; flex-wrap: wrap; gap: 4px; }
.chip {
  font-size: 10px; padding: 3px 8px;
  border: 1px solid #444; border-radius: 3px;
  color: #aaa; background-color: #1f1e22;
}

.checkbox-row { margin-bottom: 6px; }
.check-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: #ccc; cursor: pointer;
}
.check-label input[type='checkbox'] { accent-color: var(--festivall-baby-blue); }

.radio-row { display: flex; flex-wrap: wrap; gap: 1rem; }
.radio-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: #ccc; cursor: pointer;
}
.radio-label.green { color: #4caf50; }
.radio-label input[type='radio'] { accent-color: var(--festivall-baby-blue); }

.form-section {
  display: flex; flex-direction: row; align-items: stretch; margin-bottom: 6px;
}
.form-section label {
  width: 30%; min-width: 130px;
  font-size: 11px; padding: 8px 10px;
  background-color: var(--festivall-baby-blue); color: #000;
  border-radius: 4px 0 0 4px; display: flex; align-items: center;
}
.form-section input,
.form-section select,
.form-section textarea {
  flex: 1; font-size: 11px; padding: 8px 10px;
  background-color: #1a1a1d; color: #e0e0e0;
  border: 1px solid #444; border-left: none;
  border-radius: 0 4px 4px 0; outline: none;
}
.form-section textarea { min-height: 70px; resize: vertical; }
.form-section input:focus,
.form-section select:focus,
.form-section textarea:focus { border-color: var(--festivall-baby-blue); }
.form-section select option { background-color: #252528; color: #e0e0e0; }

.submit-card { margin-top: 1px; }
.success-card p { margin: 0.5rem 0; }

.field-error { font-size: 11px; color: #ef5350; margin: 0 0 6px; }

.btn-primary {
  width: 100%; padding: 10px;
  background-color: var(--festivall-baby-blue); color: #000;
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  border: none; border-radius: 4px; cursor: pointer;
}
.btn-primary:hover:not(:disabled) { background-color: #fff; }
.btn-primary:disabled { opacity: 0.5; cursor: default; }

@media (max-width: 600px) {
  .form-section { flex-direction: column; }
  .form-section label { width: 100%; border-radius: 4px 4px 0 0; min-width: unset; }
  .form-section input,
  .form-section select,
  .form-section textarea { border-left: 1px solid #444; border-top: none; border-radius: 0 0 4px 4px; }
}
</style>
