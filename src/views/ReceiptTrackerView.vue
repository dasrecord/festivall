<template>
  <div class="receipt-page">

    <!-- Banner -->
    <div class="banner">
      <RouterLink to="/">
        <img src="@/assets/images/festivall_emblem_white.png" alt="Festivall Logo" class="logo" />
      </RouterLink>
      <h1>RECEIPT TRACKER 2026</h1>
      <span class="banner-spacer"></span>
    </div>

    <!-- Step 1 — ID Gate -->
    <div v-if="step === 1" class="step-wrap">
      <div class="budget-card">
        <div class="card-header">
          <span class="card-title">Volunteer ID</span>
        </div>
        <p class="step-hint">Enter your volunteer ID code to get started.</p>
        <div class="id-form">
          <input
            v-model="idCodeInput"
            class="field-input"
            placeholder="ID code"
            :disabled="validating"
            @keyup.enter="validateIdCode"
          />
          <button
            class="primary-btn"
            :disabled="!idCodeInput.trim() || validating"
            @click="validateIdCode"
          >
            {{ validating ? 'Checking…' : 'Continue' }}
          </button>
        </div>
        <p v-if="idError" class="error-msg">{{ idError }}</p>
      </div>
    </div>

    <!-- Step 2 — Submission Form -->
    <div v-else-if="step === 2" class="step-wrap">
      <div class="budget-card volunteer-greeting">
        <span class="greeting-name">{{ volunteerName }}</span>
        <button class="ghost-btn" @click="reset">Change ID</button>
      </div>

      <div class="budget-card">
        <div class="card-header">
          <span class="card-title">Submit Receipt</span>
        </div>

        <div class="form-grid">
          <label class="field-label">Category</label>
          <select v-model="form.category" class="field-input">
            <option value="infrastructure">Infrastructure</option>
            <option value="marketing">Marketing</option>
            <option value="food">Food</option>
            <option value="miscellaneous">Miscellaneous</option>
            <option v-if="isAdmin" value="recoupable">Recoupable (advance)</option>
          </select>
          <template v-if="form.category === 'recoupable'">
            <span></span>
            <p class="recoup-hint">Tracked as a priority repayment — paid back first from ticket revenue. Use the description to name the artist or purpose (e.g. "DJ Name — upfront advance").</p>
          </template>

          <label class="field-label">Description</label>
          <input
            v-model="form.description"
            class="field-input"
            placeholder="e.g. Plywood sheets, Adobe CC, Food supplies"
            maxlength="120"
          />

          <label class="field-label">Amount (CAD)</label>
          <input
            v-model="form.amount"
            class="field-input"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
          />

          <label class="field-label">Receipt URL <span class="optional">(optional)</span></label>
          <input
            v-model="form.receiptUrl"
            class="field-input"
            type="url"
            placeholder="https://…"
          />

          <label class="field-label">
            Upload Image <span class="optional">(optional)</span>
          </label>
          <div class="file-row">
            <label class="file-label">
              <input
                ref="fileInput"
                type="file"
                accept="image/*,application/pdf"
                class="file-hidden"
                @change="onFileChange"
              />
              <span class="file-btn">{{ form.file ? form.file.name : 'Choose file…' }}</span>
            </label>
            <button v-if="form.file" class="ghost-btn" @click="clearFile">✕</button>
          </div>
        </div>

        <p v-if="!attachmentPresent && submitAttempted" class="error-msg">
          At least one of URL or image upload is required.
        </p>
        <p v-if="submitError" class="error-msg">{{ submitError }}</p>

        <div class="form-actions">
          <button
            class="primary-btn"
            :disabled="!formValid || submitting"
            @click="submitReceipt"
          >
            {{ submitting ? 'Uploading…' : 'Submit Receipt' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Step 3 — Confirmation + History -->
    <div v-else-if="step === 3" class="step-wrap">
      <div class="budget-card success-card">
        <span class="success-icon">✓</span>
        <div>
          <div class="success-title">Receipt submitted</div>
          <div class="success-sub">{{ lastSubmitted.description }} — {{ fmtCAD(lastSubmitted.amount) }}</div>
        </div>
      </div>

      <div class="budget-card">
        <div class="card-header">
          <span class="card-title">Your Submissions</span>
          <span class="card-badge amber">{{ fmtCAD(historyTotal) }}</span>
        </div>

        <div v-if="loadingHistory" class="state-row">Loading…</div>

        <template v-else>
          <div v-for="r in history" :key="r.id" class="line-item">
            <div class="history-meta">
              <span class="line-name">{{ r.description }}</span>
              <span class="history-cat">{{ r.category }}</span>
            </div>
            <a
              v-if="r.receipt_image_url || r.receipt_url"
              :href="r.receipt_image_url || r.receipt_url"
              target="_blank"
              rel="noopener noreferrer"
              class="receipt-link"
              title="View receipt"
            >&#128206;</a>
            <span class="line-amount amber">{{ fmtCAD(r.amount) }}</span>
          </div>
          <div v-if="!history.length" class="empty-row">No submissions yet</div>

          <div v-if="history.length" class="subtotal-row">
            <span class="subtotal-label">Total</span>
            <span class="subtotal-amount amber">{{ fmtCAD(historyTotal) }}</span>
          </div>
        </template>
      </div>

      <div class="step-wrap-actions">
        <button class="primary-btn" @click="submitAnother">Submit Another</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { reunion_db, reunion_storage } from '@/firebase'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

// ── State ─────────────────────────────────────────────────────────────────────
const step = ref(1)
const idCodeInput = ref('')
const validating = ref(false)
const idError = ref('')
const volunteerName = ref('')
const confirmedIdCode = ref('')

const submitAttempted = ref(false)
const submitting = ref(false)
const submitError = ref('')

const lastSubmitted = ref({ description: '', amount: 0 })

const history = ref([])
const loadingHistory = ref(false)
let unsubHistory = null

const fileInput = ref(null)
const isAdmin = ref(false)

const form = ref({
  category: 'infrastructure',
  description: '',
  amount: '',
  receiptUrl: '',
  file: null
})

// ── Computed ──────────────────────────────────────────────────────────────────
const attachmentPresent = computed(
  () => !!form.value.receiptUrl.trim() || !!form.value.file
)

const formValid = computed(
  () =>
    form.value.description.trim() &&
    Number(form.value.amount) > 0 &&
    attachmentPresent.value
)

const historyTotal = computed(() =>
  history.value.reduce((sum, r) => sum + Number(r.amount || 0), 0)
)

// ── Formatting ────────────────────────────────────────────────────────────────
const fmtCAD = (n) =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 2
  }).format(Number(n) || 0)

