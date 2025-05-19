<template>
  <div class="calendar-module">
    <!-- Loading State -->
    <div v-if="loading" class="loading">Loading events...</div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <!-- Events List -->
    <div v-else class="events-list">
      <ul v-if="events.length">
        <li v-for="event in events" :key="event.id" class="event-item">
          <!-- Iterate over all set times -->
          <div v-for="(settime, index) in event.settimes" :key="index" class="event-time">
            {{ formatTime(settime) }}
            <a
              v-if="event.mix_track_url"
              :href="event.mix_track_url"
              target="_blank"
              rel="noopener noreferrer"
              class="mix-track-link"
            >
              <img :src="music_icon" alt="Music" class="icon" />
              LISTEN
              <img :src="listen_icon" alt="Listen" class="icon" />
            </a>
          </div>

          <!-- Event Details -->
          <div class="event-details">
            <h3>
              {{ event.act_name || event.workshop_title || 'Untitled Event' }}
            </h3>
            <p v-if="event.genre">Genre: {{ event.genre }}</p>
            <p>
              {{
                event.act_description || event.workshop_description || 'No description available'
              }}
            </p>
          </div>
        </li>
      </ul>
      <p v-else class="no-events">No events scheduled for this day.</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import music_icon from '@/assets/images/icons/artist.png'
import listen_icon from '@/assets/images/icons/mix_track.png'

// Props
const props = defineProps({
  events: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

// Time formatting utility
const formatTime = (timestamp) => {
  if (!timestamp) return 'TBA'
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}
</script>

<style scoped>
.calendar-module {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.loading,
.error,
.no-events {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #dc3545;
}

.events-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.event-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1rem;
  border-top: 1px solid #fff;
  border-bottom: 1px solid #fff;
  border-radius: 10px;
}

.event-time {
  display: flex;
  flex-direction: column;
  font-size: larger;
  min-width: 100px;
  
}

.event-details {
  flex: 1;
}

.event-details h3 {
  margin: 0 0 0.5rem 0;
}

.mix-track-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  text-decoration: none;
  color: inherit;
  border: 1px solid rgba(0, 255, 0);
  cursor: pointer;
}

.icon {
  width: 24px;
  height: auto;
}
</style>
