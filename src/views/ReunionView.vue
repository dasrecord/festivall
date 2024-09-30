<script>
// import CountDownTimer from '@/components/CountdownTimer.vue'
import frog_image from '@/assets/images/frog.png'
import CalltoAction from '@/components/CalltoAction.vue'
import DetailsPanel from '@/components/DetailsPanel.vue'
import { RouterLink } from 'vue-router'

export default {
  components: {
    // CountDownTimer,
    CalltoAction,
    DetailsPanel,
    RouterLink
  },
  data() {
    return {
      frogImage: frog_image,
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
<template>
  <!-- <CountDownTimer /> -->
  <div class="basic">
    <h1>
      THE REUNION‍ <br />
      <img
        class="frog"
        :src="frogImage"
        alt="frog"
        :style="{ height: '150px', width: '150px' }"
        @click="handleClick"
      />
      <br />
    </h1>
    <!-- <h2>
      AUG 29th - SEPT 1st, 2025 <br />
      30 min from Saskatoon <br /><br />
      MUSIC - DANCING - CAMPING‍ <br />
      FAMILY - FRIENDS - FOOD‍ <br /><br />
      WEEKEND PASS - $140 CAD<br />
      DAY PASS - $80 CAD‍ <br />
      MEAL PLANS - $20 CAD/DAY<br />
      25% discount if you pay with bitcoin!‍<br /><br />
    </h2> -->
    <DetailsPanel>
      <template #link1>
        <router-link to="/reunionfamily">Learn more</router-link>
      </template>
      <template #link2>
        <router-link to="/reunionteam">Meet the team</router-link>
      </template>
      <template #link3>
        <router-link to="/reunionsoundsystem">our custom soundsystem.</router-link>
      </template>
      <template #link4>
        <router-link to="/reunionamenities">amenities.</router-link>
      </template>
    </DetailsPanel>
  </div>
  <CalltoAction />
</template>

<style scoped>
.basic {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
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

@media (min-width: 1024px) {
  .basic {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    justify-items: flex-start;
    align-items: center;
  }
  .frog {
    display: flex;
    justify-self: center;
    align-items: center;
  }
}
</style>
