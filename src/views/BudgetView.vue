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
          <span class="summary-sub">Expected: {{ fmtCAD(expectedRevenue) }}</span>
        </div>
        <div class="summary-cell">
          <span class="summary-label">Meal Cost</span>
          <span class="summary-amount amber">{{ fmtCAD(mealTicketCost) }}</span>
          <span class="summary-sub">Expected: {{ fmtCAD(expectedMealCost) }}</span>
        </div>
        <div class="summary-cell">
          <span class="summary-label">Expenses</span>
          <span class="summary-amount red">{{ fmtCAD(totalExpenses) }}</span>
          <span class="summary-sub">Expected: {{ fmtCAD(expectedExpenses) }}</span>
        </div>
        <div class="summary-cell">
          <span class="summary-label">Net</span>
          <span class="summary-amount" :class="net >= 0 ? 'green' : 'red'">{{ fmtCAD(net) }}</span>
          <span class="summary-sub">Expected: {{ fmtCAD(expectedNet) }}</span>
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
            <span class="line-meta">{{ p.mealsRedeemed }} of {{ (p.order?.meal_packages || 0) * 2 }} tickets</span>
            <span class="line-amount amber">{{ fmtCAD(p.mealsRedeemed * 15) }}</span>
          </div>
          <div v-if="!participantsWithMeals.length" class="empty-row">No meals redeemed yet</div>
        </div>

        <!-- Artists card -->
        <div class="budget-card">
          <div class="card-header">
            <span class="card-title">Artists</span>
            <span class="card-badge red">
              {{ fmtCAD(artistMonetaryTotal) }}
              <span v-if="artistsNonCAD.length" class="non-cad-note">+{{ artistsNonCAD.length }} non-CAD</span>
            </span>
          </div>

          <div class="section-label">Monetary</div>
          <div v-for="a in artistsMonetary" :key="a.id" class="line-item">
            <span class="line-name">{{ a.roles?.act_name || a.contact?.fullname }}</span>
            <div class="line-right">
              <span class="line-amount red">{{ fmtAmount(a.parsedAmount, a.parsedCurrency) }}</span>
              <span v-if="getAddons(a.application?.data?.rates).tent" class="addon-tag" title="Tent">Tent</span>
              <span v-if="getAddons(a.application?.data?.rates).sleeping_bag" class="addon-tag" title="Sleeping Bag">SB</span>
              <span v-if="getAddons(a.application?.data?.rates).airport_pickup" class="addon-tag" title="Airport Pickup">&#x2191;YYZ</span>
              <span v-if="getAddons(a.application?.data?.rates).airport_dropoff" class="addon-tag" title="Airport Dropoff">&#x2193;YYZ</span>
            </div>
          </div>
          <div v-if="!artistsMonetary.length" class="empty-row">None set</div>

          <div class="section-sep"></div>

          <div class="section-label">Non-Monetary</div>
          <div v-for="a in artistsNonMonetary" :key="a.id" class="line-item">
            <span class="line-name">{{ a.roles?.act_name || a.contact?.fullname }}</span>
            <span class="line-meta inkind">{{ getNonMonetary(a.application?.data?.rates) }}</span>
          </div>
          <div v-if="!artistsNonMonetary.length" class="empty-row">None set</div>
        </div>

        <!-- Staff card -->
        <div class="budget-card">
          <div class="card-header">
            <span class="card-title">Staff</span>
            <span class="card-badge red">
              {{ fmtCAD(staffMonetaryTotal) }}
              <span v-if="staffNonCAD.length" class="non-cad-note">+{{ staffNonCAD.length }} non-CAD</span>
            </span>
          </div>

          <div class="section-label">Monetary</div>
          <div v-for="s in staffMonetary" :key="s.id" class="line-item">
            <span class="line-name">{{ s.contact?.fullname || s.id }}</span>
            <span class="line-meta">{{ s.roles?.volunteer_type }}</span>
            <div class="line-right">
              <span class="line-amount red">{{ fmtAmount(s.parsedAmount, s.parsedCurrency) }}</span>
              <span v-if="getAddons(s.application?.data?.rates).tent" class="addon-tag" title="Tent">Tent</span>
              <span v-if="getAddons(s.application?.data?.rates).sleeping_bag" class="addon-tag" title="Sleeping Bag">SB</span>
              <span v-if="getAddons(s.application?.data?.rates).airport_pickup" class="addon-tag" title="Airport Pickup">&#x2191;YYZ</span>
              <span v-if="getAddons(s.application?.data?.rates).airport_dropoff" class="addon-tag" title="Airport Dropoff">&#x2193;YYZ</span>
            </div>
          </div>
          <div v-if="!staffMonetary.length" class="empty-row">None set</div>

          <div class="section-sep"></div>

          <div class="section-label">Non-Monetary</div>
          <div v-for="s in staffNonMonetary" :key="s.id" class="line-item">
            <span class="line-name">{{ s.contact?.fullname || s.id }}</span>
            <span class="line-meta">{{ s.roles?.volunteer_type }}</span>
            <span class="line-meta inkind">{{ getNonMonetary(s.application?.data?.rates) }}</span>
          </div>
          <div v-if="!staffNonMonetary.length" class="empty-row">None set</div>
        </div>

        <!-- Recoupable Advances -->
        <div class="budget-card">
          <div class="card-header">
            <span class="card-title">Recoupable Advances</span>
            <span class="card-badge amber">{{ fmtCAD(recoupableTotal) }}</span>
          </div>
          <div class="repay-note">⟳ Repaid first from ticket revenue</div>

          <template v-for="person in recoupableByPerson" :key="person.name">
            <div class="section-label">{{ person.name }} &mdash; {{ fmtCAD(person.total) }}</div>
            <div v-for="r in person.items" :key="r.id" class="line-item">
              <span class="line-name">{{ r.description }}</span>
              <a
                v-if="r.receipt_image_url || r.receipt_url"
                :href="r.receipt_image_url || r.receipt_url"
                target="_blank"
                rel="noopener noreferrer"
                class="recoup-link"
                title="View receipt"
              >&#128206;</a>
              <span class="line-amount amber">{{ fmtCAD(r.amount) }}</span>
            </div>
          </template>

          <div v-if="!recoupableItems.length" class="empty-row">No advances recorded yet</div>

          <div v-if="recoupableByPerson.length > 1" class="recoup-total-row">
            <span class="recoup-total-label">Total outstanding</span>
            <span class="line-amount amber">{{ fmtCAD(recoupableTotal) }}</span>
          </div>
        </div>

        <!-- Infrastructure -->
        <ManualCategoryCard
          title="Infrastructure"
          category="infrastructure"
          :items="itemsByCategory('infrastructure')"
          :receipts="receiptsByCategory('infrastructure')"
          :target="BUDGET_TARGETS.infrastructure"
          :is-admin="isAdmin"
          :saving="saving"
          @add="addItem"
          @remove="removeItem"
          @remove-receipt="removeReceipt"
        />

        <!-- Marketing -->
        <ManualCategoryCard
          title="Marketing"
          category="marketing"
          :items="itemsByCategory('marketing')"
          :receipts="receiptsByCategory('marketing')"
          :target="BUDGET_TARGETS.marketing"
          :is-admin="isAdmin"
          :saving="saving"
          @add="addItem"
          @remove="removeItem"
          @remove-receipt="removeReceipt"
        />

        <!-- Food -->
        <ManualCategoryCard
          title="Food"
          category="food"
          :items="itemsByCategory('food')"
          :receipts="receiptsByCategory('food')"
          :target="BUDGET_TARGETS.food"
          :is-admin="isAdmin"
          :saving="saving"
          @add="addItem"
          @remove="removeItem"
          @remove-receipt="removeReceipt"
        />

        <!-- Miscellaneous -->
        <ManualCategoryCard
          title="Miscellaneous"
          category="miscellaneous"
          :items="itemsByCategory('miscellaneous')"
          :receipts="receiptsByCategory('miscellaneous')"
          :target="BUDGET_TARGETS.miscellaneous"
          :is-admin="isAdmin"
          :saving="saving"
          @add="addItem"
          @remove="removeItem"
          @remove-receipt="removeReceipt"
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
import { BUDGET_TARGETS } from '@/config/festivalConfig'

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
const receiptItems = ref([])
let unsubscribeBudget = null
let unsubscribeReceipts = null

