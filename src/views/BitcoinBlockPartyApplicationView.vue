<template>
  <div class="bbpapp-page" :style="cssVars">
    <!-- ── Nav ────────────────────────────────────────────────────────────── -->
    <nav class="bbpapp-nav">
      <router-link :to="BBP.routes.landing" class="bbpapp-nav-back">← Bitcoin Block Party</router-link>
    </nav>

    <!-- ── Success screen ─────────────────────────────────────────────────── -->
    <div v-if="submitted" class="bbpapp-success">
      <h1>✓ Application Received</h1>
      <p>Thank you, <strong>{{ form.contact_name }}</strong>!<br>We'll be in touch at <strong>{{ form.email }}</strong>.</p>
      <router-link :to="BBP.routes.landing" class="bbpapp-btn bbpapp-btn-primary">Back to Event</router-link>
    </div>

    <!-- ── Application form ───────────────────────────────────────────────── -->
    <div v-else class="bbpapp-inner">

      <!-- Type picker (if role not pre-selected via route) -->
      <div v-if="!roleFromRoute" class="bbpapp-type-picker">
        <h1 class="bbpapp-page-title">Apply for Bitcoin Block Party {{ BBP.year }}</h1>
        <div class="bbpapp-type-cards">
          <button
            v-for="opt in roleOptions"
            :key="opt.value"
            class="bbpapp-type-card"
            :class="{ 'bbpapp-type-card--active': form.role === opt.value }"
            @click="form.role = opt.value"
          >
            <span class="bbpapp-type-icon">{{ opt.icon }}</span>
            <span class="bbpapp-type-name">{{ opt.label }}</span>
            <span class="bbpapp-type-desc">{{ opt.description }}</span>
          </button>
        </div>
      </div>
      <h1 v-else class="bbpapp-page-title">{{ currentRoleLabel }} Application</h1>

      <!-- Tier selection (sponsors + vendors) -->
      <section v-if="form.role === 'sponsor'" class="bbpapp-section">
        <h2 class="bbpapp-section-title">Sponsorship Tier</h2>
        <div class="bbpapp-tier-cards">
          <div
            v-for="tier in BBP.sponsorTiers"
            :key="tier.id"
            class="bbpapp-tier-card"
            :class="{
              'bbpapp-tier-card--active': form.tier === tier.id,
              'bbpapp-tier-card--claimed': isSponsorTierClaimed(tier),
            }"
            :aria-disabled="isSponsorTierClaimed(tier)"
            @click="selectSponsorTier(tier)"
          >
            <div class="bbpapp-tier-card-header">
              <span class="bbpapp-tier-name">{{ tier.name }}</span>
              <span class="bbpapp-tier-label">{{ tier.label }}</span>
              <span class="bbpapp-tier-availability" :class="{ 'bbpapp-tier-availability--claimed': isSponsorTierClaimed(tier) }">
                {{ sponsorTierAvailabilityLabel(tier) }}
              </span>
              <span class="bbpapp-tier-price" v-if="tier.price">${{ tier.price }} CAD</span>
              <span class="bbpapp-tier-price" v-else>Price TBA</span>
            </div>
            <ul class="bbpapp-tier-perks">
              <li v-for="(perk, i) in tier.perks" :key="i">{{ perk }}</li>
            </ul>
          </div>
        </div>
      </section>

      <section v-if="form.role === 'vendor'" class="bbpapp-section">
        <h2 class="bbpapp-section-title">Vendor Tier</h2>
        <div class="bbpapp-tier-cards">
          <div
            v-for="tier in BBP.vendorTiers"
            :key="tier.id"
            class="bbpapp-tier-card"
            :class="{ 'bbpapp-tier-card--active': form.tier === tier.id }"
            @click="form.tier = tier.id"
          >
            <div class="bbpapp-tier-card-header">
              <span class="bbpapp-tier-name">{{ tier.name }}</span>
              <span class="bbpapp-tier-label">{{ tier.label }}</span>
              <span class="bbpapp-tier-price">${{ tier.price }} CAD</span>
            </div>
            <ul class="bbpapp-tier-perks">
              <li v-for="(perk, i) in tier.perks" :key="i">{{ perk }}</li>
            </ul>
          </div>
        </div>
      </section>

      <section v-if="form.role && !tierStepComplete" class="bbpapp-section">
        <p class="bbpapp-gate-note">
          Choose your {{ form.role === 'sponsor' ? 'sponsorship' : 'vendor' }} tier first to continue.
        </p>
      </section>

      <!-- Contact info (all roles) -->
      <section v-if="form.role && tierStepComplete" class="bbpapp-section">
        <h2 class="bbpapp-section-title">Your Information</h2>

        <div class="bbpapp-field-group">
          <label class="bbpapp-label" for="bbpapp-name">Full Name *</label>
          <input id="bbpapp-name" v-model="form.contact_name" class="bbpapp-input" type="text" maxlength="80" required />
        </div>

        <div class="bbpapp-field-group">
          <label class="bbpapp-label" for="bbpapp-email">Email *</label>
          <input id="bbpapp-email" v-model="form.email" class="bbpapp-input" type="email" maxlength="120" required />
        </div>

        <div class="bbpapp-field-group">
          <label class="bbpapp-label" for="bbpapp-phone">Phone *</label>
          <input id="bbpapp-phone" v-model="form.phone" class="bbpapp-input" type="tel" placeholder="+1 (555) 555-5555" maxlength="20" required />
        </div>

        <div class="bbpapp-field-group" v-if="form.role !== 'volunteer'">
          <label class="bbpapp-label" for="bbpapp-org">
            {{ form.role === 'sponsor' ? 'Company / Organization *' : 'Business Name *' }}
          </label>
          <input id="bbpapp-org" v-model="form.org_name" class="bbpapp-input" type="text" maxlength="80" required />
        </div>

        <div class="bbpapp-field-group" v-if="form.role !== 'volunteer'">
          <label class="bbpapp-label" for="bbpapp-url">Website (optional)</label>
          <input id="bbpapp-url" v-model="form.url" class="bbpapp-input" type="url" maxlength="200" placeholder="https://" />
        </div>

        <div class="bbpapp-field-group" v-if="form.role !== 'volunteer'">
          <label class="bbpapp-label" for="bbpapp-display-name">
            Display Name (optional)
          </label>
          <input 
            id="bbpapp-display-name" 
            v-model="form.displayName" 
            class="bbpapp-input" 
            type="text" 
            maxlength="80" 
            :placeholder="`Defaults to ${form.org_name || 'organization name'}`" 
          />
          <p class="bbpapp-field-hint">How your name appears on the website (defaults to organization name)</p>
        </div>

        <div class="bbpapp-field-group" v-if="form.role !== 'volunteer'">
          <label class="bbpapp-label" for="bbpapp-short-desc">
            Short Description *
          </label>
          <textarea 
            id="bbpapp-short-desc" 
            v-model="form.shortDescription" 
            class="bbpapp-textarea" 
            rows="2" 
            maxlength="150"
            placeholder="Brief description for website (e.g., 'Bitcoin payments infrastructure' or 'Local coffee roaster')"
            required
          ></textarea>
          <p class="bbpapp-field-hint">{{ form.shortDescription?.length || 0 }}/150 characters</p>
        </div>
      </section>

      <!-- Role-specific fields -->
      <section v-if="form.role === 'sponsor' && tierStepComplete" class="bbpapp-section">
        <h2 class="bbpapp-section-title">Sponsorship Details</h2>
        <div class="bbpapp-field-group">
          <label class="bbpapp-label" for="bbpapp-keynote">Would you like to speak? (optional)</label>
          <textarea id="bbpapp-keynote" v-model="form.keynote_topic" class="bbpapp-textarea" rows="3"
            placeholder="Briefly describe your topic or leave blank…" maxlength="500"></textarea>
        </div>
        <div class="bbpapp-field-group">
          <label class="bbpapp-label" for="bbpapp-giveaway">Branded giveaway items? (optional)</label>
          <input id="bbpapp-giveaway" v-model="form.giveaway_description" class="bbpapp-input" type="text" maxlength="200"
            placeholder="e.g. stickers, hardware wallets, vouchers…" />
        </div>
      </section>

      <section v-if="form.role === 'vendor' && tierStepComplete" class="bbpapp-section">
        <h2 class="bbpapp-section-title">Vendor Details</h2>
        <div class="bbpapp-field-group">
          <label class="bbpapp-label" for="bbpapp-products">What are you selling? *</label>
          <textarea id="bbpapp-products" v-model="form.products" class="bbpapp-textarea" rows="3"
            placeholder="Briefly describe your products or services…" maxlength="500"></textarea>
        </div>
        <div class="bbpapp-field-group">
          <label class="bbpapp-label">Bitcoin payment method</label>
          <div class="bbpapp-radio-group">
            <label><input type="radio" v-model="form.bitcoin_method" value="lightning" /> Lightning</label>
            <label><input type="radio" v-model="form.bitcoin_method" value="onchain" /> On-chain</label>
            <label><input type="radio" v-model="form.bitcoin_method" value="both" /> Both</label>
            <label><input type="radio" v-model="form.bitcoin_method" value="planning" /> Still setting up</label>
          </div>
        </div>
        <div class="bbpapp-field-group">
          <label class="bbpapp-label">Do you need power at your table?</label>
          <div class="bbpapp-radio-group">
            <label><input type="radio" v-model="form.needs_power" value="yes" /> Yes</label>
            <label><input type="radio" v-model="form.needs_power" value="no" /> No</label>
          </div>
        </div>
      </section>

      <section v-if="form.role === 'volunteer' && tierStepComplete" class="bbpapp-section">
        <h2 class="bbpapp-section-title">Volunteer Details</h2>
        <div class="bbpapp-field-group">
          <label class="bbpapp-label" for="bbpapp-avail">Your availability on {{ BBP.date }}</label>
          <textarea id="bbpapp-avail" v-model="form.availability" class="bbpapp-textarea" rows="2"
            placeholder="e.g. 'Available 10am–4pm', 'Full day', 'Setup only'…" maxlength="300"></textarea>
        </div>
        <div class="bbpapp-field-group">
          <label class="bbpapp-label" for="bbpapp-skills">Skills or experience (optional)</label>
          <textarea id="bbpapp-skills" v-model="form.skills" class="bbpapp-textarea" rows="2"
            placeholder="e.g. event experience, first aid, sound, photography…" maxlength="400"></textarea>
        </div>
      </section>

      <!-- Notes (all roles) -->
      <section v-if="form.role && tierStepComplete" class="bbpapp-section">
        <div class="bbpapp-field-group">
          <label class="bbpapp-label" for="bbpapp-notes">Additional notes (optional)</label>
          <textarea id="bbpapp-notes" v-model="form.notes" class="bbpapp-textarea" rows="3"
            placeholder="Anything else we should know?" maxlength="600"></textarea>
        </div>
      </section>

      <!-- Submit -->
      <section v-if="form.role && tierStepComplete" class="bbpapp-section bbpapp-submit-section">
        <p v-if="validationError" class="bbpapp-validation-error">{{ validationError }}</p>
        <button
          class="bbpapp-btn bbpapp-btn-primary"
          @click="submitApplication"
          :disabled="submitting"
        >
          {{ submitting ? 'Submitting…' : `Submit ${currentRoleLabel} Application` }}
        </button>
        <p class="bbpapp-submit-note">
          We'll follow up at your email within a few days.
          Questions? <a :href="`mailto:${BBP.contactEmail}`">{{ BBP.contactEmail }}</a>
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'
import { BITCOIN_BLOCK_PARTY as BBP } from '@/config/bitcoinBlockPartyConfig.js'
import { festivall_db } from '@/firebase.js'
import { collection, addDoc } from 'firebase/firestore'

