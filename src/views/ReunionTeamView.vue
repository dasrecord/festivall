<script>
import CountdownTimer from '@/components/CountdownTimer.vue'
import TeamCard from '@/components/TeamCard.vue'
import DetailsPanel from '@/components/DetailsPanel.vue'
import CalltoAction from '@/components/CalltoAction.vue'

import Chris from '@/assets/images/reunion_team/Chris.jpg'
import land_icon from '@/assets/images/icons/land.png'

import Brandon from '@/assets/images/reunion_team/Brandon.jpg'
import construction_icon from '@/assets/images/icons/construction.png'

import Prasenjit from '@/assets/images/reunion_team/Prasenjit.jpg'
import devops_icon from '@/assets/images/icons/devops.png'

import Corey from '@/assets/images/reunion_team/Corey.jpg'
import headphones_icon from '@/assets/images/icons/headphones.png'

import Janicka from '@/assets/images/reunion_team/Janicka.jpg'
import community_icon from '@/assets/images/icons/community.png'

import Arthur from '@/assets/images/reunion_team/Arthur.jpg'
import soundtech_icon from '@/assets/images/icons/soundtech.png'

import Christina from '@/assets/images/reunion_team/Christina.jpg'
import decorations_icon from '@/assets/images/icons/decorations.png'

import Natalie from '@/assets/images/reunion_team/Natalie.jpg'
import ethos_icon from '@/assets/images/icons/ethos.png'

import Nish from '@/assets/images/reunion_team/Nish.jpg'
import photography_icon from '@/assets/images/icons/photography.png'

import Kayla from '@/assets/images/reunion_team/Kayla.jpg'
import vectors_icon from '@/assets/images/icons/vectors.png'

import Becca from '@/assets/images/reunion_team/Becca.jpg'
import graphics_icon from '@/assets/images/icons/graphics.png'

import Yvo from '@/assets/images/reunion_team/Yvo.jpg'
import guitartech_icon from '@/assets/images/icons/guitartech.png'

import Angela from '@/assets/images/reunion_team/Angela.jpg'
import food_icon from '@/assets/images/icons/food.png'

import Andy from '@/assets/images/reunion_team/Andy.jpg'
import playground_icon from '@/assets/images/icons/playground.png'

import Brandon_and_Liam from '@/assets/images/reunion_team/Brandon_and_Liam.jpg'

