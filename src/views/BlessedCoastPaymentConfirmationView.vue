<template>
  <div class="payment-confirmation">
    <h1>Thank you for your payment!</h1>
    <h2>Your QR Code will be sent to your email inbox.</h2>
    <h2>We look forward to seeing you at</h2>
    <HelloWorld msg="Blessed Coast 2025" />
    <RouterLink to="/blessedcoastamenities"> <h2>CLICK HERE TO PLAN YOUR FESTIVAL</h2></RouterLink>
  </div>
</template>

<script>
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'BlessedCoastPaymentConfirmationView',
  components: {
    HelloWorld
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
}

.payment-details p {
  margin: 5px 0;
}
</style>