const route = useRoute()

// Pre-select role from route path
const roleFromRoute = computed(() => {
  if (route.path === BBP.routes.sponsorApply)  return 'sponsor'
  if (route.path === BBP.routes.vendorApply)   return 'vendor'
  if (route.path === BBP.routes.volunteer)     return 'volunteer'
  return null
})

const roleOptions = [
  { value: 'sponsor',   icon: '₿', label: 'Sponsor',   description: 'Present your brand to the Bitcoin community.' },
  { value: 'vendor',    icon: '🏪', label: 'Vendor',    description: 'Sell products. Must accept Bitcoin.' },
  { value: 'volunteer', icon: '🙌', label: 'Volunteer', description: 'Help make the event run smoothly.' },
]

// ── Form state ────────────────────────────────────────────────────────────────
const form = ref({
  role:                 roleFromRoute.value || '',
  tier:                 '',
  contact_name:         '',
  email:                '',
  phone:                '',
  org_name:             '',
  displayName:          '',  // Public display name (defaults to org_name)
  shortDescription:     '',  // Brief description for website
  url:                  '',
  // sponsor-specific
  keynote_topic:        '',
  giveaway_description: '',
  // vendor-specific
  products:             '',
  bitcoin_method:       '',
  needs_power:          '',
  // volunteer-specific
  availability:         '',
  skills:               '',
  // shared
  notes:                '',
})

