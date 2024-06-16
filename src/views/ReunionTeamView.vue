<script>
import CountdownTimer from '@/components/CountdownTimer.vue'
import TeamCard from '@/components/TeamCard.vue'
import DetailsPanel from '@/components/DetailsPanel.vue'
import CalltoAction from '@/components/CalltoAction.vue'

import Chris from '@/assets/images/team/Chris.jpg'
import Brandon from '@/assets/images/team/Brandon.jpg'
import Prasenjit from '@/assets/images/team/Prasenjit.jpg'
import Corey from '@/assets/images/team/Corey.jpg'
import Janicka from '@/assets/images/team/Janicka.jpg'
import Arthur from '@/assets/images/team/Arthur.jpg'
import Christina from '@/assets/images/team/Christina.jpg'
import Natalie from '@/assets/images/team/Natalie.jpg'
import Nish from '@/assets/images/team/Nish.jpg'
import Kayla from '@/assets/images/team/Kayla.jpg'
import Becca from '@/assets/images/team/Becca.jpg'
import Yvo from '@/assets/images/team/Yvo.jpg'
import Angela from '@/assets/images/team/Angela.jpg'

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
      Brandon,
      Prasenjit,
      Corey,
      Janicka,
      Arthur,
      Christina,
      Natalie,
      Nish,
      Kayla,
      Becca,
      Yvo,
      Angela
    }
  }
}
</script>
<template>
  <div class="basic">
    <CountdownTimer />
    <h1>THE REUNION‍<br /></h1>
    <h2>Meet Our Festival Team<br /></h2>
    <div class="cards">
      <TeamCard>
        <template v-slot:headshot>
          <img v-if="Chris" :src="Chris" alt="Chris" />
        </template>
        <template v-slot:name>
          <h2>Chris</h2>
        </template>
        <template v-slot:role>
          <p>Land & Infrastructure</p>
        </template>
      </TeamCard>
      <TeamCard>
        <template v-slot:headshot>
          <img v-if="Brandon" :src="Brandon" alt="Brandon" />
        </template>
        <template v-slot:name>
          <h2>Brandon</h2>
        </template>
        <template v-slot:role>
          <p>Construction & Bookings</p>
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
      </TeamCard>
      <TeamCard>
        <template v-slot:headshot>
          <img v-if="Natalie" :src="Natalie" alt="Natalie" />
        </template>
        <template v-slot:name>
          <h2>Natalie</h2>
        </template>
        <template v-slot:role>
          <p>Consultant & Ethos</p>
        </template>
      </TeamCard>
      <TeamCard>
        <template v-slot:headshot>
          <img v-if="Kayla" :src="Kayla" alt="Kayla" />
        </template>
        <template v-slot:name>
          <h2>Kayla</h2>
        </template>
        <template v-slot:role>
          <p>Vectors & Logos</p>
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
      </TeamCard>
      <TeamCard>
        <template v-slot:headshot>
          <img v-if="Nish" :src="Nish" alt="Nish" />
        </template>
        <template v-slot:name>
          <h2>Nish</h2>
        </template>
        <template v-slot:role>
          <p>Photography & Resolume</p>
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
      </TeamCard>
      <TeamCard>
        <template v-slot:headshot>
          <img v-if="Yvo" :src="Yvo" alt="Yvo" />
        </template>
        <template v-slot:name>
          <h2>Yvo</h2>
        </template>
        <template v-slot:role>
          <p>Guitar Tech & Soundtech</p>
        </template>
      </TeamCard>
      <TeamCard>
        <template v-slot:headshot>
          <img v-if="Angela" :src="Angela" alt="Angela" />
        </template>
        <template v-slot:name>
          <h2>Angela</h2>
        </template>
        <template v-slot:role>
          <p>Food Coordinator</p>
        </template>
      </TeamCard>
      <!-- <TeamCard>
        <template v-slot:headshot>
          <img v-if="Andy" :src="Andy" alt="Andy" />
        </template>
        <template v-slot:name>
          <h2>Andy</h2>
        </template>
        <template v-slot:role>
          <p>Children's Coordinator</p>
        </template>
      </TeamCard> -->
    </div>
    <DetailsPanel />
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
