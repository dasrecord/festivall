<template>
  <div class="team-card">
    <slot name="headshot">
      <!-- Default content for headshot -->
    </slot>
    <slot name="name">
      <!-- Default content for name -->
    </slot>
    <slot name="role">
      <!-- Default content for role -->
    </slot>
    <slot name="icon">
      <IconFestivall style="width: 24px; height: 24px" />
    </slot>
  </div>
</template>

<script>
import IconFestivall from './icons/IconFestivall.vue'
export default {
  name: 'TeamCard',
  components: {
    IconFestivall
  }
}
</script>

<style scoped>
.team-card {
  border: 1px solid rgba(121, 188, 255, 0.25);
  border-radius: 25px;
  padding: 1rem;
  box-shadow: inset 0 0 50px rgba(121, 188, 255, 0.25);
}
/* .icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
} */
</style>
