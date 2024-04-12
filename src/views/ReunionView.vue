<script>
import CountDownTimer from '@/components/CountdownTimer.vue'
import frog_image from '@/assets/images/frog.png'
import CalltoAction from '@/components/CalltoAction.vue'
import DetailsPanel from '@/components/DetailsPanel.vue'

export default {
  components: {
    CountDownTimer,
    CalltoAction,
    DetailsPanel
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
  <div class="basic">
    <CountDownTimer />
    <h1>
      THE REUNION‍ <br />
      <img :src="frogImage" alt="frog" :style="{ width: '300px' }" @click="handleClick" />
      <br />
    </h1>
    <h2>
      AUG 30th - SEPT 2nd, 2024 <br />
      30 min from Saskatoon <br /><br />
      MUSIC - DANCING - CAMPING‍ <br />
      FAMILY - FRIENDS - FOOD‍ <br /><br />
      WEEKEND PASS - $140 CAD<br />
      DAY PASS - $80 CAD‍ <br />
      25% discount if you pay with bitcoin!‍<br /><br />
    </h2>
    <DetailsPanel />
  </div>
  <CalltoAction />
</template>

<style>
.basic {
  padding: 1rem;
  text-align: center;
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
    align-items: center;
  }
}
</style>
