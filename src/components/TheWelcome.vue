<script setup lang="ts">
import { RouterLink } from 'vue-router'
import WelcomeItem from './WelcomeItem.vue'
import IconFestivall from './icons/IconFestivall.vue'
</script>

<template>
  <WelcomeItem>
    <template #icon>
      <IconFestivall />
    </template>
    <template #heading><RouterLink to="/reunion">The Reunion</RouterLink></template>
    <p>
      The Reunion is a music festival that takes place in the heart of the Canadian prairies<br />
      featuring some of the best electronic music DJs and local acts.
    </p>
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <IconFestivall />
    </template>
    <template #heading><RouterLink to="/blessedcoast">Blessed Coast</RouterLink></template>

    <p>
      Blessed is a Celebration of Coastal Arts and Culture taking place in Squamish, BC.<br />
      Multi-cultural, family friendly, music, yoga with inspired artists, teachers & workshops.
    </p>
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <IconFestivall />
    </template>
    <template #heading
      ><a href="https://www.instagram.com/impactfestival_bc/">Impact Festival</a></template
    >
    <p>
      Showcasing the best western Canadian talent, Impact Music Festival based out of Vancouver,<br />is
      a must-see event for any electronic music fan.
    </p>
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <IconFestivall />
    </template>
    <template #heading
      ><RouterLink to="/synergistic">Synergystic Entertainment</RouterLink></template
    >
    <p>A production company that specializes in electronic music events and festivals.</p>
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <IconFestivall />
    </template>
    <template #heading>Das Record</template>
    <p>
      A doctor by day and a DJ and coder by night,<br />
      Das Record is a live piano and electronic music act and performs at music festivals accross
      Canada.
    </p>
  </WelcomeItem>
  <WelcomeItem>
    <template #icon>
      <IconFestivall />
    </template>
    <template #heading>
      <a href="https://evolvedmusicgroup.com">Evolved Music Group</a>
    </template>
    <p>
      An international artist management agency and music firm<br />
      with A&R and publishing consultants with personel in Canada, the US, and Europe.
    </p>
  </WelcomeItem>
</template>
