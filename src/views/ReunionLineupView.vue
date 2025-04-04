<template>
  <div class="basic">
    <img
      :src="reunion_emblem"
      alt="Reunion Emblem"
      class="reunion-emblem"
      style="cursor: pointer; max-width: 600px"
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

      <!-- Day sections with filtered events -->
      <div v-if="showDays.friday" class="day">
        <h2>Friday</h2>
        <lineup-day :events="getFridayEvents" :loading="loading" />
      </div>

      <div v-if="showDays.saturday" class="day">
        <h2>Saturday</h2>
        <lineup-day :events="getSaturdayEvents" :loading="loading" />
      </div>

      <div v-if="showDays.sunday" class="day">
        <h2>Sunday</h2>
        <lineup-day :events="getSundayEvents" :loading="loading" />
      </div>

      <div v-if="showDays.monday" class="day">
        <h2>Monday</h2>
        <lineup-day :events="getMondayEvents" :loading="loading" />
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
    const q = query(
      collection(reunion_db, 'applications_2025')
      // where('contract_signed', '==', true)
    )
    const snapshot = await getDocs(q)
    events.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      mix_track_url: doc.data().mix_track_url || null // Ensure mix_track_url is mapped
    }))

    // Sort events by settime after fetching
    events.value.sort((a, b) => new Date(a.settime) - new Date(b.settime))
  } catch (error) {
    console.error('Error fetching events:', error)
  } finally {
    loading.value = false
  }
}

// Filter events by day
const getFridayEvents = computed(() =>
  events.value.filter((event) => {
    const date = new Date(event.settime)
    return date.getMonth() === 7 && date.getDate() === 29 // August 29
  })
)

const getSaturdayEvents = computed(() =>
  events.value.filter((event) => {
    const date = new Date(event.settime)
    return date.getMonth() === 7 && date.getDate() === 30 // August 30
  })
)

const getSundayEvents = computed(() =>
  events.value.filter((event) => {
    const date = new Date(event.settime)
    return date.getMonth() === 7 && date.getDate() === 31 // August 31
  })
)
const getMondayEvents = computed(() =>
  events.value.filter((event) => {
    const date = new Date(event.settime)
    return date.getMonth() === 8 && date.getDate() === 1 // September 1
  })
)

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
}

.day {
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
</style>
