<template>
  <div class="carousel">
    <div class="carousel-inner">
      <CarouselIndicators
        v-if="indicators"
        :total="slides.length"
        :current-index="currentSlide"
        @switch="switchSlide($event)"
      ></CarouselIndicators>
      <CarouselItem
        v-for="(slide, index) in slides"
        :slide="slide"
        :key="`item-${index}`"
        :current-slide="currentSlide"
        :index="index"
        :direction="direction"
        @mouseenter="stopSlideTimer"
        @mouseout="startSlideTimer"
      ></CarouselItem>
      <CarouselControls v-if="controls" @prev="prev" @next="next"></CarouselControls>
    </div>
  </div>
</template>

<script>
import CarouselItem from './CarouselItem.vue'
import CarouselControls from './CarouselControls.vue'
import CarouselIndicators from './CarouselIndicators.vue'

export default {
  props: {
    slides: {
      type: Array,
      required: true
    },
    controls: {
      type: Boolean,
      default: false
    },
    indicators: {
      type: Boolean,
      default: false
    },
    interval: {
      type: Number,
      default: 5000
    }
  },
  components: { CarouselItem, CarouselControls, CarouselIndicators },
  data: () => ({
    currentSlide: 0,
    slideInterval: null,
    direction: 'right'
  }),
  methods: {
    setCurrentSlide(index) {
      this.currentSlide = index
    },
    prev(step = -1) {
      const index = this.currentSlide > 0 ? this.currentSlide + step : this.slides.length - 1
      this.setCurrentSlide(index)
      this.direction = 'left'
      this.startSlideTimer()
    },
    _next(step = 1) {
      const index = this.currentSlide < this.slides.length - 1 ? this.currentSlide + step : 0
      this.setCurrentSlide(index)
      this.direction = 'right'
    },
    next(step = 1) {
      this._next(step)
      this.startSlideTimer()
    },
    startSlideTimer() {
      this.stopSlideTimer()
      this.slideInterval = setInterval(() => {
        this._next()
      }, this.interval)
    },
    stopSlideTimer() {
      clearInterval(this.slideInterval)
    },
    switchSlide(index) {
      const step = index - this.currentSlide
      if (step > 0) {
        this.next(step)
      } else {
        this.prev(step)
      }
    }
  },
  mounted() {
    this.startSlideTimer()
  },
  beforeUnmount() {
    this.stopSlideTimer()
  }
}
</script>

<style scoped>
.carousel {
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 10px; /* Optional: Add rounded corners */
}

.carousel-inner {
  display: flex;
  position: relative;
  width: 100%;
  height: 400px;
}

.carousel-inner img {
  width: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.carousel-controls {
  position: absolute;
  top: 50%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  transform: translateY(-50%);
  z-index: 10; /* Ensure controls are above other elements */
}

.carousel-controls button {
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
}

.carousel-controls button:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.carousel-indicators {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10; /* Ensure indicators are above other elements */
}

.carousel-indicators button {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
}

.carousel-indicators button.active {
  background-color: rgba(255, 255, 255, 1);
}

/* Mobile View Adjustments */
@media (max-width: 600px) {
  .carousel-inner {
    height: 250px; /* Reduce height for smaller screens */
  }

  .carousel-indicators button {
    width: 8px;
    height: 8px;
  }

  .carousel-controls {
    top: 45%; /* Adjust control position for smaller screens */
  }
}
</style>
