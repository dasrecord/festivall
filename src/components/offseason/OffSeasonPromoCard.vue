<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'
import OsIcon from './OsIcon.vue'
import {
  DEFAULT_SEASONAL_PROMOS,
  seasonalPromoFromData,
  type SeasonalPromo
} from '@/config/seasonalPromos'

const props = defineProps<{ order?: { id_code?: string; fullname?: string; email?: string; phone?: string } }>()
const savePrefill = () => {
  const { fullname, email, phone } = props.order ?? {}
  sessionStorage.setItem('reunion_ticket_prefill', JSON.stringify({ fullname, email, phone }))
}

const promos = ref<SeasonalPromo[]>(DEFAULT_SEASONAL_PROMOS)

let stop: (() => void) | undefined
onMounted(() => {
  stop = onSnapshot(
    query(collection(reunion_db, 'seasonal_promos'), where('enabled', '==', true)),
    (snapshot) => {
      if (snapshot.empty) return
      promos.value = snapshot.docs.map((d) =>
        seasonalPromoFromData(
          d.id,
          d.data(),
          DEFAULT_SEASONAL_PROMOS.find((promo) => promo.id === d.id)
        )
      )
    },
    () => {
      promos.value = DEFAULT_SEASONAL_PROMOS
    }
  )
})
onUnmounted(() => stop?.())

const isLive = (promo: SeasonalPromo) => {
  if (!promo.enabled) return false
  const now = Date.now()
  if (promo.startsAt && new Date(`${promo.startsAt}T00:00:00`).getTime() > now) return false
  if (promo.endsAt && new Date(`${promo.endsAt}T23:59:59`).getTime() < now) return false
  return true
}

const promo = computed(() => promos.value.find(isLive) ?? null)
const hasDiscount = computed(() => promo.value?.promoType !== 'giveaway')
const discountLabel = computed(() => {
  if (!promo.value) return ''
  return promo.value.discountType === 'percent'
    ? `${promo.value.discountValue}% off`
    : `$${promo.value.discountValue} CAD off`
})
const ticketsLink = computed(() => ({
  path: '/reuniontickets',
  query: promo.value?.promoCode && hasDiscount.value ? { promo: promo.value.promoCode } : {}
}))
const flyerLink = computed(() => {
  if (!promo.value?.promoCode || !hasDiscount.value || !props.order?.id_code) return ''
  const params = new URLSearchParams({ ref: props.order.id_code, promo: promo.value.promoCode })
  return `/reunion-2026-flyer.html?${params.toString()}`
})
const daysLeft = computed(() => {
  if (!promo.value?.endsAt) return null
  const ms = new Date(`${promo.value.endsAt}T23:59:59`).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86_400_000))
})
</script>

<template>
  <section v-if="promo" class="os-card promo-card">
    <p class="eyebrow">
      {{ promo.name }} special<template v-if="daysLeft !== null"> · {{ daysLeft }} day{{ daysLeft === 1 ? '' : 's' }} left</template>
    </p>
    <h2>Get your {{ REUNION_FESTIVAL.year }} tickets<template v-if="hasDiscount"> for {{ discountLabel }}</template></h2>
    <p class="os-sub">
      Thanks for being part of Reunion {{ REUNION_FESTIVAL.dashboardYear }}<template v-if="hasDiscount"> — your discount applies automatically</template>.
      <template v-if="promo.prizeDescription && promo.promoType !== 'discount'"><OsIcon name="bonus" />Every purchase also enters you to win: {{ promo.prizeDescription }}</template>
    </p>
    <div class="row">
      <RouterLink class="cta" :to="ticketsLink" @click="savePrefill">Buy tickets{{ hasDiscount ? ' with discount' : '' }}</RouterLink>
      <a v-if="flyerLink" class="print-link" :href="flyerLink" target="_blank" rel="noopener"><OsIcon name="flyer" />Print a flyer</a>
    </div>
  </section>
</template>

<style scoped>
.os-card {
  background: #2f5d7c;
  border: 1px solid #9cc7e3;
  border-radius: 10px;
  padding: 0.7rem 0.8rem;
  color: white;
}
.eyebrow { margin: 0; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.72rem; color: #cfe6f5; }
.os-card h2 { margin: 0.15rem 0 0.3rem; font-size: 1.05rem; }
.os-sub { margin: 0 0 0.5rem; color: #e3f0f9; font-size: 0.82rem; }
.row { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
.prize { margin: 0.5rem 0; }
.code { margin: 0.5rem 0; }
.code strong { background: white; color: #1b2a36; border: 1px dashed #2f5d7c; padding: 2px 10px; border-radius: 6px; letter-spacing: 0.05em; }
.print-link { color: white; font-size: 0.82rem; text-decoration: underline; }
.cta {
  display: inline-block;
  padding: 0.4rem 1.1rem;
  border-radius: 5px;
  background: white;
  color: #2f5d7c;
  font-weight: 700;
  text-decoration: none;
}
</style>
