<template>
  <HelloWorld msg="Blessed Coast 2025"></HelloWorld>
  <div class="amenities">
    <h1>Amenities</h1>
    <h2>What to expect:</h2>
    <ul>
      <li>multiple stages</li>
      <li>yoga classes</li>
      <li>workshops</li>
      <li>outdoor camping</li>
      <li>limited parking</li>
      <li>musical performances</li>
      <li>spoken word</li>
      <li>food vendors</li>
      <li>art installations</li>
      <li>portable restrooms</li>
      <li>children's area</li>
      <li>videogame arcade</li>
    </ul>
    <h2>What to bring:</h2>
    <ul>
      <li>positive vibes</li>
      <li>potable water</li>
      <li>sunscreen</li>
      <li>hat</li>
      <li>camping gear</li>
      <li>toiletries</li>
      <li>flashlight</li>
      <li>first aid kit</li>
      <li>reusable utensils</li>
      <li>snacks</li>
    </ul>
    <h2>Available for Purchase:</h2>
    <ul>
      <li>shuttle service</li>
      <li>charging stations</li>
      <li>glamping packages</li>
      <li>food and beverages</li>
      <li>massage therapy</li>
      <li>cash or bitcoin</li>
    </ul>
    <div class="options">
      <RouterLink to="/blessedcoastlineup">CLICK HERE TO SEE THE LINEUP</RouterLink><br />
      <RouterLink to="#">CLICK HERE TO DOWNLOAD MAP</RouterLink>
    </div>
  </div>
  <BlessedCoastCalltoAction />
</template>

<script>
import HelloWorld from '@/components/HelloWorld.vue'
import BlessedCoastCalltoAction from '@/components/BlessedCoastCalltoAction.vue'

export default {
  name: 'BlessedCoastAmenitiesView',
  components: {
    HelloWorld,
    BlessedCoastCalltoAction
  }
}
</script>

<style scoped>
@import url('https://use.typekit.net/yay7cee.css');

.amenities {
  font-family: 'amandine', sans-serif;
  text-align: center;
}
ul {
  margin-bottom: 2rem;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  list-style-type: none;
}
li {
  padding: 0.25rem;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  display: flex;
  justify-content: center;
}
.options {
  display: flex;
  justify-content: space-around;
}

a {
  padding: 1rem;
  border-radius: 5px;
}
</style>
