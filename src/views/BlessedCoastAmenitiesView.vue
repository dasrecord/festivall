<template>
  <HelloWorld msg="Blessed Coast 2025"></HelloWorld>
  <h1>Amenities</h1>
  <div class="amenities">
    <h2>What to expect:</h2>
    <ul>
      <li>yoga classes</li>
      <li>camping</li>
      <li>parking</li>
      <li>charging stations</li>
      <li>workshops</li>
      <li>music</li>
      <li>shuttle service</li>
    </ul>
    <h2>What to bring:</h2>
    <ul>
      <li>potable water</li>
      <li>sunscreen</li>
      <li>hat</li>
      <li>water bottle</li>
      <li>camping gear</li>
      <li>toiletries</li>
      <li>positive vibes</li>
    </ul>
    <RouterLink to="/blessedcoastlineup"> <h2>CLICK HERE TO SEE THE LINEUP</h2></RouterLink>
  </div>
</template>

<script>
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'BlessedCoastAmenitiesView',
  components: {
    HelloWorld
  }
}
</script>

<style scoped>
ul {
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  list-style-type: none;
}
li {
  padding: 0.25rem;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  display: flex;
  justify-content: center;
}
</style>
