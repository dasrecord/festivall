<script>
import synergystic_image from '@/assets/images/synergystic/synergystic_square_1.jpg'
import BlessedCoastCalltoAction from '@/components/BlessedCoastCalltoAction.vue'
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  components: {
    HelloWorld,
    BlessedCoastCalltoAction
  },
  data() {
    return {
      splashImage: synergystic_image
    }
  }
}
</script>
<template>
  <HelloWorld msg="Synergystic Entertainment" />
  <div class="basic">
    <img class="wolf" :src="splashImage" alt="wolf" />
  </div>
  <BlessedCoastCalltoAction />
</template>

<style scoped>
.basic {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
h1 {
  font-size: 2rem;
  color: white;
  text-align: center;
}
img {
  border-radius: 25px;
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
  .frog {
    display: flex;
    justify-self: center;
    align-items: center;
  }
}
</style>
