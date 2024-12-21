<template>
  <div class="amenities">
    <HelloWorld msg="Blessed Coast 2025"></HelloWorld>
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
      <RouterLink to="/blessedcoastlineup">VIEW LINEUPS</RouterLink>
      <RouterLink to="#">PURCHASE EXTRAS</RouterLink>
      <RouterLink to="#">GET DIRECTIONS</RouterLink>
      <RouterLink to="#">DOWNLOAD MAP</RouterLink>
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
  color: #531a4a;
  background-color: #ae9def;
  font-family: 'amandine', sans-serif;
  text-align: center;
}
h2 {
  font-family: 'Helvetica', sans-serif;
}
ul {
  font-family: 'Helvetica', sans-serif;
  margin-bottom: 2rem;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
  list-style-type: none;
}
li {
  padding: 0.25rem;
  border: 1px solid #531a4a80;
  color: #531a4a;
  border-radius: 10px;
  display: flex;
  padding: 0.3rem;
  justify-content: center;
  background: radial-gradient(circle, #d1c8f4(0, 0, 0), rgba(0, 128, 255, 0.1));
  font-weight: 700;
}
.options {
  /* display: flex; */
  /* justify-content: space-around; */
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3px;
}

a {
  color: #531a4a;
  padding: 1rem;
  border: 1px solid #531a4a;
  border-radius: 10px;
  font-size: 24px;
  font-weight: 700;
}

a:hover {
  background-color: #531a4a;
  color: white;
}
</style>
