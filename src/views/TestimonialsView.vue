<script setup>
import { ref, onMounted } from 'vue'
import HelloWorld from '@/components/HelloWorld.vue'

const currentSlide = ref(0)
const isAutoPlaying = ref(true)
const testimonialRefs = ref([])

// Group testimonials by length for better layout
const testimonials = ref([
  {
    id: 1,
    name: 'Pierre Noujeim',
    title: 'Security Engineer at D3 Security',
    quote:
      'Prasenjit is the definition of multi-talented. A medical doctor, DJ, and software developer. All very impressive traits.',
    fullQuote:
      'Prasenjit is the definition of multi-talented. A medical doctor, DJ, and software developer. All very impressive traits. I worked with Prasenjit for over a year and a half where he oversaw the development of a nation-wide pool artists, curating for top talent and potential. He was organized, timely, professional, and smart. I would recommend him for any team.',
    category: 'featured',
    rating: 5
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
    rating: 5
  },
  {
    id: 3,
    name: 'Jimi Cohen',
    title: 'Innovating with AI | GUINNESS WORLD RECORD Holder',
    quote:
      "Dr. Das is the only human I've ever met who codes, produces phenomenal music, DJs like a pro AND is a licensed doctor!",
    fullQuote:
      "Dr. Das is the only human I've ever met who codes, produces phenomenal music, DJs like a pro AND is a licensed doctor! So much talent in this one human, I'm consistently astounded and grateful to collaborate with such a fantastic mind.",
    category: 'featured',
    rating: 5
  },
  {
    id: 4,
    name: 'Aaron Cruz',
    title: 'Registered Social Worker | Counsellor | Post-Secondary Instructor',
    quote:
      "Prasun's foundational training, knowledge, and work ethic comes from achieving his Medical Doctorate but he is much more than a Doctor.",
    fullQuote:
      "I have no doubt in my mind that if you need any sort of helping hand, guide, or knowledge on any given topics. Mr. Prasenjit Das (Prasun) is the man you need to help excel and refine your skills, improve quality of understanding in any topic, provide efficiency in any project or business, and if you need an event with amazing music and unique stage presence; Prasun is your man. Prasun's foundational training, knowledge, and work ethic comes from achieving his Medical Doctorate but he is much more than a Doctor.",
    category: 'featured',
    rating: 5
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
    rating: 5
  },
  {
    id: 6,
    name: 'Brandon Brown',
    title: 'Curator at SolSask, Owner at Crow Carpentry',
    quote:
      "Prasun Das, as both a musician and a technical director is one of the most passionate, committed individuals I've ever had the pleasure of working with.",
    fullQuote:
      "I have worked with Prasenjit on several events over the course of the years that we've known each other. From small, one night events for 50 people, to a multi-day music festival with over 40 change-overs, Prasun Das, as both a musician and a technical director is one of the most passionate, committed individuals I've ever had the pleasure of working with. Prasun is a technical, funky keyboardist, an astute sound technician, and his level of professionalism meshes with the soundscapes to transform audiences. Truly a visionary.",
    category: 'events'
  },
  {
    id: 7,
    name: 'Brandon Kazakoff',
    title: 'Entrepreneur',
    quote: 'Prasun is a multifaceted individual, and has exemplary skills in anything he pursues.',
    category: 'quick'
  },
  {
    id: 8,
    name: 'Dale Monette, CPA, CA, MPAcc',
    title: 'Executive Leadership | Growth Catalyst | Entrepreneur',
    quote: 'Prasun is a very accomplished individual - he is blessed with a truly inspiring mind.',
    category: 'quick'
  },
  {
    id: 9,
    name: 'Kala Sidhu',
    title: 'Event Organizer',
    quote:
      "Das Record is one of the most professional but, more importantly, inspired musicians I've ever worked with.",
    category: 'events'
  },
  {
    id: 10,
    name: 'Jessica Noujeim',
    title: 'High-Level Remote Communications Expert | Writer, Branding Specialist',
    quote:
      'Prasun is one of the most brilliant individuals I know. His mental aptitude is matched only by his warm heart and stellar communication skills.',
    category: 'featured'
  }
])