const submitted       = ref(false)
const submitting      = ref(false)
const validationError = ref('')

const currentRoleLabel = computed(() => {
  const role = form.value.role || roleFromRoute.value
  return roleOptions.find(o => o.value === role)?.label || 'Application'
})

const tierStepComplete = computed(() => {
  const role = form.value.role
  if (!role) return false
  if (role === 'sponsor' || role === 'vendor') return !!form.value.tier
  return true
})

function sponsorTierClaimedCount(tier) {
  return BBP.sponsors.filter(sponsor => sponsor.tier === tier.id && sponsor.status === 'confirmed').length
}

function isSponsorTierClaimed(tier) {
  return sponsorTierClaimedCount(tier) >= tier.capacity
}

function sponsorTierAvailabilityLabel(tier) {
  const claimed = sponsorTierClaimedCount(tier)
  if (claimed >= tier.capacity) return 'Claimed'
  return `${tier.capacity - claimed} of ${tier.capacity} left`
}

function selectSponsorTier(tier) {
  if (isSponsorTierClaimed(tier)) return
  form.value.tier = tier.id
}

useHead(computed(() => ({
  title: `${currentRoleLabel.value} Application — Bitcoin Block Party ${BBP.year}`,
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})))

// ── Validation ─────────────────────────────────────────────────────────────────
function validate() {
  const f = form.value
  if (!f.role)         return 'Please select an application type.'
  if (!f.contact_name?.trim())  return 'Please enter your name.'
  if (!f.email?.trim() || !f.email.includes('@')) return 'Please enter a valid email address.'
  if (!f.phone?.trim()) return 'Please enter your phone number.'
  if ((f.role === 'sponsor' || f.role === 'vendor') && !f.org_name?.trim()) {
    return f.role === 'sponsor' ? 'Please enter your company name.' : 'Please enter your business name.'
  }
  if ((f.role === 'sponsor' || f.role === 'vendor') && !f.shortDescription?.trim()) {
    return 'Please enter a short description for the website.'
  }
  if (f.role === 'vendor' && !f.products?.trim()) return 'Please describe what you are selling.'
  if (f.role === 'sponsor' && !f.tier) return 'Please select a sponsorship tier.'
  if (f.role === 'vendor' && !f.tier)  return 'Please select a vendor tier.'
  if (f.role === 'sponsor') {
    const selectedTier = BBP.sponsorTiers.find(tier => tier.id === f.tier)
    if (selectedTier && isSponsorTierClaimed(selectedTier)) return 'That sponsorship tier has already been claimed.'
  }
  return ''
}

