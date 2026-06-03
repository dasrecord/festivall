<template>
  <div class="testimonials-page">

    <!-- HERO -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-badge">VOICES &nbsp;·&nbsp; UNFILTERED</div>
        <h1>What People Are Saying</h1>
        <p class="tagline">
          A decade of collaboration across music, medicine, code, and creative production.<br />
          These are the people who actually know how I work.
        </p>
      </div>
    </section>

    <!-- FEATURED CAROUSEL -->
    <section class="featured">
      <div class="section-inner">
        <h2>Featured Reviews</h2>
        <div
          class="carousel"
          @mouseenter="isAutoPlaying = false"
          @mouseleave="isAutoPlaying = true"
        >
          <button
            @click="prevSlide"
            class="carousel-nav prev"
            aria-label="Previous testimonial"
          >‹</button>

          <div class="carousel-viewport">
            <div
              class="carousel-track"
              :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
            >
              <article
                v-for="t in featuredTestimonials"
                :key="t.id"
                class="featured-card"
              >
                <div class="quote-mark">"</div>
                <blockquote>{{ t.fullQuote || t.quote }}</blockquote>
                <div class="rating" v-if="t.rating">
                  <span v-for="star in t.rating" :key="star" class="star">★</span>
                </div>
                <cite class="featured-cite">
                  <strong>{{ t.name }}</strong>
                  <span>{{ t.title }}</span>
                </cite>
              </article>
            </div>
          </div>

          <button
            @click="nextSlide"
            class="carousel-nav next"
            aria-label="Next testimonial"
          >›</button>
        </div>

        <div class="carousel-indicators">
          <button
            v-for="(t, i) in featuredTestimonials"
            :key="t.id"
            @click="goToSlide(i)"
            class="dot"
            :class="{ active: i === currentSlide }"
            :aria-label="`Go to testimonial ${i + 1}`"
          ></button>
        </div>
      </div>
    </section>

    <!-- ALL REVIEWS GRID -->
    <section class="all-reviews">
      <div class="section-inner">
        <h2>All Reviews</h2>
        <div class="filter-bar">
          <button
            v-for="cat in categories"
            :key="cat.key"
            class="filter-pill"
            :class="{ active: activeFilter === cat.key }"
            @click="activeFilter = cat.key"
          >
            {{ cat.label }}
            <span class="filter-count">{{ cat.count }}</span>
          </button>
        </div>

        <div class="reviews-grid">
          <article
            v-for="t in filteredTestimonials"
            :key="t.id"
            class="review-card"
            :class="t.category"
          >
            <header class="review-head">
              <div class="avatar">{{ initials(t.name) }}</div>
              <div class="review-meta">
                <strong>{{ t.name }}</strong>
                <span>{{ t.title }}</span>
              </div>
            </header>
            <blockquote>"{{ t.quote }}"</blockquote>
            <footer class="review-foot">
              <span class="rating-small" v-if="t.rating">
                <span v-for="star in t.rating" :key="star">★</span>
              </span>
              <span class="cat-tag" :class="t.category">{{ categoryLabel(t.category) }}</span>
            </footer>
          </article>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useHead } from '@vueuse/head'

useHead({
  title: 'Testimonials — Prasenjit Das · Festivall',
  meta: [
    {
      name: 'description',
      content:
        'Reviews and testimonials from collaborators across music, medicine, technology, and live events.',
    },
  ],
})

