<template>
  <div class="medprep-contract">

    <!-- LOADING -->
    <div v-if="loading" class="state-screen">
      <p>Loading your agreement...</p>
    </div>

    <!-- NOT FOUND -->
    <div v-else-if="!application" class="state-screen">
      <h2>Link Not Found</h2>
      <p>This offer link is invalid or has expired. Contact Dr. Das directly.</p>
    </div>

    <!-- ALREADY SIGNED -->
    <div v-else-if="application.contract?.signed" class="state-screen signed">
      <div class="signed-icon">✓</div>
      <h2>Agreement Already Signed</h2>
      <p>
        This agreement was signed by <strong>{{ application.contact?.fullname }}</strong>
        on {{ formatDate(application.contract.signedAt) }}.
      </p>
      <p class="state-sub">Dr. Das will be in touch to confirm your discovery call.</p>
      <a href="/medprep" class="btn-ghost">← Back to the program</a>
    </div>

    <!-- CONTRACT -->
    <div v-else class="contract-shell">

      <div class="contract-header">
        <div class="contract-eyebrow">DR. PRASENJIT DAS MEDPREP PROGRAM</div>
        <h1>Offer of Acceptance</h1>
        <p class="contract-intro">
          Dr. Das has reviewed your application and is extending an offer to work with you.
          Read the agreement below carefully, provide your discovery call availability,
          and sign to confirm your spot.
        </p>
      </div>

      <!-- OFFER SUMMARY -->
      <section class="contract-section">
        <h2>1. The Offer</h2>
        <div class="offer-box">
          <div class="offer-row">
            <span class="offer-label">Student</span>
            <span class="offer-val">{{ application.contact?.fullname }}</span>
          </div>
          <div class="offer-row">
            <span class="offer-label">Program</span>
            <span class="offer-val">{{ packageName }}</span>
          </div>
          <div class="offer-row">
            <span class="offer-label">Commitment Deposit</span>
            <span class="offer-val">{{ packageDetails.upfront }}</span>
          </div>
          <div class="offer-row">
            <span class="offer-label">Success Premium</span>
            <span class="offer-val">{{ packageDetails.success }} <span class="offer-note">(due upon acceptance to medical school)</span></span>
          </div>
          <div class="offer-row total-row">
            <span class="offer-label">Total if Accepted</span>
            <span class="offer-val">{{ packageDetails.total }}</span>
          </div>
        </div>
        <div class="package-features" v-if="packageDetails.features.length">
          <p class="features-label">This program includes:</p>
          <ul>
            <li v-for="f in packageDetails.features" :key="f">{{ f }}</li>
          </ul>
        </div>
      </section>

      <!-- TERMS -->
      <section class="contract-section">
        <h2>2. Program Terms</h2>
        <div class="terms-block">
          <p>
            Dr. Prasenjit Das ("Consultant") agrees to provide personalized medical school admissions
            consulting services to the student named above ("Student"), as described under the selected
            program, commencing upon execution of this agreement.
          </p>
          <p>
            <strong>Commitment Deposit.</strong> The Student agrees to pay the commitment deposit
            ({{ packageDetails.upfront }}) upon signing this agreement, prior to any session or service
            commencing. This deposit is non-refundable once consulting work has begun.
          </p>
          <p>
            <strong>Success Premium.</strong> The success premium ({{ packageDetails.success }}) is due
            within 30 days of the Student receiving a written offer of acceptance to any medical school
            program for the application cycle(s) covered by this agreement. The Student acknowledges
            that professional student lines of credit (typically $200,000 or greater) are available
            through major Canadian banks upon acceptance and may be used to satisfy this payment.
          </p>
          <p>
            <strong>No Guarantee.</strong> The Consultant does not guarantee acceptance to any medical
            school program. The success premium is only owed if an offer of acceptance is received.
            If the Student is not accepted in the covered cycle, no success premium is owed.
          </p>
          <p>
            <strong>Confidentiality.</strong> Both parties agree to maintain confidentiality regarding
            the contents of all application materials, strategy discussions, and personal information
            shared in the course of this engagement.
          </p>
          <p>
            <strong>Governing Law.</strong> This agreement is governed by the laws of the Province of
            Saskatchewan, Canada.
          </p>
        </div>
      </section>

      <!-- COI -->
      <section class="contract-section coi-section">
        <h2>3. Conflict of Interest Declaration</h2>
        <div class="terms-block coi-block">
          <p>
            Dr. Das is a faculty member at the University of Saskatchewan College of Medicine.
            The Student acknowledges this fact and agrees that, if they are applying to the
            University of Saskatchewan College of Medicine, they will submit a formal recusal request
            to the U of S College of Medicine admissions office ensuring that Dr. Das is not involved
            in evaluating their application in any capacity.
          </p>
          <p>
            This recusal request must be submitted by the Student before or concurrent with submitting
            their application to U of S. Failure to do so will constitute a breach of this agreement.
          </p>
          <p>
            This declaration protects the integrity of the admissions process, the Student's standing
            as an applicant, and Dr. Das's standing as faculty. It is mandatory and non-negotiable.
          </p>
        </div>
      </section>

      <!-- DISCOVERY CALL AVAILABILITY -->
      <section class="contract-section">
        <h2>4. Discovery Call Availability</h2>
        <p class="section-desc">
          Before work begins, Dr. Das will schedule a 30-minute discovery call to align on strategy
          and answer your questions. Provide <strong>at least 3 windows of availability</strong> over
          the next two weeks (include date, time, and your timezone).
        </p>
        <div class="field-group">
          <label>Your availability</label>
          <textarea
            v-model="availability"
            rows="5"
            placeholder="e.g.&#10;Tue June 3 — 7:00 PM - 9:00 PM CST&#10;Wed June 4 — 12:00 PM - 2:00 PM CST&#10;Fri June 6 — 6:00 PM - 8:00 PM CST"
          />
          <div class="field-error" v-if="errors.availability">{{ errors.availability }}</div>
        </div>
      </section>

      <!-- SIGNATURE -->
      <section class="contract-section signature-section">
        <h2>5. Signature</h2>
        <p class="section-desc">
          By typing your full legal name and clicking Sign & Accept, you confirm that you have
          read and agree to all terms above, including the conflict of interest declaration.
        </p>
        <div class="field-group">
          <label>Full legal name (e-signature)</label>
          <input
            type="text"
            v-model="signature"
            :placeholder="application.contact?.fullname"
          />
          <div class="field-error" v-if="errors.signature">{{ errors.signature }}</div>
        </div>
        <div class="sign-meta">
          <span>Date: {{ currentDate }}</span>
          <span>Student: {{ application.contact?.fullname }}</span>
          <span>Consultant: Dr. Prasenjit Das, MD</span>
        </div>

        <div class="submit-error" v-if="submitError">{{ submitError }}</div>

        <button
          class="btn-sign"
          @click="signContract"
          :disabled="submitting"
        >
          {{ submitting ? 'Saving...' : 'Sign & Accept Offer' }}
        </button>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { festivall_db } from '@/firebase.js'