// ── Submit ────────────────────────────────────────────────────────────────────
async function submitApplication() {
  validationError.value = validate()
  if (validationError.value) return

  submitting.value = true
  try {
    const colName = {
      sponsor:   BBP.collections.applications,
      vendor:    BBP.collections.applications,
      volunteer: BBP.collections.volunteers,
    }[form.value.role] || BBP.collections.applications

    await addDoc(collection(festivall_db, colName), {
      ...form.value,
      // Default displayName to org_name if not provided (for sponsors/vendors)
      displayName: form.value.displayName || form.value.org_name || form.value.contact_name,
      event: 'bitcoin_block_party_2026',
      status: 'pending',
      submitted_at: new Date().toISOString(),
    })

    submitted.value = true
  } catch (e) {
    validationError.value = 'Submission failed — please try again or email us directly.'
    console.error('BBP application submit error:', e)
  } finally {
    submitting.value = false
  }
}

// ── CSS vars ──────────────────────────────────────────────────────────────────
const cssVars = computed(() => ({
  '--bbp-purple': BBP.palette.blue,
  '--bbp-teal':   BBP.palette.teal,
  '--bbp-orange': BBP.palette.red,
  '--bbp-tan':    BBP.palette.yellow,
  '--bbp-cream':  BBP.palette.white,
  '--bbp-dark':   BBP.palette.black,
}))
</script>

