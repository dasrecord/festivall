<script setup>
import { computed } from 'vue'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'

const DAY_MS = 86_400_000
const daysToGo = computed(() =>
  Math.max(0, Math.ceil((REUNION_FESTIVAL.startDate.getTime() - Date.now()) / DAY_MS))
)

const icsStamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
const start = REUNION_FESTIVAL.fridayDate
const end = REUNION_FESTIVAL.mondayDate
const title = `Reunion Festival ${REUNION_FESTIVAL.year}`
const location = 'Reunion Festival grounds, near Saskatoon, SK'

const googleUrl =
  'https://calendar.google.com/calendar/render?' +
  new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${icsStamp(start)}/${icsStamp(end)}`,
    location,
    details: 'Tickets and info: https://festivall.ca/reuniontickets'
  }).toString()

const downloadIcs = () => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Festivall//Reunion Festival//EN',
    'BEGIN:VEVENT',
    `UID:reunion-${REUNION_FESTIVAL.year}@festivall.ca`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ]
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `reunion-${REUNION_FESTIVAL.year}.ics`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="os-card">
    <p class="eyebrow">Save the date</p>
    <h2>{{ REUNION_FESTIVAL.dateRangeLabel }}</h2>
    <p class="os-sub">
      <strong>{{ daysToGo }}</strong> day{{ daysToGo === 1 ? '' : 's' }} until Reunion {{ REUNION_FESTIVAL.year }}
    </p>
    <div class="actions">
      <button type="button" @click="downloadIcs">📅 Add to calendar</button>
      <a :href="googleUrl" target="_blank" rel="noopener">Google Calendar ↗</a>
    </div>
  </section>
</template>

<style scoped>
.os-card {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid #9cc7e3;
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
  color: #1b2a36;
}
.eyebrow { margin: 0; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.72rem; color: #2f5d7c; }
.os-card h2 { margin: 0.25rem 0; font-size: 1.15rem; }
.os-sub { margin: 0.2rem 0 0.4rem; color: #3d5466; font-size: 0.9rem; }
.actions { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; }
.actions button {
  background: #2f5d7c;
  color: white;
  border: 0;
  border-radius: 999px;
  padding: 0.4rem 1.1rem;
  font-weight: 700;
  cursor: pointer;
}
.actions a { color: #2f5d7c; font-weight: 600; }
</style>
