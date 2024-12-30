<template>
  <div class="services">
    <h1>
      <RouterLink to="/soundtech">Sound Tech</RouterLink>
    </h1>
    <h1>
      <RouterLink to="/art&photography">Art & Photography</RouterLink>
    </h1>
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
  padding: 20px;
}
h1 {
  font-size: 2rem;
  margin: 0;
}
</style>