// ── Step 1 — ID validation ────────────────────────────────────────────────────
const validateIdCode = async () => {
  idError.value = ''
  const code = idCodeInput.value.trim().toLowerCase()
  if (!code) return

  validating.value = true
  try {
    const q = query(
      collection(reunion_db, 'participants_2026'),
      where('id_code', '==', code)
    )
    const snap = await getDocs(q)

    if (snap.empty) {
      idError.value = 'ID code not found. Please check and try again.'
      return
    }

    const p = snap.docs[0].data()
    const types = p.roles?.applicant_types || []

    if (!types.includes('Volunteer')) {
      idError.value = 'This ID code is not registered as a volunteer.'
      return
    }

    volunteerName.value = p.contact?.fullname || code
    confirmedIdCode.value = code
    step.value = 2
  } catch (e) {
    console.error('ID validation error:', e)
    idError.value = 'An error occurred. Please try again.'
  } finally {
    validating.value = false
  }
}

// ── File handling ─────────────────────────────────────────────────────────────
const onFileChange = (e) => {
  form.value.file = e.target.files[0] || null
}

const clearFile = () => {
  form.value.file = null
  if (fileInput.value) fileInput.value.value = ''
}

// ── Step 2 — Submit receipt ───────────────────────────────────────────────────
const submitReceipt = async () => {
  submitAttempted.value = true
  submitError.value = ''

  if (!formValid.value) return

  submitting.value = true
  try {
    let receipt_image_path = null
    let receipt_image_url = null

    if (form.value.file) {
      const ts = Date.now()
      const safeName = form.value.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `receipts_2026/${confirmedIdCode.value}/${ts}_${safeName}`
      const sRef = storageRef(reunion_storage, path)
      await uploadBytes(sRef, form.value.file)
      receipt_image_url = await getDownloadURL(sRef)
      receipt_image_path = path
    }

    const docData = {
      id_code: confirmedIdCode.value,
      volunteer_name: volunteerName.value,
      category: form.value.category,
      description: form.value.description.trim(),
      amount: Number(form.value.amount),
      submitted_at: serverTimestamp()
    }

    if (form.value.receiptUrl.trim()) docData.receipt_url = form.value.receiptUrl.trim()
    if (receipt_image_path) docData.receipt_image_path = receipt_image_path
    if (receipt_image_url) docData.receipt_image_url = receipt_image_url

    await addDoc(collection(reunion_db, 'receipts_2026'), docData)

    lastSubmitted.value = {
      description: form.value.description.trim(),
      amount: Number(form.value.amount)
    }

    subscribeHistory()
    step.value = 3
  } catch (e) {
    console.error('Submit receipt error:', e)
    submitError.value = 'Failed to submit. Please try again.'
  } finally {
    submitting.value = false
  }
}

