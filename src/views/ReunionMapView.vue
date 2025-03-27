<script setup>
import reunion_map from '@/assets/images/reunion_map_(helvetica).svg'
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
  font-family: 'Helvetica', sans-serif;
}
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
