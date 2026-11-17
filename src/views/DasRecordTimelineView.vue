<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useHead } from '@vueuse/head'
import { RouterLink } from 'vue-router'
import CareerMilestoneMedia from '@/components/CareerMilestoneMedia.vue'
import { loadCareerTimeline, type CareerTimelineEvent } from '@/utils/loadCareerTimeline'

const events = ref<CareerTimelineEvent[]>([])
const selectedIndex = ref(0)
const isLoading = ref(true)
const errorMessage = ref('')
const timelineScroll = ref<HTMLElement | null>(null)
const selectedEvent = computed(() => events.value[selectedIndex.value])
const slideDirection = ref<'forward' | 'backward'>('forward')
const slideTransition = computed(() => `event-${slideDirection.value}`)
let scrollAnimationFrame: number | null = null

useHead({
  title: 'Interactive Timeline — Das Record',
  meta: [
    {
      name: 'description',
      content: 'Explore the milestones in Prasenjit Das’s journey through music, medicine, and technology.'
    }
  ]
})

function centerTimelineEvent(index: number, animate = true) {
  const container = timelineScroll.value
  const marker = container?.querySelector<HTMLElement>(`[data-event-index="${index}"]`)
  if (!container || !marker) return

  const markerPosition =
    marker.getBoundingClientRect().left - container.getBoundingClientRect().left + container.scrollLeft
  const target = markerPosition - (container.clientWidth - marker.clientWidth) / 2
  if (scrollAnimationFrame !== null) cancelAnimationFrame(scrollAnimationFrame)

  if (!animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    container.scrollLeft = target
    scrollAnimationFrame = null
    return
  }

  const start = container.scrollLeft
  const distance = target - start
  const startedAt = performance.now()
  const duration = 760

  const animateScroll = (now: number) => {
    const progress = Math.min((now - startedAt) / duration, 1)
    const remaining = progress - 1
    const eased = 1 + 2.70158 * remaining ** 3 + 1.70158 * remaining ** 2
    container.scrollLeft = start + distance * eased
    if (progress < 1) {
      scrollAnimationFrame = requestAnimationFrame(animateScroll)
    } else {
      container.scrollLeft = target
      scrollAnimationFrame = null
    }
  }

  scrollAnimationFrame = requestAnimationFrame(animateScroll)
}

async function loadTimeline() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    events.value = await loadCareerTimeline()
    selectedIndex.value = events.value.length - 1
  } catch (error) {
    console.error('Unable to load the Das Record timeline.', error)
    errorMessage.value = 'The timeline could not be loaded. Please try again in a moment.'
  } finally {
    isLoading.value = false
  }

  await nextTick()
  if (events.value.length) centerTimelineEvent(selectedIndex.value, false)
}

async function selectEvent(index: number) {
  if (index < 0 || index >= events.value.length) return
  if (index === selectedIndex.value) return
  slideDirection.value = index > selectedIndex.value ? 'forward' : 'backward'
  selectedIndex.value = index
  await nextTick()
  centerTimelineEvent(index)
}

function previousEvent() {
  void selectEvent(selectedIndex.value - 1)
}

function nextEvent() {
  void selectEvent(selectedIndex.value + 1)
}

function handleTimelineKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') previousEvent()
  if (event.key === 'ArrowRight') nextEvent()
}

onMounted(loadTimeline)
onMounted(() => window.addEventListener('resize', centerSelectedEvent))
onUnmounted(() => {
  window.removeEventListener('resize', centerSelectedEvent)
  if (scrollAnimationFrame !== null) cancelAnimationFrame(scrollAnimationFrame)
})

function centerSelectedEvent() {
  centerTimelineEvent(selectedIndex.value, false)
}
</script>

