<script>
import FrogImage from '@/assets/images/frog.png'

export default {
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
      <img :src=frogImage alt="frog" height="100px" />
      <br />
    </h1>
    <h2>
      AMENITIES & INFO:‍<br />
      - You can park at your campsite‍ <br />
      - Water available on site but bring your own‍<br />
      - Food tickets available<br />
      - Cash bar‍ available<br />
      - Bitcoin and Lightning accepted<br />
      - Shared kitchen available‍<br />
      - Quiet Family Camping Area‍<br />
      - Warm showers available‍<br />
      - Children's Playground‍<br />
      - Leave pets at home.<br />
    </h2>
    <h1>
      Want to perform or volunteer?‍<br />
      <a href="https://dasrecord.typeform.com/to/a65mFuLr">APPLY NOW </a>
    </h1>
    <h1>
      Ready to buy tickets?‍<br />
      <a href="https://dasrecord.typeform.com/to/dyJs6iFd"> BUY TICKETS </a>
    </h1>
  </div>
</template>

<style>
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
    align-items: center;
  }
}
</style>
