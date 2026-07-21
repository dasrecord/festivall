import { ref, computed, onUnmounted } from 'vue'
import { festivall_auth } from '@/firebase'
import { BITCOIN_BLOCK_PARTY } from '@/config/bitcoinBlockPartyConfig.js'

const currentUser = ref(festivall_auth.currentUser)

const unsubscribe = festivall_auth.onAuthStateChanged((user) => {
  currentUser.value = user
})

// Keep the listener alive for the app lifetime (module-level singleton)
// If you ever need to clean up, call the returned unsubscribe
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', unsubscribe)
}

export function useBitcoinBlockPartyAdmin() {
  const isAdmin = computed(() =>
    !!(currentUser.value && BITCOIN_BLOCK_PARTY.adminUids.includes(currentUser.value.uid))
  )

  return { isAdmin, currentUser }
}
