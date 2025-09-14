<template>
  <div class="basic">
    <CountdownTimer :targetYear="2025" :targetMonth="8" :targetDay="29" />

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
      SEPT 4th - SEPT 7th 2026 <br />
      30 min from Saskatoon <br /><br />
      MUSIC - DANCING - CAMPING‍ <br />
      FAMILY - FRIENDS - FOOD‍ <br /><br />

      <span class="bitcoin">
        <img :src="bitcoin_icon" alt="bitcoin" style="height: 16px; width: 16px" /> GET 2025 PRICES UNTIL DEC 21st!

        <br /><br />
      </span>

      WEEKEND PASS - $140 CAD<br />
      DAY PASS - $80 CAD‍ <br />
      MEAL PLANS - $20 CAD/DAY<br />
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

export default {
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
      bitcoin_icon: bitcoin_icon
    }
  },
  mounted() {
    // Track page view with Firebase
    logEvent(reunion_analytics, 'page_view', {
      page_title: 'Reunion Festival 2025',
      page_location: window.location.href
    })

    // Track page view with Facebook Pixel
    if (typeof fbq !== 'undefined') {
      fbq('track', 'ViewContent', {
        content_name: 'Reunion Festival 2025',
        content_category: 'Festival',
        content_ids: ['reunion2025'],
        content_type: 'product'
      })
    }
  },
  methods: {
    trackVideoLoad() {
      // Firebase tracking
      logEvent(reunion_analytics, 'video_start', {
        video_title: 'Reunion Festival 2025 Promo',
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