// ── History subscription ──────────────────────────────────────────────────────
const subscribeHistory = () => {
  if (unsubHistory) unsubHistory()
  loadingHistory.value = true
  const q = query(
    collection(reunion_db, 'receipts_2026'),
    where('id_code', '==', confirmedIdCode.value)
  )
  unsubHistory = onSnapshot(q, (snap) => {
    history.value = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.submitted_at?.seconds || 0) - (a.submitted_at?.seconds || 0))
    loadingHistory.value = false
  })
}

// ── Reset ─────────────────────────────────────────────────────────────────────
const reset = () => {
  if (unsubHistory) { unsubHistory(); unsubHistory = null }
  idCodeInput.value = ''
  idError.value = ''
  volunteerName.value = ''
  confirmedIdCode.value = ''
  resetForm()
  step.value = 1
}

const resetForm = () => {
  submitAttempted.value = false
  submitError.value = ''
  form.value = { category: 'infrastructure', description: '', amount: '', receiptUrl: '', file: null }
  if (fileInput.value) fileInput.value.value = ''
}

const submitAnother = () => {
  resetForm()
  step.value = 2
}

onMounted(() => {
  isAdmin.value = !!localStorage.getItem('user')
})

onUnmounted(() => {
  if (unsubHistory) unsubHistory()
})
</script>

<style scoped>
/* ── Page ──────────────────────────────────────────────────────────────────── */
.receipt-page {
  width: 100vw;
  min-height: 100vh;
  background-color: #1f1e22;
  color: #e0e0e0;
  font-size: 11px;
  line-height: 1.4;
  padding-bottom: 3rem;
}

/* ── Banner ──────────────────────────────────────────────────────────────────── */
.banner {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  padding: 0.75rem 1rem;
}

.logo { height: 32px; width: auto; }

h1 {
  font-size: 13px;
  letter-spacing: 0.12em;
  color: var(--festivall-baby-blue);
  margin: 0;
}

.banner-spacer { width: 80px; }

/* ── Step wrapper ────────────────────────────────────────────────────────────── */
.step-wrap {
  max-width: 480px;
  margin: 1.5rem auto;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.step-wrap-actions {
  margin-top: 0.75rem;
  display: flex;
  justify-content: center;
}

/* ── Card ────────────────────────────────────────────────────────────────────── */
.budget-card {
  background-color: #252528;
  padding: 0.6rem 0.75rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid #333;
}

.card-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #ccc;
}

