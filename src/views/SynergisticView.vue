<script>
import synergistic_image from '@/assets/images/synergistic/synergistic_square_2.jpg'
import BlessedCoastCalltoAction from '@/components/BlessedCoastCalltoAction.vue'
import HelloWorld from '@/components/HelloWorld.vue'
import DetailsPanel from '@/components/DetailsPanel.vue'

export default {
  components: {
    HelloWorld,
    DetailsPanel,
    BlessedCoastCalltoAction
  },
  data() {
    return {
      splashImage: synergistic_image
    }
  }
}
</script>
<template>
  <div class="basic">
    <HelloWorld msg="Synergistic Entertainment" />
    <h2>
      Synergistic is a BC based promoter that is assembling the team for<br />
      <RouterLink to="/blessedcoastfamily">Blessed Coast 2025</RouterLink>
    </h2>
    <img class="img" :src="splashImage" alt="synergistic" />
    <DetailsPanel>
      <template #link1>
        <router-link to="/blessedcoastfamily">Learn more</router-link>
      </template>
      <template #link2>
        <router-link to="/synergistic">Explore</router-link>
      </template>
      <template #link3
        >our performers from: <br /><br />
        <router-link to="/blessedcoast2015performers">2015</router-link><br />

        <router-link to="/blessedcoast2016performers">2016</router-link><br. /><br />

        <router-link to="/blessedcoast2017performers">2017</router-link><br. /><br />

        <router-link to="/blessedcoast2018performers">2018</router-link><br. />
      </template>
      <template #link4>
        <router-link to="#">amenities.</router-link>
      </template>
    </DetailsPanel>
  </div>
  <BlessedCoastCalltoAction />
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
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
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  width: 100%;
  border-radius: 25px;
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
