<template>
  <HelloWorld msg="Reunion 2024 Lineup"></HelloWorld>
  <div class="basic">
    <div class="main-stage">
      <h1>Main Stage</h1>
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
        :startDate="new Date('2024-09-01T14:00')"
        :endDate="new Date('2024-09-02T02:00')"
      />
    </div>
  </div>
</template>

<script setup>
import CalendarModule from '@/components/CalendarModule.vue'
import HelloWorld from '@/components/HelloWorld.vue'
</script>

<style scoped>
* {
  border: 1px dotted lime;
}
.basic {
  display: flex;
  flex-direction: row;
  align-items: center;
}

p {
  font-weight: bold;
}
</style>
