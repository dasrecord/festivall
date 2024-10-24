<template>
  <div class="basic">
    <h1>Artist Lineup</h1>
    <p>Friday</p>
    <CalendarModule
      filePath="/data/calendars/blessed_coast_calendar.ics"
      :startDate="new Date('2024-08-01T14:00:00')"
      :endDate="new Date('2024-08-02T02:00:00')"
    />
    <p>Saturday</p>
    <CalendarModule
      filePath="/data/calendars/blessed_coast_calendar.ics"
      :startDate="new Date('2024-08-02T14:00:00')"
      :endDate="new Date('2024-09-03T02:00:00')"
    />
    <p>Sunday</p>
    <CalendarModule
      filePath="/data/calendars/blessed_coast_artist_calendar.ics"
      :startDate="new Date('2024-08-03T14:00')"
      :endDate="new Date('2024-08-04T02:00')"
    />
  </div>
</template>

<script setup>
import CalendarModule from '@/components/CalendarModule.vue'
</script>

<style scoped>
* {
  border: 1px solid lime;
}
.basic {
  display: flex;
  flex-direction: column;
  align-items: center;
}
p {
  font-weight: bold;
}
</style>
