<template>
  <div class="bbp-page" :style="cssVars">
    <!-- ── HERO ─────────────────────────────────────────────────────────── -->
    <section class="bbp-hero">
      <div class="bbp-hero-inner">
        <p class="bbp-hero-eyebrow">Vancouver, BC</p>
        <h1 class="bbp-hero-title">Bitcoin<br>Block Party</h1>
        <p class="bbp-hero-date">{{ BBP.date }}</p>
        <p class="bbp-hero-time">{{ BBP.startTime }} – {{ BBP.endTime }}</p>
        <p class="bbp-hero-venue">{{ BBP.venue }}</p>
        <div class="bbp-hero-ctas">
          <router-link :to="BBP.routes.map" class="bbp-btn bbp-btn-primary">View Map</router-link>
          <button class="bbp-btn bbp-btn-secondary" @click="openDirections">Get Directions</button>
          <router-link :to="BBP.routes.quiz" class="bbp-btn bbp-btn-secondary">Take the Quiz</router-link>
          <router-link :to="BBP.routes.wallet" class="bbp-btn bbp-btn-outline">Get a Wallet</router-link>
          <router-link :to="BBP.routes.sponsorApply" class="bbp-btn bbp-btn-outline">Sponsor</router-link>
          <router-link :to="BBP.routes.vendorApply" class="bbp-btn bbp-btn-outline">Vendor</router-link>
          <router-link :to="BBP.routes.volunteer" class="bbp-btn bbp-btn-outline">Volunteer</router-link>
        </div>
      </div>
    </section>

    <!-- ── QUICK ACTIONS ──────────────────────────────────────────────────── -->
    <section class="bbp-quick-actions" aria-label="Bitcoin Block Party quick actions">
      <div class="bbp-container bbp-quick-actions-inner">
        <router-link :to="BBP.routes.map">Venue Map</router-link>
        <button @click="openDirections">Directions</button>
        <router-link :to="BBP.routes.quiz">Quiz</router-link>
        <router-link :to="BBP.routes.wallet">Wallet Guide</router-link>
        <router-link :to="BBP.routes.sponsorApply">Sponsor</router-link>
        <router-link :to="BBP.routes.vendorApply">Vendor</router-link>
        <router-link :to="BBP.routes.volunteer">Volunteer</router-link>
      </div>
    </section>

    <!-- ── ABOUT ──────────────────────────────────────────────────────────── -->
    <section class="bbp-section bbp-about">
      <div class="bbp-container">
        <h2 class="bbp-section-title">About the Event</h2>
        <p class="bbp-about-body">
          The Bitcoin Block Party is a free outdoor celebration of Bitcoin, community, and sound in the heart of Vancouver.
          Enjoy film screenings, speakers, food trucks, live DJs, and prizes — all in one spot. Bitcoin accepted everywhere.
        </p>
      </div>
    </section>

    <!-- ── ITINERARY ──────────────────────────────────────────────────────── -->
    <section class="bbp-section bbp-itinerary">
      <div class="bbp-container">
        <h2 class="bbp-section-title">Day Schedule</h2>
        <div class="bbp-schedule-list">
          <div v-for="(item, i) in BBP.itinerary" :key="i" class="bbp-schedule-item">
            <span class="bbp-schedule-time">{{ item.time }}</span>
            <span class="bbp-schedule-label">
              {{ item.label }}
              <span v-if="item.note" class="bbp-schedule-note"> — {{ item.note }}</span>
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── DIRECTIONS ─────────────────────────────────────────────────────── -->
    <section class="bbp-section bbp-directions">
      <div class="bbp-container bbp-directions-inner">
        <div class="bbp-directions-copy">
          <h2 class="bbp-section-title">Get There</h2>
          <p class="bbp-directions-address">{{ directionsLabel }}</p>
          <p class="bbp-directions-note">Open directions in your preferred map app or copy the venue search.</p>
          <div class="bbp-directions-actions">
            <button class="bbp-btn bbp-btn-primary" @click="openDirections">Google Maps</button>
            <a class="bbp-btn bbp-btn-outline" :href="appleMapsUrl" target="_blank" rel="noopener noreferrer">Apple Maps</a>
            <button class="bbp-btn bbp-btn-secondary" @click="copyDirectionsQuery">
              {{ copiedDirections ? 'Copied' : 'Copy Venue' }}
            </button>
          </div>
        </div>
        <div class="bbp-directions-map">
          <iframe
            :src="googleMapsEmbedUrl"
            title="Map to Bitcoin Block Party location at FUNK Coffee Bar"
            loading="lazy"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>
      </div>
    </section>

    <!-- ── SCREENINGS ─────────────────────────────────────────────────────── -->
    <section class="bbp-section bbp-screenings">
      <div class="bbp-container">
        <h2 class="bbp-section-title">Film Screenings</h2>
        <div class="bbp-screening-cards">
          <div v-for="film in BBP.screenings" :key="film.id" class="bbp-screening-card">
            <p class="bbp-screening-time">{{ film.time }}</p>
            <h3 class="bbp-screening-title">{{ film.title }}</h3>
            <p class="bbp-screening-desc">{{ film.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── SPONSORS ───────────────────────────────────────────────────────── -->
    <section class="bbp-section bbp-sponsors" v-if="confirmedSponsors.length || showSponsorCallToAction">
      <div class="bbp-container">
        <h2 class="bbp-section-title">Sponsors</h2>

        <!-- Confirmed sponsor logos/cards -->
        <div v-if="confirmedSponsors.length" class="bbp-sponsor-cards">
          <a
            v-for="sponsor in confirmedSponsors"
            :key="sponsor.id"
            :href="sponsor.url || undefined"
            target="_blank"
            rel="noopener noreferrer"
            class="bbp-sponsor-card"
            :class="`bbp-sponsor-tier-${sponsor.tier}`"
          >
            <span class="bbp-sponsor-tier-badge">{{ tierLabel(sponsor.tier, 'sponsor') }}</span>
            <span class="bbp-sponsor-name">{{ sponsor.displayName }}</span>
            <span class="bbp-sponsor-desc">{{ sponsor.shortDescription }}</span>
          </a>
        </div>

        <!-- Sponsor CTA -->
        <div class="bbp-cta-block">
          <p class="bbp-cta-tagline">Want to support the Bitcoin Block Party?</p>
          <router-link :to="BBP.routes.sponsorApply" class="bbp-btn bbp-btn-outline">Become a Sponsor</router-link>
        </div>
      </div>
    </section>

    <!-- ── VENDORS ────────────────────────────────────────────────────────── -->
    <section class="bbp-section bbp-vendors">
      <div class="bbp-container">
        <h2 class="bbp-section-title">Vendors</h2>
        <p class="bbp-vendors-intro">
          All vendors at the Bitcoin Block Party must accept Bitcoin. Tables go fast — apply early.
        </p>

        <!-- Confirmed vendor cards -->
        <div v-if="confirmedVendors.length" class="bbp-vendor-cards">
          <div v-for="vendor in confirmedVendors" :key="vendor.id" class="bbp-vendor-card">
            <span class="bbp-vendor-tier-badge">{{ tierLabel(vendor.tier, 'vendor') }}</span>
            <span class="bbp-vendor-name">{{ vendor.displayName }}</span>
            <span class="bbp-vendor-desc">{{ vendor.shortDescription }}</span>
          </div>
        </div>

        <!-- Vendor tier comparison -->
        <div class="bbp-tier-grid">
          <div v-for="tier in BBP.vendorTiers" :key="tier.id" class="bbp-tier-card">
            <div class="bbp-tier-header">
              <span class="bbp-tier-name">{{ tier.name }}</span>
              <span class="bbp-tier-label">{{ tier.label }}</span>
              <span class="bbp-tier-price">${{ tier.price }} CAD</span>
            </div>
            <ul class="bbp-tier-perks">
              <li v-for="(perk, i) in tier.perks" :key="i">{{ perk }}</li>
            </ul>
          </div>
        </div>

        <div class="bbp-cta-block">
          <router-link :to="BBP.routes.vendorApply" class="bbp-btn bbp-btn-outline">Apply as a Vendor</router-link>
        </div>
      </div>
    </section>

    <!-- ── MAP CTA ─────────────────────────────────────────────────────────── -->
    <section class="bbp-section bbp-map-cta">
      <div class="bbp-container bbp-map-cta-inner">
        <div class="bbp-map-cta-text">
          <h2 class="bbp-section-title">Explore the Venue</h2>
          <p>Tap any zone on the interactive map to see what's happening there.</p>
        </div>
        <router-link :to="BBP.routes.map" class="bbp-btn bbp-btn-primary">Open Map</router-link>
      </div>
    </section>

    <!-- ── QUIZ CTA ───────────────────────────────────────────────────────── -->
    <section class="bbp-section bbp-quiz-cta">
      <div class="bbp-container bbp-quiz-cta-inner">
        <div>
          <h2 class="bbp-section-title">Bitcoin Quiz</h2>
          <p>Test your knowledge and compete for prizes on the leaderboard.</p>
        </div>
        <router-link :to="BBP.routes.quiz" class="bbp-btn bbp-btn-primary">Take the Quiz</router-link>
      </div>
    </section>

    <!-- ── NEW TO BITCOIN CTA ──────────────────────────────────────────────── -->
    <section class="bbp-section bbp-wallet-cta">
      <div class="bbp-container bbp-wallet-cta-inner">
        <span class="bbp-wallet-icon">₿</span>
        <div>
          <h2 class="bbp-section-title">New to Bitcoin?</h2>
          <p>Set up your first self-custody Bitcoin wallet in under 5 minutes with our step-by-step guide.</p>
        </div>
        <router-link :to="BBP.routes.wallet" class="bbp-btn bbp-btn-outline">Get a Wallet →</router-link>
      </div>
    </section>

    <!-- ── TEAM ───────────────────────────────────────────────────────────── -->
    <section class="bbp-section bbp-team">
      <div class="bbp-container">
        <h2 class="bbp-section-title">Organizers</h2>
        <div class="bbp-team-row">
          <span v-for="admin in BBP.admins" :key="admin.name" class="bbp-team-pill">{{ admin.name }}</span>
        </div>
        <p class="bbp-team-contact">
          Questions? Email us at
          <a :href="`mailto:${BBP.contactEmail}`">{{ BBP.contactEmail }}</a>
        </p>
      </div>
    </section>

    <!-- ── FOOTER ─────────────────────────────────────────────────────────── -->
    <footer class="bbp-footer">
      <a href="/" class="bbp-footer-link">Powered by Festivall</a>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useHead } from '@vueuse/head'
import { BITCOIN_BLOCK_PARTY as BBP } from '@/config/bitcoinBlockPartyConfig.js'

useHead({
  title: `Bitcoin Block Party ${BBP.year} — ${BBP.venue}, ${BBP.city}`,
  meta: [
    {
      name: 'description',
      content: `The Bitcoin Block Party is a free outdoor celebration of Bitcoin, film, music, and community in ${BBP.city}. ${BBP.date} at ${BBP.venue}.`,
    },
    { property: 'og:title', content: `Bitcoin Block Party ${BBP.year}` },
    {
      property: 'og:description',
      content: `Free outdoor Bitcoin event — film screenings, speakers, live DJs, food trucks, and prizes. ${BBP.date}, ${BBP.venue}, ${BBP.city}.`,
    },
  ],
})

const confirmedSponsors = computed(() => BBP.sponsors.filter(s => s.status === 'confirmed'))
const confirmedVendors  = computed(() => BBP.vendors.filter(v => v.status === 'confirmed'))
const showSponsorCallToAction = true
const copiedDirections = ref(false)
const directionsLabel = computed(() => `FUNK. Coffee Bar, ${BBP.venue}, ${BBP.city}`)
const directionsQuery = computed(() => encodeURIComponent(directionsLabel.value))
const googleMapsUrl = computed(() => `https://www.google.com/maps/search/?api=1&query=${directionsQuery.value}`)
const appleMapsUrl = computed(() => `https://maps.apple.com/?q=${directionsQuery.value}`)
const googleMapsEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d868.475007062634!2d-123.1213838807658!3d49.28616521956091!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54867189aefe3a9d%3A0xe72e3e82225c0f8b!2sFUNK.%20Coffee%20Bar!5e0!3m2!1sen!2sca!4v1784433137205!5m2!1sen!2sca'

function openDirections() {
  window.open(googleMapsUrl.value, '_blank', 'noopener,noreferrer')
}

async function copyDirectionsQuery() {
  try {
    await navigator.clipboard.writeText(directionsLabel.value)
    copiedDirections.value = true
    window.setTimeout(() => { copiedDirections.value = false }, 1800)
  } catch (_) {
    openDirections()
  }
}

function tierLabel(tierId, kind) {
  if (kind === 'sponsor') {
    const tier = BBP.sponsorTiers.find(t => t.id === tierId)
    return tier ? tier.label : tierId
  }
  if (kind === 'vendor') {
    const tier = BBP.vendorTiers.find(t => t.id === tierId)
    return tier ? tier.name : tierId
  }
  return tierId
}

const cssVars = computed(() => ({
  '--bbp-purple': BBP.palette.purple,
  '--bbp-teal':   BBP.palette.teal,
  '--bbp-orange': BBP.palette.orange,
  '--bbp-tan':    BBP.palette.tan,
  '--bbp-cream':  BBP.palette.cream,
}))
</script>

<style scoped>
/* ── Base ──────────────────────────────────────────────────────────────────── */
.bbp-page {
  background: var(--bbp-cream);
  color: var(--bbp-teal);
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  min-height: 100vh;
}

/* ── Hero ──────────────────────────────────────────────────────────────────── */
.bbp-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 90vh;
  padding: 4rem 1.5rem;
  background: linear-gradient(160deg, var(--bbp-cream) 55%, rgba(7,94,114,0.09) 100%);
  text-align: center;
}
.bbp-hero-inner {
  max-width: 640px;
}
.bbp-hero-eyebrow {
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--bbp-purple);
  margin-bottom: 0.5rem;
}
.bbp-hero-title {
  font-size: clamp(3rem, 10vw, 6rem);
  font-weight: 900;
  line-height: 1;
  color: var(--bbp-teal);
  margin: 0 0 1rem;
  text-shadow: 0 1px 8px rgba(7,94,114,0.12);
}
.bbp-hero-date,
.bbp-hero-time,
.bbp-hero-venue {
  font-size: 1rem;
  margin: 0.25rem 0;
  color: var(--bbp-dark);
}
.bbp-hero-date { font-weight: 700; font-size: 1.1rem; color: var(--bbp-teal); }
.bbp-hero-ctas {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* ── Buttons ───────────────────────────────────────────────────────────────── */
.bbp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.75rem;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 700;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  letter-spacing: 0.04em;
  font-family: inherit;
}
.bbp-btn:hover { opacity: 0.88; transform: translateY(-1px); }
.bbp-btn-primary  { background: var(--bbp-orange); color: #fff; }
.bbp-btn-secondary { background: var(--bbp-teal); color: #fff; }
.bbp-btn-outline  { border: 2px solid var(--bbp-teal); color: var(--bbp-teal); background: transparent; }

/* ── Quick actions ─────────────────────────────────────────────────────────── */
.bbp-quick-actions {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(244,242,230,0.94);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(188,186,165,0.5);
  border-bottom: 1px solid rgba(188,186,165,0.5);
}
.bbp-quick-actions-inner {
  max-width: 980px;
  display: flex;
  gap: 0.45rem;
  overflow-x: auto;
  padding: 0.65rem 1.5rem;
}
.bbp-quick-actions a,
.bbp-quick-actions button {
  flex: 0 0 auto;
  padding: 0.45rem 0.8rem;
  border: 1px solid var(--bbp-tan);
  border-radius: 999px;
  background: rgba(255,255,255,0.7);
  color: var(--bbp-teal);
  text-decoration: none;
  font-size: 0.78rem;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
}
.bbp-quick-actions a:hover,
.bbp-quick-actions button:hover {
  border-color: var(--bbp-orange);
  color: var(--bbp-orange);
}

/* ── Sections ──────────────────────────────────────────────────────────────── */
.bbp-section {
  padding: 4rem 1.5rem;
  border-top: 1px solid rgba(188,186,165,0.5);
}
.bbp-container {
  max-width: 760px;
  margin: 0 auto;
}
.bbp-section-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--bbp-teal);
  margin: 0 0 1.5rem;
  letter-spacing: 0.02em;
}

