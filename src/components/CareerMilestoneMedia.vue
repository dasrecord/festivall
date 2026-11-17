<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CareerTimelineEvent } from '@/utils/loadCareerTimeline'

const props = withDefaults(defineProps<{
  event: CareerTimelineEvent
  compact?: boolean
}>(), {
  compact: false
})

const isPreviewOpen = ref(false)

watch(() => props.event.id, () => {
  isPreviewOpen.value = false
})
</script>

<template>
  <aside
    v-if="event.referenceImage || event.spotifyEmbedUrl || (event.mediaUrl && !event.spotifyEmbedUrl)"
    class="career-media"
    :class="{ compact }"
  >
    <figure v-if="event.referenceImage" class="reference-image">
      <img :src="event.referenceImage" :alt="event.referenceImageAlt" loading="lazy" />
      <figcaption>
        <a
          :href="event.referenceImageSourceUrl"
          target="_blank"
          rel="noopener noreferrer"
        >{{ event.referenceImageAttribution }}</a>
        <span aria-hidden="true"> · </span>
        <a
          :href="event.referenceImageLicenseUrl"
          target="_blank"
          rel="noopener noreferrer"
        >{{ event.referenceImageLicense }}</a>
      </figcaption>
    </figure>

    <div v-if="event.spotifyEmbedUrl" class="track-preview">
      <button
        v-if="!isPreviewOpen"
        type="button"
        class="preview-button"
        aria-expanded="false"
        @click="isPreviewOpen = true"
      >
        <span aria-hidden="true">▶</span>
        Play track preview
      </button>
      <button
        v-else
        type="button"
        class="preview-button"
        aria-expanded="true"
        @click="isPreviewOpen = false"
      >
        <span aria-hidden="true">×</span>
        Close track preview
      </button>
      <iframe
        v-if="isPreviewOpen"
        class="spotify-player"
        :src="event.spotifyEmbedUrl"
        :title="`Spotify preview: ${event.headline}`"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
    </div>

    <a
      v-else-if="event.mediaUrl"
      :href="event.mediaUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="media-link"
    >
      {{ event.mediaCaption || 'View original reference' }}
      <span aria-hidden="true">↗</span>
    </a>
  </aside>
</template>

<style scoped>
.career-media {
  min-width: 0;
  align-self: center;
}

.reference-image {
  margin: 0;
}

.reference-image img {
  display: block;
  width: 100%;
  max-height: 15rem;
  border: 1px solid rgba(226, 214, 192, 0.18);
  border-radius: 0.55rem;
  background: #171714;
  object-fit: cover;
}

.reference-image figcaption {
  margin-top: 0.45rem;
  color: #a59a86;
  font-size: 0.68rem;
  line-height: 1.45;
}

.reference-image a {
  color: inherit;
  text-decoration-color: rgba(213, 184, 131, 0.45);
  text-underline-offset: 0.18em;
}

.track-preview {
  display: grid;
  gap: 0.65rem;
}

.preview-button {
  justify-self: start;
  padding: 0.7rem 0.9rem;
  border: 1px solid rgba(213, 184, 131, 0.48);
  border-radius: 999px;
  color: #e2c99e;
  background: rgba(213, 184, 131, 0.08);
  font: inherit;
  font-size: 0.84rem;
  cursor: pointer;
  transition:
    background-color 180ms ease,
    transform 420ms cubic-bezier(0.22, 1.55, 0.45, 1);
}

.preview-button:hover {
  background: rgba(213, 184, 131, 0.16);
}

.preview-button:active {
  transform: scale(0.96);
}

.preview-button span {
  margin-right: 0.4rem;
}

.spotify-player {
  display: block;
  width: min(100%, 22rem);
  height: 152px;
  border: 0;
  border-radius: 0.75rem;
}

.media-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #d5b883;
  font-size: 0.9rem;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.25em;
}

.compact .reference-image {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.compact .reference-image img {
  width: 7rem;
  height: 4.5rem;
  flex: 0 0 7rem;
}

.compact .reference-image figcaption {
  margin-top: 0.1rem;
}

.compact .spotify-player {
  width: min(100%, 22rem);
}

@media (max-width: 560px) {
  .reference-image img {
    max-height: 12rem;
  }
}
</style>
