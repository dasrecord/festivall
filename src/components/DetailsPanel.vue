<template>
  <div>
    <h2>
      <slot name="link1"></slot> about our festival.<br /><br />
      <slot name="link2"></slot> behind the scenes.<br /><br />
      Check out <slot name="link3"></slot><br /><br />
      Click here for the <slot name="link4"></slot><br /><br />
    </h2>
  </div>
</template>

<script>
export default {
  name: 'DetailsPanel'
}
</script>

<style scoped>
/* add styles */
</style>
