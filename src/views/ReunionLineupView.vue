<template>
  <div class="basic">
    <img
      :src="reunion_emblem"
      alt="Reunion Emblem"
      class="reunion-emblem"
      style="cursor: pointer; width: 100%; max-width: 600px"
      @click="$router.push('/reunion')"
    />
    <p>{{ new Date().getFullYear() }} LINEUP</p>

    <div class="main-stage">
      <!-- Toggle Buttons -->
      <div class="toggle-buttons">
        <button @click="toggleDay('friday')">Friday</button>
        <button @click="toggleDay('saturday')">Saturday</button>
        <button @click="toggleDay('sunday')">Sunday</button>
        <button @click="toggleDay('monday')">Monday</button>
      </div>
      <div class="days">
        <!-- Day sections with filtered events -->
        <div v-if="showDays.friday" class="day">
          <h2>FRIDAY</h2>
          <lineup-day :events="getFridayEvents" :loading="loading" class="setinfo" />
        </div>

        <div v-if="showDays.saturday" class="day">
          <h2>SATURDAY</h2>
          <lineup-day :events="getSaturdayEvents" :loading="loading" class="setinfo" />
        </div>

        <div v-if="showDays.sunday" class="day">
          <h2>SUNDAY</h2>
          <lineup-day :events="getSundayEvents" :loading="loading" class="setinfo" />
        </div>

        <div v-if="showDays.monday" class="day">
          <h2>MONDAY</h2>
          <lineup-day :events="getMondayEvents" :loading="loading" class="setinfo" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import LineupDay from '@/components/CalendarModule.vue'
import reunion_emblem from '@/assets/images/reunion_emblem_white.png'
import { logEvent } from 'firebase/analytics'
import { reunion_analytics } from '@/firebase'

// Reactive state
const loading = ref(false)
const events = ref([])

const showDays = reactive({
  friday: false,
  saturday: false,
  sunday: false,
  monday: false
})

// Fetch events from Firestore
const fetchEvents = async () => {
  loading.value = true
  try {
    const q = query(collection(reunion_db, 'participants_2026'), where('contract.signed', '==', true))
    const snapshot = await getDocs(q)
    events.value = snapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      const roles = data.roles || {}
      const appData = (data.application && data.application.data) || {}

      return {
        id: docSnap.id,
        ...data,
        act_name: roles.act_name || data.act_name || '',
        workshop_title: appData.workshop_title || data.workshop_title || '',
        mix_track_url: appData.mix_track_url || data.mix_track_url || '',
        social_url: appData.social_url || data.social_url || '',
        genre: appData.genre || data.genre || '',
        act_description:
          appData.act_description ||
          appData.workshop_description ||
          data.act_description ||
          '',
        settimes: Array.isArray(data.settimes) ? data.settimes : []
      }
    })

    // Log the fetched events to verify the data
    console.log('Fetched Events:', events.value)

    // Sort events by the earliest settime
    events.value.sort((a, b) => {
      const earliestA = a.settimes.length > 0 ? new Date(a.settimes[0]) : new Date(0)
      const earliestB = b.settimes.length > 0 ? new Date(b.settimes[0]) : new Date(0)
      return earliestA - earliestB
    })
  } catch (error) {
    console.error('Error fetching events:', error)
  } finally {
    loading.value = false
  }
}

// Filter events by day
const getEventsByDay = (targetDate) => {
  const targetDay = new Date(targetDate)

  return events.value
    .map((event) => {
      const filteredSettimes = event.settimes.filter((settime) => {
        const date = new Date(settime)

        // Create time boundaries for this "festival day"
        const dayStart = new Date(targetDay)
        dayStart.setHours(3, 0, 0, 0) // Start at 3:00 AM

        const dayEnd = new Date(targetDay)
        dayEnd.setDate(dayEnd.getDate() + 1)
        dayEnd.setHours(3, 0, 0, 0) // End at 3:00 AM next day

        return date >= dayStart && date < dayEnd
      })

      if (filteredSettimes.length === 0) return null

      return {
        ...event,
        settimes: filteredSettimes
      }
    })
    .filter(Boolean)
    .sort((a, b) => {
      const earliestA = a.settimes.length > 0 ? new Date(a.settimes[0]) : new Date(0)
      const earliestB = b.settimes.length > 0 ? new Date(b.settimes[0]) : new Date(0)
      return earliestA - earliestB
    })
}

const getFridayEvents = computed(() => getEventsByDay(new Date('2026-09-04T12:00:00-06:00')))
const getSaturdayEvents = computed(() => getEventsByDay(new Date('2026-09-05T12:00:00-06:00')))
const getSundayEvents = computed(() => getEventsByDay(new Date('2026-09-06T12:00:00-06:00')))
const getMondayEvents = computed(() => getEventsByDay(new Date('2026-09-07T12:00:00-06:00')))

// Toggle day visibility
const toggleDay = (day) => {
  showDays[day] = !showDays[day]
  // Track day toggle interaction
  logEvent(reunion_analytics, 'select_content', {
    content_type: 'lineup_day',
    item_id: day,
    content_name: `${day} lineup`
  })
}

// Fetch events on component mount
onMounted(() => {
  // Track page view
  logEvent(reunion_analytics, 'page_view', {
    page_title: 'Reunion Lineup',
    page_location: window.location.href
  })

  fetchEvents()
})
</script>

<style scoped>
.basic {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.days {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.day {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  background-color: var(--reunion-light-gray);
  border: 1px solid var(--reunion-frog-green);
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  color: var(--reunion-frog-green);
  text-align: center;
  font-weight: bold;
  margin: 0;
  padding: 0;
}

p {
  font-weight: bold;
}

.toggle-buttons {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.toggle-buttons button {
  margin: 0 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--reunion-frog-green);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.toggle-buttons button:hover {
  background-color: white;
  color: black;
}

.main-stage {
  margin-top: 1rem;
  width: 100%;
}

.reunion-emblem {
  max-width: 100%;
  height: auto;
  margin-bottom: 1rem;
}
</style>