// ── Participant derived data ──────────────────────────────────────────────────
// Expected vs Actual Revenue
const expectedRevenue = computed(() =>
  participants.value.reduce(
    (sum, p) => sum + Number(p.order?.fiat_total_price_cad || 0),
    0
  )
)

// Expected vs Actual Meal Tickets
const expectedMealTickets = computed(() =>
  participants.value.reduce((sum, p) => sum + (p.order?.meal_packages || 0), 0)
)
const expectedMealCost = computed(() => expectedMealTickets.value * 15)


// ...existing code...



const expectedArtistTotal = computed(() =>
  artistsMonetary.value.reduce((sum, a) => sum + (a.parsedAmount || 0), 0) +
  artistsNonMonetary.value.length * 0 // If you want to estimate non-monetary, adjust here
)
const expectedStaffTotal = computed(() =>
  staffMonetary.value.reduce((sum, s) => sum + (s.parsedAmount || 0), 0) +
  staffNonMonetary.value.length * 0 // If you want to estimate non-monetary, adjust here
)

const expectedExpenses = computed(() =>
  expectedArtistTotal.value +
  expectedStaffTotal.value +
  expectedMealCost.value +
  manualTotal.value +
  receiptTotal.value
)

const expectedNet = computed(() => expectedRevenue.value - expectedExpenses.value)
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
      mealsRedeemed: p.order?.meal_redemption_history?.length || 0
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
const parseAmountFromString = (str) => {
  if (!str) return null
  const match = String(str).match(/\$?\s*([\d,]+(?:\.\d{1,2})?)/)
  if (!match) return null
  return parseFloat(match[1].replace(/,/g, ''))
}

