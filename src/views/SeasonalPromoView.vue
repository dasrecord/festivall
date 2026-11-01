<script setup lang="ts">
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  type DocumentSnapshot,
  type QuerySnapshot
} from 'firebase/firestore'
import { useRoute } from 'vue-router'
import { reunion_db } from '@/firebase.js'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'
import { REUNION_AMENITIES } from '@/data/reunionAmenities.js'
import {
  DEFAULT_SEASONAL_PROMOS,
  seasonalPromoFromData,
  type SeasonalPromo
} from '@/config/seasonalPromos'

const route = useRoute()
const usesCustomSlug = computed(() => route.name === 'reunion-seasonal-promo')
const promoId = computed(() => {
  if (route.name === 'reunion-christmas-promo') return 'christmas'
  if (typeof route.params.slug === 'string') return route.params.slug
  return 'halloween'
})
const campaign = ref<SeasonalPromo | null>(null)
const promoStatus = ref<'loading' | 'enabled' | 'disabled' | 'error'>('loading')
const isHalloween = computed(() => campaign.value?.id === 'halloween')
const isChristmas = computed(() => campaign.value?.id === 'christmas')
const promoName = computed(() => campaign.value?.name ?? 'Reunion')
const promoCode = computed(() => campaign.value?.promoCode ?? '')
const heroLead = computed(() => (isHalloween.value ? 'Trick or treat?' : `Celebrate ${promoName.value}`))
const heroTail = computed(() => (isHalloween.value ? 'Try a festival.' : 'with festival tickets.'))
const entryCollection = computed(() =>
  (campaign.value?.id ?? promoId.value) === 'halloween'
    ? 'trick_or_treat_entries_2026'
    : `${campaign.value?.id ?? promoId.value}_promo_entries_2026`
)
const hasDiscount = computed(() => campaign.value?.promoType !== 'giveaway')
const hasGiveaway = computed(() => campaign.value?.promoType !== 'discount')
const isExpired = computed(() => {
  const endDate = campaign.value?.endsAt
  return !!endDate && new Date(`${endDate}T23:59:59`).getTime() < Date.now()
})
const isNotStarted = computed(() => {
  const startDate = campaign.value?.startsAt
  return !!startDate && new Date(`${startDate}T00:00:00`).getTime() > Date.now()
})
const discountLabel = computed(() => {
  if (!campaign.value) return ''
  return campaign.value.discountType === 'percent'
    ? `${campaign.value.discountValue}% off`
    : `$${campaign.value.discountValue} CAD off`
})
const offerLimits = computed(() => {
  if (!campaign.value) return ''
  const limits: string[] = []
  if (campaign.value.minimumSpend) limits.push(`Minimum purchase $${campaign.value.minimumSpend} CAD`)
  if (campaign.value.maxDiscountAmount) limits.push(`Maximum savings $${campaign.value.maxDiscountAmount} CAD`)
  return limits.join(' · ')
})
let stopPromoListener: (() => void) | undefined

watch(
  [promoId, usesCustomSlug],
  ([id, customSlug]) => {
    stopPromoListener?.()
    promoStatus.value = 'loading'
    campaign.value = null
    const fallback = customSlug
      ? undefined
      : DEFAULT_SEASONAL_PROMOS.find((promo) => promo.id === id)
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      promoStatus.value = 'disabled'
      return
    }

    const handleSnapshot = (snapshot: DocumentSnapshot | QuerySnapshot) => {
      const promoDocument = 'docs' in snapshot ? snapshot.docs[0] : snapshot
      if (!promoDocument?.exists()) {
        if (fallback) {
          campaign.value = fallback
          promoStatus.value = fallback.enabled ? 'enabled' : 'disabled'
        } else {
          promoStatus.value = 'disabled'
        }
        return
      }

      const loadedId = promoDocument.id
      const promoData = promoDocument.data()
      const match = seasonalPromoFromData(
        loadedId,
        promoData,
        DEFAULT_SEASONAL_PROMOS.find((promo) => promo.id === loadedId)
      )
      if (customSlug && match.slug !== id) {
        promoStatus.value = 'disabled'
        return
      }
      campaign.value = match
      promoStatus.value = match.enabled ? 'enabled' : 'disabled'
    }
    const handleError = (error: Error) => {
      console.error(`Unable to load seasonal promotion "${id}":`, error)
      promoStatus.value = 'error'
    }

    stopPromoListener = customSlug
      ? onSnapshot(
          query(collection(reunion_db, 'seasonal_promos'), where('slug', '==', id)),
          handleSnapshot,
          handleError
        )
      : onSnapshot(doc(reunion_db, 'seasonal_promos', id), handleSnapshot, handleError)
  },
  { immediate: true }
)

