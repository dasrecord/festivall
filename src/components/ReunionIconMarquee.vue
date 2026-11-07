<script setup>
defineProps({
  group: { type: Object, required: true },
  reverse: { type: Boolean, default: false },
  team: { type: Boolean, default: false }
})
</script>

<template>
  <div class="icon-marquee" :class="{ 'team-marquee': team }">
    <div class="marquee-heading">
      <h3>{{ group.title }}</h3>
      <RouterLink v-if="team" to="/reunionteam">Meet the team <span aria-hidden="true">↗</span></RouterLink>
    </div>
    <div class="marquee-window" tabindex="0" :aria-label="group.title">
      <div class="marquee-track" :class="{ reverse }">
        <div v-for="copy in 2" :key="copy" class="marquee-set" :aria-hidden="copy === 2 ? 'true' : undefined">
          <div v-for="item in group.items" :key="item.name" class="marquee-item">
            <img :src="item.icon" alt="" />
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon-marquee {
  border-top: 1px solid var(--reunion-border);
}

h3 {
  color: var(--reunion-accent);
  font: 600 0.68rem/1.2 Arial, sans-serif;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.marquee-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem var(--reunion-page-gutter) 0;
}

.marquee-heading a {
  color: var(--reunion-accent);
  font: 400 0.75rem/1.2 var(--reunion-body-font);
  white-space: nowrap;
}

.marquee-heading a:focus-visible {
  outline: 2px solid var(--reunion-gold);
  outline-offset: 3px;
}

.marquee-window {
  overflow: hidden;
}

.marquee-track {
  display: flex;
  width: max-content;
  animation: drift 100s linear infinite;
}

.marquee-track.reverse {
  animation-direction: reverse;
}

.marquee-set {
  display: flex;
  flex-shrink: 0;
  justify-content: space-around;
  min-width: 100vw;
}

.marquee-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1.4rem 1.6rem;
  color: var(--reunion-text);
  font: 400 1rem/1.2 var(--reunion-body-font);
  white-space: nowrap;
  text-transform: capitalize;
}

.marquee-item img {
  width: 2.4rem;
  height: 2.4rem;
  object-fit: contain;
}

.team-marquee .marquee-item {
  gap: 0.75rem;
  padding: 1rem 1.4rem;
  font-size: 0.88rem;
  text-transform: none;
}

.team-marquee .marquee-item img {
  width: 3rem;
  height: 3rem;
  border: 1px solid var(--reunion-border-strong);
  border-radius: 50%;
  object-fit: cover;
}

@keyframes drift {
  to { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-window { overflow-x: auto; }
  .marquee-track { animation: none; }
  .marquee-set[aria-hidden='true'] { display: none; }
}
</style>