export default {
  name: 'ReunionTeamView',
  components: {
    CountdownTimer,
    TeamCard,
    DetailsPanel,
    CalltoAction
  },
  data() {
    return {
      Chris,
      land_icon,
      Brandon,
      construction_icon,
      Prasenjit,
      devops_icon,
      Corey,
      headphones_icon,
      Janicka,
      community_icon,
      Arthur,
      soundtech_icon,
      Christina,
      decorations_icon,
      Natalie,
      ethos_icon,
      Nish,
      photography_icon,
      Kayla,
      vectors_icon,
      Becca,
      graphics_icon,
      Yvo,
      guitartech_icon,
      Angela,
      food_icon,
      Andy,
      playground_icon,
      Brandon_and_Liam
    }
  }
}
</script>
<template>
  <div class="basic">
    <CountdownTimer :targetYear="2025" :targetMonth="8" :targetDay="29" />
    <h1>THE REUNION‍<br /></h1>
    <h2>Meet Our Festival Team<br /></h2>
    <div class="cards">
      <TeamCard>
        <template v-slot:headshot>
          <img :src="Chris" alt="Chris" />
        </template>
        <template v-slot:name>
          <h2>Chris</h2>
        </template>
        <template v-slot:role>
          <p>Land & Infrastructure</p>
        </template>
        <template v-slot:icon>
          <img
            :src="land_icon"
            alt="Land Icon"
            style="width: 75px; border-radius: 0; border-radius: 0"
          />
        </template>
      </TeamCard>
      <TeamCard>
        <template v-slot:headshot>
          <img :src="Brandon" alt="Brandon" />
        </template>
        <template v-slot:name>
          <h2>Brandon B.</h2>
        </template>
        <template v-slot:role>
          <p>Construction & Bookings</p>
        </template>
        <template v-slot:icon>
          <img
            :src="construction_icon"
            alt="Construction Icon"
            style="width: 75px; border-radius: 0; border-radius: 0"
          />
        </template>
      </TeamCard>
      <TeamCard>
        <template v-slot:headshot>
          <img :src="Prasenjit" alt="Prasenjit" />
        </template>
        <template v-slot:name>
          <h2>Prasenjit</h2>
        </template>
        <template v-slot:role>
          <p>DevOps & Technology</p>
        </template>
        <template v-slot:icon>
          <img
            :src="devops_icon"
            alt="DevOps Icon"
            style="width: 75px; border-radius: 0; border-radius: 0"
          />
        </template>
      </TeamCard>
      <TeamCard>
        <template v-slot:headshot>
          <img :src="Corey" alt="Corey" />
        </template>
        <template v-slot:name>
          <h2>Corey</h2>
        </template>
        <template v-slot:role>
          <p>Artist Changeovers</p>
        </template>
        <template v-slot:icon>
          <img
            :src="headphones_icon"
            alt="Headphones Icon"
            style="width: 75px; border-radius: 0; border-radius: 0"
          />
        </template>
      </TeamCard>
      <TeamCard>
        <template v-slot:headshot>
          <img :src="Natalie" alt="Natalie" />
        </template>
        <template v-slot:name>
          <h2>Natalie</h2>
        </template>
        <template v-slot:role>
          <p>Consultant & Ethos</p>
        </template>
        <template v-slot:icon>
          <img
            :src="ethos_icon"
            alt="Ethos Icon"
            style="width: 75px; border-radius: 0; border-radius: 0"
          />
        </template>
      </TeamCard>
      <TeamCard>
        <template v-slot:headshot>
          <img :src="Kayla" alt="Kayla" />
        </template>
        <template v-slot:name>
          <h2>Kayla</h2>
        </template>
        <template v-slot:role>
          <p>Vectors & Logos</p>
        </template>
        <template v-slot:icon>
          <img
            :src="vectors_icon"
            alt="Vectors Icon"
            style="width: 75px; border-radius: 0; border-radius: 0"
          />
        </template>
      </TeamCard>
      <TeamCard>
        <template v-slot:headshot>
          <img :src="Christina" alt="Christina" />
        </template>
        <template v-slot:name>
          <h2>Christina</h2>
        </template>
        <template v-slot:role>
          <p>Decorations & Vibe</p>
        </template>
        <template v-slot:icon>
          <img
            :src="decorations_icon"
            alt="Decorations Icon"
            style="width: 75px; border-radius: 0; border-radius: 0"
          />
        </template>
      </TeamCard>
      <TeamCard>
        <template v-slot:headshot>
          <img :src="Brandon_and_Liam" alt="Brandon_and_Liam" />
        </template>
        <template v-slot:name>
          <h2>Brandon and Liam</h2>
        </template>
        <template v-slot:role>
          <p>Construction</p>
        </template>
        <template v-slot:icon>
          <img
            :src="construction_icon"
            alt="Construction Icon"
            style="width: 75px; border-radius: 0"
          />
        </template>
      </TeamCard>
      <TeamCard>
        <template v-slot:headshot>
          <img :src="Janicka" alt="Janicka" />
        </template>
        <template v-slot:name>
          <h2>Janicka</h2>
        </template>
        <template v-slot:role>
          <p>Community Building</p>
        </template>
        <template v-slot:icon>
          <img :src="community_icon" alt="Community Icon" style="width: 75px; border-radius: 0" />
        </template>
      </TeamCard>
      <TeamCard>
        <template v-slot:headshot>
          <img :src="Becca" alt="Becca" />
        </template>
        <template v-slot:name>
          <h2>Becca</h2>
        </template>
        <template v-slot:role>
          <p>Graphic Design</p>
        </template>
        <template v-slot:icon>
          <img :src="graphics_icon" alt="Graphics Icon" style="width: 75px; border-radius: 0" />
        </template>
      </TeamCard>
      <TeamCard>
        <template v-slot:headshot>
          <img :src="Nish" alt="Nish" />
        </template>
        <template v-slot:name>
          <h2>Nish</h2>
        </template>
        <template v-slot:role>
          <p>Photography & Resolume</p>
        </template>
        <template v-slot:icon>
          <img
            :src="photography_icon"
            alt="Photography Icon"
            style="width: 75px; border-radius: 0"
          />
        </template>
      </TeamCard>
      <TeamCard>
        <template v-slot:headshot>
          <img :src="Arthur" alt="Arthur" />
        </template>
        <template v-slot:name>
          <h2>Arthur</h2>
        </template>
        <template v-slot:role>
          <p>Soundtech</p>
        </template>
        <template v-slot:icon>
          <img :src="soundtech_icon" alt="Soundtech Icon" style="width: 75px; border-radius: 0" />
        </template>
      </TeamCard>
      <TeamCard>
        <template v-slot:headshot>
          <img :src="Yvo" alt="Yvo" />
        </template>
        <template v-slot:name>
          <h2>Yvo</h2>
        </template>
        <template v-slot:role>
          <p>Guitar Tech & Soundtech</p>
        </template>
        <template v-slot:icon>
          <img
            :src="guitartech_icon"
            alt="Guitar Tech Icon"
            style="width: 75px; border-radius: 0"
          />
        </template>
      </TeamCard>
      <TeamCard>
        <template v-slot:headshot>
          <img :src="Angela" alt="Angela" />
        </template>
        <template v-slot:name>
          <h2>Angela</h2>
        </template>
        <template v-slot:role>
          <p>Food Coordinator</p>
        </template>
        <template v-slot:icon>
          <img :src="food_icon" alt="Food Icon" style="width: 75px; border-radius: 0" />
        </template>
      </TeamCard>
      <TeamCard>
        <template v-slot:headshot>
          <img :src="Andy" alt="Andy" />
        </template>
        <template v-slot:name>
          <h2>Andy</h2>
        </template>
        <template v-slot:role>
          <p>Children's Coordinator</p>
        </template>
        <template v-slot:icon>
          <img :src="playground_icon" alt="Playground Icon" style="width: 75px; border-radius: 0" />
        </template>
      </TeamCard>
    </div>
    <DetailsPanel>
      <template #link1>
        <router-link to="/reunionfamily">Learn more</router-link>
      </template>
      <template #link2>
        <router-link to="/reunionteam">Meet the team</router-link>
      </template>
      <template #link3>
        <router-link to="/reunionsoundsystem">custom soundsystem.</router-link>
      </template>
      <template #link4>
        <router-link to="/reunionamenities">amenities.</router-link>
      </template>
    </DetailsPanel>
    <CalltoAction />
  </div>
</template>

<style scoped>
.basic {
  padding: 1rem;
  text-align: center;
  align-items: center;
  justify-content: center;
}
.cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
img {
  display: inline;
  max-width: 300px;
  height: auto;
  border-radius: 15px;
}

@media (min-width: 1024px) {
  .basic {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
</style>