<style scoped>
/* ── Base ──────────────────────────────────────────────────────────────────── */
.bbpapp-page {
  min-height: 100dvh;
  background: var(--bbp-cream);
  color: var(--bbp-teal);
  font-family: var(--bbp-font-family);
}

/* ── Nav ─────────────────────────────────────────────────────────────────────── */
.bbpapp-nav {
  padding: 1rem 1.5rem;
  background: rgba(244,242,230,0.96);
  border-bottom: 1px solid var(--bbp-tan);
}
.bbpapp-nav-back {
  color: var(--bbp-teal);
  text-decoration: none;
  font-size: 0.88rem;
  transition: color 0.1s;
}
.bbpapp-nav-back:hover { color: var(--bbp-orange); }

/* ── Inner ────────────────────────────────────────────────────────────────────── */
.bbpapp-inner {
  max-width: 680px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
}
.bbpapp-page-title {
  font-size: 1.8rem;
  font-weight: 900;
  margin: 0 0 2rem;
}

/* ── Type picker ─────────────────────────────────────────────────────────────── */
.bbpapp-type-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2.5rem;
}
.bbpapp-type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.4rem;
  padding: 1.5rem 1rem;
  border-radius: 8px;
  border: 1.5px solid var(--bbp-tan);
  background: rgba(255,255,255,0.7);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.bbpapp-type-card:hover { border-color: var(--bbp-teal); background: rgba(255,255,255,0.9); }
.bbpapp-type-card--active { border-color: var(--bbp-orange); background: rgba(248,41,9,0.05); }
.bbpapp-type-icon { font-size: 1.75rem; }
.bbpapp-type-name { font-weight: 700; font-size: 1rem; }
.bbpapp-type-desc { font-size: 0.8rem; color: var(--bbp-dark); line-height: 1.4; }

/* ── Sections ────────────────────────────────────────────────────────────────── */
.bbpapp-section {
  margin-bottom: 2.5rem;
}
.bbpapp-section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--bbp-teal);
  margin: 0 0 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--bbp-tan);
}