const parseAmount = (rates) => {
  if (!rates) return null
  if (typeof rates === 'object') return rates.monetary_amount > 0 ? rates.monetary_amount : null
  return parseAmountFromString(rates)
}

const parseCurrency = (rates) => {
  if (!rates) return 'CAD'
  if (typeof rates === 'object') return rates.monetary_currency || 'CAD'
  return 'CAD'
}

const isMonetary = (rates) => parseAmount(rates) !== null

const getNonMonetary = (rates) => {
  if (!rates) return null
  if (typeof rates === 'object') return rates.non_monetary || null
  if (typeof rates === 'string') return rates
  return null
}

const getAddons = (rates) => {
  if (!rates || typeof rates !== 'object') return {}
  return rates.addons || {}
}

const fmtAmount = (amount, currency) => {
  if (!amount) return ''
  if (currency === 'BTC') return `${amount} BTC`
  if (currency === 'JPY') return `\xa5${Number(amount).toLocaleString('en-CA', { maximumFractionDigits: 0 })} JPY`
  if (currency === 'EUR') return `\u20ac${Number(amount).toLocaleString('en-CA', { maximumFractionDigits: 2 })} EUR`
  if (currency === 'GBP') return `\xa3${Number(amount).toLocaleString('en-CA', { maximumFractionDigits: 2 })} GBP`
  if (currency === 'USD') return `$${Number(amount).toLocaleString('en-CA', { maximumFractionDigits: 2 })} USD`
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(amount)
}

// ── Artists ───────────────────────────────────────────────────────────────────
// Deduplicate participants for compensation lists
const compensatedParticipants = computed(() => {
  // Only those with a compensation/rates field
  return participants.value.filter((p) => p.application?.data?.rates)
})

// Prioritize: Artist > Staff (Volunteer), Monetary > Non-Monetary
const uniqueCompensated = computed(() => {
  const seen = new Set()
  const result = []
  // First, add all compensated Artists
  compensatedParticipants.value.forEach((p) => {
    if ((p.roles?.applicant_types || []).includes('Artist') && !seen.has(p.id)) {
      result.push(p)
      seen.add(p.id)
    }
  })
  // Then, add compensated Volunteers not already added
  compensatedParticipants.value.forEach((p) => {
    if ((p.roles?.applicant_types || []).includes('Volunteer') && !seen.has(p.id)) {
      result.push(p)
      seen.add(p.id)
    }
  })
  return result
})

const artistsMonetary = computed(() =>
  uniqueCompensated.value
    .filter((a) => (a.roles?.applicant_types || []).includes('Artist') && isMonetary(a.application?.data?.rates))
    .map((a) => ({ ...a, parsedAmount: parseAmount(a.application.data.rates), parsedCurrency: parseCurrency(a.application.data.rates) }))
)

const artistsNonMonetary = computed(() =>
  uniqueCompensated.value
    .filter((a) => (a.roles?.applicant_types || []).includes('Artist') && !isMonetary(a.application?.data?.rates))
)

