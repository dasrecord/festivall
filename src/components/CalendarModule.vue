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
            <!-- Mix Track URL -->

            <h3>
              <a
                v-if="event.applicant && event.applicant.mixtrackurl"
                :href="event.applicant.mixtrackurl"
                target="_blank"
                rel="noopener noreferrer"
                class="mix-track-link"
              >
                <img :src="music_icon" alt="Music" class="icon" />
              </a>
              <div
                v-else-if="event.applicant && event.applicant.type === 'Workshop'"
                class="workshop-icon"
              >
                <img :src="workshop_icon" alt="Workshop" class="icon" />
              </div>
              {{ event.summary }}
            </h3>
            <p v-if="event.description">{{ event.description }}</p>
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
import workshop_icon from '@/assets/images/icons/workshop.png'

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

  // Debug: Log all properties
  // console.log(
  //   'All properties:',
  // properties.map((p) => ({ name: p.name, value: p.getFirstValue() }))
  // )

  properties.forEach((prop) => {
    const name = prop.name.toUpperCase() // Normalize to uppercase for comparison
    if (name.startsWith('X-APPLICANT-')) {
      // Convert property name to camelCase
      const key = name
        .replace('X-APPLICANT-', '')
        .toLowerCase()
        .replace(/-./g, (match) => match[1].toUpperCase())

      const value = prop.getFirstValue()

      // Debug: Log each property transformation
      // console.log(`Converting ${name} to ${key} with value:`, value)

      // Only set non-empty values
      if (value) {
        applicant[key] = value
      }
    }
  })

  // Debug: Log final object
  // console.log('Final applicant object:', applicant)

  return Object.keys(applicant).length > 0 ? applicant : null
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
  font-size: larger;
  min-width: 100px;
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

  border-radius: 4px;
  text-decoration: none;
  color: inherit;
}

.icon {
  width: 20px;
  height: 20px;
}
</style>
