<template>
  <div class="basic">
    <img
      :src="reunion_emblem"
      alt="reunion"
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
      </div>

      <!-- Friday Content -->
      <div v-if="showDays.friday" class="day">
        <h2>Friday</h2>
        <CalendarModule
          filePath="/data/calendars/reunion_artist_calendar.ics"
          :startDate="new Date('2024-08-30T14:00:00')"
          :endDate="new Date('2024-08-31T02:00:00')"
        />
      </div>

      <!-- Saturday Content -->
      <div v-if="showDays.saturday" class="day">
        <h2>Saturday</h2>
        <CalendarModule
          filePath="/data/calendars/reunion_artist_calendar.ics"
          :startDate="new Date('2024-08-31T14:00:00')"
          :endDate="new Date('2024-09-01T02:00:00')"
        />
      </div>

      <!-- Sunday Content -->
      <div v-if="showDays.sunday" class="day">
        <h2>Sunday</h2>
        <CalendarModule
          filePath="/data/calendars/reunion_artist_calendar.ics"
          :startDate="new Date('2024-09-01T14:00:00')"
          :endDate="new Date('2024-09-02T02:00:00')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import CalendarModule from '@/components/CalendarModule.vue'
import reunion_emblem from '@/assets/images/reunion_emblem_white.png'

// Reactive object to track visibility of each day's content
const showDays = reactive({
  friday: false,
  saturday: false,
  sunday: false
})

// Function to toggle visibility of a specific day
const toggleDay = (day) => {
  showDays[day] = !showDays[day]
}
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
}
</style>
