<template>
  <main class="reunion-page">
    <header class="topline">
      <img :src="reunion_emblem" alt="Reunion" class="reunion-emblem" />
      <span class="topline-location">A gathering near Saskatoon, SK</span>
      <RouterLink class="topline-link" to="/reuniontickets">Get tickets <span aria-hidden="true">↗</span></RouterLink>
    </header>

    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow"><span class="status-dot"></span> {{ festivalDateRange }} &nbsp; / &nbsp; Saskatchewan</p>
        <h1>Come back<br /><em>together.</em></h1>
        <p class="hero-description">A little world of music, dancing, camping, family, friends, and food. Made together, for everyone.</p>
        <div class="hero-actions">
          <RouterLink class="primary-link" to="/reuniontickets">Find your way here <span aria-hidden="true">↗</span></RouterLink>
          <a class="text-link" href="#the-experience">Explore Reunion <span aria-hidden="true">↓</span></a>
        </div>
      </div>
      <div class="hero-art">
        <div class="hero-orbit orbit-one"></div>
        <div class="hero-orbit orbit-two"></div>
        <span class="art-caption art-caption-top">A place to belong</span>
        <img class="frog" :src="frogImage" alt="Reunion's frog mascot" />
        <span class="art-caption art-caption-bottom">See you in {{ festival.year }} ✳</span>
      </div>
      <div class="hero-footer">
        <span>30 minutes from Saskatoon</span>
        <span class="countdown"><CountdownTimer /></span>
        <span>One weekend. All of us.</span>
      </div>
    </section>

    <div class="marquee-band">
      <ReunionIconMarquee :group="iconMarquees[0]" />
      <ReunionIconMarquee :group="iconMarquees[1]" reverse />
    </div>

    <section id="the-experience" class="marquee-section" aria-label="Explore the festival">
      <div class="section-intro">
        <p class="eyebrow">01 / A world of its own</p>
        <h2>All the little things<br /><em>make the magic.</em></h2>
        <p>From the dance floor to the quiet corners, there’s a place for you here.</p>
      </div>
    </section>

    <div class="marquee-band marquee-band-light">
      <ReunionIconMarquee :group="iconMarquees[2]" />
      <ReunionIconMarquee :group="iconMarquees[5]" reverse />
    </div>

    <section class="film-section">
      <div class="film-heading">
        <div>
          <p class="eyebrow">02 / Get a feel for it</p>
          <h2>More than a<br /><em>festival.</em></h2>
        </div>
        <p>It's the people, the place, and the moments in between. Take a look inside Reunion.</p>
      </div>
      <div class="video-wrapper">
        <iframe
          src="https://www.youtube.com/embed/xibNU7F_RKQ?si=ImT7j7-lbAu41oPu"
          title="Reunion Festival video"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
          @load="trackVideoLoad"
        ></iframe>
      </div>
    </section>

    <section class="marquee-section community-section" aria-label="The people and ideas behind Reunion">
      <div class="section-intro">
        <p class="eyebrow">03 / Made by all of us</p>
        <h2>Many hands.<br /><em>One Reunion.</em></h2>
        <p>Artists, builders, dreamers, and doers: every part of this gathering has a story.</p>
      </div>
    </section>

    <div class="marquee-band marquee-band-light">
      <ReunionIconMarquee :group="iconMarquees[4]" />
      <ReunionIconMarquee :group="teamMarquee" reverse team />
    </div>

    <section class="visit-section">
      <div class="visit-copy">
        <p class="eyebrow">04 / Make yourself at home</p>
        <h2>We'll save you<br /><em>a spot.</em></h2>
        <p>{{ festivalDateRange }}<br />30 minutes from Saskatoon, Saskatchewan</p>
      </div>
      <div class="visit-details">
        <div class="price-row"><span>Weekend pass</span><strong>${{ festival.pricing.weekendPass }} CAD</strong></div>
        <div class="price-row"><span>Day pass</span><strong>${{ festival.pricing.dayPass }} CAD</strong></div>
        <div class="price-row"><span>Meal plans</span><strong>${{ festival.pricing.mealPackage }} CAD / day</strong></div>
        <p class="bitcoin">25% discount if you pay with bitcoin <img :src="bitcoin_icon" alt="" /></p>
        <div class="details-panel">
          <DetailsPanel>
            <template #link1><RouterLink to="/reunionfamily" @click="trackLinkClick('learn_more')">Learn more</RouterLink></template>
            <template #link2><RouterLink to="/reunionteam" @click="trackLinkClick('meet_team')">Meet the team</RouterLink></template>
            <template #link3><RouterLink to="/reunionsoundsystem" @click="trackLinkClick('sound_system')">our custom soundsystem.</RouterLink></template>
            <template #link4><RouterLink to="/reunionamenities" @click="trackLinkClick('amenities')">amenities.</RouterLink></template>
          </DetailsPanel>
        </div>
      </div>
    </section>
    <div class="marquee-band">
      <ReunionIconMarquee :group="iconMarquees[3]" />
      <ReunionIconMarquee :group="iconMarquees[6]" reverse />
    </div>
    <section class="action-section" aria-label="Get involved">
      <p class="eyebrow">See you out there</p>
      <CalltoAction />
    </section>
  </main>
