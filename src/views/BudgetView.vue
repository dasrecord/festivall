<template>
  <div class="budget-page">

    <!-- Banner -->
    <div class="banner">
      <RouterLink to="/dashboard">
        <img src="@/assets/images/festivall_emblem_white.png" alt="Festivall Logo" class="logo" />
      </RouterLink>
      <h1>BUDGET 2026</h1>
      <RouterLink to="/dashboard" class="back-link">← Dashboard</RouterLink>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-row">Loading…</div>

    <template v-if="!loading">
      <!-- Summary Strip -->
      <div class="summary-strip">
        <div class="summary-cell">
          <span class="summary-label">Revenue</span>
          <span class="summary-amount green">{{ fmtCAD(totalRevenue) }}</span>
        </div>
        <div class="summary-cell">
          <span class="summary-label">Meal Cost</span>
          <span class="summary-amount amber">{{ fmtCAD(mealTicketCost) }}</span>
          <span class="summary-sub">{{ mealTicketsRedeemed }}× $15</span>
        </div>
        <div class="summary-cell">
          <span class="summary-label">Expenses</span>
          <span class="summary-amount red">{{ fmtCAD(totalExpenses) }}</span>
        </div>
        <div class="summary-cell">
          <span class="summary-label">Net</span>
          <span class="summary-amount" :class="net >= 0 ? 'green' : 'red'">{{ fmtCAD(net) }}</span>
        </div>
      </div>

      <!-- Budget Grid -->
      <div class="budget-grid">

        <!-- Revenue card -->
        <div class="budget-card">
          <div class="card-header">
            <span class="card-title">Revenue</span>
            <span class="card-badge green">{{ fmtCAD(totalRevenue) }}</span>
          </div>

          <div class="section-label">Paid</div>
          <div v-for="p in paidParticipants" :key="p.id" class="line-item">
            <span class="line-name">{{ p.contact?.fullname || p.id }}</span>
            <span class="line-meta">{{ p.order?.ticket_type }} · {{ p.order?.payment_type }}</span>
            <span class="line-amount green">{{ fmtCAD(p.order?.fiat_total_price_cad) }}</span>
          </div>
          <div v-if="!paidParticipants.length" class="empty-row">No paid participants yet</div>

          <div class="section-sep"></div>

          <div class="section-label">Unpaid / Pending</div>
          <div v-for="p in unpaidParticipants" :key="p.id" class="line-item muted">
            <span class="line-name">{{ p.contact?.fullname || p.id }}</span>
            <span class="line-meta">{{ p.order?.ticket_type }} · {{ p.order?.payment_type }}</span>
            <span class="line-amount muted">{{ fmtCAD(p.order?.fiat_total_price_cad) }}</span>
          </div>
          <div v-if="!unpaidParticipants.length" class="empty-row">None</div>
        </div>

        <!-- Meal Tickets card -->
        <div class="budget-card">
          <div class="card-header">
            <span class="card-title">Meal Tickets</span>
            <span class="card-badge amber">{{ fmtCAD(mealTicketCost) }}</span>
          </div>
          <div class="section-label">Redeemed — {{ mealTicketsRedeemed }} × $15</div>
          <div v-for="p in participantsWithMeals" :key="p.id" class="line-item">
            <span class="line-name">{{ p.contact?.fullname || p.id }}</span>
            <span class="line-meta">{{ p.mealsRedeemed }} of {{ p.order?.meal_packages }} pkg</span>
            <span class="line-amount amber">{{ fmtCAD(p.mealsRedeemed * 15) }}</span>
          </div>
          <div v-if="!participantsWithMeals.length" class="empty-row">No meals redeemed yet</div>
        </div>

        <!-- Artists card -->
        <div class="budget-card">
          <div class="card-header">
            <span class="card-title">Artists</span>
            <span class="card-badge red">{{ fmtCAD(artistMonetaryTotal) }}</span>
          </div>

          <div class="section-label">Monetary</div>
          <div v-for="a in artistsMonetary" :key="a.id" class="line-item">
            <span class="line-name">{{ a.roles?.act_name || a.contact?.fullname }}</span>
            <span class="line-amount red">{{ fmtCAD(a.parsedAmount) }}</span>
          </div>
          <div v-if="!artistsMonetary.length" class="empty-row">None set</div>

          <div class="section-sep"></div>

          <div class="section-label">Non-Monetary</div>
          <div v-for="a in artistsNonMonetary" :key="a.id" class="line-item">
            <span class="line-name">{{ a.roles?.act_name || a.contact?.fullname }}</span>
            <span class="line-meta inkind">{{ a.application?.data?.rates }}</span>
          </div>
          <div v-if="!artistsNonMonetary.length" class="empty-row">None set</div>
        </div>

        <!-- Staff card -->
        <div class="budget-card">
          <div class="card-header">
            <span class="card-title">Staff</span>
            <span class="card-badge red">{{ fmtCAD(staffMonetaryTotal) }}</span>
          </div>

          <div class="section-label">Monetary</div>
          <div v-for="s in staffMonetary" :key="s.id" class="line-item">
            <span class="line-name">{{ s.contact?.fullname || s.id }}</span>
            <span class="line-meta">{{ s.roles?.volunteer_type }}</span>
            <span class="line-amount red">{{ fmtCAD(s.parsedAmount) }}</span>
          </div>
          <div v-if="!staffMonetary.length" class="empty-row">None set</div>

          <div class="section-sep"></div>

          <div class="section-label">Non-Monetary</div>
          <div v-for="s in staffNonMonetary" :key="s.id" class="line-item">
            <span class="line-name">{{ s.contact?.fullname || s.id }}</span>
            <span class="line-meta">{{ s.roles?.volunteer_type }}</span>
            <span class="line-meta inkind">{{ s.application?.data?.rates }}</span>
          </div>
          <div v-if="!staffNonMonetary.length" class="empty-row">None set</div>
        </div>

        <!-- Infrastructure -->
        <ManualCategoryCard
          title="Infrastructure"
          category="infrastructure"
          :items="itemsByCategory('infrastructure')"
          :is-admin="isAdmin"
          :saving="saving"
          @add="addItem"
          @remove="removeItem"
        />

        <!-- Marketing -->
        <ManualCategoryCard
          title="Marketing"
          category="marketing"
          :items="itemsByCategory('marketing')"
          :is-admin="isAdmin"
          :saving="saving"
          @add="addItem"
          @remove="removeItem"
        />

        <!-- Miscellaneous -->
        <ManualCategoryCard
          title="Miscellaneous"
          category="miscellaneous"
          :items="itemsByCategory('miscellaneous')"
          :is-admin="isAdmin"
          :saving="saving"
          @add="addItem"
          @remove="removeItem"
        />

      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { reunion_db } from '@/firebase'
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import ManualCategoryCard from '@/components/ManualCategoryCard.vue'

