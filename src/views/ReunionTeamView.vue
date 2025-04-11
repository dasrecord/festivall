<script>
import CountdownTimer from '@/components/CountdownTimer.vue'
import TeamCard from '@/components/TeamCard.vue'
import DetailsPanel from '@/components/DetailsPanel.vue'
import CalltoAction from '@/components/CalltoAction.vue'

import Chris from '@/assets/images/reunion_team/Chris.jpg'
import land_icon from '@/assets/images/icons/land.png'

import Brandon from '@/assets/images/reunion_team/Brandon.jpg'
import flame_icon from '@/assets/images/icons/flame.png'

import Prasenjit from '@/assets/images/reunion_team/Prasenjit.jpg'
import devops_icon from '@/assets/images/icons/devops.png'

import Cory from '@/assets/images/reunion_team/Cory.jpg'
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
import construction_icon from '@/assets/images/icons/construction.png'

import reunion_emblem from '@/assets/images/reunion_emblem_white.png'

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
      reunion_emblem,
      Chris,
      land_icon,
      Brandon,
      flame_icon,
      Prasenjit,
      devops_icon,
      Cory,
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
      Brandon_and_Liam,
      construction_icon
    }
  }
}
</script>
<template>
  <div class="basic">
    <CountdownTimer :targetYear="2025" :targetMonth="8" :targetDay="29" />
    <img
      :src="reunion_emblem"
      alt="reunion"
      class="reunion-emblem"
      style="cursor: pointer; max-width: 600px; border-radius: 0"
      @click="$router.push('/reunion')"
    />
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
          <h3>Land & Infrastructure</h3>
          <p>
            Chris brings the gift of the land to the project, ensuring that our festival has a true
            home.
          </p>
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
          <h3>Guadian of the Flame</h3>
          <p>
            Our talented lead builder, Brandon, has been instrumental in bringing our vision to life
            with his exceptional construction skills and dedication.
          </p>
        </template>
        <template v-slot:icon>
          <img
            :src="flame_icon"
            alt="Flame Icon"
            style="width: auto; height: 75px; border-radius: 0; border-radius: 0"
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
          <h3>DevOps & Technology</h3>
          <p>
            Our DevOps lead, Prasenjit, aims to deliver a seamless user experience for our artists &
            attendees.
          </p>
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
          <img :src="Angela" alt="Angela" />
        </template>
        <template v-slot:name>
          <h2>Angela</h2>
        </template>
        <template v-slot:role>
          <h3>Food Coordinator</h3>
          <p>
            Angela ensures our festival-goers are well-fed and satisfied, bringing hearty culinary
            experience to the event.
          </p>
        </template>
        <template v-slot:icon>
          <img :src="food_icon" alt="Food Icon" style="width: 75px; border-radius: 0" />
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
          <h3>Consultant & Ethos</h3>
          <p>
            Natalie is our consultant and ethos lead, ensuring that our festival is aligned with our
            core values and mission.
          </p></template
        >
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
          <h3>Vectors & Logos</h3>
          <p>Kayla is a vector guru, the key to a crisp and fresh brand image.</p>
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
          <h3>Decorations & Vibe</h3>
          <p>
            Christina is our decorations and vibe lead, ensuring that our festival is a feast for
            the eyes and the soul.
          </p>
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
          <h3>Construction</h3>
          <p>
            Brandon and Liam are our construction duo, working together to bring our festival to
            life.
          </p>
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
          <h3>Community Building</h3>
          <p>
            Janicka is a social butterfly that networks, bringing people together and fostering a
            sense of community.
          </p>
        </template>
        <template v-slot:icon>
          <img :src="community_icon" alt="Community Icon" style="width: 75px; border-radius: 0" />
        </template>
      </TeamCard>
      <TeamCard>
        <template v-slot:headshot>
          <img :src="Cory" alt="Cory" />
        </template>
        <template v-slot:name>
          <h2>Cory</h2>
        </template>
        <template v-slot:role>
          <h3>Artist Changeovers</h3>
          <p>
            As a DJ himself, Cory understands the importance of timing and flow, making him the
            perfect fit for this role.
          </p></template
        >
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
          <img :src="Becca" alt="Becca" />
        </template>
        <template v-slot:name>
          <h2>Becca</h2>
        </template>
        <template v-slot:role>
          <h3>Graphic Design</h3>
          <p>Becca designs our graphic assets, making sure our visuals are clear and consistent.</p>
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
          <h3>Photography & Resolume</h3>
          <p>
            Nish is our photography and Resolume expert, capturing the magic of the festival and
            creating stunning visuals.
          </p>
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
          <h3>Soundtech</h3>
          <p>
            Arthur is our trusted soundtech, ensuring that our festival sounds as good as it looks.
          </p>
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
          <h3>Guitar Tech & Soundtech</h3>
          <p>
            Yvo is a versatile professional, adept at managing both guitar tech and soundtech
            responsibilities with skill and style.
          </p>
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
          <img :src="Andy" alt="Andy" />
        </template>
        <template v-slot:name>
          <h2>Andy</h2>
        </template>
        <template v-slot:role>
          <h3>Children's Coordinator</h3>
          <p>
            Andy is our children's coordinator, ensuring that our youngest festival-goers have a
            safe and fun experience.
          </p>
        </template>
        <template v-slot:icon>
          <img :src="playground_icon" alt="Playground Icon" style="width: 75px; border-radius: 0" />
        </template>
      </TeamCard>
    </div>
    <DetailsPanel>
      <template #link1>
        <RouterLink to="/reunionfamily">Learn more</RouterLink>
      </template>
      <template #link2>
        <RouterLink to="/reunionteam">Meet the team</RouterLink>
      </template>
      <template #link3>
        <RouterLink to="/reunionsoundsystem">our custom soundsystem.</RouterLink>
      </template>
      <template #link4>
        <RouterLink to="/reunionamenities">amenities.</RouterLink>
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
  max-height: 300px;
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
