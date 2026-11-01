<template>
  <main class="seasonal-admin">
    <header class="page-header">
      <div>
        <RouterLink to="/dashboard" class="back-link">← Dashboard</RouterLink>
        <p class="eyebrow">Dashboard tool</p>
        <h1>Seasonal Promotions</h1>
        <p class="intro">Turn seasonal campaign pages on or off, or add another holiday promotion.</p>
      </div>
    </header>

    <div v-if="!isAuthenticated" class="notice notice--error" role="alert">
      Please log in to manage seasonal promotions.
      <RouterLink to="/login">Go to Login</RouterLink>
    </div>
    <template v-else>
      <p v-if="statusMessage" class="notice" :class="`notice--${statusType}`" role="status">
        {{ statusMessage }}
      </p>
      <p v-if="loadError" class="notice notice--error" role="alert">
        {{ loadError }}
        <button type="button" class="text-button" @click="subscribeToPromos">Retry</button>
      </p>
      <p class="notice notice--info">
        Promotion terms and dates are displayed on the public page. Discount caps, redemption
        limits, and giveaway entry caps must also be enforced by the ticket checkout or a trusted
        backend; this browser dashboard cannot enforce those transaction limits by itself.
      </p>

      <section class="campaign-list" aria-labelledby="campaigns-heading">
        <h2 id="campaigns-heading">Campaigns</h2>
        <p v-if="isLoading">Loading campaigns…</p>
        <article v-for="campaign in campaigns" :key="campaign.id" class="campaign-card">
          <div class="campaign-fields">
            <label>
              Campaign name
              <input v-model="campaign.name" type="text" maxlength="60" />
            </label>
            <label>
              URL slug
              <input v-model="campaign.slug" type="text" maxlength="60" placeholder="holiday-sale" />
            </label>
            <label>
              Promo code
              <input v-model="campaign.promoCode" type="text" maxlength="40" />
            </label>
            <label>
              Promotion type
              <select v-model="campaign.promoType">
                <option value="discount">Discount only</option>
                <option value="giveaway">Giveaway only</option>
                <option value="discount-giveaway">Discount and giveaway</option>
              </select>
            </label>
            <label v-if="campaign.promoType !== 'giveaway'">
              Discount type
              <select v-model="campaign.discountType">
                <option value="percent">Percentage</option>
                <option value="fixed">Fixed amount (CAD)</option>
              </select>
            </label>
            <label v-if="campaign.promoType !== 'giveaway'">
              Discount amount{{ campaign.discountType === 'percent' ? ' (%)' : ' (CAD)' }}
              <input v-model.number="campaign.discountValue" type="number" min="0.01" step="0.01" required />
            </label>
            <label v-if="campaign.promoType !== 'giveaway'">
              Maximum discount (CAD, optional)
              <input v-model.number="campaign.maxDiscountAmount" type="number" min="0" step="0.01" placeholder="No cap" />
            </label>
            <label v-if="campaign.promoType !== 'giveaway'">
              Minimum purchase (CAD, optional)
              <input v-model.number="campaign.minimumSpend" type="number" min="0" step="0.01" placeholder="No minimum" />
            </label>
            <label v-if="campaign.promoType !== 'discount'">
              Prize description
              <input v-model="campaign.prizeDescription" type="text" maxlength="160" />
            </label>
            <label v-if="campaign.promoType !== 'discount'">
              Prize value cap (CAD, optional)
              <input v-model.number="campaign.prizeValue" type="number" min="0" step="0.01" placeholder="No cap" />
            </label>
            <label>
              Offer start date (optional)
              <input v-model="campaign.startsAt" type="date" />
            </label>
            <label>
              Offer end date (optional)
              <input v-model="campaign.endsAt" type="date" />
            </label>
            <label class="campaign-description">
              Official terms URL (optional)
              <input v-model="campaign.termsUrl" type="url" placeholder="https://example.com/terms" />
            </label>
            <label class="campaign-description">
              Festival description
              <textarea v-model="campaign.description" rows="2" maxlength="400"></textarea>
            </label>
            <div class="campaign-link">
              Public page:
              <RouterLink :to="seasonalPromoPath(campaign)" target="_blank">
                {{ publicUrl(campaign) }}
              </RouterLink>
            </div>
          </div>
          <div class="campaign-actions">
            <span class="campaign-state" :class="{ 'campaign-state--on': campaign.enabled }">
              {{ campaign.enabled ? 'On' : 'Off' }}
            </span>
            <button
              type="button"
              class="button button--save"
              :disabled="savingId === campaign.id || !campaign.name.trim() || !campaign.slug.trim() || (campaign.promoType !== 'giveaway' && !campaign.promoCode.trim())"
              @click="saveCampaign(campaign)"
            >
              {{ savingId === campaign.id ? 'Saving…' : 'Save details' }}
            </button>
            <button
              type="button"
              class="button"
              :class="campaign.enabled ? 'button--disable' : 'button--enable'"
              :disabled="savingId === campaign.id"
              @click="toggleCampaign(campaign)"
            >
              Turn {{ campaign.enabled ? 'off' : 'on' }}
            </button>
          </div>
        </article>
        <p v-if="!isLoading && !campaigns.length" class="empty-state">No campaigns yet.</p>
      </section>

      <section class="add-campaign" aria-labelledby="add-campaign-heading">
        <h2 id="add-campaign-heading">Add a seasonal promotion</h2>
        <p>Set a short URL slug such as <code>merry-christmas</code>; its public page will be <code>/reunion-merry-christmas</code>.</p>
        <form class="add-form" @submit.prevent="addCampaign">
          <label>
            Holiday or campaign name
            <input v-model="newName" type="text" maxlength="60" placeholder="New Year" required />
          </label>
          <label>
            Promo code
            <input
              v-model="newPromoCode"
              type="text"
              maxlength="40"
              placeholder="FESTIVAL27"
              :required="newPromoType !== 'giveaway'"
            />
          </label>
          <label>
            URL slug
            <input v-model="newSlug" type="text" maxlength="60" placeholder="merry-christmas" required />
          </label>
          <label>
            Promotion type
            <select v-model="newPromoType">
              <option value="discount">Discount only</option>
              <option value="giveaway">Giveaway only</option>
              <option value="discount-giveaway">Discount and giveaway</option>
            </select>
          </label>
          <button class="button button--enable" type="submit" :disabled="isAdding">
            {{ isAdding ? 'Adding…' : 'Add campaign' }}
          </button>
        </form>
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { festivall_auth, reunion_db } from '@/firebase'
import {
  DEFAULT_SEASONAL_PROMOS,
  seasonalPromoFromData,
  seasonalPromoPath,
  type SeasonalPromo
} from '@/config/seasonalPromos'

