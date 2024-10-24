<template>
  <div class="ics-viewer">
    <h2>Events</h2>
    <ul v-if="filteredEvents.length">
      <li v-for="(event, index) in filteredEvents" :key="index">
        <p>{{ event.startDate.toLocaleTimeString() }}</p>
        <h3>{{ event.summary }}</h3>
        <!-- <p><strong>Start:</strong> {{ formatDate(event.startDate) }}</p>
        <p><strong>End:</strong> {{ formatDate(event.endDate) }}</p>
        <p><strong>Description:</strong> {{ event.description }}</p> -->
      </li>
    </ul>
    <p v-else>No events found for the selected date range.</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ICAL from 'ical.js'
import { defineProps } from 'vue'

const props = defineProps({
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  }
})

const events = ref([])

const fetchIcsFile = async () => {
  try {
    const response = await fetch('/data/calendars/reunion_artist_calendar.ics')
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.text()
    parseIcsData(data)
  } catch (error) {
    console.error('Error fetching the ICS file:', error)
  }
}

const parseIcsData = (data) => {
  const jcalData = ICAL.parse(data)
  const comp = new ICAL.Component(jcalData)
  const vevents = comp.getAllSubcomponents('vevent')
  events.value = vevents.map((vevent) => {
    const event = new ICAL.Event(vevent)
    return {
      summary: event.summary,
      startDate: event.startDate.toJSDate(),
      endDate: event.endDate.toJSDate(),
      description: event.description
    }
  })
}

const filteredEvents = computed(() => {
  return events.value
    .filter((event) => {
      return event.startDate >= props.startDate && event.endDate <= props.endDate
    })
    .sort((a, b) => a.startDate - b.startDate) // Sort events by start date
})

onMounted(() => {
  fetchIcsFile()
})
</script>

<style scoped>
.ics-viewer {
}
.ics-viewer ul {
  list-style-type: none;
  padding: 0;
}
.ics-viewer li {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
}
</style>
