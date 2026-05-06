<template>
  <div class="basic">
    <CountdownTimer />
    <img
      :src="reunion_emblem"
      alt="reunion"
      class="reunion-emblem"
      style="max-width: 600px; height: auto; cursor: pointer"
      @click="$router.push('/reunion')"
    />
    <h2>About Our Festival</h2>
    <h3>
      The Reunion is Saskatchewan's only family friendly electronic music festival — and we've built
      it from the ground up to prove it. Set just outside Saskatoon, we celebrate the region's best
      electronic artists with a custom built sound system, projection mapped visuals, and a Festival
      FM radio broadcast. Off the dancefloor, there's a retro arcade, Nerf battle arena, kids'
      playground, wading pool, warm showers, live workshops, art installations, and a scavenger hunt
      with Bitcoin prizes. Arrive through our self check-in kiosk, navigate with our interactive
      grounds map, and stay in touch via text notifications. This is grassroots done differently.<br /><br />
    </h3>

    <StoriesHighlights :groups="storyGroups" />
    <!-- CAROUSEL <CarouselComponent :slides="slides" :interval="3600" controls indicators></CarouselComponent> CAROUSEL -->
    <DetailsPanel>
      <template #link1>
        <RouterLink to="/reunionfamily">Learn more</RouterLink>
      </template>
      <template #link2>
        <RouterLink to="/reunionteam">Meet the team</RouterLink>
      </template>
      <template #link3>
        <RouterLink to="/reunionsoundsystem">our custom soundsystem.</RouterLink>
      </template>
      <template #link4>
        <RouterLink to="/reunionamenities">amenities.</RouterLink>
      </template>
    </DetailsPanel>
    <CalltoAction />
  </div>
</template>

<script>
import CountdownTimer from '@/components/CountdownTimer.vue'
// CAROUSEL import CarouselComponent from '@/components/carousel/CarouselComponent.vue' CAROUSEL
import DetailsPanel from '@/components/DetailsPanel.vue'
import CalltoAction from '@/components/CalltoAction.vue'
import StoriesHighlights from '@/components/StoriesHighlights.vue'
import reunion_emblem from '@/assets/images/reunion_emblem_white.png'
import { analyticsMixin } from '@/mixins/analytics.js'

import thumb1 from '@/assets/images/reunion_about/thumbnails/reunion_story_thumbnails-1-our_story.png'
import thumb2 from '@/assets/images/reunion_about/thumbnails/reunion_story_thumbnails-2-three_families.png'
import thumb3 from '@/assets/images/reunion_about/thumbnails/reunion_story_thumbnails-3-build_something.png'
import thumb4 from '@/assets/images/reunion_about/thumbnails/reunion_story_thumbnails-4-events.png'
import thumb5 from '@/assets/images/reunion_about/thumbnails/reunion_story_thumbnails-5-learning.png'
import thumb6 from '@/assets/images/reunion_about/thumbnails/reunion_story_thumbnails-6-the_magic.png'
import thumb7 from '@/assets/images/reunion_about/thumbnails/reunion_story_thumbnails-7-scavenger_hunt.png'
import thumb8 from '@/assets/images/reunion_about/thumbnails/reunion_story_thumbnails-8-new_features.png'

// CAROUSEL const images = import.meta.glob('@/assets/images/reunion_about/*.jpg') CAROUSEL

export default {
  mixins: [analyticsMixin],
  components: {
    CountdownTimer,
    // CAROUSEL CarouselComponent, CAROUSEL
    StoriesHighlights,
    DetailsPanel,
    CalltoAction
  },
  data() {
    return {
      reunion_emblem,
      // CAROUSEL slides: [], CAROUSEL
      storyGroups: [
        { label: 'Our Story',       thumb: thumb1, url: 'https://www.instagram.com/stories/highlights/18072141676939371/' },
        { label: 'Three Families',  thumb: thumb2, url: 'https://www.instagram.com/stories/highlights/18004709648616914/' },
        { label: 'Build Something', thumb: thumb3, url: 'https://www.instagram.com/stories/highlights/18076507999907549/' },
        { label: 'Events',          thumb: thumb4, url: 'https://www.instagram.com/stories/highlights/18044287133275354/' },

        { label: 'The Magic',       thumb: thumb6, url: 'https://www.instagram.com/stories/highlights/18066522173133927/' },

        { label: 'New Features',    thumb: thumb8, url: 'https://www.instagram.com/stories/highlights/17992549121821119/' }
      ]
    }
  },
  async created() {
    // Track page view
    this.trackPageView('Reunion Family', 'reunion')

    // CAROUSEL
    // for (const path in images) {
    //   const image = await images[path]()
    //   this.slides.push(image.default)
    // }
    // CAROUSEL
  }
}
</script>

<style scoped>
.basic,
h2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  text-align: center;
}

.carousel-wrapper {
  margin: 2rem auto;
  max-width: 800px;
}
img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}
.reunion-emblem {
  width: 100%;
  height: auto;
}

@media (max-width: 600px) {
  .basic {
    padding: 0.5rem;
  }

  .carousel-wrapper {
    max-width: 100%; /* Allow the carousel to take full width on smaller screens */
  }

  h2 {
    font-size: 1.2rem; /* Adjust font size for smaller screens */
  }
}
</style>
