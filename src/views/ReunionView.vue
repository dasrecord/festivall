<template>
  <div class="basic">
    <CountdownTimer />

    <div class="title">
      <img
        :src="reunion_emblem"
        alt="reunion"
        class="reunion-emblem"
        style="cursor: pointer"
        @click="$router.push('/reunion')"
      />

      <img class="frog" :src="frogImage" alt="frog" :style="{ height: '250px', width: '250px' }" />
    </div>

    <h2>
      {{ festivalDateRange }} <br />
      30 min from Saskatoon <br /><br />
      MUSIC - DANCING - CAMPING‍ <br />
      FAMILY - FRIENDS - FOOD‍ <br /><br />

      <!-- <span class="bitcoin">
        <img :src="bitcoin_icon" alt="bitcoin" style="height: 16px; width: 16px" /> GET 2025 PRICES UNTIL DEC 21st!
        <br /><br />
      </span> -->

      WEEKEND PASS - $200 CAD<br />
      DAY PASS - $100 CAD‍ <br />
      MEAL PLANS - $30 CAD/DAY<br />
      <span class="bitcoin">
        25% discount if you pay with bitcoin!‍
        <img :src="bitcoin_icon" alt="bitcoin" style="height: 16px; width: 16px" /> <br />
      </span>
    </h2>
    <div class="video-wrapper">
      <iframe
        src="https://www.youtube.com/embed/xibNU7F_RKQ?si=ImT7j7-lbAu41oPu"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
        @load="trackVideoLoad"
      ></iframe>
    </div>

    <DetailsPanel>
      <template #link1>
        <RouterLink to="/reunionfamily" @click="trackLinkClick('learn_more')"
          >Learn more</RouterLink
        >
      </template>
      <template #link2>
        <RouterLink to="/reunionteam" @click="trackLinkClick('meet_team')"
          >Meet the team</RouterLink
        >
      </template>
      <template #link3>
        <RouterLink to="/reunionsoundsystem" @click="trackLinkClick('sound_system')"
          >our custom soundsystem.</RouterLink
        >
      </template>
      <template #link4>
        <RouterLink to="/reunionamenities" @click="trackLinkClick('amenities')"
          >amenities.</RouterLink
        >
      </template>
    </DetailsPanel>
    <CalltoAction />
  </div>
</template>

<script>
import CountdownTimer from '@/components/CountdownTimer.vue'
import frog_image from '@/assets/images/frog.png'
import reunion_emblem from '../assets/images/reunion_emblem_white.png'
import bitcoin_icon from '../assets/images/bitcoin.svg?url'
import CalltoAction from '@/components/CalltoAction.vue'
import DetailsPanel from '@/components/DetailsPanel.vue'
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
    RouterLink
  },
  data() {
    return {
      frogImage: frog_image,
      reunion_emblem: reunion_emblem,
      bitcoin_icon: bitcoin_icon,
      festival: REUNION_FESTIVAL
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
      page_title: 'Reunion Festival 2026',
      page_location: window.location.href
    })

    // Track page view with Facebook Pixel
    if (typeof fbq !== 'undefined') {
      fbq('track', 'ViewContent', {
        content_name: 'Reunion Festival 2026',
        content_category: 'Festival',
        content_ids: ['reunion2026'],
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
.basic {
  padding: 1rem;
  text-align: center;
  justify-content: center;
  align-items: center;
}

a {
  display: inline-block;
  padding: 0.5rem 0.5rem;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  transition: box-shadow 0.4s ease-in-out;
}
a:hover {
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  color: white;
}
.reunion-emblem {
  width: 100%;
  max-width: 600px;
  margin: 1rem 0;
}
.title {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.bitcoin {
  font-size: 1.5rem;
  color: var(--bitcoin-orange);
}

.video-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  width: 100%;
  background: #000;
  margin: 1rem 0;
  border-radius: 15px;
}

.video-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 15px;
}

@media (min-width: 1024px) {
  .basic {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .frog {
    display: flex;
    justify-self: center;
    align-items: center;
  }
}
</style>