const featuredTestimonials = ref(testimonials.value.filter((t) => t.category === 'featured'))

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % featuredTestimonials.value.length
}

const prevSlide = () => {
  currentSlide.value =
    currentSlide.value === 0 ? featuredTestimonials.value.length - 1 : currentSlide.value - 1
}

const goToSlide = (index) => {
  currentSlide.value = index
}

const toggleAutoPlay = () => {
  isAutoPlaying.value = !isAutoPlaying.value
}

onMounted(() => {
  // Auto-play carousel
  setInterval(() => {
    if (isAutoPlaying.value) {
      nextSlide()
    }
  }, 5000)
})
</script>
<template>
  <div class="testimonials-container">
    <HelloWorld msg="What People Are Saying" />

    <!-- Featured Testimonials Carousel -->
    <section class="featured-section">
      <h2 class="section-title">Featured Reviews</h2>
      <div class="carousel-container">
        <div
          class="carousel"
          @mouseenter="isAutoPlaying = false"
          @mouseleave="isAutoPlaying = true"
        >
          <div class="carousel-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div
              v-for="(testimonial, index) in featuredTestimonials"
              :key="testimonial.id"
              class="carousel-slide"
              :class="{ active: index === currentSlide }"
            >
              <div class="testimonial-card featured">
                <div class="quote-icon">❝</div>
                <blockquote class="quote">
                  {{ testimonial.fullQuote || testimonial.quote }}
                </blockquote>
                <div class="rating" v-if="testimonial.rating">
                  <span v-for="star in testimonial.rating" :key="star" class="star">★</span>
                </div>
                <div class="author">
                  <div class="author-info">
                    <h3 class="author-name">{{ testimonial.name }}</h3>
                    <p class="author-title">{{ testimonial.title }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Carousel Controls -->
        <button @click="prevSlide" class="carousel-btn prev" aria-label="Previous testimonial">
          ‹
        </button>
        <button @click="nextSlide" class="carousel-btn next" aria-label="Next testimonial">
          ›
        </button>

        <!-- Carousel Indicators -->
        <div class="carousel-indicators">
          <button
            v-for="(testimonial, index) in featuredTestimonials"
            :key="testimonial.id"
            @click="goToSlide(index)"
            class="indicator"
            :class="{ active: index === currentSlide }"
            :aria-label="`Go to testimonial ${index + 1}`"
          ></button>
        </div>

        <!-- Auto-play Toggle -->
        <button @click="toggleAutoPlay" class="autoplay-toggle" :class="{ active: isAutoPlaying }">
          {{ isAutoPlaying ? '⏸️' : '▶️' }}
        </button>
      </div>
    </section>

    <!-- All Testimonials Grid -->
    <section class="grid-section">
      <h2 class="section-title">All Reviews</h2>
      <div class="testimonials-grid">
        <div
          v-for="testimonial in testimonials"
          :key="testimonial.id"
          class="testimonial-card"
          :class="[testimonial.category, { featured: testimonial.category === 'featured' }]"
        >
          <div class="card-header">
            <div class="author-avatar">
              {{
                testimonial.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
              }}
            </div>
            <div class="author-info">
              <h3 class="author-name">{{ testimonial.name }}</h3>
              <p class="author-title">{{ testimonial.title }}</p>
            </div>
          </div>

          <blockquote class="quote">"{{ testimonial.quote }}"</blockquote>

          <div class="card-footer">
            <div class="rating" v-if="testimonial.rating">
              <span v-for="star in testimonial.rating" :key="star" class="star">★</span>
            </div>
            <div class="category-badge" :class="testimonial.category">
              {{
                testimonial.category === 'featured'
                  ? '🌟 Featured'
                  : testimonial.category === 'events'
                    ? '🎪 Events'
                    : '💬 Quick'
              }}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.testimonials-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  min-height: 100vh;
}

