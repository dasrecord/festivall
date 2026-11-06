<script setup>
import { computed } from 'vue'
import bonus from '@/assets/images/icons/bonus.svg?raw'
import contract from '@/assets/images/icons/contract.svg?raw'
import dj from '@/assets/images/icons/dj.svg?raw'
import flyer from '@/assets/images/icons/flyer.svg?raw'
import link from '@/assets/images/icons/link.svg?raw'
import mixTrack from '@/assets/images/icons/mix_track.svg?raw'
import offLimits from '@/assets/images/icons/off_limits.svg?raw'
import quest from '@/assets/images/icons/quest.svg?raw'
import radio from '@/assets/images/icons/radio.svg?raw'
import reminder from '@/assets/images/icons/reminder.svg?raw'
import ticket from '@/assets/images/icons/ticket.svg?raw'
import volunteer from '@/assets/images/icons/volunteer.svg?raw'

const props = defineProps({ name: { type: String, required: true } })

const icons = {
  bonus, contract, dj, flyer, link, mix_track: mixTrack, off_limits: offLimits,
  quest, radio, reminder, ticket, volunteer
}
const svg = computed(() =>
  (icons[props.name] || '').replace(/fill="rgb\(100%, 100%, 100%\)"/g, 'fill="currentColor"')
)
</script>

<template>
  <span class="os-icon" aria-hidden="true" v-html="svg"></span>
</template>

<style scoped>
.os-icon {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  vertical-align: -0.2em;
  margin-right: 0.4em;
}
.os-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
