<template>
  <div class="services">
    <div class="service">
      <h1>
        <RouterLink to="/soundtech">Sound Tech</RouterLink>
      </h1>
      <p>
        Need someone to run sound for your event?<br />
        We have you covered.
      </p>
    </div>
    <div class="service">
      <h1>
        <RouterLink to="/art&photography">Art & Photography</RouterLink>
      </h1>
      <p>Need a photographer or artist for your event?<br />Drop us a line.</p>
    </div>
    <div class="service">
      <h1>
        <RouterLink to="/bitcoinmeetup">Bitcoin</RouterLink>
      </h1>
      <p>Interested in learning about Bitcoin?<br />Schedule a free workshop.</p>
    </div>
  </div>
</template>

<script>
import HelloWorld from '@/components/HelloWorld.vue'
import { RouterLink } from 'vue-router'

export default {
  name: 'ServicesView',
  components: {
    HelloWorld
  }
}
</script>

<style scoped>
.services {
  margin-top: 10%;
  height: 300px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}
.service {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  border: 1px solid white;
  border-radius: 5px;
  width: 80%;
  max-width: 80vw;
  margin: 1rem;
}

h1 {
  font-size: 2rem;
}
h2 {
  font-size: 1.5rem;
  margin: 2rem;
}
</style>
