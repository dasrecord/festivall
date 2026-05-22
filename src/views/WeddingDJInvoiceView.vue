<template>
  <div class="contract-page" id="printable">
    <div class="no-print nav-bar">
      <RouterLink to="/wedding-dj" class="back-link">← Back</RouterLink>
      <span class="nav-title">Wedding DJ Contract</span>
      <button class="btn-print" @click="printContract">Export PDF</button>
    </div>

    <div v-if="loading" class="state-msg">Loading contract...</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>

    <div v-else class="contract-body">
      <h1 class="contract-title">DJ Services Agreement</h1>
      <p class="contract-meta">Lead ID: {{ data.lead_id }}</p>

      <!-- 1. PARTIES -->
      <section>
        <h2>1. Parties</h2>
        <p><strong>Client (Person 1):</strong> {{ data.client_name }}, reachable at {{ data.client_email }}{{ data.client_phone ? ', ' + data.client_phone : '' }}.</p>
        <p><strong>Production Provider (Person 2):</strong> {{ config.you.name }}, {{ config.you.address }}.</p>
        <p v-if="data.production_needed"><strong>DJ / Performer (Person 3):</strong> To be confirmed by Production Provider.</p>
      </section>

      <!-- 2. EVENT DETAILS -->
      <section>
        <h2>2. Event Details</h2>
        <p><strong>Date:</strong> {{ data.event_date }}</p>
        <p><strong>Venue:</strong> {{ data.venue_name || 'TBD' }}{{ data.venue_address ? ', ' + data.venue_address : '' }}</p>
        <p><strong>Event Time:</strong> {{ data.event_start }} – {{ data.event_end }}</p>
        <p><strong>Estimated Guests:</strong> {{ data.guest_count || 'TBD' }}</p>
        <p v-if="data.load_in_time"><strong>Load-In Time:</strong> {{ data.load_in_time }}</p>
      </section>

      <!-- 3. PAYMENT TERMS -->
      <section>
        <h2>3. Payment Terms</h2>
        <p>A non-refundable deposit of <strong>${{ config.deposit }}</strong> is due upon signing to secure the date. The remaining balance is due on or before the event date.</p>
        <p>DJ + Gear Rate: <strong>${{ config.dj_with_gear_rate_per_hour }}/hr</strong>.</p>
        <p v-if="data.production_needed">Production Management: <strong>${{ config.production_flat_rate }} flat</strong>.</p>
        <p v-if="data.outsourced_dj">Outsourced DJ Rate: <strong>${{ config.outsourced_dj_rate_per_hour }}/hr</strong>.</p>
        <p>Overtime: <strong>${{ config.overtime_rate_per_hour }}/hr</strong> for each hour beyond contracted end time, billed in 30-min increments.</p>
        <p>Accepted payment methods: {{ config.payment_methods.join(', ') }}.</p>
      </section>

      <!-- 4. EQUIPMENT -->
      <section>
        <h2>4. Equipment Provided</h2>
        <p>The Production Provider will supply the following equipment:</p>
        <ul>
          <li v-for="item in config.equipment" :key="item">{{ item }}</li>
        </ul>
        <p>The client is responsible for providing adequate power outlets and a dry, covered performance area.</p>
      </section>

      <!-- 5. RESPONSIBILITIES -->
      <section>
        <h2>5. Responsibilities</h2>
        <p>The Production Provider agrees to arrive at the scheduled load-in time, set up and test all equipment before the event, and perform professionally for the duration of the contracted time.</p>
        <p>The Client agrees to provide accurate event information, a suitable performance area, and to notify the Production Provider of any schedule changes at least 48 hours in advance.</p>
      </section>

      <!-- 6. OVERTIME -->
      <section>
        <h2>6. Overtime</h2>
        <p>If the Client requests service beyond the contracted end time, overtime will be billed at ${{ config.overtime_rate_per_hour }}/hr in 30-minute increments. Overtime must be agreed upon verbally or in writing during the event.</p>
      </section>

      <!-- 7. MEALS & BREAKS -->
      <section>
        <h2>7. Meals &amp; Breaks</h2>
        <p v-if="data.meals_provided === 'Yes'">The Client has agreed to provide a meal for the production team during the event.</p>
        <p v-else>The production team will arrange their own meals. A 15-minute break per 4 hours of performance time is expected.</p>
      </section>

      <!-- 8. EQUIPMENT LIABILITY -->
      <section>
        <h2>8. Equipment Liability</h2>
        <p>The Production Provider is responsible for the safe transport and setup of their own equipment. The Client is liable for any damage caused to equipment by guests or venue staff during the event.</p>
      </section>

      <!-- 9. CANCELLATION -->
      <section>
        <h2>9. Cancellation Policy</h2>
        <p>The deposit is non-refundable. If the Client cancels within 30 days of the event, 50% of the remaining balance is owed. If the Production Provider cancels, the deposit will be returned in full and reasonable efforts will be made to find a replacement.</p>
      </section>

      <!-- 10. AGREEMENT & SIGNATURES -->
      <section class="signatures-section">
        <h2>10. Agreement &amp; Signatures</h2>
        <p>By signing below, each party agrees to the terms of this contract.</p>

        <!-- Person 1: Client -->
        <div class="sig-block">
          <p class="sig-name">Person 1 — Client: {{ data.client_name }}</p>
          <div v-if="data.person1_signature" class="sig-done">
            <span class="sig-text">✓ Signed: {{ data.person1_signature }}</span>
            <span class="sig-date">{{ formatDate(data.person1_signed_at) }}</span>
          </div>
          <div v-else class="sig-input-row no-print">
            <input type="text" v-model="sig1" placeholder="Type your full name to sign" class="sig-input" />
            <button class="btn-sign" @click="sign(1)" :disabled="signing === 1">
              {{ signing === 1 ? 'Saving...' : 'Sign' }}
            </button>
          </div>
          <p v-if="sigError === 1" class="field-error">Please enter your full name.</p>
        </div>

        <!-- Person 2: Production Provider -->
        <div class="sig-block" v-if="data.production_needed">
          <p class="sig-name">Person 2 — Production Provider: {{ config.you.name }}</p>
          <div v-if="data.person2_signature" class="sig-done">
            <span class="sig-text">✓ Signed: {{ data.person2_signature }}</span>
            <span class="sig-date">{{ formatDate(data.person2_signed_at) }}</span>
          </div>
          <div v-else class="sig-input-row no-print">
            <input type="text" v-model="sig2" placeholder="Type your full name to sign" class="sig-input" />
            <button class="btn-sign" @click="sign(2)" :disabled="signing === 2">
              {{ signing === 2 ? 'Saving...' : 'Sign' }}
            </button>
          </div>
          <p v-if="sigError === 2" class="field-error">Please enter your full name.</p>
        </div>

        <!-- Person 3: DJ/Performer (always present) -->
        <div class="sig-block">
          <p class="sig-name">Person {{ data.production_needed ? '3' : '2' }} — DJ / Performer: TBD</p>
          <div v-if="data.person3_signature" class="sig-done">
            <span class="sig-text">✓ Signed: {{ data.person3_signature }}</span>
            <span class="sig-date">{{ formatDate(data.person3_signed_at) }}</span>
          </div>
          <div v-else class="sig-input-row no-print">
            <input type="text" v-model="sig3" placeholder="Type your full name to sign" class="sig-input" />
            <button class="btn-sign" @click="sign(3)" :disabled="signing === 3">
              {{ signing === 3 ? 'Saving...' : 'Sign' }}
            </button>
          </div>
          <p v-if="sigError === 3" class="field-error">Please enter your full name.</p>
        </div>

        <p v-if="sigSuccess" class="sig-success">{{ sigSuccess }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { festivall_db } from '@/firebase'
import { sendFestivallDJSlack } from '/scripts/notifications.js'
import { WEDDING_DJ_CONFIG } from '@/config/weddingDJConfig.js'

const config = WEDDING_DJ_CONFIG
const route = useRoute()
const lead_id = route.params.lead_id

const loading = ref(true)
const error = ref('')
const data = ref({})

const sig1 = ref('')
const sig2 = ref('')
const sig3 = ref('')
const signing = ref(null)
const sigError = ref(null)
const sigSuccess = ref('')

const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
}