interface Testimonial {
  id: number
  name: string
  title: string
  quote: string
  fullQuote?: string
  category: 'featured' | 'events' | 'quick'
  rating?: number
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Pierre Noujeim',
    title: 'Security Engineer at D3 Security',
    quote:
      'Prasenjit is the definition of multi-talented. A medical doctor, DJ, and software developer.',
    fullQuote:
      'Prasenjit is the definition of multi-talented. A medical doctor, DJ, and software developer. All very impressive traits. I worked with Prasenjit for over a year and a half where he oversaw the development of a nation-wide pool of artists, curating for top talent and potential. He was organized, timely, professional, and smart. I would recommend him for any team.',
    category: 'featured',
    rating: 5,
  },
  {
    id: 2,
    name: 'Mike Saint-Jules',
    title: 'Music Producer / Engineer',
    quote:
      'Prasenjit has always demonstrated great workmanship and great spirits when working together in the studio.',
    fullQuote:
      "It's my pleasure to offer my recommendation for Prasenjit Das. Over the last several years, Prasenjit has always demonstrated great workmanship and great spirits when working together in the studio. He's also a person that you can learn from and that's the kind of person you want on your team. Prasenjit is an asset to any team, organization, you name it. He has a strong passion for the music industry and his skillset outputs the right amount of soul that will entice anyone to get close to him.",
    category: 'featured',
    rating: 5,
  },
  {
    id: 3,
    name: 'Jimi Cohen',
    title: 'Innovating with AI | Serial Enterpreneur',
    quote:
      "Dr. Das is the only human I've ever met who codes, produces phenomenal music, DJs like a pro AND is a licensed doctor!",
    fullQuote:
      "Dr. Das is the only human I've ever met who codes, produces phenomenal music, DJs like a pro AND is a licensed doctor! So much talent in this one human, I'm consistently astounded and grateful to collaborate with such a fantastic mind.",
    category: 'featured',
    rating: 5,
  },
  {
    id: 4,
    name: 'Aaron Cruz',
    title: 'Registered Social Worker · Counsellor · Post-Secondary Instructor',
    quote:
      "Prasun's foundational training, knowledge, and work ethic comes from achieving his Medical Doctorate but he is much more than a Doctor.",
    fullQuote:
      "I have no doubt in my mind that if you need any sort of helping hand, guide, or knowledge on any given topic, Prasenjit Das (Prasun) is the man you need to help excel and refine your skills, improve quality of understanding in any topic, provide efficiency in any project or business, and if you need an event with amazing music and unique stage presence; Prasun is your man. Prasun's foundational training, knowledge, and work ethic comes from achieving his Medical Doctorate — but he is much more than a Doctor.",
    category: 'featured',
    rating: 5,
  },
  {
    id: 5,
    name: 'Daniel Martell-Gardiner',
    title: 'Senior Music Industry Executive & Strategist',
    quote:
      "This incredibly gifted, young, musical professional is a very rare find in today's world make no mistake.",
    fullQuote:
      'It is fair to say that Prasenjit Das is not only a highly intuitive musician, composer and accomplished pianist, but his musical talents and incredibly unique performance ability within the live arena and in studios can light up even the most near complete projects and compositional ideas. This young man knows no bounds and the very creativity by which he lives, eats, sleeps and breathes is simply formidable and a real thing of beauty to behold.',
    category: 'featured',
    rating: 5,
  },
  {
    id: 6,
    name: 'Brandon Brown',
    title: 'Curator at SolSask · Owner at Crow Carpentry',
    quote:
      "Prasun Das, as both a musician and a technical director, is one of the most passionate, committed individuals I've ever had the pleasure of working with.",
    fullQuote:
      "I have worked with Prasenjit on several events over the course of the years that we've known each other. From small, one-night events for 50 people to a multi-day music festival with over 40 change-overs, Prasun Das, as both a musician and a technical director, is one of the most passionate, committed individuals I've ever had the pleasure of working with. Prasun is a technical, funky keyboardist, an astute sound technician, and his level of professionalism meshes with the soundscapes to transform audiences. Truly a visionary.",
    category: 'events',
  },
  {
    id: 7,
    name: 'Brandon Kazakoff',
    title: 'Entrepreneur',
    quote: 'Prasun is a multifaceted individual, and has exemplary skills in anything he pursues.',
    category: 'quick',
  },
  {
    id: 8,
    name: 'Dale Monette, CPA, CA, MPAcc',
    title: 'Executive Leadership · Growth Catalyst · Entrepreneur',
    quote:
      'Prasun is a very accomplished individual — he is blessed with a truly inspiring mind.',
    category: 'quick',
  },
  {
    id: 9,
    name: 'Kala Sidhu',
    title: 'Event Organizer',
    quote:
      "Das Record is one of the most professional but, more importantly, inspired musicians I've ever worked with.",
    category: 'events',
  },
  {
    id: 10,
    name: 'Jessica Noujeim',
    title: 'High-Level Remote Communications Expert · Writer · Branding Specialist',
    quote:
      'Prasun is one of the most brilliant individuals I know. His mental aptitude is matched only by his warm heart and stellar communication skills.',
    category: 'featured',
  },
]

const featuredTestimonials = computed(() =>
  testimonials.filter((t) => t.category === 'featured'),
)

const activeFilter = ref<'all' | 'featured' | 'events' | 'quick'>('all')