// ── Auth ──────────────────────────────────────────────────────────────────────
const isAdmin = ref(false)
let authCheckHandler = null

const checkAuth = () => {
  authCheckHandler = () => {
    isAdmin.value = !!localStorage.getItem('user')
  }
  authCheckHandler()
  window.addEventListener('storage', authCheckHandler)
}

// ── State ─────────────────────────────────────────────────────────────────────
const loading = ref(true)
const saving = ref(false)
const participants = ref([])
const budgetItems = ref([])
let unsubscribeBudget = null

// ── Participant derived data ──────────────────────────────────────────────────
const paidParticipants = computed(() =>
  participants.value.filter(
    (p) => p.order?.paid === true && Number(p.order?.fiat_total_price_cad || 0) > 0
  )
)

const unpaidParticipants = computed(() =>
  participants.value.filter(
    (p) =>
      !p.order?.paid &&
      Number(p.order?.fiat_total_price_cad || 0) > 0 &&
      p.order?.payment_type !== 'inkind'
  )
)

const participantsWithMeals = computed(() =>
  participants.value
    .map((p) => ({
      ...p,
      mealsRedeemed: Math.max(
        0,
        (p.order?.meal_packages || 0) - (p.order?.meal_tickets_remaining || 0)
      )
    }))
    .filter((p) => p.mealsRedeemed > 0)
)

