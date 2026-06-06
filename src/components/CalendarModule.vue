<template>
  <div class="calendar-module">
    <!-- Loading State -->
    <div v-if="loading" class="loading">Loading events...</div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <!-- Events List -->
    <div v-else class="events-list">
      <template v-if="events.length">
        <div
          v-for="(item, idx) in flatSlots"
          :key="item.id + '-' + (item.settimes && item.settimes[0])"
          class="event-item"
          :class="{ 'is-now': idx === currentSlotIndex }"
        >
          <!-- Red time line inside the current event -->
          <div v-if="idx === currentSlotIndex" class="time-line">
            <span class="time-line-label">NOW</span>
          </div>

          <!-- Type icon -->
          <img
            :src="item.is_workshop ? workshop_icon : dj_icon"
            class="type-icon"
            :alt="item.is_workshop ? 'Workshop' : 'DJ'"
          />

          <!-- Single set time -->
          <div class="event-time">
            <h3 class="set-time">
              {{ formatTime(item.settimes[0]) }}
            </h3>
            <a
              v-if="item.mix_track_url"
              :href="item.mix_track_url"
              target="_blank"
              rel="noopener noreferrer"
              class="mix-track-link"
            >
              LISTEN
              <img :src="listen_icon" alt="Listen" class="icon" />
            </a>
            <p v-if="item.social_url">
              <a
                :href="item.social_url"
                target="_blank"
                rel="noopener noreferrer"
                class="mix-track-link"
              >
                SOCIALS
                <img :src="link_icon" alt="Link" class="icon" />
              </a>
            </p>
          </div>

          <!-- Event Details -->
          <div class="event-details">
            <div class="event-details-header">
              <h3 class="artist-name">
                {{ item.act_name || item.workshop_title || 'Untitled Event' }}
              </h3>
              <button
                class="star-btn"
                :class="{ starred: isStarred(slotKey(item)) }"
                :aria-label="isStarred(slotKey(item)) ? 'Remove from My Schedule' : 'Add to My Schedule'"
                @click="toggleStar(slotKey(item))"
              >
                {{ isStarred(slotKey(item)) ? '★' : '☆' }}
              </button>
            </div>
            <p v-if="item.genre" class="event-genre">{{ item.genre }}</p>
            <div
              class="event-desc"
              :class="{ expanded: expandedSlots.has(slotKey(item)) }"
            >
              {{ item.act_description || item.workshop_description || '' }}
            </div>
            <button
              v-if="(item.act_description || item.workshop_description)"
              class="expand-btn"
              @click="toggleExpand(slotKey(item))"
            >
              {{ expandedSlots.has(slotKey(item)) ? 'Less ▲' : 'More ▼' }}
            </button>
          </div>
        </div>
      </template>
      <p v-else class="no-events">No events scheduled for this day.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import link_icon from '@/assets/images/icons/link.png'
import listen_icon from '@/assets/images/icons/mix_track.png'
import dj_icon from '@/assets/images/icons/dj.png'
import workshop_icon from '@/assets/images/icons/workshop.png'
import { useLineupState } from '@/composables/useLineupState'

const { toggleStar, isStarred } = useLineupState()