/* Section Titles */
.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin: 3rem 0 2rem;
  background: linear-gradient(45deg, #00d4ff, #9c27b0, #ff6ec7);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Featured Carousel Section */
.featured-section {
  margin-bottom: 4rem;
}

.carousel-container {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 212, 255, 0.2);
}

.carousel {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.carousel-track {
  display: flex;
  transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.carousel-slide {
  min-width: 100%;
  padding: 3rem;
  opacity: 0.8;
  transition: opacity 0.8s ease;
}

.carousel-slide.active {
  opacity: 1;
}

.testimonial-card.featured {
  text-align: center;
  color: white;
}

.quote-icon {
  font-size: 4rem;
  color: #00d4ff;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.quote {
  font-size: 1.3rem;
  line-height: 1.8;
  font-style: italic;
  margin: 2rem 0;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 300;
}

.rating {
  margin: 1.5rem 0;
}

.star {
  color: #ffd700;
  font-size: 1.5rem;
  margin: 0 0.1rem;
  animation: sparkle 2s infinite;
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.author-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #00d4ff;
  margin: 0.5rem 0;
}

.author-title {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* Carousel Controls */
.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 212, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.carousel-btn:hover {
  background: rgba(0, 212, 255, 1);
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 10px 25px rgba(0, 212, 255, 0.4);
}

.carousel-btn.prev {
  left: 20px;
}

.carousel-btn.next {
  right: 20px;
}

/* Carousel Indicators */
.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: #00d4ff;
  transform: scale(1.3);
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.6);
}

/* Auto-play Toggle */
.autoplay-toggle {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 25px;
  padding: 0.5rem 1rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.autoplay-toggle.active {
  background: rgba(0, 212, 255, 0.6);
}

/* Grid Section */
.grid-section {
  margin-top: 4rem;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.testimonial-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  color: white;
}

.testimonial-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #00d4ff, #9c27b0, #ff6ec7);
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.testimonial-card:hover::before {
  transform: scaleX(1);
}

.testimonial-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 25px 50px rgba(0, 212, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.4);
}

.testimonial-card.featured {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(156, 39, 176, 0.1));
  border-color: rgba(0, 212, 255, 0.3);
}

.testimonial-card.events {
  background: linear-gradient(135deg, rgba(255, 110, 199, 0.15), rgba(156, 39, 176, 0.1));
  border-color: rgba(255, 110, 199, 0.3);
}

.testimonial-card.quick {
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.15), rgba(0, 212, 255, 0.1));
  border-color: rgba(156, 39, 176, 0.3);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(45deg, #00d4ff, #9c27b0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  margin-right: 1rem;
  font-size: 1.1rem;
}

.author-info {
  flex: 1;
}

.card-header .author-name {
  font-size: 1.2rem;
  margin: 0;
  color: #00d4ff;
}

.card-header .author-title {
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.7);
}

.testimonial-card .quote {
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 1.5rem 0;
  color: rgba(255, 255, 255, 0.9);
  font-style: italic;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.category-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.category-badge.featured {
  background: rgba(0, 212, 255, 0.2);
  color: #00d4ff;
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.category-badge.events {
  background: rgba(255, 110, 199, 0.2);
  color: #ff6ec7;
  border: 1px solid rgba(255, 110, 199, 0.3);
}

.category-badge.quick {
  background: rgba(156, 39, 176, 0.2);
  color: #9c27b0;
  border: 1px solid rgba(156, 39, 176, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .testimonials-container {
    padding: 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .carousel-slide {
    padding: 2rem 1.5rem;
  }

  .quote {
    font-size: 1.1rem;
  }

  .testimonials-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .carousel-btn {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .carousel-btn.prev {
    left: 10px;
  }

  .carousel-btn.next {
    right: 10px;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .carousel-track {
    transition: none;
  }

  .testimonial-card {
    transition: none;
  }

  .star {
    animation: none;
  }

  .section-title {
    animation: none;
  }
}
</style>
