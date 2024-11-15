<template>
  <img :src="BlessedCoastComingSoon" alt="Blessed Coast Coming Soon" />
  <div class="payment-confirmation">
    <img :src="BlessedCoastEmblem" alt="Blessed Coast Emblem" class="logo" />
    <h1>Thank you for your payment!</h1>
    <h2>Your QR Code will be sent to your email inbox.</h2>
    <h2>We look forward to seeing you at</h2>
    <HelloWorld msg="Blessed Coast 2025" />
    <RouterLink to="/blessedcoastamenities"> <h2>CLICK HERE TO PLAN YOUR FESTIVAL</h2></RouterLink>
  </div>
</template>

<script>
import HelloWorld from '@/components/HelloWorld.vue'
import BlessedCoastComingSoon from '@/assets/images/blessed/bc_wolf_square.png'
import BlessedCoastEmblem from '@/assets/images/blessed_coast_emblem_white.png'
export default {
  name: 'BlessedCoastPaymentConfirmationView',
  components: {
    HelloWorld
  },
  data() {
    return {
      BlessedCoastComingSoon,
      BlessedCoastEmblem
    }
  }
}
</script>

<style scoped>
@import url('https://use.typekit.net/yay7cee.css');

.payment-confirmation {
  font-family: 'amandine', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 2rem;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 50px;
  padding: 2rem;
  z-index: 0;
  border-radius: 15px;
  height: 90vh;
}

.payment-details p {
  margin: 5px 0;
}

img:not(.logo) {
  position: absolute;
  top: 0%;
  right: 0%;

  z-index: -1;
}
.logo {
  height: auto;
}
a {
  color: white;
  border-radius: 15px;
  font-size: 20px;
  border: 1px solid white;
  padding: 10px;
}
a:hover {
  color: white;
}
</style>
