<script>
import FrogImage from '@/assets/images/frog.png'
import CalltoAction from '@/components/CalltoAction.vue'

export default {
  components: {
    CalltoAction
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
    <h1>
      THE REUNION‍ <br />
      <img :src="frogImage" alt="frog" :style="{ width: '300px' }" />
      <br />
    </h1>
    <h2>AMENITIES & INFO:‍</h2>
    <h3>
      - You can park at your campsite‍ <br />
      - Water available on site but bring your own‍<br />
      - Food tickets available<br />
      <!-- - Cash bar‍ available<br /> -->
      - Bitcoin and Lightning accepted<br />
      - Shared kitchen available‍<br />
      - Quiet Family Camping Area‍<br />
      - Warm showers available‍<br />
      - Children's Playground‍<br />
      - Leave pets at home.<br />
    </h3>
    <CalltoAction />
  </div>
</template>

<style scoped>
.basic {
  padding: 2rem;
  text-align: center;
  max-height: 50px;
}

@media (min-width: 1024px) {
  .basic {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
}
</style>
