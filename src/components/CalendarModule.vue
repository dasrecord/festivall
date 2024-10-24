<template>
  <div class="ics-viewer">
    <h2>Events</h2>
    <ul v-if="events.length">
      <li v-for="(event, index) in events" :key="index">
        <h3>{{ event.summary }}</h3>
        <p><strong>Start:</strong> {{ formatDate(event.startDate) }}</p>
        <p><strong>End:</strong> {{ formatDate(event.endDate) }}</p>
        <p><strong>Description:</strong> {{ event.description }}</p>
      </li>
    </ul>
    <p v-else>Loading events...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ICAL from 'ical.js'

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

const formatDate = (date) => {
  return date.toLocaleString()
}

onMounted(() => {
  fetchIcsFile()
})
</script>

<style scoped>
.ics-viewer {
  padding: 1rem;
}
.ics-viewer ul {
  list-style-type: none;
  padding: 0;
}
.ics-viewer li {
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 5px;
}
</style>
