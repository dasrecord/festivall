<template>
  <div class="team-card">
    <slot name="headshot">
      <!-- Default content for headshot -->
    </slot>
    <div class="label">
      <slot name="name">
        <!-- Default content for name -->
      </slot>
      <slot class="icon" name="icon">
        <!-- Default content for image -->
      </slot>
    </div>
    <slot name="role">
      <!-- Default content for role -->
    </slot>
  </div>
</template>

<script>
export default {
  name: 'TeamCard'
}
</script>

<style scoped>
.team-card {
  border: 1px solid rgba(121, 188, 255, 0.25);
  border-radius: 25px;
  padding: 1rem;
  box-shadow: inset 0 0 50px rgba(121, 188, 255, 0.25);
}

</style>
