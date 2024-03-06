<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import WelcomeItem from './WelcomeItem.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'
import ToolingIcon from './icons/IconTooling.vue'
import EcosystemIcon from './icons/IconEcosystem.vue'
import CommunityIcon from './icons/IconCommunity.vue'
import SupportIcon from './icons/IconSupport.vue'
</script>

<template>
  <WelcomeItem>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading><RouterLink to="/reunion">The Reunion</RouterLink> </template>
    <p>
      The Reunion is a music festival that takes place in the
      heart of the Canadian prairies featuring some of the best electronic music DJs and local acts.
    </p>
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading><a href="https://www.instagram.com/impactfestival_bc/">Impact Festival</a></template>
    <p>
      Showcasing the best western Canadian talent, Impact Music Festival based out of Vancouver is a
      must-see event for any electronic music fan.
    </p>
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading>Blessed Coast</template>
    <p>
      A music festival that takes place in beautiful British Columbia, Blessed Coast Festival is a
      celebration of electronic music and art.
    </p>
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading>Das Record</template>
    <p>
      A doctor by day and a DJ and coder by night, Das Record is a live piano and electronic music
      act and performs at music festivals accross Canada.
    </p>
  </WelcomeItem>

  <WelcomeItem>
    <template #icon>
      <DocumentationIcon />
    </template>
    <template #heading>
      <a href="https://evolvedmusicgroup.com">Evolved Music Group</a>
    </template>
    <p>
      An international artist management agency and music firm with A&R and publishing consultants
      with personel in Canada, the US, and Europe.
    </p>
  </WelcomeItem>
</template>
