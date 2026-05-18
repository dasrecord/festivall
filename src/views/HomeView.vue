<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import { onMounted } from 'vue'
import { logEvent } from 'firebase/analytics'
import { festivall_analytics } from '@/firebase.js'
import { useHead } from '@vueuse/head'

useHead({
  title: 'Festivall — Canadian Electronic Music Festivals',
  meta: [
    { name: 'description', content: 'Festivall is the home of Canada\'s best grassroots electronic music festivals. Discover Reunion, Blessed Coast, Fuse Collective, and more.' },
    { property: 'og:title', content: 'Festivall — Canadian Electronic Music Festivals' },
    { property: 'og:description', content: 'Discover Canada\'s best grassroots electronic music festivals: Reunion, Blessed Coast, Fuse Collective, and more.' },
    { property: 'og:image', content: 'https://festivall.ca/festivall_preview.png' },
    { property: 'og:url', content: 'https://festivall.ca/' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Festivall — Canadian Electronic Music Festivals' },
    { name: 'twitter:description', content: 'Discover Canada\'s best grassroots electronic music festivals: Reunion, Blessed Coast, Fuse Collective, and more.' },
    { name: 'twitter:image', content: 'https://festivall.ca/festivall_preview.png' },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Festivall',
        url: 'https://festivall.ca',
        logo: 'https://festivall.ca/festivall_logo.png',
        description: 'Home of the best Canadian grassroots electronic music festivals.',
        sameAs: [
          'https://www.instagram.com/festivall.ca',
          'https://www.facebook.com/festivallca'
        ]
      })
    }
  ]
})

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
