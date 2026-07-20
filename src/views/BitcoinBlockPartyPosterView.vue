<template>
  <main class="bbp-poster-page">
    <PosterSplash
      :src="posterSrc"
      :hint-title="BBP.splash?.title || `${BBP.name} ${BBP.year}`"
      :hint-body="BBP.splash?.hintBody || 'Tap the poster to enter. Pinch or scroll to zoom.'"
      :show-bitcoin-block-party-info="true"
      @dismissed="goToLanding"
    />
  </main>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import PosterSplash from '@/components/PosterSplash.vue'
import { BITCOIN_BLOCK_PARTY as BBP } from '@/config/bitcoinBlockPartyConfig.js'
import posterSrc from '@/assets/images/bitcoin_block_party/bitcoin_block_party_2026_bg.svg?url'

const router = useRouter()

useHead({
  title: `${BBP.name} ${BBP.year} Poster`,
  meta: [
    {
      name: 'description',
      content: `View the ${BBP.name} ${BBP.year} poster for ${BBP.date} at ${BBP.venue}, ${BBP.city}.`,
    },
    { property: 'og:title', content: `${BBP.name} ${BBP.year} Poster` },
    { property: 'og:image', content: posterSrc },
  ],
})

function goToLanding() {
  router.push(BBP.routes.landing)
}
</script>

<style scoped>
.bbp-poster-page {
  min-height: 100vh;
  background: #000;
}
</style>