const mealTicketsRedeemed = computed(() =>
  participantsWithMeals.value.reduce((sum, p) => sum + p.mealsRedeemed, 0)
)

const mealTicketCost = computed(() => mealTicketsRedeemed.value * 15)

const totalRevenue = computed(() =>
  paidParticipants.value.reduce(
    (sum, p) => sum + Number(p.order?.fiat_total_price_cad || 0),
    0
  )
)

// ── Compensation helpers ──────────────────────────────────────────────────────
const parseAmount = (ratesStr) => {
  if (!ratesStr) return null
  const match = String(ratesStr).match(/\$?\s*([\d,]+(?:\.\d{1,2})?)/)
  if (!match) return null
  return parseFloat(match[1].replace(/,/g, ''))
}

const isMonetary = (ratesStr) => parseAmount(ratesStr) !== null

// ── Artists ───────────────────────────────────────────────────────────────────
const artistsWithRates = computed(() =>
  participants.value.filter(
    (p) =>
      (p.roles?.applicant_types || []).includes('Artist') &&
      p.application?.data?.rates
  )
)

const artistsMonetary = computed(() =>
  artistsWithRates.value
    .filter((a) => isMonetary(a.application?.data?.rates))
    .map((a) => ({ ...a, parsedAmount: parseAmount(a.application.data.rates) }))
)

const artistsNonMonetary = computed(() =>
  artistsWithRates.value.filter((a) => !isMonetary(a.application?.data?.rates))
)

const artistMonetaryTotal = computed(() =>
  artistsMonetary.value.reduce((sum, a) => sum + (a.parsedAmount || 0), 0)
)

// ── Staff ─────────────────────────────────────────────────────────────────────
const staffWithRates = computed(() =>
  participants.value.filter(
    (p) =>
      (p.roles?.applicant_types || []).includes('Volunteer') &&
      p.application?.data?.rates
  )
)

const staffMonetary = computed(() =>
  staffWithRates.value
    .filter((s) => isMonetary(s.application?.data?.rates))
    .map((s) => ({ ...s, parsedAmount: parseAmount(s.application.data.rates) }))
)

const staffNonMonetary = computed(() =>
  staffWithRates.value.filter((s) => !isMonetary(s.application?.data?.rates))
)

const staffMonetaryTotal = computed(() =>
  staffMonetary.value.reduce((sum, s) => sum + (s.parsedAmount || 0), 0)
)

// ── Manual budget items ───────────────────────────────────────────────────────
const itemsByCategory = (cat) => budgetItems.value.filter((i) => i.category === cat)

const manualTotal = computed(() =>
  budgetItems.value.reduce((sum, i) => sum + Number(i.amount || 0), 0)
)

const totalExpenses = computed(
  () =>
    artistMonetaryTotal.value +
    staffMonetaryTotal.value +
    mealTicketCost.value +
    manualTotal.value
)

const net = computed(() => totalRevenue.value - totalExpenses.value)

// ── Formatting ────────────────────────────────────────────────────────────────
const fmtCAD = (n) =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0
  }).format(Number(n) || 0)

// ── CRUD ──────────────────────────────────────────────────────────────────────
const addItem = async ({ category, label, amount }) => {
  if (!isAdmin.value || !label || !amount) return
  saving.value = true
  try {
    await addDoc(collection(reunion_db, 'budget_2026'), {
      category,
      label,
      amount: Number(amount),
      createdAt: serverTimestamp()
    })
  } catch (e) {
    console.error('Error adding budget item:', e)
  } finally {
    saving.value = false
  }
}

