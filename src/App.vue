<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import { useHead } from '@vueuse/head'
import PosterSplash from './components/PosterSplash.vue'
import { BITCOIN_BLOCK_PARTY as BBP } from '@/config/bitcoinBlockPartyConfig.js'
import poster2026 from '@/assets/images/reunion_2026_poster_v1.svg?url'
import poster2025 from '@/assets/images/reunion_2025_poster_v2.svg?url'
import poster2024 from '@/assets/images/reunion_2024_poster_v1.png?url'
import bitcoinBlockPartyPoster from '@/assets/images/bitcoin_block_party/bitcoin_block_party_2026_bg.svg?url'

const POSTER_ROUTES = ['/reunion', '/reunionapplication', '/reuniontickets']
const BITCOIN_BLOCK_PARTY_POSTER_ROUTES = ['/bitcoinblockparty']
const STORAGE_KEY = 'posterSplashShown_2026'
const BITCOIN_BLOCK_PARTY_STORAGE_KEY = 'bitcoinBlockPartyPosterSplashShown_2026'

const route = useRoute()
const showPoster = ref(false)
const posterSrc = ref(poster2025)
const posterHint = ref('This was our 2025 poster.<br>The 2026 edition is going to be Iconic')
const posterHintTitle = ref('')
const posterHintBody = ref('')
const showBitcoinBlockPartyInfo = ref(false)
const activePosterStorageKey = ref(STORAGE_KEY)

watch(
  () => route.path,
  (path) => {
    if (POSTER_ROUTES.includes(path)) {
      const shown = parseInt(sessionStorage.getItem(STORAGE_KEY) || '0')
      posterSrc.value = poster2025
      posterHint.value = 'This was our 2025 poster.<br>The 2026 edition is going to be Iconic'
      posterHintTitle.value = ''
      posterHintBody.value = ''
      showBitcoinBlockPartyInfo.value = false
      activePosterStorageKey.value = STORAGE_KEY
      showPoster.value = shown < 3
      return
    }

    if (BITCOIN_BLOCK_PARTY_POSTER_ROUTES.includes(path)) {
      const shown = parseInt(sessionStorage.getItem(BITCOIN_BLOCK_PARTY_STORAGE_KEY) || '0')
      posterSrc.value = bitcoinBlockPartyPoster
      posterHint.value = ''
      posterHintTitle.value = BBP.splash?.title || `${BBP.name} ${BBP.year}`
      posterHintBody.value = BBP.splash?.hintBody || 'Tap the poster to enter. Pinch or scroll to zoom.'
      showBitcoinBlockPartyInfo.value = true
      activePosterStorageKey.value = BITCOIN_BLOCK_PARTY_STORAGE_KEY
      showPoster.value = shown < 3
      return
    }

    showPoster.value = false
    showBitcoinBlockPartyInfo.value = false
  },
  { immediate: true }
)

const onPosterDismissed = () => {
  showPoster.value = false
  const storageKey = activePosterStorageKey.value
  const shown = parseInt(sessionStorage.getItem(storageKey) || '0')
  sessionStorage.setItem(storageKey, String(shown + 1))
}

// Default global meta (individual pages override title/description via their own useHead)
useHead({
  title: 'Festivall — Canadian Electronic Music Festivals',
  meta: [
    {
      name: 'description',
      content: 'Home of the best Canadian grassroots electronic music festivals.'
    },
    {
      name: 'keywords',
      content: 'Festival, Festiv-All, Impact, Evolved, Blessed Coast, Reunion, festival, Das Record'
    }
  ]
})

// Noindex all pages not in the public allowlist
const PUBLIC_PATHS = [
  '/', '/about', '/reunion', '/blessedcoast', '/blessedcoastlineup',
  '/fusecollective', '/dasrecord', '/synergistic', '/services', '/testimonials',
  '/reunionlineup', '/reuniontickets', '/reunionapplication', '/reunionfaq', '/reunionamenities',
  '/reunionfamily', '/reunionteam', '/reunionsoundsystem',
  '/art-and-photography', '/coding-and-webdev', '/soundtech', '/reunioncontact',
  '/bitcoinblockparty', '/bitcoinblockparty/archive', '/bitcoinblockpartymap', '/bitcoinquiz', '/bitcoin-wallet',
]

useHead(computed(() => ({
  meta: PUBLIC_PATHS.includes(route.path)
    ? []
    : [{ name: 'robots', content: 'noindex, nofollow' }]
})))
</script>

<template>
  <header v-show="$route.meta.showHeader">
    <div class="wrapper">
      <!-- <HelloWorld msg="FESTIV-ALL" /> -->
      <a href="/">
        <img
          src="@/assets/images/festivall_emblem_white.png"
          alt="Festivall Logo"
          class="logo"
          style="display: flex; align-items: center; height: auto; width: 100px"
        />
      </a>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/reunion">Reunion</RouterLink>
        <!-- <RouterLink to="/dasrecord">Das Record</RouterLink> -->
        <RouterLink to="/placeholder">PlaceHolder</RouterLink>
        <RouterLink to="/blessedcoast">Blessed</RouterLink>
        <RouterLink to="/synergistic">Synergistic</RouterLink>
        <RouterLink to="/starcrossed">Starcrossed</RouterLink>
        <a href="https://evolvedmusicgroup.com"> Evolved</a>
        <a href="https://www.instagram.com/impactfestival_bc/">Impact</a>
        <RouterLink to="/fusecollective">Fuse</RouterLink>
        <RouterLink to="/services">Services</RouterLink>
        <RouterLink id="dashboard" to="/dashboard">Dashboard</RouterLink>
      </nav>
    </div>
  </header>

  <PosterSplash
    v-if="showPoster"
    :src="posterSrc"
    :hint="posterHint"
    :hint-title="posterHintTitle"
    :hint-body="posterHintBody"
    :show-bitcoin-block-party-info="showBitcoinBlockPartyInfo"
    @dismissed="onPosterDismissed"
  />
  <RouterView />
</template>

<style scoped>
#dashboard {
  background-color: var(--color-primary);
  color: white;
  text-shadow: 0px 0px 10px white;
}
header {
  line-height: 1.3;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 1rem auto;
  /* box-shadow: 0 0 10px rgb(0, 128, 255); */
}

nav {
  text-shadow: 0px 0px 20px rgba(255, 255, 255, 0.2);
  display: grid;
  gap: 0.25rem;
  padding: 0 1rem;
  grid-template-columns: repeat(4, 1fr);
  width: 100%;
  font-size: 16px;

  text-align: center;
  /* margin-top: 1rem; */
}
nav a:hover {
  color: white;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-left: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);

  border-radius: 5px;
  margin: 1px;
}

@media (min-width: 1024px) {
  nav {
    display: flex;
    text-align: center;
    justify-content: space-around;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