/* ── Tier cards ──────────────────────────────────────────────────────────────── */
.bbpapp-tier-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.bbpapp-tier-card {
  border: 1.5px solid var(--bbp-tan);
  border-radius: 8px;
  background: rgba(255,255,255,0.7);
  cursor: pointer;
  transition: border-color 0.15s;
  overflow: hidden;
}
.bbpapp-tier-card:hover { border-color: var(--bbp-teal); }
.bbpapp-tier-card--active { border-color: var(--bbp-orange); }
.bbpapp-tier-card--claimed {
  position: relative;
  border-color: rgba(247,211,3,0.8);
  background: repeating-linear-gradient(
    -45deg,
    rgba(247,211,3,0.12) 0,
    rgba(247,211,3,0.12) 8px,
    rgba(255,255,255,0.62) 8px,
    rgba(255,255,255,0.62) 18px
  );
  cursor: not-allowed;
  opacity: 0.78;
}
.bbpapp-tier-card--claimed:hover { border-color: rgba(247,211,3,0.8); }
.bbpapp-tier-card-header {
  padding: 1rem 1.25rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid var(--bbp-tan);
}
.bbpapp-tier-name  { font-weight: 800; font-size: 1rem; }
.bbpapp-tier-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--bbp-teal);
}
.bbpapp-tier-availability {
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: rgba(7,94,114,0.08);
  color: var(--bbp-teal);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.bbpapp-tier-availability--claimed {
  background: rgba(248,41,9,0.14);
  color: var(--bbp-orange);
}
.bbpapp-tier-price { margin-left: auto; font-weight: 700; font-size: 0.95rem; color: var(--bbp-orange); }
.bbpapp-tier-card--claimed .bbpapp-tier-price,
.bbpapp-tier-card--claimed .bbpapp-tier-perks li,
.bbpapp-tier-card--claimed .bbpapp-tier-perks li::before {
  color: var(--bbp-tan);
}
.bbpapp-tier-perks {
  padding: 0.75rem 1.25rem 1rem;
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.bbpapp-tier-perks li {
  font-size: 0.85rem;
  color: var(--bbp-dark);
  padding-left: 1rem;
  position: relative;
  line-height: 1.45;
}
.bbpapp-tier-perks li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--bbp-teal);
  font-size: 0.72rem;
  top: 2px;
}

/* ── Form fields ──────────────────────────────────────────────────────────────── */
.bbpapp-field-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.1rem;
}.bbpapp-field-hint {
  font-size: 0.8rem;
  color: color-mix(in srgb, var(--bbp-black) 60%, transparent);
  margin: 0;
  line-height: 1.4;
}.bbpapp-label {
  font-size: 0.85rem;
  color: var(--bbp-dark);
}
.bbpapp-input,
.bbpapp-textarea {
  padding: 0.7rem 1rem;
  border-radius: 6px;
  border: 1.5px solid var(--bbp-tan);
  background: white;
  color: var(--bbp-dark);
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
}
.bbpapp-input:focus,
.bbpapp-textarea:focus { border-color: var(--bbp-teal); }
.bbpapp-textarea { resize: vertical; min-height: 70px; }
.bbpapp-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.bbpapp-radio-group label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  cursor: pointer;
  color: var(--bbp-dark);
}

/* ── Submit ───────────────────────────────────────────────────────────────────── */
.bbpapp-submit-section { border-top: 1px solid var(--bbp-tan); padding-top: 1.5rem; }
.bbpapp-validation-error {
  color: #ff6b6b;
  font-size: 0.88rem;
  margin-bottom: 0.75rem;
}
.bbpapp-btn {
  display: inline-block;
  padding: 0.8rem 2rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  text-decoration: none;
  transition: opacity 0.15s;
}
.bbpapp-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.bbpapp-btn-primary { background: var(--bbp-orange); color: #fff; }
.bbpapp-btn-primary:hover:not(:disabled) { opacity: 0.88; }
.bbpapp-submit-note {
  margin-top: 0.75rem;
  font-size: 0.82rem;
  color: var(--bbp-tan);
}
.bbpapp-submit-note a { color: var(--bbp-teal); text-decoration: none; }
.bbpapp-submit-note a:hover { text-decoration: underline; }
.bbpapp-gate-note {
  margin: 0;
  border: 1px dashed var(--bbp-tan);
  border-radius: 8px;
  background: rgba(255,255,255,0.72);
  color: var(--bbp-dark);
  padding: 0.9rem 1rem;
  font-size: 0.9rem;
}

/* ── Success ─────────────────────────────────────────────────────────────────── */
.bbpapp-success {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1.5rem;
  gap: 1.25rem;
}
.bbpapp-success h1 { font-size: 2rem; margin: 0; }
.bbpapp-success p  { color: var(--bbp-dark); margin: 0; line-height: 1.6; }
</style>