import { sendMedPrep } from '@/../scripts/notifications.js'

const route = useRoute()

const loading = ref(true)
const application = ref<any>(null)
const availability = ref('')
const signature = ref('')
const submitting = ref(false)
const submitError = ref('')
const errors = ref<{ availability?: string; signature?: string }>({})

const currentDate = new Date().toLocaleDateString('en-CA', {
  year: 'numeric', month: 'long', day: 'numeric'
})

const packageMap: Record<string, { name: string; upfront: string; success: string; total: string; features: string[] }> = {
  blueprint: {
    name: 'The Blueprint',
    upfront: '$500',
    success: '$2,000',
    total: '$2,500',
    features: ['3 strategy sessions', 'GPA & MCAT roadmap', 'Experience gap analysis', 'Written strategic report', '30-day email Q&A'],
  },
  campaign: {
    name: 'The Campaign',
    upfront: '$750',
    success: '$7,250',
    total: '$8,000',
    features: ['Unlimited sessions through cycle', 'Personal statement (multi-draft)', 'ABS review', 'CASPer prep', 'MMI mock sessions', 'References strategy'],
  },
  the_return: {
    name: 'The Return',
    upfront: '$500',
    success: '$4,000',
    total: '$4,500',
    features: ['Prior cycle gap analysis', 'Updated personal statement', 'MMI + panel interview prep', 'Strategic reapplication plan'],
  },
  full_ride: {
    name: 'The Full Ride',
    upfront: '$1,500',
    success: '$11,000',
    total: '$12,500',
    features: ['Everything in The Campaign', 'Monthly 1-on-1s year-round', 'Residency & CaRMS strategy', 'Direct messaging access', 'Multi-year support if needed'],
  },
}

