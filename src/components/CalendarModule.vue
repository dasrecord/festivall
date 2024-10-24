<template>
  <div class="ics-viewer">
    <ul v-if="filteredEvents.length">
      <li v-for="(event, index) in filteredEvents" :key="index">
        <p>{{ event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</p>
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
import { ref, computed, onMounted, watch } from 'vue'
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
  },
  filePath: {
    type: String,
    required: true
  }
})

const events = ref([])

const fetchIcsFile = async (filePath) => {
  try {
    const response = await fetch(filePath)
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
      startDate: new Date(event.startDate.toJSDate()),
      endDate: new Date(event.endDate.toJSDate()),
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
  fetchIcsFile(props.filePath)
})

watch(
  () => props.filePath,
  (newFilePath) => {
    fetchIcsFile(newFilePath)
  }
)
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
