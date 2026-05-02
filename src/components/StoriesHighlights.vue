<template>
  <div class="stories-highlights">
    <template v-for="group in groups" :key="group.label">
      <a
        v-if="group.url"
        :href="group.url"
        target="_blank"
        rel="noopener noreferrer"
        class="story-bubble"
      >
        <div class="bubble-ring">
          <img :src="group.thumb" :alt="group.label" class="bubble-img" />
        </div>
        <span class="bubble-label">{{ group.label }}</span>
      </a>
      <div v-else class="story-bubble story-bubble--inactive">
        <div class="bubble-ring">
          <img :src="group.thumb" :alt="group.label" class="bubble-img" />
        </div>
        <span class="bubble-label">{{ group.label }}</span>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    groups: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.stories-highlights {
  display: flex;
  flex-direction: row;
  gap: 1.2rem;
  overflow-x: auto;
  padding: 1rem 1rem;
  justify-content: center;
  flex-wrap: wrap;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
}

.story-bubble {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
  flex-shrink: 0;
  cursor: pointer;
}

.story-bubble--inactive {
  opacity: 0.4;
  cursor: default;
  pointer-events: none;
}

.bubble-ring {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2.5px solid white;
  padding: 3px;
  background: transparent;
  transition: border-color 0.2s;
}

.story-bubble:not(.story-bubble--inactive):hover .bubble-ring {
  border-color: #aaa;
}

.bubble-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.bubble-label {
  font-size: 0.7rem;
  color: white;
  text-align: center;
  max-width: 80px;
  line-height: 1.2;
  letter-spacing: 0.02em;
}

@media (max-width: 600px) {
  .stories-highlights {
    flex-wrap: nowrap;
    justify-content: flex-start;
    padding: 1rem 1rem;
    overflow-x: auto;
  }
}
</style>
