<script>
import CountdownTimer from '@/components/CountdownTimer.vue'
import FrogImage from '@/assets/images/frog.png'
import CalltoAction from '@/components/CalltoAction.vue'
import DetailsPanel from '@/components/DetailsPanel.vue'

export default {
  components: {
    CountdownTimer,
    CalltoAction,
    DetailsPanel
  },
  data() {
    return {
      frogImage: FrogImage
    }
  }
}
</script>
<template>
  <div class="basic">
    <CountdownTimer :targetYear="2025" :targetMonth="8" :targetDay="29" />
    <h1>
      THE REUNION‍ <br />
      <img :src="frogImage" alt="frog" :style="{ width: '300px' }" />
      <br />
    </h1>
    <h2>
      AMENITIES & INFO:‍
      <h3>
        - In house ticketing system‍<br />
        - Campsite‍ parking <br />
        - Water available on site‍<br />
        - Scannable meal tickets<br />
        - Bitcoin and Lightning accepted<br />
        - Shared kitchen available‍<br />
        - Quiet family camping area‍<br />
        - Warm showers available‍<br />
        - Custom sound system‍<br />
        - Projection mapped visuals‍<br />
        - Wading pool‍ to cool off<br />
        - Children's Playground‍<br />
        - Nerf gun battle arena‍<br />
        - Leave pets at home.<br />
      </h3>
    </h2>
    <DetailsPanel>
      <template #link1>
        <router-link to="/reunionfamily">Learn more</router-link>
      </template>
      <template #link2>
        <router-link to="/reunionteam">Meet the team</router-link>
      </template>
      <template #link3>
        <router-link to="/reunionsoundsystem"> our custom soundsystem.</router-link>
      </template>
      <template #link4>
        <router-link to="/reunionamenities">amenities.</router-link>
      </template>
    </DetailsPanel>
    <CalltoAction />
  </div>
</template>

<style scoped>
.basic {
  text-align: center;
}

@media (min-width: 1024px) {
  .basic {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
}
</style>