<template>
  <main class="career-timeline" @keydown="handleTimelineKeydown">
    <div class="timeline-container">
      <header class="timeline-header">
        <RouterLink to="/dasrecord" class="back-link">← Back to Das Record</RouterLink>
        <p class="eyebrow">Prasenjit Das · Life in chapters</p>
        <h1>A life in motion<span>.</span></h1>
        <p class="intro">
          From a first piano lesson to medicine, music, and the work still unfolding.
        </p>
      </header>

      <section v-if="isLoading" class="status-card" aria-live="polite">
        <span class="loading-mark" aria-hidden="true"></span>
        <p>Loading the timeline…</p>
      </section>

      <section v-else-if="errorMessage" class="status-card error-card" role="alert">
        <p>{{ errorMessage }}</p>
        <button type="button" class="retry-button" @click="loadTimeline">Try again</button>
      </section>

      <template v-else-if="selectedEvent">
        <section class="event-section" aria-live="polite" aria-atomic="true">
          <div class="event-meta">
            <p class="event-date">{{ selectedEvent.date }}</p>
            <p class="event-count">
              <span>{{ String(selectedIndex + 1).padStart(2, '0') }}</span>
              <span class="count-divider">/</span>
              {{ String(events.length).padStart(2, '0') }} milestones
            </p>
          </div>

          <div class="event-scene">
            <Transition :name="slideTransition" :duration="620">
              <article :key="selectedEvent.id" class="event-card">
                <div class="event-accent" aria-hidden="true"></div>
                <div
                  class="event-content"
                  :class="{
                    'has-media': selectedEvent.referenceImage || selectedEvent.spotifyEmbedUrl || selectedEvent.mediaUrl
                  }"
                >
                  <div class="event-copy">
                    <p class="event-year">{{ selectedEvent.year }}</p>
                    <h2>{{ selectedEvent.headline }}</h2>
                    <p v-if="selectedEvent.text" class="event-description">{{ selectedEvent.text }}</p>
                  </div>
                  <CareerMilestoneMedia :event="selectedEvent" />
                </div>
              </article>
            </Transition>
          </div>

          <nav class="event-controls" aria-label="Timeline navigation">
            <button type="button" :disabled="selectedIndex === 0" @click="previousEvent">
              <span aria-hidden="true">←</span> Previous
            </button>
            <span class="keyboard-hint">Use ← → to explore</span>
            <button
              type="button"
              :disabled="selectedIndex === events.length - 1"
              @click="nextEvent"
            >
              Next <span aria-hidden="true">→</span>
            </button>
          </nav>

          <section class="timeline-navigator" aria-label="Choose a milestone">
            <div class="navigator-heading">
              <h2>Explore the years</h2>
              <p>Choose a point in the story</p>
            </div>
            <div ref="timelineScroll" class="timeline-scroll">
              <ol class="timeline-track">
                <li
                  v-for="(event, index) in events"
                  :key="event.id"
                  class="timeline-step"
                  :class="{
                    'year-start': index === 0 || event.year !== events[index - 1]?.year
                  }"
                >
                  <span
                    v-if="index === 0 || event.year !== events[index - 1]?.year"
                    class="year-label"
                  >{{ event.year }}</span>
                  <button
                    type="button"
                    class="timeline-dot"
                    :class="{ active: selectedIndex === index }"
                    :aria-label="`${event.date}: ${event.headline}`"
                    :aria-current="selectedIndex === index ? 'step' : undefined"
                    :data-event-index="index"
                    @click="selectEvent(index)"
                  >
                    <span class="visually-hidden">{{ event.headline }}</span>
                  </button>
                </li>
              </ol>
            </div>
          </section>
        </section>
      </template>
    </div>
  </main>
</template>

<style scoped>
:global(#app) {
  width: 100%;
  min-width: 0;
}

.career-timeline {
  width: 100%;
  min-width: 0;
  min-height: 100vh;
  min-height: 100svh;
  padding: clamp(1.25rem, 5vw, 4rem) 1.25rem;
  color: #f4f0e9;
  background:
    radial-gradient(ellipse at 82% 4%, rgba(162, 127, 77, 0.15), transparent 34rem),
    #11110f;
  font-family: 'Oswald', 'Helvetica Neue', sans-serif;
}