onMounted(async () => {
  try {
    const snap = await getDoc(doc(festivall_db, 'dj_inquiries', lead_id))
    if (!snap.exists()) {
      error.value = 'Contract not found. Please check your lead ID.'
    } else {
      data.value = snap.data()
    }
  } catch (err) {
    error.value = 'Failed to load contract. Please try again.'
    console.error(err)
  } finally {
    loading.value = false
  }
})

const sign = async (person) => {
  const sigMap = { 1: sig1, 2: sig2, 3: sig3 }
  const val = sigMap[person].value.trim()
  if (!val) {
    sigError.value = person
    return
  }
  sigError.value = null
  signing.value = person

  const timestamp = new Date().toISOString()
  const updatePayload = {
    [`person${person}_signature`]: val,
    [`person${person}_signed_at`]: timestamp
  }

  try {
    await updateDoc(doc(festivall_db, 'dj_inquiries', lead_id), updatePayload)
    data.value[`person${person}_signature`] = val
    data.value[`person${person}_signed_at`] = timestamp

    sigSuccess.value = `Person ${person} signature saved.`

    // On Client (Person 1) signature: send playlist link via Slack notification
    if (person === 1) {
      const playlistUrl = `https://festivall.ca/wedding-dj/playlist/${lead_id}`
      await sendFestivallDJSlack(`✅ Contract signed by client: ${val}\nEvent: ${data.value.event_date}\nPlaylist link: ${playlistUrl}`)
    }
  } catch (err) {
    console.error(err)
    sigSuccess.value = ''
    sigError.value = person
  } finally {
    signing.value = null
  }
}