/* ── About ──────────────────────────────────────────────────────────────────── */
.bbp-about-body {
  font-size: 1.05rem;
  line-height: 1.75;
  color: var(--bbp-dark);
}

/* ── Itinerary ─────────────────────────────────────────────────────────────── */
.bbp-schedule-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.bbp-schedule-item {
  display: flex;
  gap: 1.25rem;
  align-items: baseline;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(188,186,165,0.5);
}
.bbp-schedule-time {
  font-size: 0.85rem;
  color: var(--bbp-teal);
  min-width: 140px;
  font-weight: 700;
  letter-spacing: 0.03em;
}
.bbp-schedule-label {
  font-size: 1rem;
  color: var(--bbp-dark);
}
.bbp-schedule-note {
  color: var(--bbp-purple);
  font-size: 0.9rem;
}

/* ── Screenings ─────────────────────────────────────────────────────────────── */
.bbp-screening-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

/* ── Directions ─────────────────────────────────────────────────────────────── */
.bbp-directions {
  background: rgba(188,186,165,0.16);
}
.bbp-directions-inner {
  max-width: 980px;
  display: grid;
  grid-template-columns: minmax(260px, 0.85fr) minmax(320px, 1.15fr);
  align-items: stretch;
  gap: 2rem;
}
.bbp-directions-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.bbp-directions-address {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--bbp-dark);
}
.bbp-directions-note {
  margin: 0.35rem 0 0;
  color: var(--bbp-purple);
  font-size: 0.95rem;
}
.bbp-directions-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.25rem;
}
.bbp-directions-map {
  min-height: 320px;
  border: 1px solid var(--bbp-tan);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255,255,255,0.7);
}
.bbp-directions-map iframe {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 320px;
  border: 0;
}
.bbp-screening-card {
  background: rgba(255,255,255,0.75);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--bbp-tan);
}
.bbp-screening-time {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--bbp-teal);
  margin: 0 0 0.35rem;
}
.bbp-screening-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--bbp-teal);
  margin: 0 0 0.5rem;
}
.bbp-screening-desc {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--bbp-dark);
  margin: 0;
}