const staffMonetary = computed(() =>
  uniqueCompensated.value
    .filter((s) => (s.roles?.applicant_types || []).includes('Volunteer') && isMonetary(s.application?.data?.rates) && !(s.roles?.applicant_types || []).includes('Artist'))
    .map((s) => ({ ...s, parsedAmount: parseAmount(s.application.data.rates), parsedCurrency: parseCurrency(s.application.data.rates) }))
)

const staffNonMonetary = computed(() =>
  uniqueCompensated.value
    .filter((s) => (s.roles?.applicant_types || []).includes('Volunteer') && !isMonetary(s.application?.data?.rates) && !(s.roles?.applicant_types || []).includes('Artist'))
)

const artistMonetaryTotal = computed(() =>
  artistsMonetary.value.filter((a) => a.parsedCurrency === 'CAD').reduce((sum, a) => sum + (a.parsedAmount || 0), 0)
)

const staffMonetaryTotal = computed(() =>
  staffMonetary.value.filter((s) => s.parsedCurrency === 'CAD').reduce((sum, s) => sum + (s.parsedAmount || 0), 0)
)

const artistsNonCAD = computed(() => artistsMonetary.value.filter((a) => a.parsedCurrency !== 'CAD'))
const staffNonCAD = computed(() => staffMonetary.value.filter((s) => s.parsedCurrency !== 'CAD'))

// ── Manual budget items ───────────────────────────────────────────────────────
const itemsByCategory = (cat) => budgetItems.value.filter((i) => i.category === cat)

const manualTotal = computed(() =>
  budgetItems.value.reduce((sum, i) => sum + Number(i.amount || 0), 0)
)

// ── Receipt items ─────────────────────────────────────────────────────────────
const receiptsByCategory = (cat) => receiptItems.value.filter((r) => r.category === cat)

const receiptTotal = computed(() =>
  receiptItems.value
    .filter((r) => r.category !== 'recoupable')
    .reduce((sum, r) => sum + Number(r.amount || 0), 0)
)

const recoupableItems = computed(() =>
  receiptItems.value.filter((r) => r.category === 'recoupable')
)

const recoupableTotal = computed(() =>
  recoupableItems.value.reduce((sum, r) => sum + Number(r.amount || 0), 0)
)

const recoupableByPerson = computed(() => {
  const map = {}
  recoupableItems.value.forEach((r) => {
    const name = r.volunteer_name || r.id_code
    if (!map[name]) map[name] = { name, items: [], total: 0 }
    map[name].items.push(r)
    map[name].total += Number(r.amount || 0)
  })
  return Object.values(map).sort((a, b) => b.total - a.total)
})

const totalExpenses = computed(
  () =>
    artistMonetaryTotal.value +
    staffMonetaryTotal.value +
    mealTicketCost.value +
    manualTotal.value +
    receiptTotal.value
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

const removeReceipt = async (id) => {
  if (!isAdmin.value) return
  try {
    await deleteDoc(doc(reunion_db, 'receipts_2026', id))
  } catch (e) {
    console.error('Error deleting receipt:', e)
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

const subscribeReceipts = () => {
  unsubscribeReceipts = onSnapshot(collection(reunion_db, 'receipts_2026'), (snap) => {
    receiptItems.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })
}

onMounted(async () => {
  checkAuth()
  await loadParticipants()
  subscribeBudget()
  subscribeReceipts()
  loading.value = false
})

onUnmounted(() => {
  if (unsubscribeBudget) unsubscribeBudget()
  if (unsubscribeReceipts) unsubscribeReceipts()
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

.line-right {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  margin-left: auto;
}
.addon-tag {
  font-size: 12px;
  opacity: 0.75;
  cursor: default;
}
.non-cad-note {
  display: block;
  font-size: 9px;
  font-weight: 400;
  color: #aaa;
  margin-top: 1px;
}

/* ── Recoupable Advances ─────────────────────────────────────────────────────── */
.repay-note {
  font-size: 9px;
  color: #ffa726;
  opacity: 0.85;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.3rem;
}

.recoup-link {
  font-size: 13px;
  text-decoration: none;
  opacity: 0.7;
  flex-shrink: 0;
}

.recoup-link:hover { opacity: 1; }

.recoup-total-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 3px 0 0;
  margin-top: 2px;
  border-top: 1px solid #444;
}

.recoup-total-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #666;
}
</style>
