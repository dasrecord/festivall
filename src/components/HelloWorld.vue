<script setup lang="ts">
defineProps<{
  msg: string
  color: string
}>()
</script>

<template>
  <div class="greetings">
    <h1 :style="{ color: color }">{{ msg }}</h1>

    <!-- <h3>...home of the best Canadian grassroots electronic music festivals...</h3> -->
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  /* top: -10px; */
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: center;
  }
}
</style>
