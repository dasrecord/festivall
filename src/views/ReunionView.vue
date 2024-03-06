<script>
import FrogImage from '@/assets/images/frog.png'

export default {
  data() {
    return {
      frogImage: FrogImage
    }
  }
}
</script>
<template>
  <div class="basic">
    <h1>
      THE REUNION‍ <br />
      <img :src="frogImage" alt="frog" height="100px" />
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
      Check Out Our
      <a href="https://www.instagram.com/p/CqX9uHBL6nE/?igsh=MTY4M2l3MXlraW43bQ=="
        >Custom Sound System‍</a
      ><br />
      <br />
      <RouterLink to="/reunionamenities">Click Here</RouterLink>
      for the Amenities‍<br />
      <br />
      <!-- Click Here for the Lineup‍<br />
      <br /> -->
    </h2>
    <h1>
      Want to perform or volunteer?‍<br />
      <a href="https://dasrecord.typeform.com/to/a65mFuLr">APPLY NOW </a>
    </h1>
    <h1>
      Ready to buy tickets?‍<br />
      <a href="https://dasrecord.typeform.com/to/dyJs6iFd"> BUY TICKETS </a>
    </h1>
  </div>
</template>

<style>
.basic {
  padding: 2rem;
  text-align: center;
}

a {
  display: inline-block;
  padding: 0.5rem 1rem;
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
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
