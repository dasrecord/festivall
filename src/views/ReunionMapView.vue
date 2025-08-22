<script setup>
// Import SVG as URL for use in template
import reunion_map from '@/assets/images/reunion_map_(awesome_lathusca).svg?url'
</script>

<template>
  <div class="map-container">
    <object :data="reunion_map" type="image/svg+xml" class="festival-map">
      Your browser does not support the object tag.
    </object>
  </div>
</template>

<style scoped>
.map-container {
  width: 100vw;
  height: auto;
  overflow: hidden;
  background-color: white;
}

.festival-map {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
