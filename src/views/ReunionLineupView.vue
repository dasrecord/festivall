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

    <!-- ── My Schedule ─────────────────────────────────────────────── -->
    <div class="my-schedule">
      <button class="my-schedule-toggle" @click="myScheduleOpen = !myScheduleOpen">
        <span>★ MY SCHEDULE</span>
        <span class="toggle-chevron" :class="{ open: myScheduleOpen }">▾</span>
      </button>
      <div v-if="myScheduleOpen" class="my-schedule-body">
        <p v-if="!starredEvents.length" class="no-starred">No acts starred yet — tap ☆ on any act to add it here.</p>
        <lineup-day v-else :events="starredEvents" :loading="loading" class="setinfo" />
      </div>
    </div>

    <div class="main-stage">
      <!-- Toggle Buttons -->
      <div class="toggle-buttons">
        <button v-if="isDev" class="today-btn" @click="toggleDay('today')">⚡ TODAY</button>
        <button @click="toggleDay('friday')">Friday</button>
        <button @click="toggleDay('saturday')">Saturday</button>
        <button @click="toggleDay('sunday')">Sunday</button>
        <button @click="toggleDay('monday')">Monday</button>
      </div>
      <div class="days">
        <!-- Dev: today's real date events for testing now-playing -->
        <div v-if="showDays.today" class="day">
          <h2>TODAY (TEST)</h2>
          <lineup-day :events="getTodayEvents" :loading="loading" class="setinfo" />
        </div>
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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import LineupDay from '@/components/CalendarModule.vue'
import reunion_emblem from '@/assets/images/reunion_emblem_white.png'
import { logEvent } from 'firebase/analytics'
import { reunion_analytics } from '@/firebase'
import { useLineupState } from '@/composables/useLineupState'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'
import { useHead } from '@vueuse/head'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
const { year, month, day, endDay } = REUNION_FESTIVAL
const monthName = months[month - 1]
const dateRange = `${monthName} ${day}–${endDay}, ${year}`

useHead({
  title: `Reunion Festival ${year} — Full Lineup | Festivall`,
  meta: [
    { name: 'description', content: `See the full artist lineup for Reunion Festival ${year} — ${dateRange} near Saskatoon, SK. Browse sets by day and build your personal schedule.` },
    { property: 'og:title', content: `Reunion Festival ${year} — Full Lineup` },
    { property: 'og:description', content: `Full artist lineup for Reunion ${year}. Browse by day, star your favourites, and plan your festival weekend near Saskatoon.` },
    { property: 'og:image', content: 'https://festivall.ca/reunion_2026_preview.png' },
    { property: 'og:url', content: 'https://festivall.ca/reunionlineup' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: `Reunion Festival ${year} — Full Lineup` },
    { name: 'twitter:description', content: `Full artist lineup for Reunion ${year}. Browse by day and plan your festival weekend near Saskatoon.` },
    { name: 'twitter:image', content: 'https://festivall.ca/reunion_preview.png' },
  ]
})

const { isStarred, updateCurrentAct } = useLineupState()

const isDev = import.meta.env.DEV

// Reactive state
const loading = ref(false)
const events = ref([])

const showDays = reactive({
  today: false,
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
        settimes: Array.isArray(data.settimes)
          ? data.settimes.map((t) => {
              if (t && typeof t.toDate === 'function') return t.toDate().toISOString()
              if (typeof t === 'string') return t.replace(/^"|"$/g, '')
              return t
            })
          : []
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

const getFridayEvents = computed(() => getEventsByDay(REUNION_FESTIVAL.fridayDate))
const getSaturdayEvents = computed(() => getEventsByDay(REUNION_FESTIVAL.saturdayDate))
const getSundayEvents = computed(() => getEventsByDay(REUNION_FESTIVAL.sundayDate))
const getMondayEvents = computed(() => getEventsByDay(REUNION_FESTIVAL.mondayDate))
const getTodayEvents = computed(() => getEventsByDay(new Date()))

// ── My Schedule ───────────────────────────────────────────────────────────────
const myScheduleOpen = ref(false)

const starredEvents = computed(() => {
  const slots = []
  for (const event of events.value) {
    for (const settime of event.settimes) {
      const key = `${event.id}::${settime}`
      if (isStarred(key)) {
        slots.push({ ...event, settimes: [settime] })
      }
    }
  }
  return slots.sort((a, b) => new Date(a.settimes[0]).getTime() - new Date(b.settimes[0]).getTime())
})

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

// ── Now-playing interval ─────────────────────────────────────────────────────
let nowPlayingInterval = null

// Fetch events on component mount
onMounted(() => {
  // Track page view
  logEvent(reunion_analytics, 'page_view', {
    page_title: 'Reunion Lineup',
    page_location: window.location.href
  })

  fetchEvents().then(() => {
    updateCurrentAct(events.value)
    nowPlayingInterval = setInterval(() => updateCurrentAct(events.value), 60_000)
  })
})

onUnmounted(() => {
  clearInterval(nowPlayingInterval)
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

.toggle-buttons .today-btn {
  background-color: #430789;
  outline: 2px dashed #fff;
  outline-offset: -3px;
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

/* ── My Schedule ─────────────────────────────────────────────────────────── */
.my-schedule {
  width: 100%;
  max-width: 800px;
  margin-bottom: 1.5rem;
  border: 1px solid var(--reunion-frog-green);
  border-radius: 10px;
  overflow: hidden;
}

.my-schedule-toggle {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background-color: var(--reunion-light-gray);
  color: #f5c518;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.08em;
  border: none;
  cursor: pointer;
}

.my-schedule-toggle:hover {
  background-color: #2a2a2a;
}

.toggle-chevron {
  font-size: 1.2rem;
  transition: transform 0.2s;
  display: inline-block;
}

.toggle-chevron.open {
  transform: rotate(180deg);
}

.my-schedule-body {
  padding: 0.5rem 0;
  background-color: var(--reunion-light-gray);
}

.no-starred {
  padding: 1rem;
  text-align: center;
  color: #aaa;
  font-weight: normal;
  font-size: 0.9rem;
}
</style>
