<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import { onMounted } from 'vue'
import { logEvent } from 'firebase/analytics'
import { festivall_analytics } from '@/firebase.js'

onMounted(() => {
  // Track page view for home page
  logEvent(festivall_analytics, 'page_view', {
    page_title: 'Festivall Home',
    page_location: window.location.href
  })
})
</script>

<template>
  <main>
    <TheWelcome />
  </main>
</template>
