<template>
  <HelloWorld msg="Blessed Coast 2025 Lineup"></HelloWorld>
  <div class="basic">
    <div class="controls">
      <button class="totem-stage" @click="toggleStage('totemstage')">Totem Stage</button>
      <button class="dojo-stage" @click="toggleStage('dojostage')">Dojo Stage</button>
      <button class="yoga-temple" @click="toggleStage('yogatemple')">Yoga Temple</button>
      <button class="workshop-space" @click="toggleStage('workshopspace')">Workshop Space</button>
    </div>
    <div class="lineups">
      <div v-if="stages.totemstage" class="totem-stage">
        <h1>Totem Stage</h1>
        <p>Friday</p>
        <CalendarModule
          filePath="/data/calendars/blessed_coast_totem_stage_calendar.ics"
          :startDate="new Date('2025-08-01T12:00:00')"
          :endDate="new Date('2025-08-02T02:00:00')"
        />
        <p>Saturday</p>
        <CalendarModule
          filePath="/data/calendars/blessed_coast_totem_stage_calendar.ics"
          :startDate="new Date('2025-08-02T14:00:00')"
          :endDate="new Date('2025-09-03T02:00:00')"
        />
        <p>Sunday</p>
        <CalendarModule
          filePath="/data/calendars/blessed_coast_totem_stage_calendar.ics"
          :startDate="new Date('2025-08-03T14:00')"
          :endDate="new Date('2025-08-04T02:00')"
        />
        <p>Monday</p>
        <CalendarModule
          filePath="/data/calendars/blessed_coast_totem_stage_calendar.ics"
          :startDate="new Date('2025-08-04T14:00')"
          :endDate="new Date('2025-08-05T02:00')"
        />
      </div>
      <div v-if="stages.dojostage" class="dojo-stage">
        <h1>Dojo Stage</h1>
        <p>Friday</p>
        <CalendarModule
          filePath="/data/calendars/blessed_coast_dojo_stage_calendar.ics"
          :startDate="new Date('2025-08-01T12:00:00')"
          :endDate="new Date('2025-08-02T02:00:00')"
        />
        <p>Saturday</p>
        <CalendarModule
          filePath="/data/calendars/blessed_coast_dojo_stage_calendar.ics"
          :startDate="new Date('2025-08-02T14:00:00')"
          :endDate="new Date('2025-09-03T02:00:00')"
        />
        <p>Sunday</p>
        <CalendarModule
          filePath="/data/calendars/blessed_coast_dojo_stage_calendar.ics"
          :startDate="new Date('2025-08-03T14:00')"
          :endDate="new Date('2025-08-04T02:00')"
        />
        <p>Monday</p>
        <CalendarModule
          filePath="/data/calendars/blessed_coast_dojo_stage_calendar.ics"
          :startDate="new Date('2025-08-04T14:00')"
          :endDate="new Date('2025-08-05T02:00')"
        />
      </div>
      <div v-if="stages.yogatemple" class="yoga-temple">
        <h1>Yoga Temple</h1>
        <p>Friday</p>
        <CalendarModule
          filePath="/data/calendars/blessed_coast_yoga_temple_calendar.ics"
          :startDate="new Date('2025-08-01T14:00:00')"
          :endDate="new Date('2025-08-02T02:00:00')"
        />
        <p>Saturday</p>
        <CalendarModule
          filePath="/data/calendars/blessed_coast_yoga_temple_calendar.ics"
          :startDate="new Date('2025-08-02T14:00:00')"
          :endDate="new Date('2025-09-03T02:00:00')"
        />
        <p>Sunday</p>
        <CalendarModule
          filePath="/data/calendars/blessed_coast_yoga_temple_calendar.ics"
          :startDate="new Date('2025-08-03T14:00')"
          :endDate="new Date('2025-08-04T02:00')"
        />
        <p>Monday</p>
        <CalendarModule
          filePath="/data/calendars/blessed_coast_yoga_temple_calendar.ics"
          :startDate="new Date('2025-08-04T14:00')"
          :endDate="new Date('2025-08-05T02:00')"
        />
      </div>
      <div v-if="stages.workshopspace" class="workshop-space">
        <h1>Workshop Space</h1>
        <p>Friday</p>
        <CalendarModule
          filePath="/data/calendars/blessed_coast_workshop_space_calendar.ics"
          :startDate="new Date('2025-08-01T14:00:00')"
          :endDate="new Date('2025-08-02T02:00:00')"
        />
        <p>Saturday</p>
        <CalendarModule
          filePath="/data/calendars/blessed_coast_workshop_space_calendar.ics"
          :startDate="new Date('2025-08-02T14:00:00')"
          :endDate="new Date('2025-09-03T02:00:00')"
        />
        <p>Sunday</p>
        <CalendarModule
          filePath="/data/calendars/blessed_coast_workshop_space_calendar.ics"
          :startDate="new Date('2025-08-03T14:00')"
          :endDate="new Date('2025-08-04T02:00')"
        />
        <p>Monday</p>
        <CalendarModule
          filePath="/data/calendars/blessed_coast_workshop_space_calendar.ics"
          :startDate="new Date('2025-08-04T14:00')"
          :endDate="new Date('2025-08-05T02:00')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import CalendarModule from '@/components/CalendarModule.vue'
import HelloWorld from '@/components/HelloWorld.vue'

const stages = reactive({
  totemstage: false,
  dojostage: false,
  yogatemple: false,
  workshopspace: false
})

function toggleStage(stage) {
  stages[stage] = !stages[stage]
}
</script>

<style scoped>
@import url('https://use.typekit.net/yay7cee.css');

* {
  font-family: amandine, sans-serif;
  /* border: 1px solid lime; */
}

.basic {
  font-family: amandine, sans-serif;
}

p {
  font-weight: bold;
}
.controls {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.lineups {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 1rem;
  padding: 1rem;
  z-index: 0;
}
.totem-stage {
  background-color: #4285f4;
}

.dojo-stage {
  background-color: #f4511e;
}
.yoga-temple {
  background-color: #8e24aa;
}
.workshop-space {
  background-color: #0b8043;
}

button {
  padding: 1rem;
  margin: 1rem;
  border-radius: 5px;
  font-size: large;
  color: white;
}
</style>