onUnmounted(() => stopPromoListener?.())

const multiplier = Math.floor(Math.random() * 8) + 2
const addend = Math.floor(Math.random() * 15) + 1
const skillTestAnswer = 8 * multiplier + addend
const skillTestPrompt = computed(
  () =>
    `The Reunion Scavenger Hunt has a number clue: 1, 1, 2, 3, 5… Continue the pattern, multiply the next number by ${multiplier}, then add ${addend}. What number do you get?`
)

const form = reactive({
  email: '',
  skillTest: '',
  eligible: false,
  marketingConsent: false
})
const isSubmitting = ref(false)
const isComplete = ref(false)
const errorMessage = ref('')
const copyMessage = ref('')
const showCalendarLink = ref(false)
const amenityTrack = ref<HTMLElement | null>(null)
const activeAmenityIndex = ref(0)
const calendarUrl = computed(() => {
  const start = REUNION_FESTIVAL.fridayDate.toISOString().replace(/[-:]|\.\d{3}/g, '')
  const end = REUNION_FESTIVAL.mondayDate.toISOString().replace(/[-:]|\.\d{3}/g, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Reunion Festival ${REUNION_FESTIVAL.year}`,
    dates: `${start}/${end}`,
    details: 'Music, dancing, camping, family, friends, and food at Reunion Festival.',
    location: 'Near Saskatoon, Saskatchewan, Canada'
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
})

function scrollAmenities(direction: -1 | 1) {
  const track = amenityTrack.value
  if (!track) return

  const item = track.querySelector<HTMLElement>('.amenity-card')
  if (!item) return
  const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0
  track.scrollBy({ left: direction * (item.offsetWidth + gap), behavior: 'smooth' })
}

function updateAmenityIndex() {
  const track = amenityTrack.value
  const item = track?.querySelector<HTMLElement>('.amenity-card')
  if (!track || !item) return

  const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0
  activeAmenityIndex.value = Math.min(
    REUNION_AMENITIES.length - 1,
    Math.max(0, Math.round(track.scrollLeft / (item.offsetWidth + gap)))
  )
}

async function submitEntry() {
  errorMessage.value = ''
  copyMessage.value = ''

  if (hasGiveaway.value && !form.eligible) {
    errorMessage.value = 'Please confirm your eligibility and email consent to continue.'
    return
  }
  if (!form.marketingConsent) {
    errorMessage.value = 'Please consent to receive Reunion news and offers to continue.'
    return
  }

  if (hasGiveaway.value && (!/^\d+$/.test(form.skillTest.trim()) || Number(form.skillTest) !== skillTestAnswer)) {
    errorMessage.value = 'That answer isn’t quite right. Try the number clue again.'
    return
  }
  if (isExpired.value || isNotStarted.value || promoStatus.value !== 'enabled') {
    errorMessage.value = 'This promotion is no longer active.'
    return
  }

  isSubmitting.value = true
  try {
    await addDoc(collection(reunion_db, entryCollection.value), {
      email: form.email.trim().toLowerCase(),
      eligible_saskatchewan_adult: form.eligible,
      marketing_consent: form.marketingConsent,
      promo_type: campaign.value?.promoType,
      promo_code: campaign.value?.promoCode,
      discount_type: campaign.value?.discountType,
      discount_value: campaign.value?.discountValue,
      contest_terms_version: hasGiveaway.value
        ? isHalloween.value
          ? 'reunion-2027-trick-or-treat-2026-10'
          : `reunion-2027-${campaign.value?.id ?? promoId.value}-2026-11`
        : null,
      submitted_at: serverTimestamp()
    })
    isComplete.value = true
    showCalendarLink.value = true
  } catch (error) {
    console.error(`Unable to submit ${promoName.value} promotion entry:`, error)
    errorMessage.value = 'We couldn’t save your entry. Please check your connection and try again.'
  } finally {
    isSubmitting.value = false
  }
}

async function copyPromoCode() {
  copyMessage.value = ''
  try {
    await navigator.clipboard.writeText(promoCode.value)
    copyMessage.value = 'Copied!'
  } catch (error) {
    console.error('Unable to copy the promotion code:', error)
    copyMessage.value = 'Select and copy the code above.'
  } finally {
    showCalendarLink.value = true
  }
}
</script>

<template>
  <main v-if="promoStatus !== 'enabled' || isExpired || isNotStarted" class="promo-unavailable">
    <div>
      <p class="eyebrow">Reunion Festival</p>
      <h1>
        {{
          promoStatus === 'loading'
            ? 'Loading promotion…'
            : promoStatus === 'error'
              ? 'Promotion unavailable'
              : isNotStarted
                ? 'This promotion has not started yet'
              : isExpired
                ? 'This promotion has ended'
                : 'This promotion is not active'
        }}
      </h1>
      <p v-if="isNotStarted">
        This offer starts on {{ campaign?.startsAt }}. Please check back then.
      </p>
      <p v-else-if="isExpired">
        This offer ended on {{ campaign?.endsAt }}. Explore Reunion for other ways to join us.
      </p>
      <p v-else-if="promoStatus === 'disabled'">
        This seasonal offer is not currently running. Check back for the next Reunion promotion.
      </p>
      <p v-else-if="promoStatus === 'error'">
        We couldn’t check this promotion right now. Please try again later.
      </p>
      <RouterLink to="/reunion">Explore Reunion Festival</RouterLink>
    </div>
  </main>
  <main v-else class="treat-page" :class="{ 'treat-page--christmas': isChristmas }">
    <div class="page-glow page-glow-top" aria-hidden="true"></div>
    <div class="page-glow page-glow-bottom" aria-hidden="true"></div>

    <div class="page-content">
      <header class="brand-lockup">
        <span class="brand-mark" aria-hidden="true">R</span>
        <span>REUNION FESTIVAL <span class="brand-year">2027</span></span>
      </header>

      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow"><span aria-hidden="true">✦</span> A little {{ promoName }} magic</p>
          <h1>{{ heroLead }}<br /><span>{{ heroTail }}</span></h1>
          <p class="intro">
            {{ campaign?.description }}
            <template v-if="hasDiscount">
              Get <strong>{{ discountLabel }} Reunion {{ REUNION_FESTIVAL.year }} tickets</strong>
              when you sign up.
            </template>
            <template v-if="hasGiveaway">
              {{ hasDiscount ? ' You’ll also be entered to win ' : 'Enter for a chance to win ' }}
              <strong>{{ campaign?.prizeDescription }}</strong>.
            </template>
          </p>
          <div v-if="hasDiscount || hasGiveaway" class="perk-row" aria-label="Promotion highlights">
            <div v-if="hasDiscount" class="perk">
              <strong>{{ discountLabel }}</strong>
              <span>Reunion tickets</span>
            </div>
            <div v-if="hasDiscount && hasGiveaway" class="perk-divider" aria-hidden="true"></div>
            <div v-if="hasGiveaway" class="perk">
              <strong>{{ campaign?.prizeValue ? `$${campaign.prizeValue} CAD` : 'Prize draw' }}</strong>
              <span>{{ campaign?.prizeDescription }}</span>
            </div>
          </div>
          <p v-if="offerLimits" class="offer-limits">{{ offerLimits }}</p>
          <p v-if="campaign?.startsAt" class="offer-limits">
            Offer starts {{ campaign.startsAt }}.
          </p>
          <p v-if="hasGiveaway && campaign?.endsAt" class="offer-limits">
            Giveaway entries close {{ campaign.endsAt }}.
          </p>
          <p v-else-if="hasDiscount && campaign?.endsAt" class="offer-limits">
            Offer ends {{ campaign.endsAt }}.
          </p>
          <p v-if="hasDiscount" class="offer-disclaimer">
            {{ discountLabel }} using code {{ promoCode }}.
            <span v-if="campaign?.minimumSpend">Minimum purchase ${{ campaign.minimumSpend }} CAD.</span>
            <span v-if="campaign?.maxDiscountAmount">Maximum savings ${{ campaign.maxDiscountAmount }} CAD.</span>
            Apply the code at checkout; offer terms are subject to the ticket seller’s validation.
          </p>
        </div>

        <aside class="grounds-teaser" aria-label="Reunion Festival amenities">
          <div class="teaser-heading">
            <div>
              <p class="teaser-kicker">Make a weekend of it</p>
              <p class="teaser-copy">Little discoveries, big memories.</p>
            </div>
            <div class="amenity-controls">
              <button
                type="button"
                aria-label="Previous amenity"
                :disabled="activeAmenityIndex === 0"
                @click="scrollAmenities(-1)"
              >‹</button>
              <button
                type="button"
                aria-label="Next amenity"
                :disabled="activeAmenityIndex === REUNION_AMENITIES.length - 1"
                @click="scrollAmenities(1)"
              >›</button>
            </div>
          </div>
          <div ref="amenityTrack" class="amenity-track" @scroll.passive="updateAmenityIndex">
            <div v-for="amenity in REUNION_AMENITIES" :key="amenity.label" class="amenity-card">
              <img :src="amenity.icon" :alt="amenity.label" />
              <span>{{ amenity.label }}</span>
            </div>
          </div>
          <div class="amenity-position" aria-live="polite">
            {{ activeAmenityIndex + 1 }} / {{ REUNION_AMENITIES.length }}
          </div>
        </aside>
      </section>

      <section class="entry-card" aria-labelledby="entry-heading">
        <template v-if="!isComplete">
          <div class="card-heading">
            <div>
              <p class="step-label">{{ hasGiveaway ? 'ONE SHORT FORM ENTERS YOU' : 'YOUR OFFER IS ONE SHORT FORM AWAY' }}</p>
              <h2 id="entry-heading">
                {{ hasDiscount && hasGiveaway ? `Claim ${discountLabel} & enter` : hasDiscount ? `Claim ${discountLabel}` : 'Enter the giveaway' }}
              </h2>
            </div>
            <span v-if="hasDiscount" class="ticket-stamp" aria-hidden="true">
              {{ campaign?.discountValue }}<br /><small>{{ campaign?.discountType === 'percent' ? '% OFF' : 'CAD OFF' }}</small>
            </span>
          </div>

          <form class="entry-form" @submit.prevent="submitEntry">
            <label class="field-label" for="entry-email">Your email address</label>
            <input
              id="entry-email"
              v-model="form.email"
              class="text-input"
              type="email"
              name="email"
              autocomplete="email"
              placeholder="you@example.com"
              required
            />

            <template v-if="hasGiveaway">
              <label class="field-label skill-label" for="skill-test">{{ skillTestPrompt }}</label>
              <input
                id="skill-test"
                v-model="form.skillTest"
                class="text-input"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                placeholder="Your answer"
                required
              />
              <p class="field-hint">A quick skill-testing question to complete your entry.</p>
            </template>

            <label v-if="hasGiveaway" class="check-row">
              <input v-model="form.eligible" type="checkbox" required />
              <span>I confirm I’m a Saskatchewan resident and at least 18 years old.</span>
            </label>
            <label class="check-row">
              <input v-model="form.marketingConsent" type="checkbox" required />
              <span>
                Email me Reunion news and offers. I understand I can unsubscribe at any time.
              </span>
            </label>

            <p v-if="errorMessage" class="form-message error-message" role="alert">
              {{ errorMessage }}
            </p>
            <button class="submit-button" type="submit" :disabled="isSubmitting">
              {{
                isSubmitting
                  ? 'Saving…'
                  : hasDiscount && hasGiveaway
                    ? 'Get my code & enter the draw'
                    : hasDiscount
                      ? 'Get my discount code'
                      : 'Enter the giveaway'
              }}
              <span aria-hidden="true">→</span>
            </button>
            <p class="privacy-note">
              Your email is used to deliver your offer, administer the giveaway when applicable,
              and send the updates you opted into.
            </p>
          </form>
        </template>

        <div v-else class="success-panel" aria-live="polite">
          <span class="success-sparkle" aria-hidden="true">✦</span>
          <p class="step-label">{{ hasGiveaway ? 'YOU’RE IN!' : 'YOUR OFFER IS READY' }}</p>
          <h2 id="entry-heading">{{ hasGiveaway ? 'Your entry is in.' : 'Your discount is ready.' }}</h2>
          <p class="success-copy" v-if="hasDiscount">
            <template v-if="hasGiveaway">You’re entered in the draw. </template>
            Use this code for {{ discountLabel }} Reunion {{ REUNION_FESTIVAL.year }} tickets:
          </p>
          <p v-else class="success-copy">Your giveaway entry has been recorded.</p>
          <div v-if="hasDiscount" class="code-box">
            <code>{{ promoCode }}</code>
            <button class="copy-button" type="button" @click="copyPromoCode">
              {{ copyMessage === 'Copied!' ? 'Copied' : 'Copy code' }}
            </button>
          </div>
          <RouterLink
            v-if="hasDiscount"
            class="checkout-link"
            :to="{ path: '/reuniontickets', query: { promo: promoCode } }"
          >
            Continue to ticket checkout
            <span aria-hidden="true">→</span>
          </RouterLink>
          <p class="copy-feedback" aria-live="polite">{{ copyMessage }}</p>
          <a
            v-if="showCalendarLink"
            class="calendar-link"
            :href="calendarUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Add Reunion Festival to your calendar
            <span aria-hidden="true">↗</span>
          </a>
          <p v-if="hasGiveaway" class="draw-note">Keep an eye on your inbox for giveaway updates.</p>
          <p v-else class="draw-note">Use the code before the offer end date and check the purchase conditions above.</p>
          <RouterLink class="reunion-link" to="/reunion">
            See what Reunion is all about
            <span aria-hidden="true">→</span>
          </RouterLink>
        </div>
      </section>

      <footer class="contest-details">
        <p v-if="hasGiveaway">
          One eligible entrant wins {{ campaign?.prizeDescription }}
          <template v-if="campaign?.prizeValue">up to <strong>${{ campaign.prizeValue }} CAD</strong></template>.
          <template v-if="campaign?.endsAt"> Entries close <strong>{{ campaign.endsAt }}</strong>.</template>
          Open to Saskatchewan residents age 18+. A skill-testing question is required.
        </p>
        <p v-else-if="offerLimits">{{ offerLimits }}. See the ticket seller’s terms at checkout.</p>
        <p v-if="campaign?.termsUrl">
          <a :href="campaign.termsUrl" target="_blank" rel="noopener noreferrer">Read the official promotion terms</a>
        </p>
        <p class="footer-signoff">Made for families. Remembered together.</p>
      </footer>
    </div>
  </main>
</template>

<style scoped>
.promo-unavailable {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 28px 20px;
  background: #17231d;
  color: #fff8ed;
  text-align: center;
}

.promo-unavailable > div {
  width: min(100%, 560px);
}

.promo-unavailable h1 {
  margin-bottom: 12px;
  font-size: clamp(2rem, 6vw, 3.5rem);
}

.promo-unavailable p {
  color: rgba(255, 248, 237, 0.75);
  line-height: 1.6;
}

.promo-unavailable a {
  color: #d7ed9f;
  font-weight: 700;
}

.treat-page {
  --cream: #fff8ed;
  --ink: #17231d;
  --green: #405b3b;
  --lime: #d7ed9f;
  --orange: #f79b50;
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  padding: 28px 20px 36px;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(80, 107, 69, 0.48), transparent 54%),
    #17231d;
  color: var(--cream);
  font-family: inherit;
}

.treat-page--christmas {
  --orange: #e77c78;
  --green: #245c4a;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(52, 112, 84, 0.52), transparent 54%),
    #17231d;
}

.page-content {
  position: relative;
  z-index: 1;
  width: min(100%, 990px);
  margin: 0 auto;
}

.page-glow {
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.16;
  pointer-events: none;
}

.page-glow-top {
  top: 100px;
  right: -100px;
  background: #e58b4d;
}

.page-glow-bottom {
  bottom: 60px;
  left: -150px;
  background: #a4d17e;
}

.brand-lockup {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 248, 237, 0.83);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
}

.brand-mark {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid rgba(215, 237, 159, 0.7);
  border-radius: 50%;
  color: var(--lime);
  font-size: 1rem;
}

.brand-year {
  color: var(--lime);
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(250px, 0.8fr);
  align-items: center;
  gap: clamp(26px, 6vw, 72px);
  padding: 54px 0 42px;
}

.eyebrow,
.step-label {
  margin: 0 0 12px;
  color: var(--lime);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.eyebrow span {
  margin-right: 5px;
  color: var(--orange);
}

h1,
h2,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 16px;
  color: var(--cream);
  font-size: clamp(2.6rem, 7vw, 5rem);
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 0.98;
}

h1 span {
  color: var(--orange);
}

.intro {
  max-width: 550px;
  margin-bottom: 25px;
  color: rgba(255, 248, 237, 0.8);
  font-size: 1.05rem;
  line-height: 1.65;
}

.intro strong {
  color: var(--cream);
}

.perk-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.perk {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.perk strong {
  color: var(--lime);
  font-size: 1.55rem;
}

.perk span {
  color: rgba(255, 248, 237, 0.67);
  font-size: 0.84rem;
}

.perk-divider {
  width: 1px;
  height: 38px;
  background: rgba(255, 248, 237, 0.25);
}

.grounds-teaser {
  min-width: 0;
  padding: 22px;
  overflow: hidden;
  border: 1px solid rgba(255, 248, 237, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
}

.teaser-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
}

.teaser-kicker {
  margin-bottom: 3px;
  color: var(--lime);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.teaser-copy {
  margin-bottom: 0;
  color: rgba(255, 248, 237, 0.8);
  font-size: 0.92rem;
  line-height: 1.55;
}

.amenity-controls {
  display: flex;
  flex: 0 0 auto;
  gap: 6px;
}

.amenity-controls button {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid rgba(255, 248, 237, 0.36);
  border-radius: 50%;
  background: transparent;
  color: var(--cream);
  cursor: pointer;
  font: inherit;
  font-size: 1.35rem;
  line-height: 1;
}

.amenity-controls button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.13);
}

.amenity-controls button:disabled {
  cursor: default;
  opacity: 0.35;
}

.amenity-track {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.amenity-track::-webkit-scrollbar {
  display: none;
}

.amenity-card {
  display: flex;
  flex: 0 0 112px;
  min-height: 124px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 13px 10px;
  border: 1px solid rgba(255, 248, 237, 0.16);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.12);
  color: var(--cream);
  scroll-snap-align: start;
  text-align: center;
}

.amenity-card img {
  width: 44px;
  height: 44px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.amenity-card span {
  font-size: 0.78rem;
  line-height: 1.3;
}

.amenity-position {
  margin-top: 9px;
  color: rgba(255, 248, 237, 0.62);
  font-size: 0.72rem;
  text-align: right;
}

.entry-card {
  width: min(100%, 620px);
  margin: 0 auto;
  padding: clamp(24px, 5vw, 42px);
  border-radius: 22px;
  background: var(--cream);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.22);
  color: var(--ink);
}

.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 24px;
}

.card-heading .step-label,
.success-panel .step-label {
  margin-bottom: 8px;
  color: var(--green);
  font-size: 0.65rem;
}

h2 {
  margin-bottom: 0;
  font-size: clamp(1.7rem, 4vw, 2.2rem);
  line-height: 1.1;
}

.ticket-stamp {
  display: grid;
  flex: 0 0 64px;
  width: 64px;
  height: 64px;
  align-content: center;
  justify-items: center;
  border: 1px dashed var(--green);
  border-radius: 50%;
  color: var(--green);
  font-size: 1.35rem;
  line-height: 1;
  transform: rotate(9deg);
}

.ticket-stamp small {
  font-size: 0.48rem;
  letter-spacing: 0.08em;
}

.entry-form {
  display: flex;
  flex-direction: column;
}

.field-label {
  margin-bottom: 8px;
  color: #29372e;
  font-size: 0.9rem;
  font-weight: 700;
}

.skill-label {
  margin-top: 21px;
  line-height: 1.45;
}

.text-input {
  width: 100%;
  min-height: 52px;
  padding: 13px 15px;
  border: 1px solid #c8cdbf;
  border-radius: 10px;
  outline: none;
  background: #fffdf8;
  color: var(--ink);
  font: inherit;
  font-size: 1rem;
}

.text-input:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 3px rgba(64, 91, 59, 0.15);
}

.field-hint {
  margin: 7px 0 18px;
  color: #667168;
  font-size: 0.8rem;
}

.check-row {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  margin: 0 0 13px;
  color: #46534a;
  font-size: 0.84rem;
  line-height: 1.5;
}

.check-row input {
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  margin: 2px 0 0;
  accent-color: var(--green);
}

.form-message {
  margin: 4px 0 12px;
  font-size: 0.88rem;
}

.error-message {
  color: #a6382b;
}

.submit-button {
  display: flex;
  min-height: 54px;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
  padding: 14px 18px;
  border: 0;
  border-radius: 10px;
  background: var(--green);
  color: white;
  cursor: pointer;
  font: inherit;
  font-size: 1rem;
  font-weight: 700;
  transition: background 0.18s, transform 0.18s;
}

.submit-button:hover:not(:disabled) {
  background: #2f472e;
  transform: translateY(-1px);
}

.submit-button:disabled {
  cursor: wait;
  opacity: 0.72;
}

.submit-button span {
  font-size: 1.2rem;
}

.privacy-note {
  margin: 12px 0 0;
  color: #727a70;
  font-size: 0.73rem;
  line-height: 1.45;
  text-align: center;
}

.success-panel {
  padding: 12px 0 4px;
  text-align: center;
}

.success-sparkle {
  display: block;
  margin-bottom: 14px;
  color: #d9823f;
  font-size: 2.1rem;
}

.success-panel h2 {
  margin-bottom: 12px;
}

.success-copy,
.draw-note {
  color: #58645a;
  line-height: 1.55;
}

.code-box {
  display: flex;
  min-height: 62px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 20px;
  padding: 10px 12px 10px 18px;
  border: 1px dashed #829272;
  border-radius: 11px;
  background: #f3f5e9;
}

.code-box code {
  color: #2f472e;
  font-family: 'Courier New', monospace;
  font-size: clamp(1rem, 4vw, 1.35rem);
  font-weight: 700;
  letter-spacing: 0.06em;
}

.copy-button {
  min-height: 40px;
  padding: 8px 13px;
  border: 0;
  border-radius: 8px;
  background: var(--green);
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
}

.copy-feedback {
  min-height: 1.25em;
  margin: 6px 0 10px;
  color: #405b3b;
  font-size: 0.78rem;
}

.draw-note {
  margin-bottom: 0;
  font-size: 0.88rem;
}

.reunion-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 12px;
  color: var(--green);
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.calendar-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: var(--green);
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.contest-details {
  width: min(100%, 750px);
  margin: 24px auto 0;
  color: rgba(255, 248, 237, 0.68);
  font-size: 0.76rem;
  line-height: 1.6;
  text-align: center;
}

.contest-details p {
  margin-bottom: 8px;
}

.contest-details strong {
  color: rgba(255, 248, 237, 0.9);
}

.contest-details a {
  color: var(--lime);
  font-weight: 700;
}

.offer-limits,
.offer-disclaimer {
  color: rgba(255, 248, 237, 0.72);
  font-size: 0.82rem;
  line-height: 1.5;
}

.offer-disclaimer {
  margin-top: 12px;
}

.footer-signoff {
  color: var(--lime);
  letter-spacing: 0.05em;
}

@media (max-width: 700px) {
  .treat-page {
    padding: 20px 16px 28px;
  }

  .hero {
    grid-template-columns: 1fr;
    gap: 26px;
    padding: 42px 0 30px;
  }

  .grounds-teaser {
    padding: 16px;
  }

  .teaser-kicker {
    font-size: 0.64rem;
  }

  .teaser-copy {
    font-size: 0.83rem;
  }

  .amenity-card {
    flex-basis: 100px;
  }
}

@media (max-width: 400px) {
  .code-box {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
}
</style>