const printContract = () => window.print()
</script>

<style>
/* Global print styles */
@media print {
  .no-print { display: none !important; }
  .contract-page { background: #fff !important; color: #000 !important; }
  .contract-body { padding: 2rem !important; }
  section { break-inside: avoid; }
}
</style>

<style scoped>
.contract-page {
  width: 100%;
  min-height: 100vh;
  background-color: #fff;
  color: #111;
  font-family: Helvetica, Arial, sans-serif;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  padding: 0.75rem 1rem;
}

.back-link { font-size: 11px; color: #81bdfe; text-decoration: none; }
.nav-title { font-size: 12px; color: #ccc; letter-spacing: 0.08em; }

.btn-print {
  font-size: 11px; padding: 5px 12px;
  background-color: #81bdfe; color: #000;
  border: none; border-radius: 4px; cursor: pointer;
}

.state-msg { padding: 2rem; text-align: center; font-size: 14px; color: #555; }
.state-msg.error { color: #c00; }

.contract-body {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.contract-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 4px;
}
.contract-meta {
  font-size: 11px;
  color: #888;
  margin-bottom: 2rem;
}

section {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

h2 {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #333;
  margin-bottom: 0.5rem;
}

p { font-size: 13px; line-height: 1.7; margin: 0.3rem 0; }
ul { padding-left: 1.5rem; margin: 0.3rem 0; }
li { font-size: 13px; line-height: 1.7; }

.signatures-section { border-bottom: none; }

.sig-block {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0.75rem;
  margin: 0.75rem 0;
}

.sig-name { font-size: 12px; font-weight: 600; margin: 0 0 0.5rem; }

.sig-done { display: flex; justify-content: space-between; align-items: center; }
.sig-text { font-size: 13px; color: #2e7d32; font-style: italic; }
.sig-date { font-size: 11px; color: #888; }

.sig-input-row { display: flex; gap: 8px; }
.sig-input {
  flex: 1; font-size: 12px; padding: 7px 10px;
  border: 1px solid #bbb; border-radius: 4px; outline: none;
}
.sig-input:focus { border-color: #81bdfe; }

.btn-sign {
  padding: 7px 14px; font-size: 11px; font-weight: 700;
  background-color: #81bdfe; color: #000;
  border: none; border-radius: 4px; cursor: pointer;
}
.btn-sign:hover:not(:disabled) { background-color: #333; color: #fff; }
.btn-sign:disabled { opacity: 0.5; cursor: default; }

.field-error { font-size: 11px; color: #c00; margin: 4px 0 0; }
.sig-success { font-size: 11px; color: #2e7d32; margin-top: 0.5rem; }
</style>