const categories = computed(() => [
  { key: 'all' as const, label: 'All', count: testimonials.length },
  {
    key: 'featured' as const,
    label: 'Featured',
    count: testimonials.filter((t) => t.category === 'featured').length,
  },
  {
    key: 'events' as const,
    label: 'Events',
    count: testimonials.filter((t) => t.category === 'events').length,
  },
  {
    key: 'quick' as const,
    label: 'Quick',
    count: testimonials.filter((t) => t.category === 'quick').length,
  },
])

const filteredTestimonials = computed(() =>
  activeFilter.value === 'all'
    ? testimonials
    : testimonials.filter((t) => t.category === activeFilter.value),
)

const initials = (name: string) =>
  name
    .split(' ')
    .filter((p) => /^[A-Z]/.test(p))
    .map((p) => p[0])
    .slice(0, 2)
    .join('')

const categoryLabel = (c: string) =>
  c === 'featured' ? 'Featured' : c === 'events' ? 'Events' : 'Quick'

// ── Carousel ─────────────────────────────────────────────
const currentSlide = ref(0)
const isAutoPlaying = ref(true)

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % featuredTestimonials.value.length
}
const prevSlide = () => {
  const len = featuredTestimonials.value.length
  currentSlide.value = (currentSlide.value - 1 + len) % len
}
const goToSlide = (i: number) => {
  currentSlide.value = i
}

let autoTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  autoTimer = setInterval(() => {
    if (isAutoPlaying.value) nextSlide()
  }, 6000)
})
onBeforeUnmount(() => {
  if (autoTimer) clearInterval(autoTimer)
})
</script>

<style scoped>
/* ─── Global Layout (mirrors MedPrep) ───────────────────── */
.testimonials-page {
  background: #0d0d0d;
  color: #e8e8e8;
  font-family: 'Oswald', sans-serif;
  min-height: 100vh;
}

.section-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 80px 24px;
}

h2 {
  font-size: 2rem;
  color: #ffffff;
  letter-spacing: 0.04em;
  margin-bottom: 32px;
  text-transform: uppercase;
}