.timeline-container {
  width: min(100%, 1220px);
  margin: 0 auto;
}

.timeline-header {
  padding: 0.5rem 0 2.5rem;
}

.back-link {
  display: inline-block;
  margin-bottom: clamp(3rem, 9vw, 6.5rem);
  color: #d7c8ad;
  font-size: 0.9rem;
  letter-spacing: 0.04em;
  text-decoration: none;
}

.back-link:hover,
.back-link:focus-visible {
  color: #fff;
}

.eyebrow,
.event-date,
.event-year {
  color: #c5a775;
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.timeline-header h1 {
  margin-top: 0.6rem;
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(2.4rem, 8vw, 5.4rem);
  font-weight: 400;
  letter-spacing: -0.055em;
  line-height: 1.05;
}

.timeline-header h1 span {
  color: #c5a775;
}

.intro {
  max-width: 34rem;
  margin-top: 1rem;
  color: #b6b0a5;
  font-size: clamp(1rem, 2vw, 1.15rem);
  line-height: 1.6;
}

.event-section {
  padding-top: 1.5rem;
}

.event-meta,
.event-controls,
.navigator-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.event-count {
  color: #858078;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.event-count span:first-child {
  color: #f4f0e9;
}

.count-divider {
  margin: 0 0.35rem;
  color: #746b5c;
}

.event-scene {
  display: grid;
}

.event-card {
  grid-area: 1 / 1;
  position: relative;
  display: grid;
  grid-template-columns: 4px 1fr;
  min-height: 17rem;
  margin-top: 0.9rem;
  overflow: hidden;
  border: 1px solid rgba(226, 214, 192, 0.12);
  border-radius: 0.7rem;
  background: linear-gradient(115deg, rgba(42, 40, 35, 0.96), rgba(27, 27, 24, 0.95));
  box-shadow: 0 1.5rem 4rem rgba(0, 0, 0, 0.22);
}

.event-forward-enter-active,
.event-forward-leave-active,
.event-backward-enter-active,
.event-backward-leave-active {
  will-change: opacity, transform;
  transition:
    opacity 360ms ease,
    transform 620ms cubic-bezier(0.22, 1.55, 0.45, 1);
}

.event-forward-enter-from {
  opacity: 0;
  transform: perspective(1100px) translateX(100px) rotateY(-9deg) scale(0.96);
}

.event-forward-leave-from,
.event-backward-leave-from {
  opacity: 1;
  transform: perspective(1100px) translateX(0) rotateY(0) scale(1);
}

.event-forward-leave-to {
  opacity: 0;
  transform: perspective(1100px) translateX(-75px) rotateY(7deg) scale(0.97);
}

.event-backward-enter-from {
  opacity: 0;
  transform: perspective(1100px) translateX(-100px) rotateY(9deg) scale(0.96);
}

.event-backward-leave-to {
  opacity: 0;
  transform: perspective(1100px) translateX(75px) rotateY(-7deg) scale(0.97);
}

.event-accent {
  background: linear-gradient(180deg, #d5b883, rgba(213, 184, 131, 0.1));
}

.event-content {
  align-self: center;
  padding: clamp(1.5rem, 6vw, 3.5rem);
}

.event-copy {
  min-width: 0;
}

.event-year {
  margin-bottom: 0.75rem;
  font-size: 0.72rem;
}

.event-content h2 {
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(1.75rem, 5vw, 3rem);
  line-height: 1.2;
}

.event-description {
  max-width: 48rem;
  margin-top: 1.1rem;
  color: #c8c3b9;
  font-family: 'Oswald', 'Helvetica Neue', sans-serif;
  font-size: clamp(1rem, 2.2vw, 1.15rem);
  line-height: 1.7;
  white-space: pre-line;
}

.media-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.4rem;
  color: #d5b883;
  font-size: 0.9rem;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.25em;
}

.event-controls {
  padding: 1rem 0 2.25rem;
}

.event-controls button,
.retry-button {
  padding: 0.65rem 0.85rem;
  border: 1px solid rgba(226, 214, 192, 0.2);
  border-radius: 0.35rem;
  color: #f4f0e9;
  background: transparent;
  font: inherit;
}

.event-controls button:not(:disabled):hover,
.retry-button:hover {
  border-color: #c5a775;
  color: #e2c99e;
}

.event-controls button:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}

