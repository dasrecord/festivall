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

      <img
        class="frog"
        :src="frogImage"
        alt="frog"
        :style="{ height: '250px', width: '250px' }"
        @click="handleClick"
      />
    </div>

    <h2>
      AUG 29th - SEPT 1st, 2025 <br />
      30 min from Saskatoon <br /><br />
      MUSIC - DANCING - CAMPING‍ <br />
      FAMILY - FRIENDS - FOOD‍ <br /><br />

      <span class="bitcoin">
        <img :src="bitcoin_icon" alt="bitcoin" style="height: 16px; width: 16px" /> NO PRICE
        INCREASE IN 2025!‍

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
      ></iframe>
    </div>

    <DetailsPanel>
      <template #link1>
        <RouterLink to="/reunionfamily">Learn more</RouterLink>
      </template>
      <template #link2>
        <RouterLink to="/reunionteam">Meet the team</RouterLink>
      </template>
      <template #link3>
        <RouterLink to="/reunionsoundsystem">our custom soundsystem.</RouterLink>
      </template>
      <template #link4>
        <RouterLink to="/reunionamenities">amenities.</RouterLink>
      </template>
    </DetailsPanel>
    <CalltoAction />
  </div>
</template>

<script>
import CountdownTimer from '@/components/CountdownTimer.vue'
import frog_image from '@/assets/images/frog.png'
import reunion_emblem from '../assets/images/reunion_emblem_white.png'
import bitcoin_icon from '../assets/images/bitcoin.svg'
import CalltoAction from '@/components/CalltoAction.vue'
import DetailsPanel from '@/components/DetailsPanel.vue'
import { RouterLink } from 'vue-router'

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
      bitcoin_icon: bitcoin_icon,
      clickCount: 0
    }
  },
  methods: {
    handleClick() {
      this.clickCount++
      if (this.clickCount === 21) {
        this.$router.push('/reunionticketscanner')
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