/* ── Sponsors ───────────────────────────────────────────────────────────────── */
.bbp-sponsor-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}
.bbp-sponsor-card {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1.25rem 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--bbp-tan);
  background: rgba(255,255,255,0.75);
  text-decoration: none;
  color: var(--bbp-teal);
  transition: background 0.15s;
  min-width: 200px;
}
.bbp-sponsor-card:hover { background: rgba(255,255,255,0.95); }
.bbp-sponsor-tier-badge {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--bbp-orange);
}
.bbp-sponsor-name { font-size: 1.2rem; font-weight: 800; }
.bbp-sponsor-desc { font-size: 0.85rem; color: var(--bbp-dark); }

/* ── Vendors ─────────────────────────────────────────────────────────────────── */
.bbp-vendors-intro {
  color: var(--bbp-tan);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}
.bbp-vendor-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}
.bbp-vendor-card {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border: 1px solid var(--bbp-tan);
  background: rgba(255,255,255,0.75);
  min-width: 180px;
}
.bbp-vendor-tier-badge {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--bbp-teal);
}
.bbp-vendor-name { font-size: 1rem; font-weight: 700; }
.bbp-vendor-desc { font-size: 0.82rem; color: var(--bbp-dark); }

/* ── Tier grid ───────────────────────────────────────────────────────────────── */
.bbp-tier-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}
.bbp-tier-card {
  border-radius: 8px;
  border: 1px solid var(--bbp-tan);
  background: rgba(255,255,255,0.75);
  overflow: hidden;
}
.bbp-tier-header {
  padding: 1.25rem 1.25rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  border-bottom: 1px solid var(--bbp-tan);
}
.bbp-tier-name { font-size: 1.15rem; font-weight: 800; color: var(--bbp-teal); }
.bbp-tier-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--bbp-teal); }
.bbp-tier-price { font-size: 1rem; font-weight: 700; color: var(--bbp-orange); margin-top: 0.25rem; }
.bbp-tier-perks {
  padding: 0.75rem 1.25rem 1.25rem;
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.bbp-tier-perks li {
  font-size: 0.88rem;
  color: var(--bbp-dark);
  padding-left: 1rem;
  position: relative;
}
.bbp-tier-perks li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--bbp-teal);
  font-size: 0.75rem;
  top: 1px;
}