const removeItem = async (id) => {
  if (!isAdmin.value) return
  try {
    await deleteDoc(doc(reunion_db, 'budget_2026', id))
  } catch (e) {
    console.error('Error deleting budget item:', e)
  }
}

// ── Data loading ──────────────────────────────────────────────────────────────
const loadParticipants = async () => {
  const snap = await getDocs(collection(reunion_db, 'participants_2026'))
  participants.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

const subscribeBudget = () => {
  unsubscribeBudget = onSnapshot(collection(reunion_db, 'budget_2026'), (snap) => {
    budgetItems.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })
}

onMounted(async () => {
  checkAuth()
  await loadParticipants()
  subscribeBudget()
  loading.value = false
})

onUnmounted(() => {
  if (unsubscribeBudget) unsubscribeBudget()
  if (authCheckHandler) window.removeEventListener('storage', authCheckHandler)
})
</script>

<style scoped>
/* ── Page ──────────────────────────────────────────────────────────────────── */
.budget-page {
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

.logo {
  height: 32px;
  width: auto;
}

h1 {
  font-size: 13px;
  letter-spacing: 0.12em;
  color: var(--festivall-baby-blue);
  margin: 0;
}

.back-link {
  font-size: 11px;
  color: var(--festivall-baby-blue);
  text-decoration: none;
}

/* ── Summary strip ───────────────────────────────────────────────────────────── */
.summary-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background-color: #2a2a2e;
  border-bottom: 1px solid #2a2a2e;
}

.summary-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0.25rem;
  background-color: #252528;
}

.summary-label {
  font-size: 9px;
  letter-spacing: 0.1em;
  color: #666;
  text-transform: uppercase;
}

.summary-amount {
  font-size: 14px;
  font-weight: 700;
  margin-top: 1px;
}

.summary-sub {
  font-size: 9px;
  color: #666;
  margin-top: 1px;
}

/* ── Budget grid ─────────────────────────────────────────────────────────────── */
.budget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1px;
  padding: 1px;
  background-color: #2a2a2e;
  margin-top: 1px;
}

/* ── Budget card (used by read-only cards here; ManualCategoryCard has its own) */
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

/* ── Section helpers ─────────────────────────────────────────────────────────── */
.section-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #666;
  margin: 0.35rem 0 0.2rem;
}

.section-sep {
  height: 1px;
  background-color: #333;
  margin: 0.4rem 0;
}

/* ── Line items ──────────────────────────────────────────────────────────────── */
.line-item {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  padding: 2px 0;
  border-bottom: 1px solid #2e2e32;
  flex-wrap: wrap;
}

.line-item.muted {
  opacity: 0.4;
}

.line-name {
  flex: 1;
  font-size: 11px;
  color: #d0d0d0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.line-meta {
  font-size: 10px;
  color: #666;
  white-space: nowrap;
}

.line-meta.inkind {
  color: #909090;
  font-style: italic;
}

.line-amount {
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  margin-left: auto;
}

.empty-row {
  font-size: 10px;
  color: #555;
  padding: 3px 0;
  font-style: italic;
}

/* ── State row ───────────────────────────────────────────────────────────────── */
.state-row {
  padding: 2rem;
  font-size: 11px;
  color: #555;
  text-align: center;
}

/* ── Color tokens ────────────────────────────────────────────────────────────── */
.green  { color: #4caf50; }
.red    { color: #ef5350; }
.amber  { color: #ffa726; }
.muted  { color: #555; }

/* ── Mobile ──────────────────────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .summary-strip {
    grid-template-columns: repeat(2, 1fr);
  }
  .budget-grid {
    grid-template-columns: 1fr;
  }
  .summary-amount {
    font-size: 13px;
  }
}
</style>
