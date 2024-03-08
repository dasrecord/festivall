<script>
import TeamCard from '@/components/TeamCard.vue'
import Prasenjit from '@/assets/images/team/Prasenjit.jpg'
import Corey from '@/assets/images/team/Corey.jpg'
import Janicka from '@/assets/images/team/Janicka.jpg'
import Arthur from '@/assets/images/team/Arthur.jpg'
import Christina from '@/assets/images/team/Christina.jpg'

export default {
  name: 'ReunionTeamView',
  components: {
    TeamCard
  },
  data() {
    return {
      Prasenjit: Prasenjit,
      Corey: Corey,
      Janicka: Janicka,
      Arthur: Arthur,
      Christina: Christina,
    }
  }
}
</script>
<template>
  <div class="basic">
    <h1>THE REUNION‍<br /></h1>
    Meet Our Festival Team<br /><br />
    <div class="cards">
      <TeamCard>
        <template v-slot:headshot>
          <img v-if="Chris":src="Chris" alt="Chris" />
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
        <img v-if="Natalie":src="Natalie" alt="Natalie" />
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
            <p>Graphic Design & Logos</p>
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
        <img v-if="Nish":src="Nish" alt="Nish" />
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
        <img v-if="Yvo":src="Yvo" alt="Yvo" />
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
        <img v-if="Andy":src="Andy" alt="Andy" />
      </template>
      <template v-slot:name>
        <h2>Andy</h2>
      </template>
      <template v-slot:role>
        <p>Children's Coordinator</p>
      </template>
    </TeamCard>
    </div> 
    <h1>
      Want to perform or volunteer?‍<br />
      <a href="https://dasrecord.typeform.com/to/a65mFuLr">APPLY NOW</a>
    </h1>
    <h1>
      Ready to buy tickets?‍<br />
      <a href="https://dasrecord.typeform.com/to/dyJs6iFd">BUY TICKETS</a>
    </h1>
  </div>
</template>

<style>
.basic {
  padding: 2rem;
  text-align: center;
  align-items: center;
  justify-content: center;
}
.cards{
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 30px;

}
img {
  display: inline;
  max-width: 300px;
  height: auto;
  border-radius: 25px;
}

@media (min-width: 1024px) {
  .basic {
    min-height: 100vh;
    display: block;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
</style>