interface StoredPromo extends SeasonalPromo {
  updatedAt?: unknown
}

const isAuthenticated = computed(() => !!festivall_auth.currentUser)
const campaigns = ref<StoredPromo[]>(DEFAULT_SEASONAL_PROMOS.map((promo) => ({ ...promo })))
const isLoading = ref(true)
const isAdding = ref(false)
const savingId = ref('')
const loadError = ref('')
const statusMessage = ref('')
const statusType = ref<'success' | 'error'>('success')
const newName = ref('')
const newPromoCode = ref('')
const newSlug = ref('')
const newPromoType = ref<SeasonalPromo['promoType']>('discount-giveaway')
let unsubscribe: (() => void) | undefined

function publicUrl(campaign: SeasonalPromo) {
  return `${window.location.origin}${seasonalPromoPath(campaign)}`
}

function subscribeToPromos() {
  unsubscribe?.()
  isLoading.value = true
  loadError.value = ''

  unsubscribe = onSnapshot(
    collection(reunion_db, 'seasonal_promos'),
    (snapshot) => {
      const byId = new Map(DEFAULT_SEASONAL_PROMOS.map((promo) => [promo.id, { ...promo }]))
      const storedIds = new Set(snapshot.docs.map((promoDoc) => promoDoc.id))
      snapshot.forEach((promoDoc) => {
        const data = promoDoc.data()
        const fallback = byId.get(promoDoc.id)
        byId.set(promoDoc.id, seasonalPromoFromData(promoDoc.id, data, fallback))
      })
      campaigns.value = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
      isLoading.value = false
      DEFAULT_SEASONAL_PROMOS.filter((promo) => !storedIds.has(promo.id)).forEach((promo) => {
        const { id, ...data } = promo
        void setDoc(doc(reunion_db, 'seasonal_promos', id), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          updatedBy: festivall_auth.currentUser?.email ?? festivall_auth.currentUser?.uid ?? 'unknown'
        }).catch((error) => {
          console.error(`Unable to initialize seasonal promotion "${id}":`, error)
          loadError.value = 'Default campaigns could not be initialized. Check your connection and permissions.'
        })
      })
    },
    (error) => {
      console.error('Unable to load seasonal promotions:', error)
      loadError.value = 'Seasonal promotions could not be loaded. Check your connection and permissions.'
      isLoading.value = false
    }
  )
}

