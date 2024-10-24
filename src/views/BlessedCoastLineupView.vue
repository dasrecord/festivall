<template>
  <div>
    <h1>Calendar Events</h1>
    <CalendarModule
      :startDate="new Date('2024-08-30T14:00:00')"
      :endDate="new Date('2024-08-31T02:00:00')"
    />
  </div>
</template>

<script setup>
import CalendarModule from '@/components/CalendarModule.vue'
</script>

<style scoped>
/* Add any styles specific to this view here */
</style>