/* ── CTA blocks ──────────────────────────────────────────────────────────────── */
.bbp-cta-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}
.bbp-cta-tagline { color: var(--bbp-dark); font-size: 0.95rem; margin: 0; }

/* ── Map CTA ─────────────────────────────────────────────────────────────────── */
.bbp-map-cta, .bbp-quiz-cta {
  background: rgba(7, 94, 114, 0.06);
}
.bbp-map-cta-inner,
.bbp-quiz-cta-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}
.bbp-map-cta-text p,
.bbp-quiz-cta-inner > div > p {
  color: var(--bbp-dark);
  margin: 0;
  font-size: 0.95rem;
}
.bbp-map-cta-text .bbp-section-title,
.bbp-quiz-cta-inner .bbp-section-title {
  margin-bottom: 0.35rem;
}

/* ── Wallet CTA ──────────────────────────────────────────────────────────────── */
.bbp-wallet-cta {
  background: rgba(200, 63, 15, 0.07);
}
.bbp-wallet-cta-inner {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}
.bbp-wallet-icon {
  font-size: 3rem;
  line-height: 1;
}
.bbp-wallet-cta-inner > div > p {
  color: var(--bbp-dark);
  margin: 0;
  font-size: 0.95rem;
}
.bbp-wallet-cta-inner .bbp-section-title {
  margin-bottom: 0.35rem;
}