.event-controls button span {
  padding: 0 0.2rem;
  color: #c5a775;
}

.keyboard-hint {
  color: #858078;
  font-size: 0.75rem;
}

.timeline-navigator {
  padding: 1.25rem 0 0.5rem;
  border-top: 1px solid rgba(226, 214, 192, 0.14);
}

.navigator-heading {
  margin-bottom: 1.25rem;
}

.navigator-heading h2 {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 1rem;
}

.navigator-heading p {
  color: #858078;
  font-size: 0.8rem;
}

.timeline-scroll {
  overflow-x: auto;
  padding: 1.5rem 0.5rem 1rem;
  scrollbar-color: #76664b #24231f;
  scrollbar-width: thin;
}

.timeline-track {
  position: relative;
  display: flex;
  align-items: center;
  width: max-content;
  min-width: 100%;
  padding: 0.7rem 0.3rem 0;
  list-style: none;
}

.timeline-track::before {
  position: absolute;
  top: 1.05rem;
  right: 0;
  left: 0;
  height: 1px;
  background: rgba(213, 184, 131, 0.4);
  content: '';
}

.timeline-step {
  position: relative;
  display: flex;
  width: 2rem;
  flex: 0 0 2rem;
  justify-content: center;
}

.timeline-step.year-start {
  width: 3.75rem;
  flex-basis: 3.75rem;
}

.year-label {
  position: absolute;
  bottom: calc(100% + 0.7rem);
  left: 50%;
  color: #a59a86;
  font-size: 0.68rem;
  transform: translateX(-50%);
}

.timeline-dot {
  z-index: 1;
  width: 0.65rem;
  height: 0.65rem;
  padding: 0;
  border: 1px solid #a68e65;
  border-radius: 50%;
  background: #171714;
  transition: transform 160ms ease, background-color 160ms ease;
}

.timeline-dot:hover,
.timeline-dot:focus-visible {
  outline: 2px solid rgba(213, 184, 131, 0.42);
  outline-offset: 3px;
  transform: scale(1.25);
}

.timeline-dot.active {
  border-color: #ead4ae;
  background: #d5b883;
  box-shadow: 0 0 0 4px rgba(213, 184, 131, 0.16);
  transform: scale(1.2);
}

.status-card {
  display: flex;
  min-height: 12rem;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  color: #c8c3b9;
}

.loading-mark {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(213, 184, 131, 0.25);
  border-top-color: #d5b883;
  border-radius: 50%;
  animation: spin 850ms linear infinite;
}

.error-card {
  flex-direction: column;
  text-align: center;
}

