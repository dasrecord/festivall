<script setup>
import { computed } from 'vue'

const props = defineProps({ name: { type: String, required: true } })

const icons = import.meta.glob('@/assets/images/icons/*.svg', {
  eager: true,
  query: '?url',
  import: 'default'
})
const src = computed(() => icons[`/src/assets/images/icons/${props.name}.svg`])
</script>

<template>
  <span
    class="os-icon"
    aria-hidden="true"
    :style="{ '--icon': `url(${src})` }"
  ></span>
</template>

<style scoped>
.os-icon {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  vertical-align: -0.2em;
  margin-right: 0.4em;
  background-color: currentColor;
  -webkit-mask: var(--icon) center / contain no-repeat;
  mask: var(--icon) center / contain no-repeat;
}
</style>