/* ── Team ────────────────────────────────────────────────────────────────────── */
.bbp-team { text-align: center; }
.bbp-team-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}
.bbp-team-pill {
  padding: 0.35rem 1rem;
  border-radius: 999px;
  border: 1px solid var(--bbp-tan);
  font-size: 0.9rem;
  color: var(--bbp-teal);
}
.bbp-team-contact {
  font-size: 0.9rem;
  color: var(--bbp-dark);
}
.bbp-team-contact a {
  color: var(--bbp-teal);
  text-decoration: none;
}
.bbp-team-contact a:hover { text-decoration: underline; }

/* ── Footer ──────────────────────────────────────────────────────────────────── */
.bbp-footer {
  padding: 2rem 1.5rem;
  text-align: center;
  border-top: 1px solid rgba(188,186,165,0.5);
}
.bbp-footer-link {
  font-size: 0.8rem;
  color: var(--bbp-tan);
  text-decoration: none;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.bbp-footer-link:hover { color: var(--bbp-teal); }

/* ── Responsive ──────────────────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .bbp-schedule-item { flex-direction: column; gap: 0.2rem; }
  .bbp-schedule-time { min-width: auto; }
  .bbp-map-cta-inner,
  .bbp-quiz-cta-inner,
  .bbp-wallet-cta-inner { flex-direction: column; align-items: flex-start; }
  .bbp-directions-inner { grid-template-columns: 1fr; }
  .bbp-directions-actions .bbp-btn { width: 100%; }
}
</style>