async function saveCampaign(campaign: StoredPromo) {
  await persistCampaign(campaign, campaign.enabled, 'Campaign details saved.')
}

async function toggleCampaign(campaign: StoredPromo) {
  await persistCampaign(campaign, !campaign.enabled, `${campaign.name} turned ${campaign.enabled ? 'off' : 'on'}.`)
}

async function persistCampaign(campaign: StoredPromo, enabled: boolean, successMessage: string) {
  statusMessage.value = ''
  campaign.slug = normalizeSlug(campaign.slug)
  const duplicateSlug = campaigns.value.some(
    (other) => other.id !== campaign.id && normalizeSlug(other.slug) === campaign.slug
  )
  if (!campaign.slug || duplicateSlug) {
    statusType.value = 'error'
    statusMessage.value = duplicateSlug ? 'That URL slug is already in use.' : 'Enter a valid URL slug.'
    return
  }
  const duplicateCode = campaigns.value.some(
    (other) =>
      other.id !== campaign.id &&
      campaign.promoCode.trim() &&
      normalizeCode(other.promoCode) === normalizeCode(campaign.promoCode)
  )
  if (duplicateCode) {
    statusType.value = 'error'
    statusMessage.value = 'Promo codes must be unique across campaigns.'
    return
  }
  if (!validateOffer(campaign)) return
  savingId.value = campaign.id
  try {
    await setDoc(
      doc(reunion_db, 'seasonal_promos', campaign.id),
      {
        name: campaign.name.trim(),
        slug: campaign.slug,
        promoCode: campaign.promoCode.trim(),
        promoType: campaign.promoType,
        discountType: campaign.discountType,
        discountValue: campaign.discountValue,
        maxDiscountAmount: positiveOrNull(campaign.maxDiscountAmount),
        minimumSpend: positiveOrNull(campaign.minimumSpend),
        startsAt: campaign.startsAt,
        endsAt: campaign.endsAt,
        termsUrl: campaign.termsUrl.trim(),
        prizeDescription: campaign.prizeDescription.trim(),
        prizeValue: positiveOrNull(campaign.prizeValue),
        description: campaign.description.trim(),
        enabled,
        updatedAt: serverTimestamp(),
        updatedBy: festivall_auth.currentUser?.email ?? festivall_auth.currentUser?.uid ?? 'unknown'
      },
      { merge: true }
    )
    campaign.enabled = enabled
    statusType.value = 'success'
    statusMessage.value = successMessage
  } catch (error) {
    console.error(`Unable to update seasonal promotion "${campaign.id}":`, error)
    statusType.value = 'error'
    statusMessage.value = 'The campaign could not be saved. Check your connection and permissions.'
  } finally {
    savingId.value = ''
  }
}

