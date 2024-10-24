<template>
  <div>
    <h1>Artist Lineup</h1>
    <p>Friday</p>
    <CalendarModule
      filePath="/data/calendars/reunion_artist_calendar.ics"
      :startDate="new Date('2024-08-30T14:00:00')"
      :endDate="new Date('2024-08-31T02:00:00')"
    />
    <p>Saturday</p>
    <CalendarModule
      filePath="/data/calendars/reunion_artist_calendar.ics"
      :startDate="new Date('2024-08-31T14:00:00')"
      :endDate="new Date('2024-09-01T02:00:00')"
    />
    <p>Sunday</p>
    <CalendarModule
      filePath="/data/calendars/reunion_artist_calendar.ics"
      :startDate="new Date('2024-09-01T14:00:00')"
      :endDate="new Date('2024-09-02T02:00:00')"
    />
  </div>
</template>

<script setup>
import CalendarModule from '@/components/CalendarModule.vue'
</script>

<style scoped>
/* Add any styles specific to this view here */
</style>
