<template>
  <div class="calendar-module">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading">Loading calendar data...</div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <!-- Events List -->
    <div v-else class="events-list">
      <ul v-if="filteredEvents.length">
        <li v-for="event in filteredEvents" :key="event.uid" class="event-item">
          <div class="event-time">
            {{ formatTime(event.startDate) }}
          </div>

          <div class="event-details">
            <h3>{{ event.summary }}</h3>
            <p v-if="event.description">{{ event.description }}</p>

            <!-- Applicant Details -->
            <div v-if="event.applicant" class="applicant-details">
              <p v-if="event.applicant.name">Presenter: {{ event.applicant.name }}</p>
              <p v-if="event.applicant.type">Type: {{ event.applicant.type }}</p>

              <!-- Mix Track URL -->
              <a
                v-if="event.applicant.mixTrackUrl"
                :href="event.applicant.mixTrackUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="mix-track-link"
              >
                <img :src="music_icon" alt="Music" class="icon" />
                Listen to Mix
              </a>
            </div>
          </div>
        </li>
      </ul>
      <p v-else class="no-events">No events scheduled for this time period.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ICAL from 'ical.js'
import music_icon from '@/assets/images/icons/artist.png'

// Props
const props = defineProps({
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  filePath: {
    type: String,
    required: true
  }
})

// Reactive state
const events = ref([])
const isLoading = ref(false)
const error = ref(null)

// Time formatting utility
const formatTime = (date) => {
  if (!date) return 'TBA'
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

// Extract applicant data from X-APPLICANT-* fields
const extractApplicantData = (vevent) => {
  const applicant = {}
  const properties = vevent.getAllProperties()

  properties.forEach((prop) => {
    const name = prop.name
    if (name.startsWith('X-APPLICANT-')) {
      const key = name.replace('X-APPLICANT-', '').toLowerCase()
      const value = prop.getFirstValue()

      // Convert property names to camelCase
      const camelKey = key.toLowerCase().replace(/-(.)/g, (_, c) => c.toUpperCase())
      applicant[camelKey] = value || null
    }
  })

  return Object.keys(applicant).length ? applicant : null
}

// Parse individual event
const parseEvent = (vevent) => {
  const event = new ICAL.Event(vevent)
  const applicant = extractApplicantData(vevent)

  return {
    uid: event.uid,
    summary: event.summary,
    description: event.description,
    startDate: event.startDate?.toJSDate() || null,
    endDate: event.endDate?.toJSDate() || null,
    location: event.location,
    applicant
  }
}

// Fetch and parse ICS file
const fetchIcsFile = async (filePath) => {
  isLoading.value = true
  error.value = null

  try {
    const response = await fetch(filePath)
    if (!response.ok) {
      throw new Error(`Failed to fetch calendar data: ${response.statusText}`)
    }

    const data = await response.text()
    const jcalData = ICAL.parse(data)
    const comp = new ICAL.Component(jcalData)
    const vevents = comp.getAllSubcomponents('vevent')

    events.value = vevents.map(parseEvent)
  } catch (err) {
    console.error('Calendar loading error:', err)
    error.value = 'Failed to load calendar data. Please try again later.'
  } finally {
    isLoading.value = false
  }
}

// Filter events by date range
const filteredEvents = computed(() => {
  return events.value
    .filter((event) => {
      if (!event.startDate || !event.endDate) return false
      return event.startDate >= props.startDate && event.endDate <= props.endDate
    })
    .sort((a, b) => a.startDate - b.startDate)
})

// Initialize on mount
onMounted(() => {
  fetchIcsFile(props.filePath)
})

// Watch for file path changes
watch(
  () => props.filePath,
  (newPath) => {
    fetchIcsFile(newPath)
  }
)
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
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.event-time {
  min-width: 100px;
  color: #666;
}

.event-details {
  flex: 1;
}

.event-details h3 {
  margin: 0 0 0.5rem 0;
}

.applicant-details {
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.mix-track-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
  text-decoration: none;
  color: inherit;
}

.mix-track-link:hover {
  background: #eee;
}

.icon {
  width: 20px;
  height: 20px;
}
</style>
