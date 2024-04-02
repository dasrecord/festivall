<template>
  <button class="carousel-control left" @click="$emit('prev')">&lt;</button>
  <button class="carousel-control right" @click="$emit('next')">&gt;</button>
</template>
<script>
export default {
  emits: ['prev', 'next']
}
</script>
<style scoped>
.carousel-control {
  background-color: rgba(0, 0, 0, 0.5);
  border: none;
  display: inline-block;
  position: absolute;
  height: 100%;
  width: 25px;
  /* top: calc(50% - 25px); */
  color: #f3f3f3;
  cursor: pointer;
}
.left {
  left: 0;
}
.right {
  right: 0;
}
</style>
