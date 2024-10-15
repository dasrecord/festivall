<script>
import fuse_image from '@/assets/images/fuse_collective/fuse_collective.jpg'

// import { RouterLink } from 'vue-router'

export default {
  components: {
    RouterLink
  },
  data() {
    return {
      fuse_image: fuse_image
    }
  }
}
</script>
<template>
  <div class="basic">
    <h1>
      FUSE COLLECTIVE <br />
      <img class="fuse" :src="fuse_image" alt="fuse" :style="{ height: '150px', width: '150px' }" />
      <br />
    </h1>
    <h2 class="description">Description goes here.</h2>
  </div>
  <CalltoAction />
</template>

<style scoped>
.basic {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
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
    justify-content: flex-start;
    justify-items: flex-start;
    align-items: center;
  }
  .fuse {
    display: flex;
    justify-self: center;
    align-items: center;
  }
}
</style>
