<template>
  <div class="services-page">
    <div class="banner">
      <img :src="emblem" alt="Festivall" class="logo" />
      <h1>SERVICES</h1>
      <span class="tagline">What we do</span>
    </div>

    <div class="services-grid">

      <!-- Community Hotspot — commented out (venue TBD)
      <div class="budget-card">
        <div class="card-header">
          <RouterLink to="/hotspot" class="card-title">Community Hotspot →</RouterLink>
        </div>
        <p class="card-blurb">Looking for a creative space for microevents? Check this place out.</p>
      </div>
      -->

      <div class="budget-card">
        <div class="card-header">
          <RouterLink to="/starcrossed" class="card-title">Record Label →</RouterLink>
        </div>
        <p class="card-blurb">Want to submit your producer/DJ demos? Start here.</p>
      </div>

      <div class="budget-card">
        <div class="card-header">
          <RouterLink to="/soundtech" class="card-title">Sound Tech →</RouterLink>
        </div>
        <p class="card-blurb">Need someone to run sound for your event? We have you covered.</p>
      </div>

      <div class="budget-card">
        <div class="card-header">
          <RouterLink to="/stagerider" class="card-title">Stage Rider →</RouterLink>
        </div>
        <p class="card-blurb">Need to submit your stage rider for your performance? We can help.</p>
      </div>

      <div class="budget-card">
        <div class="card-header">
          <RouterLink to="/art-and-photography" class="card-title">Art & Photography →</RouterLink>
        </div>
        <p class="card-blurb">Looking for a photographer or artist for your event? Drop us a line.</p>
      </div>

      <div class="budget-card">
        <div class="card-header">
          <RouterLink to="/onyx" class="card-title">Onyx →</RouterLink>
        </div>
        <p class="card-blurb">Interested in custom hair, photo & design? Check this out.</p>
      </div>

      <div class="budget-card">
        <div class="card-header">
          <a href="https://www.instagram.com/cakeawaysk" target="_blank" rel="noopener noreferrer" class="card-title">Cakeaway →</a>
        </div>
        <p class="card-blurb">Interested in custom desserts and cakes? Dig in.</p>
      </div>

      <div class="budget-card">
        <div class="card-header">
          <RouterLink to="/munnismeals" class="card-title">Munni's Meals →</RouterLink>
        </div>
        <p class="card-blurb">Craving homemade Indian/Bengali food? We deliver.</p>
      </div>

      <div class="budget-card">
        <div class="card-header">
          <RouterLink to="/coding-and-webdev" class="card-title">Coding & Web Development →</RouterLink>
        </div>
        <p class="card-blurb">Searching for a computer programmer or webmaster? Look no further.</p>
      </div>

      <div class="budget-card">
        <div class="card-header">
          <RouterLink to="/wedding-dj" class="card-title">Wedding DJ →</RouterLink>
        </div>
        <p class="card-blurb">Looking for a premium DJ + production for your wedding or event? Let's talk.</p>
      </div>

      <div class="budget-card">
        <div class="card-header">
          <RouterLink to="/bitcoinmeetup" class="card-title bitcoin-title">Bitcoin →</RouterLink>
        </div>
        <p class="card-blurb">Interested in learning about Bitcoin? Schedule a free workshop.</p>
      </div>

    </div>
  </div>
</template>

<script>
import { RouterLink } from 'vue-router'
import festivallEmblemWhite from '@/assets/images/festivall_emblem_white.png'
import { useHead } from '@vueuse/head'

export default {
  name: 'ServicesView',
  setup() {
    useHead({
      title: 'Services — Festivall | Sound Tech, Web Dev, Photography & More',
      meta: [
        { name: 'description', content: 'Festivall offers a suite of creative services: sound tech, web development, art & photography, event production, and more. Based in Saskatchewan, Canada.' },
        { property: 'og:title', content: 'Services — Festivall' },
        { property: 'og:description', content: 'Sound tech, web development, art & photography, event production, and more. Creative services from the Festivall network.' },
        { property: 'og:image', content: 'https://festivall.ca/festivall_preview.png' },
        { property: 'og:url', content: 'https://festivall.ca/services' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Services — Festivall' },
        { name: 'twitter:description', content: 'Sound tech, web development, art & photography, event production, and more. Creative services from the Festivall network.' },
        { name: 'twitter:image', content: 'https://festivall.ca/festivall_preview.png' },
      ]
    })
  },
  components: { RouterLink },
  data() {
    return { emblem: festivallEmblemWhite }
  }
}
</script>

<style scoped>
.services-page {
  width: 100%;
  min-height: 100vh;
  background-color: #1f1e22;
  color: #e0e0e0;
  padding-bottom: 3rem;
}

.banner {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  padding: 0.75rem 1rem;
}

.logo {
  height: 32px;
  width: auto;
}

h1 {
  font-size: 13px;
  letter-spacing: 0.12em;
  color: var(--festivall-baby-blue);
  margin: 0;
}

.tagline {
  font-size: 11px;
  color: #666;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1px;
  background-color: #2a2a2e;
  padding: 1px;
  margin-top: 1px;
}

.budget-card {
  background-color: #252528;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.card-header {
  border-bottom: 1px solid #333;
  padding-bottom: 0.4rem;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--festivall-baby-blue);
  text-decoration: none;
}

.card-title:hover {
  color: #fff;
}

.bitcoin-title {
  color: #ff9900;
}

.bitcoin-title:hover {
  color: #ffb84d;
}

.card-blurb {
  font-size: 11px;
  color: #888;
  line-height: 1.5;
  margin: 0;
}

@media (max-width: 480px) {
  .services-grid {
    grid-template-columns: 1fr;
  }
}
</style>
