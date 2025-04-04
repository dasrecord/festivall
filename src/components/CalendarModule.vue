<template>
  <div class="ics-viewer">
    <ul v-if="filteredEvents.length">
      <li v-for="(event, index) in filteredEvents" :key="index">
        <p>{{ event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</p>
        <h3>{{ event.summary }}</h3>
        <p v-if="event.applicant">{{ parseApplicantData(event.applicant) }}</p>

        <a
          v-if="event.applicant && event.applicant.mix_track_url"
          :href="event.applicant.mix_track_url"
          rel="noopener noreferrer"
        >
          <img :src="music_icon" alt="Music Icon" style="width: 36px; height: auto" />
        </a>
      </li>
    </ul>
    <p v-else>No events found for the selected date range.</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ICAL from 'ical.js'
import { defineProps } from 'vue'
import music_icon from '@/assets/images/icons/artist.png'

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

const events = ref([])

// Fetch the ICS file and parse its data
const fetchIcsFile = async (filePath) => {
  try {
    const response = await fetch(filePath)
    if (!response.ok) {
      throw new Error(`Failed to fetch ICS file: ${response.statusText}`)
    }
    const data = await response.text()
    parseIcsData(data)
  } catch (error) {
    console.error('Error fetching the ICS file:', error)
  }
}

// Parse the ICS data and extract events
const parseIcsData = (data) => {
  try {
    const jcalData = ICAL.parse(data)
    const comp = new ICAL.Component(jcalData)
    const vevents = comp.getAllSubcomponents('vevent')

    events.value = vevents.map((vevent) => {
      const event = new ICAL.Event(vevent)
      return {
        uid: event.uid,
        summary: event.summary,
        startDate: new Date(event.startDate.toJSDate()),
        endDate: new Date(event.endDate.toJSDate()),
        applicant: parseCustomField(vevent, 'X-APPLICANT-DATA') // Extract custom field
      }
    })
  } catch (error) {
    console.error('Error parsing ICS data:', error)
  }
}

// Extract custom fields from the VEVENT component
const parseCustomField = (vevent, fieldName) => {
  try {
    const fieldValue = vevent.getFirstPropertyValue(fieldName)
    return fieldValue ? JSON.parse(fieldValue) : null
  } catch (error) {
    console.error(`Error parsing custom field "${fieldName}":`, error)
    return null
  }
}

// Format and display applicant data
const parseApplicantData = (applicant) => {
  if (typeof applicant === 'object') {
    return `Applicant: ${applicant.name || 'Unknown'}`
  }
  return applicant
}

// Filter events based on the provided date range
const filteredEvents = computed(() => {
  return events.value
    .filter((event) => {
      return event.startDate >= props.startDate && event.endDate <= props.endDate
    })
    .sort((a, b) => a.startDate - b.startDate) // Sort events by start date
})

// Fetch the ICS file when the component is mounted
onMounted(() => {
  fetchIcsFile(props.filePath)
})

// Watch for changes in the filePath prop and refetch the ICS file
watch(
  () => props.filePath,
  (newFilePath) => {
    fetchIcsFile(newFilePath)
  }
)
</script>

<style scoped>
.ics-viewer {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.ics-viewer ul {
  list-style-type: none;
  padding: 0;
}
.ics-viewer li {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 6px;
  border-radius: 6px;
}
</style>
