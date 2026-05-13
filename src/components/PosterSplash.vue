<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
// TODO: Replace with 2026 SVG poster when ready
import posterImage from '@/assets/images/reunion_2026_poster_v1.svg'


const emit = defineEmits<{ dismissed: [] }>()

const visible = ref(true)
const secondsLeft = ref(30)
let countdown: ReturnType<typeof setInterval> | null = null

const dismiss = () => {
  visible.value = false
  emit('dismissed')
}

onMounted(() => {
  countdown = setInterval(() => {
    secondsLeft.value--
    if (secondsLeft.value <= 0) {
      clearInterval(countdown!)
      dismiss()
    }
  }, 1000)
})

onBeforeUnmount(() => {
  if (countdown) clearInterval(countdown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="poster-fade">
      <div
        v-if="visible"
        data-poster-splash
        @click="dismiss"
        :style="{ backgroundImage: `url(${posterImage})` }"
      >
        <div class="poster-hint">
          <span class="countdown">{{ secondsLeft }}</span>
          <span>Click anywhere to continue</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
[data-poster-splash] {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 9999 !important;
  background-color: #000 !important;
  background-size: contain !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  cursor: pointer !important;
}

.poster-hint {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.45);
  padding: 0.4rem 1rem;
  border-radius: 2rem;
  white-space: nowrap;
}

.countdown {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  min-width: 1.25ch;
  text-align: center;
}

.poster-fade-enter-active,
.poster-fade-leave-active {
  transition: opacity 0.6s ease;
}
.poster-fade-enter-from,
.poster-fade-leave-to {
  opacity: 0;
}
</style>
