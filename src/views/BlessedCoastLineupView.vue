<template>
  <HelloWorld msg="Blessed Coast 2025 Lineup"></HelloWorld>
  <div class="basic">
    <div class="totem-stage">
      <h1>Totem Stage</h1>
      <p>Friday</p>
      <CalendarModule
        filePath="/data/calendars/blessed_coast_totem_stage_calendar.ics"
        :startDate="new Date('2024-08-01T14:00:00')"
        :endDate="new Date('2024-08-02T02:00:00')"
      />
      <p>Saturday</p>
      <CalendarModule
        filePath="/data/calendars/blessed_coast_totem_stage_calendar.ics"
        :startDate="new Date('2024-08-02T14:00:00')"
        :endDate="new Date('2024-09-03T02:00:00')"
      />
      <p>Sunday</p>
      <CalendarModule
        filePath="/data/calendars/blessed_coast_totem_stage_calendar.ics"
        :startDate="new Date('2024-08-03T14:00')"
        :endDate="new Date('2024-08-04T02:00')"
      />
      <p>Monday</p>
      <CalendarModule
        filePath="/data/calendars/blessed_coast_totem_stage_calendar.ics"
        :startDate="new Date('2024-08-04T14:00')"
        :endDate="new Date('2024-08-05T02:00')"
      />
    </div>
    <div class="dojo-stage">
      <h1>Dojo Stage</h1>
      <p>Friday</p>
      <CalendarModule
        filePath="/data/calendars/blessed_coast_dojo_stage_calendar.ics"
        :startDate="new Date('2024-08-01T14:00:00')"
        :endDate="new Date('2024-08-02T02:00:00')"
      />
      <p>Saturday</p>
      <CalendarModule
        filePath="/data/calendars/blessed_coast_dojo_stage_calendar.ics"
        :startDate="new Date('2024-08-02T14:00:00')"
        :endDate="new Date('2024-09-03T02:00:00')"
      />
      <p>Sunday</p>
      <CalendarModule
        filePath="/data/calendars/blessed_coast_dojo_stage_calendar.ics"
        :startDate="new Date('2024-08-03T14:00')"
        :endDate="new Date('2024-08-04T02:00')"
      />
      <p>Monday</p>
      <CalendarModule
        filePath="/data/calendars/blessed_coast_dojo_stage_calendar.ics"
        :startDate="new Date('2024-08-04T14:00')"
        :endDate="new Date('2024-08-05T02:00')"
      />
    </div>
    <div class="yoga-temple">
      <h1>Yoga Temple</h1>
      <p>Friday</p>
      <CalendarModule
        filePath="/data/calendars/blessed_coast_yoga_temple_calendar.ics"
        :startDate="new Date('2024-08-01T14:00:00')"
        :endDate="new Date('2024-08-02T02:00:00')"
      />
      <p>Saturday</p>
      <CalendarModule
        filePath="/data/calendars/blessed_coast_yoga_temple_calendar.ics"
        :startDate="new Date('2024-08-02T14:00:00')"
        :endDate="new Date('2024-09-03T02:00:00')"
      />
      <p>Sunday</p>
      <CalendarModule
        filePath="/data/calendars/blessed_coast_yoga_temple_calendar.ics"
        :startDate="new Date('2024-08-03T14:00')"
        :endDate="new Date('2024-08-04T02:00')"
      />
      <p>Monday</p>
      <CalendarModule
        filePath="/data/calendars/blessed_coast_yoga_temple_calendar.ics"
        :startDate="new Date('2024-08-04T14:00')"
        :endDate="new Date('2024-08-05T02:00')"
      />
    </div>
    <div class="workshop-space">
      <h1>Workshop Space</h1>
      <p>Friday</p>
      <CalendarModule
        filePath="/data/calendars/blessed_coast_workshop_space_calendar.ics"
        :startDate="new Date('2024-08-01T14:00:00')"
        :endDate="new Date('2024-08-02T02:00:00')"
      />
      <p>Saturday</p>
      <CalendarModule
        filePath="/data/calendars/blessed_coast_workshop_space_calendar.ics"
        :startDate="new Date('2024-08-02T14:00:00')"
        :endDate="new Date('2024-09-03T02:00:00')"
      />
      <p>Sunday</p>
      <CalendarModule
        filePath="/data/calendars/blessed_coast_workshop_space_calendar.ics"
        :startDate="new Date('2024-08-03T14:00')"
        :endDate="new Date('2024-08-04T02:00')"
      />
      <p>Monday</p>
      <CalendarModule
        filePath="/data/calendars/blessed_coast_workshop_space_calendar.ics"
        :startDate="new Date('2024-08-04T14:00')"
        :endDate="new Date('2024-08-05T02:00')"
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
  /* border: 1px solid lime; */
}
.basic {
  display: flex;
  flex-direction: row;
  align-items: center;
}
p {
  font-weight: bold;
}
.totem-stage {
  background-color: #5484ed;
}

.dojo-stage {
  background-color: #ffb878;
}
.yoga-temple {
  background-color: #dbadff;
}
.workshop-space {
  background-color: #fbd75b;
}
</style>
