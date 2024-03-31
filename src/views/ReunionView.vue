<script>
import frog_image from '@/assets/images/frog.png'
import CalltoAction from '@/components/CalltoAction.vue'
export default {
  components: {
    CalltoAction
  },
  data() {
    return {
      frogImage: frog_image
    }
  }
}
</script>
<template>
  <div class="basic">
    <h1>
      THE REUNION‍ <br />
      <img :src="frogImage" alt="frog" :style="{ height: '200px' }" />
      <br />
    </h1>
    <h2>
      Aug 30 - Sept 2, 2024 <br />
      30 min from Saskatoon <br />
      MUSIC - DANCING - CAMPING‍ <br />
      <br />
      WEEKEND PASS - $140 CAD<br />
      DAY PASS - $80 CAD‍ <br />
      25% discount if you pay with bitcoin!‍<br />
      <br />
      <RouterLink to="/reunionfamily">Learn More</RouterLink> about our festival.
      <br />
      <RouterLink to="/reunionteam">Meet the Team</RouterLink> behind the scenes.
      <br />
      Check Out Our
      <a href="https://www.instagram.com/p/CqX9uHBL6nE/?igsh=MTY4M2l3MXlraW43bQ=="
        >Custom Sound System‍</a
      >
      <br />
      <RouterLink to="/reunionamenities">Click Here</RouterLink>
      for the Amenities‍<br />
      <br />
      <!-- Click Here for the Lineup‍<br />
      <br /> -->
    </h2>
    <CalltoAction />
  </div>
</template>

<style>
.basic {
  padding: 1rem;
  text-align: center;
}

a {
  display: inline-block;
  padding: 0.5rem 0.5rem;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  transition: box-shadow 0.4s ease-in-out;
}
a:hover {
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  color: white;
}

@media (min-width: 1024px) {
  .basic {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
  }
}
</style>
