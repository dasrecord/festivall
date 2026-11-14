<script setup>
import OsIcon from './OsIcon.vue'

defineProps({
  title: { type: String, required: true }
})
</script>

<template>
  <div class="locked">
    <OsIcon name="off_limits" />
    <div>
      <strong>{{ title }}</strong>
      <p>Unlocked for supporters who make a donation. Once the crew confirms yours, it appears here.</p>
    </div>
  </div>
</template>

<style scoped>
.locked { display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; color: #9fb6c7; }
.locked :deep(.os-icon) { width: 36px; height: 36px; margin: 0; flex: none; color: #6f8ba0; }
.locked p { margin: 0.15rem 0 0; font-size: 0.78rem; color: #6f8ba0; }
</style>
