<template>
  <div class="services">
    <div class="service">
      <h1>
        <RouterLink to="/starcrossed">Record Label</RouterLink>
      </h1>
      <p>
        Want to submit your demos?<br />
        Start here.
      </p>
    </div>
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
        <RouterLink to="/stagerider">Stage Rider</RouterLink>
      </h1>
      <p>
        Need to submit your stage rider for your performance?<br />
        We can help.
      </p>
    </div>
    <div class="service">
      <h1>
        <RouterLink to="/art&photography">Art & Photography</RouterLink>
      </h1>
      <p>Looking for a photographer or artist for your event?<br />Drop us a line.</p>
    </div>
    <div class="service">
      <h1>
        <a href="https://www.instagram.com/cakeawaysk">Cakeaway</a>
      </h1>
      <p>
        Interested in custom desserts and cakes?<br />
        Dig in.
      </p>
    </div>
    <div class="service">
      <h1>
        <RouterLink to="/munnismeals">Munni's Meals</RouterLink>
      </h1>
      <p>
        Craving homemade indian/bengali food?<br />
        We deliver.
      </p>
    </div>
    <div class="service">
      <h1>
        <RouterLink to="/coding&webdev">Coding & Web Development</RouterLink>
      </h1>
      <p>
        Searching for a computer programmer or webmaster?<br />
        Look no further.
      </p>
    </div>
    <div class="service">
      <h1>
        <RouterLink id="bitcoin" to="/bitcoinmeetup">Bitcoin</RouterLink>
      </h1>
      <p>Interested in learning about Bitcoin?<br />Schedule a free workshop.</p>
    </div>
    <div id="emblem">
      <img :src="festivall_emblem" alt="Festivall Emblem" />
    </div>
  </div>
</template>

<script>
import HelloWorld from '@/components/HelloWorld.vue'
import { RouterLink } from 'vue-router'
import festivallEmblemWhite from '@/assets/images/festivall_emblem_white.png'

export default {
  name: 'ServicesView',
  components: {
    HelloWorld,
    RouterLink
  },
  data() {
    return {
      festivall_emblem: festivallEmblemWhite
    }
  }
}
</script>

<style scoped>
.services {
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
#bitcoin {
  color: #ff9900;
}
#emblem {
  height: 64px;
}

h1 {
  font-size: 2rem;
}
h2 {
  font-size: 1.5rem;
  margin: 2rem;
}
</style>