const packageDetails = computed(() => {
  const key = application.value?.logistics?.package_interest
  return packageMap[key] ?? { name: 'Program TBD', upfront: 'TBD', success: 'TBD', total: 'TBD', features: [] }
})

const packageName = computed(() => packageDetails.value.name)

function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

async function loadApplication() {
  const id = route.params.id as string
  if (!id) { loading.value = false; return }
  try {
    const snap = await getDoc(doc(festivall_db, 'medprep_applications', id))
    if (snap.exists()) {
      application.value = snap.data()
    }
  } catch (e) {
    console.error('Error loading MedPrep application:', e)
  } finally {
    loading.value = false
  }
}

function validate(): boolean {
  errors.value = {}
  if (!availability.value.trim()) {
    errors.value.availability = 'Please provide at least 3 windows of availability.'
  }
  if (!signature.value.trim()) {
    errors.value.signature = 'Please type your full legal name to sign.'
  } else if (
    signature.value.trim().toLowerCase() !==
    (application.value?.contact?.fullname ?? '').toLowerCase()
  ) {
    errors.value.signature = 'Signature must match your full legal name exactly as entered in your application.'
  }
  return Object.keys(errors.value).length === 0
}

async function signContract() {
  if (!validate()) return
  submitting.value = true
  submitError.value = ''

  const id = route.params.id as string
  const signedAt = new Date().toISOString()

  try {
    await updateDoc(doc(festivall_db, 'medprep_applications', id), {
      contract: {
        signed: true,
        signature: signature.value.trim(),
        signedAt,
        availability: availability.value.trim(),
        contractVersion: '2026-01',
      },
      status: 'reviewing',
    })

    // Update local state for instant UI switch
    application.value = {
      ...application.value,
      contract: {
        signed: true,
        signature: signature.value.trim(),
        signedAt,
        availability: availability.value.trim(),
      },
    }

    // Notify Dr. Das
    await sendMedPrep(
      [
        `:pen: *MedPrep Contract Signed*`,
        `:bust_in_silhouette: ${application.value.contact?.fullname}`,
        `:email: ${application.value.contact?.email}`,
        `:briefcase: Package: ${packageName.value}`,
        `:calendar: Availability provided: ${availability.value.trim().split('\n').join(' | ')}`,
        `:clock1: Signed at: ${signedAt}`,
      ].join('\n')
    )
  } catch (e) {
    console.error('Error signing contract:', e)
    submitError.value = 'Something went wrong. Please try again or contact Dr. Das directly.'
  } finally {
    submitting.value = false
  }
}

onMounted(loadApplication)
</script>

<style scoped>
/* ─── Shell ──────────────────────────────────────────────── */
.medprep-contract {
  background: #0d0d0d;
  min-height: 100vh;
  color: #e8e8e8;
  font-family: 'Oswald', sans-serif;
}