async function addCampaign() {
  const name = newName.value.trim()
  const id = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const promoCode = newPromoCode.value.trim()
  const slug = normalizeSlug(newSlug.value || name)
  if (!name || (newPromoType.value !== 'giveaway' && !promoCode)) return
  if (!id) {
    statusType.value = 'error'
    statusMessage.value = 'Use a campaign name containing English letters or numbers.'
    return
  }
  if (campaigns.value.some((campaign) => campaign.id === id || normalizeSlug(campaign.slug) === slug)) {
    statusType.value = 'error'
    statusMessage.value = 'A campaign or URL slug with that name already exists.'
    return
  }
  if (
    promoCode &&
    campaigns.value.some((campaign) => normalizeCode(campaign.promoCode) === normalizeCode(promoCode))
  ) {
    statusType.value = 'error'
    statusMessage.value = 'Promo codes must be unique across campaigns.'
    return
  }
  if (!slug) {
    statusType.value = 'error'
    statusMessage.value = 'Enter a URL slug containing letters or numbers.'
    return
  }

  statusMessage.value = ''
  isAdding.value = true
  try {
    await setDoc(doc(reunion_db, 'seasonal_promos', id), {
      name,
      slug,
      promoCode,
      enabled: false,
      promoType: newPromoType.value,
      discountType: 'percent',
      discountValue: 25,
      maxDiscountAmount: null,
      minimumSpend: null,
      startsAt: '',
      endsAt: '',
      termsUrl: '',
      prizeDescription: '',
      prizeValue: null,
      description: 'A family-friendly festival with music, food, camping, and activities for all ages.',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      updatedBy: festivall_auth.currentUser?.email ?? festivall_auth.currentUser?.uid ?? 'unknown'
    })
    newName.value = ''
    newPromoCode.value = ''
    newSlug.value = ''
    newPromoType.value = 'discount-giveaway'
    statusType.value = 'success'
    statusMessage.value = `${name} was added and is off until you turn it on.`
  } catch (error) {
    console.error(`Unable to add seasonal promotion "${id}":`, error)
    statusType.value = 'error'
    statusMessage.value = 'The campaign could not be added. Check your connection and permissions.'
  } finally {
    isAdding.value = false
  }
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeCode(value: string) {
  return value.trim().toLowerCase()
}

function positiveOrNull(value: number | null) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null
}

function validateOffer(campaign: StoredPromo) {
  if (campaign.startsAt && campaign.endsAt && campaign.startsAt > campaign.endsAt) {
    statusType.value = 'error'
    statusMessage.value = 'Offer start date must be on or before its end date.'
    return false
  }
  if (
    campaign.promoType !== 'giveaway' &&
    (!Number.isFinite(campaign.discountValue) ||
      campaign.discountValue <= 0 ||
      (campaign.discountType === 'percent' && campaign.discountValue > 100))
  ) {
    statusType.value = 'error'
    statusMessage.value = 'Discount must be greater than zero and a percentage cannot exceed 100%.'
    return false
  }
  if (campaign.promoType !== 'giveaway' && !campaign.promoCode.trim()) {
    statusType.value = 'error'
    statusMessage.value = 'Add a promo code for discount campaigns.'
    return false
  }
  if (campaign.promoType !== 'discount' && !campaign.prizeDescription.trim()) {
    statusType.value = 'error'
    statusMessage.value = 'Add a prize description for giveaway campaigns.'
    return false
  }
  if (campaign.termsUrl && !/^https?:\/\//i.test(campaign.termsUrl.trim())) {
    statusType.value = 'error'
    statusMessage.value = 'Official terms URL must start with https:// or http://.'
    return false
  }
  return true
}

onMounted(() => {
  if (isAuthenticated.value) subscribeToPromos()
})

