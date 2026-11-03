<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import {
  DEFAULT_SEASONAL_PROMOS,
  seasonalPromoFromData,
  seasonalPromoPath,
  type SeasonalPromo
} from '@/config/seasonalPromos'

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
const daysLeft = computed(() => {
  if (!promo.value?.endsAt) return null
  const ms = new Date(`${promo.value.endsAt}T23:59:59`).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86_400_000))
})
</script>

<template>
  <section v-if="promo" class="os-card promo-card">
    <p class="eyebrow">Seasonal promotion</p>
    <h2>{{ promo.name }}<template v-if="hasDiscount"> · {{ discountLabel }}</template></h2>
    <p v-if="promo.description" class="os-sub">{{ promo.description }}</p>
    <p v-if="promo.prizeDescription" class="prize">🎁 {{ promo.prizeDescription }}</p>
    <p v-if="hasDiscount && promo.promoCode" class="code">
      Code <strong>{{ promo.promoCode }}</strong>
    </p>
    <p v-if="daysLeft !== null" class="os-sub">
      {{ daysLeft }} day{{ daysLeft === 1 ? '' : 's' }} left
    </p>
    <RouterLink class="cta" :to="seasonalPromoPath(promo)">View offer</RouterLink>
  </section>
</template>

<style scoped>
.os-card {
  background: #2f5d7c;
  border: 1px solid #9cc7e3;
  border-radius: 10px;
  padding: 0.9rem;
  color: white;
}
.eyebrow { margin: 0; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.72rem; color: #cfe6f5; }
.os-card h2 { margin: 0.25rem 0 0.5rem; font-size: 1.15rem; }
.os-sub { margin: 0.25rem 0; color: #e3f0f9; font-size: 0.9rem; }
.prize { margin: 0.5rem 0; }
.code { margin: 0.5rem 0; }
.code strong { background: white; color: #1b2a36; border: 1px dashed #2f5d7c; padding: 2px 10px; border-radius: 6px; letter-spacing: 0.05em; }
.cta {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.4rem 1.1rem;
  border-radius: 999px;
  background: white;
  color: #2f5d7c;
  font-weight: 700;
  text-decoration: none;
}
</style>
