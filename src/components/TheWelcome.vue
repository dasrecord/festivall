<script setup lang="ts">
import { RouterLink } from 'vue-router'
import WelcomeItem from './WelcomeItem.vue'
import IconFestivall from './icons/IconFestivall.vue'
import reunion_emblem from '../assets/images/reunion_emblem_white.png'
import fuse_logo from '../assets/images/fuse_logo_white.png'
import blessed_coast_emblem from '../assets/images/blessed_coast_emblem_white.png'
import impact_logo from '../assets/images/impact_logo_white.png'
import synergistic_logo from '../assets/images/synergistic_logo_white.png'
import das_record_logo from '../assets/images/das_record_logo_white.png'
import evolved_classic_logo from '../assets/images/evolved_classic_logo_white.png'
import festivall_emblem_white from '../assets/images/festivall_emblem_white.png'
</script>

<template>
  <div class="container">
    <WelcomeItem class="welcome-item">
      <template #icon>
        <IconFestivall />
      </template>
      <template #heading><RouterLink to="/reunion">The Reunion</RouterLink></template>
      <template #description>
        The Reunion is a music festival that takes place in the heart of the Canadian prairies
        featuring some of the best electronic music DJs and local acts.
      </template>
      <template #logo>
        <img :src="reunion_emblem" alt="reunion" class="reunion-emblem" />
      </template>
    </WelcomeItem>
    <WelcomeItem class="welcome-item">
      <template #icon>
        <IconFestivall />
      </template>
      <template #heading><RouterLink to="/fusecollective">Fuse Collective</RouterLink></template>
      <template #description>
        Fuse Collective is a group of artists, musicians, producers, DJ's, production specialists,
        and promoters all coming together to create and support new growth in the scene.
      </template>
      <template #logo>
        <img :src="fuse_logo" alt="fuse_logo" class="fuse-logo" />
      </template>
    </WelcomeItem>

    <WelcomeItem class="welcome-item">
      <template #icon>
        <IconFestivall />
      </template>
      <template #heading><RouterLink to="/blessedcoast">Blessed Coast</RouterLink></template>

      <template #description>
        Blessed is a Celebration of Coastal Arts and Culture taking place in Squamish, BC.
        Multi-cultural, family friendly, music, yoga with inspired artists, teachers & workshops.
      </template>

      <template #logo>
        <img :src="blessed_coast_emblem" alt="blessed_coast_emblem" class="blessed-coast-emblem" />
      </template>
    </WelcomeItem>

    <WelcomeItem class="welcome-item">
      <template #icon>
        <IconFestivall />
      </template>
      <template #heading
        ><a href="https://www.instagram.com/impactfestival_bc/">Impact Festival</a></template
      >
      <template #description>
        Showcasing the best western Canadian talent, Impact Music Festival based out of Vancouver,
        is a must-see event for any electronic music fan.
      </template>
      <template #logo>
        <img :src="impact_logo" alt="impact_logo" class="impact-logo" />
      </template>
    </WelcomeItem>

    <WelcomeItem class="welcome-item">
      <template #icon>
        <IconFestivall />
      </template>
      <template #heading
        ><RouterLink to="/synergistic">Synergystic Entertainment</RouterLink></template
      >
      <template #description
        >A production company that specializes in electronic music events and festivals.</template
      >
      <template #logo>
        <img :src="synergistic_logo" alt="synergistic_logo" class="synergistic-logo" />
      </template>
    </WelcomeItem>

    <WelcomeItem class="welcome-item">
      <template #icon>
        <IconFestivall />
      </template>
      <template #heading><RouterLink to="/dasrecord">Das Record</RouterLink></template>
      <template #description>
        A medical doctor by day and a DJ/musician/coder by night, Das Record is a live piano and
        electronic music act and runs music festivals accross Canada.
      </template>
      <template #logo>
        <img :src="das_record_logo" alt="das_record_logo" class="das-record-logo" />
      </template>
    </WelcomeItem>
    <WelcomeItem class="welcome-item">
      <template #icon>
        <IconFestivall />
      </template>
      <template #heading>
        <a href="https://evolvedmusicgroup.com">Evolved Music Group</a>
      </template>
      <template #description>
        An international artist management agency and music firm with A&R and publishing consultants
        with personel in Canada, the US, and Europe.</template
      >
      <template #logo>
        <img :src="evolved_classic_logo" alt="evolved_classic_logo" class="evolved-classic-logo" />
      </template>
    </WelcomeItem>
    <WelcomeItem class="welcome-item">
      <template #icon>
        <IconFestivall />
      </template>
      <template #heading><RouterLink to="/dashboard">Admin Dashboard</RouterLink></template>
      <template #description>
        A members only area where you can scout new talent, book artists, and manage your event
        roster.
      </template>
      <template #logo>
        <img :src="festivall_emblem_white" alt="festivall" class="festivall-emblem" />
      </template>
    </WelcomeItem>
  </div>
</template>

<style scoped></style>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  /* border: 1px solid lime; */
}

.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 0.5rem;
  /* padding: 1rem; */
  margin: 0 auto;
  max-width: 1200px;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.welcome-item {
  height: 400px;
  display: grid;
  grid-template-rows: 1fr 1fr 1fr 3fr;
}

.reunion-emblem {
  width: 350px;
}
.fuse-logo {
  width: 250px;
}
.blessed-coast-emblem {
  width: 300px;
}
.impact-logo {
  width: 300px;
}
.synergistic-logo {
  width: 350px;
}
.das-record-logo {
  width: 250px;
}
.evolved-classic-logo {
  width: 300px;
}
.festivall-emblem {
  width: 150px;
}
</style>
