<template>
  <div class="basic">
    <img
      :src="reunion_emblem"
      alt="Reunion Emblem"
      class="reunion-emblem"
      style="cursor: pointer; width: 100%; max-width: 600px"
      @click="$router.push('/reunion')"
    />

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
    const q = query(collection(reunion_db, 'orders_2025'), where('contract_signed', '==', true))
    const snapshot = await getDocs(q)
    events.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      settimes: Array.isArray(doc.data().settimes) ? doc.data().settimes : [] // Ensure settimes is an array
    }))

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
const getEventsByDay = (targetDate) =>
  events.value
    .map((event) => {
      // Filter the settimes to include only those matching the target day
      const filteredSettimes = event.settimes.filter((settime) => {
        const date = new Date(settime)
        return (
          date.getFullYear() === targetDate.getFullYear() &&
          date.getMonth() === targetDate.getMonth() &&
          date.getDate() === targetDate.getDate()
        )
      })

      // If no settimes match the target day, exclude the event
      if (filteredSettimes.length === 0) return null

      // Return a new event object with only the matching settimes
      return {
        ...event,
        settimes: filteredSettimes
      }
    })
    .filter(Boolean) // Remove null values

const getFridayEvents = computed(() => getEventsByDay(new Date('2025-08-29T00:00:00-06:00'))) // CST offset
const getSaturdayEvents = computed(() => getEventsByDay(new Date('2025-08-30T00:00:00-06:00')))
const getSundayEvents = computed(() => getEventsByDay(new Date('2025-08-31T00:00:00-06:00')))
const getMondayEvents = computed(() => getEventsByDay(new Date('2025-09-01T00:00:00-06:00')))

// Toggle day visibility
const toggleDay = (day) => {
  showDays[day] = !showDays[day]
}

// Fetch events on component mount
onMounted(() => {
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