</template>

<script>
import CountdownTimer from '@/components/CountdownTimer.vue'
import frog_image from '@/assets/images/frog.png'
import reunion_emblem from '../assets/images/reunion_emblem_white.png'
import bitcoin_icon from '../assets/images/bitcoin.svg?url'
import CalltoAction from '@/components/CalltoAction.vue'
import DetailsPanel from '@/components/DetailsPanel.vue'
import ReunionIconMarquee from '@/components/ReunionIconMarquee.vue'
import { REUNION_ICON_MARQUEES } from '@/data/reunionIconMarquees.js'
import { REUNION_TEAM } from '@/data/reunionTeam.js'
import { RouterLink } from 'vue-router'
import { logEvent } from 'firebase/analytics'
import { reunion_analytics } from '@/firebase.js'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'
import { useHead } from '@vueuse/head'

export default {
  setup() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
    const { year, month, day, endDay, pricing, startDate } = REUNION_FESTIVAL
    const monthName = months[month - 1]
    const dateRange = `${monthName} ${day}–${endDay}, ${year}`
    const startDateStr = startDate.toISOString().slice(0, 10)
    const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`

    useHead({
      title: `Reunion Festival ${year} — Grassroots Electronic Music Near Saskatoon, SK`,
      meta: [
        { name: 'description', content: `Reunion is a grassroots electronic music festival 30 minutes from Saskatoon, SK. ${dateRange}. Music, dancing, camping, family, friends, and food. Weekend passes from $${pricing.weekendPass} CAD.` },
        { property: 'og:title', content: `Reunion Festival ${year} — Near Saskatoon, SK` },
        { property: 'og:description', content: `A grassroots electronic music festival in Saskatchewan. ${dateRange}. Camping, live music, and community. Weekend passes from $${pricing.weekendPass} CAD.` },
        { property: 'og:image', content: 'https://festivall.ca/reunion_2026_preview.png' },
        { property: 'og:url', content: 'https://festivall.ca/reunion' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: `Reunion Festival ${year} — Near Saskatoon, SK` },
        { name: 'twitter:description', content: `A grassroots electronic music festival in Saskatchewan. ${dateRange}. Camping, live music, and community.` },
        { name: 'twitter:image', content: 'https://festivall.ca/reunion_preview.png' },
      ],
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MusicEvent',
            name: `Reunion Festival ${year}`,
            description: `Reunion is a grassroots electronic music festival 30 minutes from Saskatoon, SK. Music, dancing, camping, family, friends, and food.`,
            startDate: startDateStr,
            endDate: endDateStr,
            eventStatus: 'https://schema.org/EventScheduled',
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            location: {
              '@type': 'Place',
              name: 'Near Saskatoon, Saskatchewan, Canada',
              address: {
                '@type': 'PostalAddress',
                addressRegion: 'SK',
                addressCountry: 'CA'
              }
            },
            offers: {
              '@type': 'Offer',
              url: 'https://festivall.ca/reuniontickets',
              price: String(pricing.weekendPass),
              priceCurrency: 'CAD',
              availability: 'https://schema.org/InStock'
            },
            organizer: {
              '@type': 'Organization',
              name: 'Festivall',
              url: 'https://festivall.ca'
            },
            image: 'https://festivall.ca/reunion_preview.png',
            url: 'https://festivall.ca/reunion'
          })
        }
      ]
    })
  },
  components: {
    CountdownTimer,
    CalltoAction,
    DetailsPanel,
    ReunionIconMarquee,
    RouterLink
  },
  data() {
    return {
      frogImage: frog_image,
      reunion_emblem: reunion_emblem,
      bitcoin_icon: bitcoin_icon,
      festival: REUNION_FESTIVAL,
      iconMarquees: REUNION_ICON_MARQUEES,
      teamMarquee: {
        title: 'The people behind Reunion',
        items: REUNION_TEAM.map(({ name, label, image }) => ({
          name,
          label: label || name,
          icon: image
        }))
      }
    }
  },
  computed: {
    festivalDateRange() {
      const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEPT','OCT','NOV','DEC']
      const month = months[this.festival.month - 1]
      const ord = (n) => { const s = ['th','st','nd','rd']; const v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]) }
      return `${month} ${ord(this.festival.day)} - ${month} ${ord(this.festival.endDay)} ${this.festival.year}`
    }
  },
  mounted() {
    // Track page view with Firebase
    logEvent(reunion_analytics, 'page_view', {
      page_title: `Reunion Festival ${this.festival.year}`,
      page_location: window.location.href
    })

    // Track page view with Facebook Pixel
    if (typeof fbq !== 'undefined') {
      fbq('track', 'ViewContent', {
        content_name: `Reunion Festival ${this.festival.year}`,
        content_category: 'Festival',
        content_ids: [`reunion${this.festival.year}`],
        content_type: 'product'
      })
    }
  },
  methods: {
    trackVideoLoad() {
      // Firebase tracking
      logEvent(reunion_analytics, 'video_start', {
        video_title: 'Reunion Festival 2026 Promo',
        video_url: 'https://www.youtube.com/embed/xibNU7F_RKQ'
      })

      // Facebook Pixel tracking
      if (typeof fbq !== 'undefined') {
        fbq('track', 'ViewContent', {
          content_name: 'Reunion Festival Video',
          content_category: 'Video'
        })
      }
    },
    trackLinkClick(linkName) {
      // Firebase tracking
      logEvent(reunion_analytics, 'select_content', {
        content_type: 'navigation_link',
        item_id: linkName,
        content_name: linkName.replace('_', ' ')
      })

      // Facebook Pixel tracking
      if (typeof fbq !== 'undefined') {
        fbq('track', 'ViewContent', {
          content_name: linkName.replace('_', ' '),
          content_category: 'Navigation'
        })
      }
    }
  }
}
</script>

<style scoped>
.reunion-page {
  width: 100vw;
  overflow: hidden;
  background: var(--reunion-bg);
  color: var(--reunion-text);
  font-family: var(--reunion-body-font);
}

.topline, .hero, .section-intro, .film-section, .visit-section, .action-section {
  padding-left: var(--reunion-page-gutter);
  padding-right: var(--reunion-page-gutter);
}

.topline {
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--reunion-border);
}

.reunion-emblem { width: clamp(120px, 13vw, 190px); height: auto; }
.topline-location, .topline-link, .eyebrow, .hero-footer, .art-caption {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.topline-location { color: var(--reunion-accent-muted); }
.topline-link { color: var(--reunion-text); }
.topline-link span, .primary-link span { margin-left: 1rem; }

.hero {
  position: relative;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  align-items: center;
  min-height: 650px;
  padding-top: 5rem;
  background: radial-gradient(ellipse at 75% 42%, var(--reunion-hero-glow) 0%, var(--reunion-hero-mid) 34%, var(--reunion-bg) 70%);
}
.hero-copy { position: relative; z-index: 1; padding-bottom: 4rem; }
.eyebrow { color: var(--reunion-accent); line-height: 1.6; }
.status-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 0.5rem;
  border-radius: 50%;
  background: var(--reunion-gold);
  box-shadow: 0 0 12px var(--reunion-gold);
}
h1, h2 {
  font-family: var(--reunion-display-font);
  font-weight: 100;
  letter-spacing: -0.055em;
}
h1 { margin: 1.7rem 0; font-size: clamp(5rem, 10vw, 10.5rem); line-height: 0.86; }
h2 { font-size: clamp(3.5rem, 6vw, 6.8rem); line-height: 0.94; }
h1 em, h2 em { color: var(--reunion-accent); font-style: normal; }
.hero-description, .section-intro > p:last-child, .film-heading > p, .visit-copy > p:last-child {
  max-width: 400px;
  color: var(--reunion-text-muted);
  font-size: 1rem;
  line-height: 1.7;
}
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 1.5rem; margin-top: 2rem; }
.primary-link {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.2rem;
  background: var(--reunion-accent-soft);
  color: var(--reunion-bg);
  font-size: 0.8rem;
  font-weight: 700;
}
.primary-link:hover { background: var(--reunion-accent-hover); }
.text-link { color: var(--reunion-text); font-size: 0.8rem; }
.text-link span { margin-left: 0.6rem; }

.hero-art {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 560px);
  aspect-ratio: 1;
  justify-self: center;
}
.hero-orbit { position: absolute; inset: 8%; border: 1px solid rgba(231, 228, 185, 0.3); border-radius: 50%; }
.orbit-two { inset: 0; border-color: rgba(231, 228, 185, 0.12); }
.frog { position: relative; width: 65%; height: auto; filter: drop-shadow(0 20px 50px rgba(0, 0, 0, 0.25)); }
.art-caption { position: absolute; z-index: 1; color: var(--reunion-accent); }
.art-caption-top { top: 9%; right: 3%; }
.art-caption-bottom { bottom: 10%; left: 0; }
.hero-footer {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 80px;
  border-top: 1px solid var(--reunion-border);
  color: var(--reunion-accent-muted);
}
.countdown { color: var(--reunion-text); letter-spacing: 0; }
.countdown :deep(.countdowntimer) { margin: 0; padding: 0; }

.marquee-section { padding-top: 7rem; background: var(--reunion-surface); }
.marquee-band { background: var(--reunion-surface); }
.marquee-band-light { background: var(--reunion-surface-raised); }
.section-intro { padding-bottom: 4rem; }
.section-intro h2 { margin: 1.5rem 0; }
.film-section { padding-top: 8rem; padding-bottom: 8rem; }
.film-heading { display: flex; align-items: end; justify-content: space-between; gap: 3rem; margin-bottom: 3rem; }
.film-heading h2 { margin-top: 1.5rem; }
.video-wrapper { width: 100%; aspect-ratio: 16 / 9; background: #000; }
.video-wrapper iframe { display: block; width: 100%; height: 100%; }
.community-section { background: var(--reunion-surface); }

.visit-section { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; padding-top: 8rem; padding-bottom: 8rem; }
.visit-copy h2 { margin: 1.5rem 0 2rem; }
.visit-details { align-self: center; }
.price-row { display: flex; justify-content: space-between; gap: 1rem; padding: 1.2rem 0; border-bottom: 1px solid var(--reunion-border); font-size: 0.9rem; }
.price-row strong { font-weight: 600; }
.bitcoin { display: flex; align-items: center; gap: 0.5rem; margin-top: 1.5rem; color: #ffb85b; font-size: 0.85rem; }
.bitcoin img { width: 18px; height: 18px; }
.details-panel { margin-top: 3rem; }
.details-panel :deep(h2) { font: 400 0.9rem/1.5 Arial, sans-serif; letter-spacing: 0; }
.details-panel :deep(a) { color: var(--reunion-accent); text-decoration: underline; }
.action-section { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; padding-top: 4rem; padding-bottom: 6rem; background: var(--reunion-surface-action); }
.action-section :deep(.call-to-action) { width: min(100%, 700px); margin: 0; }

@media (max-width: 700px) {
  .topline { min-height: 76px; }
  .topline-location { display: none; }
  .hero { grid-template-columns: 1fr; min-height: 0; padding-top: 4rem; }
  .hero-copy { padding-bottom: 0; }
  h1 { font-size: clamp(4.5rem, 15vw, 7rem); }
  .hero-art { width: min(100%, 420px); margin: 1rem auto; }
  .hero-footer { flex-wrap: wrap; justify-content: center; padding: 1.25rem 0; text-align: center; }
  .hero-footer > span:first-child, .hero-footer > span:last-child { display: none; }
  .marquee-section { padding-top: 5rem; }
  .section-intro { padding-bottom: 3rem; }
  .film-section { padding-top: 5rem; padding-bottom: 5rem; }
  .film-heading { display: block; }
  .film-heading > p { margin-top: 1.5rem; }
  .visit-section { grid-template-columns: 1fr; gap: 3rem; padding-top: 5rem; padding-bottom: 5rem; }
}
</style>