const props = defineProps({
  events: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

// Reactive clock for the time line
const now = ref(Date.now())
let clockInterval = null

onMounted(() => {
  clockInterval = setInterval(() => {
    now.value = Date.now()
  }, 60_000)
})

onUnmounted(() => {
  clearInterval(clockInterval)
})

// Flatten: one slot per settime
const flatSlots = computed(() => {
  const slots = []
  for (const event of props.events) {
    const types = Array.isArray(event.set_types) ? event.set_types : []
    for (let i = 0; i < event.settimes.length; i++) {
      const slotType = types[i] || (event.is_workshop ? 'workshop' : 'act')
      const isWorkshop = slotType === 'workshop'
      slots.push({
        ...event,
        settimes:   [event.settimes[i]],
        is_workshop: isWorkshop,
        // For dual participants, pick the right display name per slot
        act_name: isWorkshop
          ? (event.workshop_title || event.act_name)
          : (event.act_name || event.workshop_title)
      })
    }
  }
  slots.sort((a, b) => new Date(a.settimes[0]).getTime() - new Date(b.settimes[0]).getTime())
  return slots
})

// Time line position
const timeLineInsertIndex = computed(() => {
  if (!flatSlots.value.length) return -1

  const firstStart = new Date(flatSlots.value[0].settimes[0]).getTime()
  const lastStart = new Date(flatSlots.value[flatSlots.value.length - 1].settimes[0]).getTime()
  const dayEnd = lastStart + 90 * 60 * 1000

  if (now.value < firstStart || now.value >= dayEnd) return -1

  let insertAfter = -1
  for (let i = 0; i < flatSlots.value.length; i++) {
    const start = new Date(flatSlots.value[i].settimes[0]).getTime()
    if (start <= now.value) {
      insertAfter = i
    } else {
      break
    }
  }
  return insertAfter
})

// Current slot index (which event card gets the inline time line)
const currentSlotIndex = computed(() => timeLineInsertIndex.value)

// Per-slot unique key used for starring
const slotKey = (item) => `${item.id}::${item.settimes[0]}`

// Collapsible descriptions
const expandedSlots = ref(new Set())
function toggleExpand(key) {
  const s = new Set(expandedSlots.value)
  if (s.has(key)) s.delete(key)
  else s.add(key)
  expandedSlots.value = s
}

// Time formatting
const formatTime = (timestamp) => {
  if (!timestamp) return 'TBA'
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}
</script>

<style scoped>
.calendar-module {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.loading,
.error,
.no-events {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #dc3545;
}

.events-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.event-item {
  position: relative;
  display: grid;
  grid-template-columns: 40px 1.6fr 3fr;
  align-items: start;
  gap: 0.2rem;
  margin-top: 0.4rem;
  padding: 0.65rem 0.75rem;
  min-height: 80px;
  border-top: 1px solid #fff;
  border-bottom: 1px solid #fff;
  border-radius: 10px;
  box-sizing: border-box;
}

.time-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 1;
}

.time-line::before {
  content: '';
  flex: 1;
  height: 2px;
  background: #e53935;
  box-shadow: 0 0 6px rgba(229, 57, 53, 0.7);
}

.time-line-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #e53935;
  padding: 0 6px;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.time-line::after {
  content: '';
  flex: 1;
  height: 2px;
  background: #e53935;
  box-shadow: 0 0 6px rgba(229, 57, 53, 0.7);
}

.event-details-header {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.type-icon {
  /* margin-left: 1rem; */
  width: 32px;
  height: 32px;
  opacity: 0.75;
  flex-shrink: 0;
  align-self: center;
}

.star-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.6rem;
  line-height: 1;
  color: #fff;
  padding: 0;
  flex-shrink: 0;
  transition: color 0.15s;
}

.star-btn.starred {
  color: #f5c518;
}

.event-time {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 80px;
  gap: 0.25rem;
}

.event-details {
  flex: 1;
  min-width: 0;
}

.event-details h3 {
  margin: 0 0 0.25rem 0;
}

.event-genre {
  font-size: 0.72rem;
  color: #aaa;
  margin: 0 0 0.2rem;
}

.event-desc {
  font-size: 0.8rem;
  color: #ccc;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-desc.expanded {
  display: block;
  overflow: visible;
  -webkit-line-clamp: unset;
  line-clamp: unset;
}

.expand-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 0.68rem;
  cursor: pointer;
  padding: 0.15rem 0;
  margin-top: 0.1rem;
}

.expand-btn:hover {
  color: #ccc;
}

.set-time {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0;
}

.artist-name {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 0 0.3rem;
}

.mix-track-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  text-decoration: none;
  color: white;
  border: 1px solid rgba(0, 255, 0);
  cursor: pointer;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.icon {
  width: 24px;
  height: auto;
}
</style>