/* ─── State screens ──────────────────────────────────────── */
.state-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 16px;
  text-align: center;
  padding: 40px 24px;
  max-width: 560px;
  margin: 0 auto;
}
.state-screen h2 {
  font-size: 1.6rem;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.state-screen p {
  font-size: 0.9rem;
  color: #888;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.7;
}
.state-sub {
  font-size: 0.8rem !important;
  color: #555 !important;
}
.signed-icon {
  font-size: 3rem;
  color: #c9a227;
}
.btn-ghost {
  display: inline-block;
  color: #c9a227;
  text-decoration: none;
  font-size: 0.82rem;
  letter-spacing: 0.1em;
  border: 1px solid #c9a227;
  padding: 10px 24px;
  margin-top: 8px;
  transition: background 0.2s, color 0.2s;
}
.btn-ghost:hover {
  background: #c9a227;
  color: #0d0d0d;
}

/* ─── Contract shell ─────────────────────────────────────── */
.contract-shell {
  max-width: 760px;
  margin: 0 auto;
  padding: 56px 24px 100px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ─── Header ─────────────────────────────────────────────── */
.contract-header {
  border-bottom: 1px solid #1e1e1e;
  padding-bottom: 40px;
  margin-bottom: 48px;
}
.contract-eyebrow {
  font-size: 0.7rem;
  color: #c9a227;
  letter-spacing: 0.18em;
  margin-bottom: 12px;
}
.contract-header h1 {
  font-size: 2.2rem;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 16px;
}
.contract-intro {
  font-size: 0.9rem;
  color: #888;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.7;
  max-width: 580px;
}

/* ─── Sections ───────────────────────────────────────────── */
.contract-section {
  padding: 40px 0;
  border-bottom: 1px solid #1a1a1a;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.contract-section:last-child {
  border-bottom: none;
}
.contract-section h2 {
  font-size: 0.8rem;
  color: #c9a227;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin: 0;
}
.section-desc {
  font-size: 0.88rem;
  color: #777;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.6;
  margin: 0;
}

/* ─── Offer box ──────────────────────────────────────────── */
.offer-box {
  border: 1px solid #2a2a2a;
  border-radius: 2px;
  overflow: hidden;
}
.offer-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 12px 20px;
  border-bottom: 1px solid #1a1a1a;
  gap: 16px;
}
.offer-row:last-child { border-bottom: none; }
.total-row {
  background: #141208;
}
.offer-label {
  font-size: 0.72rem;
  color: #666;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  flex-shrink: 0;
}
.offer-val {
  font-size: 0.9rem;
  color: #e8e8e8;
  font-family: sans-serif;
  font-weight: 400;
  text-align: right;
}
.total-row .offer-val {
  color: #c9a227;
  font-weight: 600;
}
.offer-note {
  font-size: 0.72rem;
  color: #555;
  font-family: sans-serif;
  font-weight: 300;
}
.package-features {
  margin-top: 4px;
}
.features-label {
  font-size: 0.72rem;
  color: #555;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 0 0 10px;
}
.package-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.package-features li {
  font-size: 0.82rem;
  color: #777;
  font-family: sans-serif;
  font-weight: 300;
  padding-left: 14px;
  position: relative;
  line-height: 1.4;
}
.package-features li::before {
  content: '-';
  position: absolute;
  left: 0;
  color: #444;
}

/* ─── Terms ──────────────────────────────────────────────── */
.terms-block {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.terms-block p {
  font-size: 0.85rem;
  color: #888;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.7;
  margin: 0;
}
.terms-block strong {
  color: #bbb;
  font-weight: 500;
}
.coi-block {
  border-left: 3px solid #c9a22744;
  padding-left: 20px;
}
.coi-section h2 {
  color: #c9a22799;
}

/* ─── Fields ─────────────────────────────────────────────── */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
label {
  font-size: 0.72rem;
  color: #666;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
input[type='text'],
textarea {
  background: #111;
  border: 1px solid #2a2a2a;
  color: #e8e8e8;
  font-family: sans-serif;
  font-size: 0.9rem;
  font-weight: 300;
  padding: 10px 14px;
  border-radius: 2px;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}
input:focus, textarea:focus { border-color: #c9a227; }
textarea { resize: vertical; }
.field-error {
  font-size: 0.75rem;
  color: #c0392b;
  font-family: sans-serif;
}

/* ─── Signature section ──────────────────────────────────── */
.sign-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  font-size: 0.75rem;
  color: #555;
  font-family: sans-serif;
  font-weight: 300;
  letter-spacing: 0.04em;
  padding: 12px 0;
  border-top: 1px solid #1a1a1a;
  border-bottom: 1px solid #1a1a1a;
}
.submit-error {
  font-size: 0.8rem;
  color: #c0392b;
  font-family: sans-serif;
}
.btn-sign {
  background: #c9a227;
  color: #0d0d0d;
  border: none;
  font-family: 'Oswald', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 14px 40px;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  align-self: flex-start;
}
.btn-sign:hover { background: #e0b52e; }
.btn-sign:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