/* ─── Hero ───────────────────────────────────────────────── */
.hero {
  background: #0d0d0d;
  border-bottom: 1px solid #2a2a2a;
  padding: 100px 24px 80px;
}
.hero-inner {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}
.hero-badge {
  display: inline-block;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  color: var(--festivall-baby-blue, #81bdfe);
  border: 1px solid var(--festivall-baby-blue, #81bdfe);
  padding: 6px 16px;
  margin-bottom: 28px;
  text-transform: uppercase;
}
.hero h1 {
  font-size: clamp(2.4rem, 5vw, 4rem);
  color: #ffffff;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  margin-bottom: 20px;
  line-height: 1.1;
  font-family: 'Oswald', sans-serif;
}
.tagline {
  font-size: 1.05rem;
  color: #b0b0b0;
  line-height: 1.7;
  font-family: sans-serif;
  font-weight: 300;
}

/* ─── Featured Carousel ─────────────────────────────────── */
.featured {
  background: #111111;
  border-bottom: 1px solid #2a2a2a;
}

.carousel {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 12px;
}

.carousel-viewport {
  flex: 1;
  overflow: hidden;
  background: #181818;
  border: 1px solid #2a2a2a;
  border-radius: 2px;
  min-width: 0;
}

.carousel-track {
  display: flex;
  transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.featured-card {
  min-width: 100%;
  padding: 48px 56px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
}

.quote-mark {
  font-family: 'Oswald', sans-serif;
  font-size: 5rem;
  line-height: 0.4;
  color: var(--festivall-baby-blue, #81bdfe);
  opacity: 0.4;
  margin-top: 18px;
  height: 36px;
}

.featured-card blockquote {
  margin: 0;
  font-family: sans-serif;
  font-weight: 300;
  font-size: 1.15rem;
  line-height: 1.75;
  color: #e0e0e0;
  font-style: italic;
}

.rating {
  display: flex;
  gap: 3px;
}
.star {
  color: var(--festivall-baby-blue, #81bdfe);
  font-size: 1rem;
}

.featured-cite {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-left: 2px solid var(--festivall-baby-blue, #81bdfe);
  padding: 6px 0 6px 16px;
  font-style: normal;
  margin-top: 8px;
}
.featured-cite strong {
  font-size: 0.85rem;
  color: var(--festivall-baby-blue, #81bdfe);
  font-family: 'Oswald', sans-serif;
  letter-spacing: 0.08em;
  font-weight: 500;
  text-transform: uppercase;
}
.featured-cite span {
  font-size: 0.78rem;
  color: #888;
  font-family: sans-serif;
  font-weight: 300;
}

/* ── Nav arrows ─────────────────────────────────────────── */
.carousel-nav {
  flex: 0 0 44px;
  background: transparent;
  border: 1px solid #2a2a2a;
  color: var(--festivall-baby-blue, #81bdfe);
  font-size: 1.6rem;
  font-family: 'Oswald', sans-serif;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  line-height: 1;
}
.carousel-nav:hover {
  background: var(--festivall-baby-blue, #81bdfe);
  border-color: var(--festivall-baby-blue, #81bdfe);
  color: #0d0d0d;
}

/* ── Dots ───────────────────────────────────────────────── */
.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 28px;
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 1px solid #444;
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}
.dot.active {
  background: var(--festivall-baby-blue, #81bdfe);
  border-color: var(--festivall-baby-blue, #81bdfe);
  transform: scale(1.2);
}
.dot:hover {
  border-color: var(--festivall-baby-blue, #81bdfe);
}

/* ─── All Reviews ───────────────────────────────────────── */
.all-reviews {
  background: #0d0d0d;
  border-bottom: 1px solid #2a2a2a;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Oswald', sans-serif;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #888;
  background: transparent;
  border: 1px solid #2a2a2a;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 2px;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.filter-pill:hover {
  color: var(--festivall-baby-blue, #81bdfe);
  border-color: var(--festivall-baby-blue, #81bdfe);
}
.filter-pill.active {
  background: var(--festivall-baby-blue, #81bdfe);
  border-color: var(--festivall-baby-blue, #81bdfe);
  color: #0d0d0d;
}
.filter-count {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.72rem;
  font-weight: 500;
  opacity: 0.75;
}
.filter-pill.active .filter-count {
  opacity: 1;
}

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.review-card {
  background: #181818;
  border: 1px solid #2a2a2a;
  border-radius: 2px;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: border-color 0.2s, transform 0.2s;
}
.review-card:hover {
  border-color: #444;
  transform: translateY(-2px);
}
.review-card.featured {
  border-top: 2px solid var(--festivall-baby-blue, #81bdfe);
  background: #0c161f;
}

.review-head {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar {
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid var(--festivall-baby-blue, #81bdfe);
  color: var(--festivall-baby-blue, #81bdfe);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Oswald', sans-serif;
  font-weight: 500;
  font-size: 0.85rem;
  letter-spacing: 0.04em;
}

.review-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.review-meta strong {
  font-family: 'Oswald', sans-serif;
  font-size: 0.92rem;
  color: #ffffff;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.review-meta span {
  font-family: sans-serif;
  font-weight: 300;
  font-size: 0.78rem;
  color: #888;
  line-height: 1.4;
}

.review-card blockquote {
  margin: 0;
  font-family: sans-serif;
  font-weight: 300;
  font-style: italic;
  font-size: 0.94rem;
  line-height: 1.7;
  color: #c0c0c0;
}

.review-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #2a2a2a;
}
.rating-small {
  color: var(--festivall-baby-blue, #81bdfe);
  font-size: 0.85rem;
  letter-spacing: 1px;
}

.cat-tag {
  font-family: 'Oswald', sans-serif;
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 2px;
  border: 1px solid;
}
.cat-tag.featured {
  color: var(--festivall-baby-blue, #81bdfe);
  border-color: var(--festivall-baby-blue, #81bdfe);
}
.cat-tag.events,
.cat-tag.quick {
  color: #666;
  border-color: #2a2a2a;
}

/* ─── Responsive ─────────────────────────────────────────── */
@media (max-width: 700px) {
  .section-inner {
    padding: 56px 18px;
  }
  .hero {
    padding: 72px 18px 60px;
  }
  .featured-card {
    padding: 32px 24px;
  }
  .featured-card blockquote {
    font-size: 1rem;
    line-height: 1.65;
  }
  .carousel-nav {
    flex: 0 0 36px;
    font-size: 1.3rem;
  }
  .reviews-grid {
    grid-template-columns: 1fr;
  }
}
</style>