onUnmounted(() => unsubscribe?.())
</script>

<style scoped>
.seasonal-admin {
  min-height: 100vh;
  padding: clamp(24px, 5vw, 56px) 20px;
  background: #f4f6f7;
  color: #202b34;
}

.page-header,
.campaign-list,
.add-campaign {
  width: min(100%, 980px);
  margin: 0 auto 24px;
}

.back-link {
  color: #375d80;
  font-weight: 700;
  text-decoration: none;
}

.eyebrow {
  margin: 22px 0 6px;
  color: #637687;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1,
h2,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 8px;
  font-size: clamp(2rem, 5vw, 3.2rem);
}

h2 {
  margin-bottom: 14px;
}

.intro,
.add-campaign > p {
  color: #5f6e79;
}

.campaign-list,
.add-campaign,
.campaign-card {
  border: 1px solid #dce3e8;
  border-radius: 12px;
  background: white;
  box-shadow: 0 8px 24px rgba(34, 52, 68, 0.05);
}

.campaign-list,
.add-campaign {
  padding: clamp(18px, 3vw, 28px);
}

.campaign-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  margin-top: 12px;
  padding: 18px;
  box-shadow: none;
}

.campaign-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #42515d;
  font-size: 0.85rem;
  font-weight: 700;
}

input {
  min-width: 0;
  min-height: 42px;
  padding: 9px 11px;
  border: 1px solid #cbd5dc;
  border-radius: 7px;
  background: #fff;
  color: #202b34;
  font: inherit;
}

select,
textarea {
  min-width: 0;
  min-height: 42px;
  padding: 9px 11px;
  border: 1px solid #cbd5dc;
  border-radius: 7px;
  background: #fff;
  color: #202b34;
  font: inherit;
}

.campaign-description {
  grid-column: 1 / -1;
}

.campaign-description textarea {
  resize: vertical;
}

input:focus {
  border-color: #3c719b;
  outline: 3px solid rgba(60, 113, 155, 0.15);
}

.campaign-link {
  grid-column: 1 / -1;
  overflow-wrap: anywhere;
  color: #657580;
  font-size: 0.82rem;
}

.campaign-link a {
  color: #315f85;
}

.campaign-actions {
  display: flex;
  min-width: 132px;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 8px;
}

.campaign-state {
  color: #7d4c48;
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
}

.campaign-state--on {
  color: #34704d;
}

.button {
  min-height: 40px;
  padding: 9px 13px;
  border: 1px solid #cbd5dc;
  border-radius: 7px;
  background: #fff;
  color: #354653;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.button:disabled {
  cursor: wait;
  opacity: 0.58;
}

.button--enable {
  border-color: #2f7048;
  background: #2f7048;
  color: white;
}

.button--disable {
  border-color: #a5534b;
  color: #9a4039;
}

.button--save {
  border-color: #446c8b;
  color: #315c7c;
}

.add-form {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  align-items: end;
  gap: 12px;
}

.add-form button {
  min-width: 132px;
}

.notice {
  width: min(100%, 980px);
  margin: 0 auto 16px;
  padding: 12px 15px;
  border-radius: 8px;
  background: #e8f2eb;
  color: #2f6944;
}

.notice--error {
  background: #faeae8;
  color: #963c35;
}

.notice--info {
  background: #e8eff6;
  color: #345b7a;
  line-height: 1.55;
}

.notice a {
  margin-left: 8px;
  color: inherit;
  font-weight: 700;
}

.text-button {
  margin-left: 10px;
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  text-decoration: underline;
}

.empty-state {
  margin-bottom: 0;
  color: #657580;
}

@media (max-width: 700px) {
  .campaign-card {
    grid-template-columns: 1fr;
  }

  .campaign-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-width: 0;
  }

  .campaign-state {
    grid-column: 1 / -1;
  }

  .campaign-fields,
  .add-form {
    grid-template-columns: 1fr;
  }
}
</style>