.retry-button {
  cursor: pointer;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (min-width: 900px) {
  .career-timeline {
    display: flex;
    min-height: 100svh;
    align-items: center;
    padding: 2rem clamp(2rem, 6vw, 6rem);
  }

  .timeline-header {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(16rem, 0.65fr);
    align-items: end;
    column-gap: 2rem;
    padding: 0 0 2.5rem;
  }

  .back-link {
    grid-column: 1 / -1;
    margin-bottom: clamp(2rem, 5vh, 4rem);
  }

  .timeline-header .eyebrow {
    grid-column: 1;
    grid-row: 2;
  }

  .timeline-header h1 {
    grid-column: 1;
    grid-row: 3;
    font-size: clamp(3.25rem, 5vw, 5.25rem);
    white-space: nowrap;
  }

  .intro {
    grid-column: 2;
    grid-row: 2 / 4;
    max-width: 24rem;
    margin: 0 0 0.55rem;
    font-size: clamp(1.1rem, 1.5vw, 1.4rem);
    line-height: 1.75;
  }

  .event-section {
    padding-top: 0;
  }

  .event-meta {
    margin-bottom: 0.85rem;
  }

  .event-card {
    min-height: clamp(19rem, 36vh, 27rem);
    grid-template-columns: 6px 1fr;
    margin-top: 0;
    border-radius: 0.9rem;
    background:
      radial-gradient(ellipse at 87% 24%, rgba(196, 159, 102, 0.1), transparent 34rem),
      linear-gradient(115deg, rgba(42, 40, 35, 0.96), rgba(27, 27, 24, 0.95));
    box-shadow: 0 2rem 6rem rgba(0, 0, 0, 0.3);
  }

  .event-content {
    max-width: 65rem;
    padding: clamp(2.5rem, 5vw, 5rem);
  }

  .event-content.has-media {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(16rem, 0.75fr);
    align-items: center;
    gap: clamp(1.5rem, 4vw, 4rem);
  }

  .event-year {
    margin-bottom: 1.1rem;
    font-size: 0.85rem;
  }

  .event-content h2 {
    font-size: clamp(3rem, 6vw, 5rem);
    letter-spacing: -0.035em;
  }

  .event-description {
    max-width: 58rem;
    margin-top: 1.5rem;
    font-size: clamp(1.15rem, 1.6vw, 1.4rem);
  }

  .event-controls {
    padding: 1.2rem 0 2rem;
  }

  .event-controls button {
    min-width: 8rem;
    padding: 0.8rem 1rem;
    transition:
      border-color 180ms ease,
      color 180ms ease,
      transform 420ms cubic-bezier(0.22, 1.55, 0.45, 1);
  }

  .event-controls button:not(:disabled):active {
    transform: scale(0.94);
  }

  .timeline-navigator {
    padding-top: 1.5rem;
  }

  .navigator-heading {
    margin-bottom: 1.5rem;
  }

  .navigator-heading h2 {
    font-size: 1.25rem;
  }

  .navigator-heading p {
    font-size: 0.9rem;
  }

  .timeline-scroll {
    padding: 1.75rem 1rem 1.25rem;
  }

  .timeline-track {
    padding-top: 0.9rem;
  }

  .timeline-track::before {
    top: 1.25rem;
  }

  .timeline-step {
    width: 2.25rem;
    flex-basis: 2.25rem;
  }

  .timeline-step.year-start {
    width: 4rem;
    flex-basis: 4rem;
  }

  .year-label {
    bottom: calc(100% + 0.9rem);
    font-size: 0.78rem;
  }

  .timeline-dot {
    width: 0.75rem;
    height: 0.75rem;
    cursor: pointer;
    transition:
      transform 360ms cubic-bezier(0.22, 1.55, 0.45, 1),
      background-color 200ms ease,
      box-shadow 360ms cubic-bezier(0.22, 1.55, 0.45, 1);
  }

  .timeline-dot.active {
    transform: scale(1.4);
  }
}

@media (max-width: 560px) {
  .career-timeline {
    padding-right: 1rem;
    padding-left: 1rem;
  }

  .timeline-header {
    padding-bottom: 1.5rem;
  }

  .back-link {
    margin-bottom: 3.5rem;
  }

  .event-section {
    padding-top: 1rem;
  }

  .event-card {
    min-height: 15rem;
  }

  .keyboard-hint {
    display: none;
  }

  .event-controls button {
    padding: 0.6rem;
    font-size: 0.9rem;
  }

  .navigator-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.35rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