.card-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 3px;
}

.amber { color: #ffa726; }

/* ── Volunteer greeting ──────────────────────────────────────────────────────── */
.volunteer-greeting {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.greeting-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--festivall-baby-blue);
}

/* ── Form ────────────────────────────────────────────────────────────────────── */
.step-hint {
  font-size: 11px;
  color: #777;
  margin: 0 0 0.5rem;
}

.id-form {
  display: flex;
  gap: 6px;
}

.form-grid {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 5px 8px;
  align-items: center;
  margin-bottom: 0.5rem;
}

.field-label {
  font-size: 10px;
  color: #777;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  white-space: nowrap;
}

.optional {
  color: #555;
  text-transform: none;
  letter-spacing: 0;
}

.field-input {
  padding: 4px 7px;
  border-radius: 4px;
  border: 1px solid #444;
  background-color: #1f1e22;
  color: #e0e0e0;
  font-size: 11px;
  width: 100%;
  box-sizing: border-box;
}

.field-input::placeholder { color: #555; }

select.field-input {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23666'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 22px;
}

/* ── File picker ─────────────────────────────────────────────────────────────── */
.file-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.file-label { display: contents; }

.file-hidden {
  display: none;
}

.file-btn {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid #444;
  background-color: #1f1e22;
  color: #999;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.file-btn:hover { border-color: #666; color: #ccc; }

/* ── Buttons ─────────────────────────────────────────────────────────────────── */
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
  padding-top: 0.4rem;
  border-top: 1px solid #333;
}

.primary-btn {
  padding: 5px 14px;
  background-color: var(--festivall-baby-blue);
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
}

.primary-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.ghost-btn {
  padding: 3px 8px;
  background: none;
  border: 1px solid #444;
  border-radius: 4px;
  color: #777;
  font-size: 10px;
  cursor: pointer;
  white-space: nowrap;
}

.ghost-btn:hover { border-color: #666; color: #ccc; }

/* ── Errors ──────────────────────────────────────────────────────────────────── */
.error-msg {
  font-size: 10px;
  color: #ef5350;
  margin: 4px 0 0;
}

/* ── Success ─────────────────────────────────────────────────────────────────── */
.success-card {
  display: flex;
  align-items: center;
  gap: 10px;
}

.success-icon {
  font-size: 18px;
  color: #4caf50;
  flex-shrink: 0;
}

.success-title {
  font-size: 12px;
  font-weight: 600;
  color: #4caf50;
}

.success-sub {
  font-size: 10px;
  color: #777;
  margin-top: 1px;
}

/* ── Line items ──────────────────────────────────────────────────────────────── */
.line-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 4px 0;
  border-bottom: 1px solid #2e2e32;
}

.history-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.line-name {
  font-size: 11px;
  color: #d0d0d0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-cat {
  font-size: 9px;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.line-amount {
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  margin-left: auto;
}

.receipt-link {
  font-size: 13px;
  text-decoration: none;
  flex-shrink: 0;
  opacity: 0.7;
}

.receipt-link:hover { opacity: 1; }

.empty-row {
  font-size: 10px;
  color: #555;
  padding: 4px 0;
  font-style: italic;
}

.subtotal-row {
  display: flex;
  justify-content: space-between;
  padding: 3px 0 0;
  margin-top: 2px;
  border-top: 1px solid #444;
}

.subtotal-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #666;
}

.subtotal-amount {
  font-size: 11px;
  font-weight: 700;
}

/* ── State row ───────────────────────────────────────────────────────────────── */
.state-row {
  font-size: 11px;
  color: #555;
  padding: 1rem 0;
  text-align: center;
}

/* ── Recoupable hint ─────────────────────────────────────────────────────────── */
.recoup-hint {
  font-size: 10px;
  color: #ffa726;
  margin: 0;
  line-height: 1.4;
  opacity: 0.85;
}

/* ── Mobile ──────────────────────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .field-label {
    margin-bottom: -2px;
  }
}
</style>
