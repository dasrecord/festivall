<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-close" @click="$emit('close')"></div>
      <img
        class="festivall-emblem"
        :src="festivall_emblem_white"
        style="height: 64px; width: auto"
        alt="Festivall Emblem"
      />
      <img
        :src="headphones_icon"
        style="height: 64px; width: auto; margin: 0"
        alt="Open Decks Icon"
      />
      <h2>Open Decks</h2>
      <p class="modal-subtitle">
        Claim a 20-minute slot to showcase your music! 
        <span v-if="!loading" class="slots-info">({{ myClaimedSlots.length }} claimed)</span>
      </p>

      <div v-if="loading" class="loading-state">Loading available slots...</div>
      
      <div v-else-if="availableTimeWindows.length === 0" class="no-slots">
        <p>No open decks time is currently available.</p>
        <p class="hint">Check back later or contact the organizers.</p>
      </div>

      <div v-else class="slots-container">
        <!-- Show my claimed slots -->
        <div
          v-for="mySlot in myClaimedSlots"
          :key="'mine-' + mySlot.settime"
          class="slot-card slot-mine"
        >
          <div class="slot-header">
            <div class="slot-day">{{ mySlot.day }}</div>
            <div class="slot-time">{{ formatTime(mySlot.settime) }}</div>
          </div>
          <div class="slot-duration">20 minutes</div>
          <div class="slot-status mine">
            ✓ Your claimed slot
            <button class="unclaim-btn" @click="releaseSlot(mySlot)">Release</button>
          </div>
        </div>

        <!-- Show available time windows with claim buttons -->
        <div
          v-for="window in availableTimeWindows"
          :key="window.id"
          class="slot-card"
        >
          <div class="slot-header">
            <div class="slot-day">{{ formatDay(window.day) }}</div>
            <div class="slot-time">{{ formatTime(window.settime) }}</div>
          </div>
          <div class="slot-duration">{{ window.availableMinutes }} minutes available</div>
          <button 
            class="claim-btn" 
            @click="claimFromWindow(window)"
          >
            Claim 20 min
          </button>
        </div>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, doc, updateDoc, getDoc, query, orderBy, arrayUnion, arrayRemove } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import festivall_emblem_white from '@/assets/images/festivall_emblem_white.png'
import headphones_icon from '@/assets/images/icons/headphones.png'

const props = defineProps({
  participantId: { type: String, required: true },
  participantName: { type: String, required: true }
})

const emit = defineEmits(['close'])

const SLOT_DURATION = 20  // Artists claim 20-minute chunks

const loading = ref(true)
const error = ref(null)
const openDecksWindows = ref([])
const mySettimes = ref([])
const mySetTypes = ref([])

// Get artist's claimed Open Decks slots from their settimes
const myClaimedSlots = computed(() => {
  const claimed = []
  mySettimes.value.forEach((settime, index) => {
    if (mySetTypes.value[index] === 'open_decks') {
      const settimeDate = settime.toDate ? settime.toDate() : new Date(settime)
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      claimed.push({
        settime: settimeDate,
        day: dayNames[settimeDate.getDay()],
        index
      })
    }
  })
  return claimed.sort((a, b) => a.settime - b.settime)
})

// Calculate available time windows
const availableTimeWindows = computed(() => {
  const windows = []
  
  openDecksWindows.value.forEach(window => {
    const claimed = window.claimed_slots || []
    const totalClaimed = claimed.reduce((sum, slot) => sum + (slot.duration || 0), 0)
    const availableMinutes = window.duration - totalClaimed
    
    if (availableMinutes >= SLOT_DURATION) {
      windows.push({
        id: window.id,
        day: window.day,
        settime: window.settime.toDate ? window.settime.toDate() : new Date(window.settime),
        duration: window.duration,
        claimed_slots: claimed,
        availableMinutes
      })
    }
  })
  
  return windows.sort((a, b) => a.settime - b.settime)
})

async function fetchData() {
  loading.value = true
  error.value = null
  try {
    // Fetch Open Decks windows
    const col = collection(reunion_db, 'open_decks_2026')
    const q = query(col, orderBy('settime', 'asc'))
    const snapshot = await getDocs(q)
    openDecksWindows.value = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }))

    // Fetch artist's current settimes and set_types
    const participantRef = doc(reunion_db, 'participants_2026', props.participantId)
    const participantSnap = await getDoc(participantRef)
    if (participantSnap.exists()) {
      const data = participantSnap.data()
      mySettimes.value = data.settimes || []
      mySetTypes.value = data.set_types || []
    }
  } catch (err) {
    console.error('Error fetching data:', err)
    error.value = 'Failed to load data. Please try again.'
  } finally {
    loading.value = false
  }
}

async function claimFromWindow(window) {
  error.value = null
  try {
    // Find next available start time in this window
    const claimed = window.claimed_slots || []
    let startOffset = 0
    
    // Sort claimed slots by startOffset
    const sortedClaimed = [...claimed].sort((a, b) => a.startOffset - b.startOffset)
    
    // Find first 20-min gap
    for (const claim of sortedClaimed) {
      if (claim.startOffset - startOffset >= SLOT_DURATION) {
        break // Found a gap
      }
      startOffset = claim.startOffset + claim.duration
    }
    
    // Calculate the actual datetime for this slot
    const windowStart = window.settime.getTime()
    const slotStart = new Date(windowStart + startOffset * 60 * 1000)
    
    // Get current participant data
    const participantRef = doc(reunion_db, 'participants_2026', props.participantId)
    const participantSnap = await getDoc(participantRef)
    const data = participantSnap.data()
    
    // Add to parallel arrays
    const settimes = [...(data.settimes || []), slotStart]
    const setTypes = [...(data.set_types || []), 'open_decks']
    const setDurations = [...(data.set_durations || []), SLOT_DURATION]
    
    // Update participant document
    await updateDoc(participantRef, {
      settimes,
      set_types: setTypes,
      set_durations: setDurations
    })
    
    // Add to Open Decks window's claimed_slots
    const windowRef = doc(reunion_db, 'open_decks_2026', window.id)
    await updateDoc(windowRef, {
      claimed_slots: arrayUnion({
        participantId: props.participantId,
        participantName: props.participantName,
        startOffset,
        duration: SLOT_DURATION
      })
    })
    
    // Refresh data
    await fetchData()
  } catch (err) {
    console.error('Error claiming slot:', err)
    error.value = 'Failed to claim slot. Please try again.'
  }
}

async function releaseSlot(mySlot) {
  error.value = null
  try {
    // Find which Open Decks window this came from
    const slotTime = mySlot.settime.getTime()
    let foundWindow = null
    let claimedSlotData = null
    
    for (const window of openDecksWindows.value) {
      const windowStart = (window.settime.toDate ? window.settime.toDate() : new Date(window.settime)).getTime()
      const windowEnd = windowStart + window.duration * 60 * 1000
      
      if (slotTime >= windowStart && slotTime < windowEnd) {
        const startOffset = Math.floor((slotTime - windowStart) / (60 * 1000))
        claimedSlotData = (window.claimed_slots || []).find(
          slot => slot.participantId === props.participantId && slot.startOffset === startOffset
        )
        if (claimedSlotData) {
          foundWindow = window
          break
        }
      }
    }
    
    if (!foundWindow || !claimedSlotData) {
      error.value = 'Could not find this slot to release.'
      return
    }
    
    // Remove from artist's settimes using array manipulation
    const participantRef = doc(reunion_db, 'participants_2026', props.participantId)
    const participantSnap = await getDoc(participantRef)
    const data = participantSnap.data()
    const settimes = [...(data.settimes || [])]
    const setTypes = [...(data.set_types || [])]
    const setDurations = [...(data.set_durations || [])]
    
    // Find and remove this specific settime
    const settimeToRemove = mySlot.settime
    let indexToRemove = -1
    
    for (let i = 0; i < settimes.length; i++) {
      const st = settimes[i].toDate ? settimes[i].toDate() : new Date(settimes[i])
      if (Math.abs(st.getTime() - settimeToRemove.getTime()) < 1000 && setTypes[i] === 'open_decks') {
        indexToRemove = i
        break
      }
    }
    
    if (indexToRemove !== -1) {
      settimes.splice(indexToRemove, 1)
      setTypes.splice(indexToRemove, 1)
      setDurations.splice(indexToRemove, 1)
      
      await updateDoc(participantRef, {
        settimes,
        set_types: setTypes,
        set_durations: setDurations
      })
    }
    
    // Remove from Open Decks window's claimed_slots
    const windowRef = doc(reunion_db, 'open_decks_2026', foundWindow.id)
    const windowSnap = await getDoc(windowRef)
    const windowData = windowSnap.data()
    const claimedSlots = (windowData.claimed_slots || []).filter(
      slot => !(slot.participantId === props.participantId && slot.startOffset === claimedSlotData.startOffset)
    )
    
    await updateDoc(windowRef, {
      claimed_slots: claimedSlots
    })
    
    // Refresh data
    await fetchData()
  } catch (err) {
    console.error('Error releasing slot:', err)
    error.value = 'Failed to release slot. Please try again.'
  }
}

function formatDay(day) {
  if (!day) return ''
  return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  let h = date.getHours()
  const m = date.getMinutes()
  const period = h < 12 ? 'AM' : 'PM'
  if (h === 0) h = 12
  else if (h > 12) h -= 12
  return `${h}:${m.toString().padStart(2, '0')} ${period}`
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  text-align: center;
  color: white;
  border: 2px solid var(--reunion-frog-green);
  border-radius: 15px;
  background-color: rgba(0, 0, 0, 0.8);
  position: relative;
  margin-top: 2rem;
}

.festivall-emblem {
  position: absolute;
  top: 10px;
  left: 10px;
}

.modal-close {
  position: sticky;
  top: 15px;
  font-size: 24px;
  color: white;
  cursor: pointer;
  z-index: 12;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  transition: background-color 0.2s ease;
  align-self: flex-end;
  margin-bottom: -30px;
  border: none;
  padding: 0;
  line-height: 1;
}

.modal-close::before {
  content: '✕';
}

.modal-close:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

h2 {
  font-size: 1.5rem;
  margin: 1rem 0;
  color: white;
  font-weight: bold;
}

h3 {
  font-size: 1rem;
  line-height: 1.4;
  margin: 0.75rem 0;
  font-weight: normal;
}

.modal-subtitle {
  color: #ddd;
  margin: 0 0 1.5rem;
  font-size: 1rem;
  line-height: 1.4;
}

.slots-info {
  color: var(--reunion-frog-green);
  font-weight: 700;
  font-size: 0.95rem;
}

.loading-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #aaa;
  font-size: 1rem;
}

.no-slots {
  text-align: center;
  padding: 3rem 1rem;
}

.no-slots p {
  color: #aaa;
  margin: 0.5rem 0;
}

.no-slots .hint {
  font-size: 0.85rem;
  color: #888;
}

.slots-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  width: 100%;
  justify-content: center;
}

.slot-card {
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid var(--reunion-frog-green);
  border-radius: 10px;
  padding: 1rem;
  transition: all 0.2s;
  width: 100%;
  max-width: 320px;
  min-width: 280px;
}

.slot-card:not(.slot-mine):hover {
  border-color: #fff;
  box-shadow: 0 4px 12px rgba(106, 204, 106, 0.3);
  transform: translateY(-2px);
}

.slot-card.slot-mine {
  border-color: #6acc6a;
  background: rgba(106, 204, 106, 0.15);
}

.slot-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.slot-day {
  font-weight: 700;
  color: var(--reunion-frog-green);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.slot-time {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
}

.slot-duration {
  color: #aaa;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  text-align: left;
}

.slot-status {
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}

.slot-status.mine {
  background: rgba(106, 204, 106, 0.2);
  color: #6acc6a;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.claim-btn {
  width: 100%;
  min-height: 48px;
  padding: 0.6rem 1rem;
  background-color: var(--reunion-frog-green);
  color: white;
  border: 2px solid var(--reunion-frog-green);
  border-radius: 25px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.claim-btn:hover {
  background-color: transparent;
  color: var(--reunion-frog-green);
  transform: scale(1.02);
}

.claim-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.claim-btn:disabled:hover {
  background: var(--reunion-frog-green);
  color: #fff;
  transform: none;
}

.unclaim-btn {
  padding: 0.35rem 0.75rem;
  background: transparent;
  color: #f66;
  border: 1px solid #f66;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.unclaim-btn:hover {
  background: #f66;
  color: #fff;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(255, 102, 102, 0.15);
  border: 1px solid #f66;
  border-radius: 6px;
  color: #f66;
  font-size: 0.9rem;
  text-align: center;
  width: 100%;
}

@media (max-width: 768px) {
  .modal-content {
    padding: 1.5rem 1rem;
    max-width: 100%;
  }
  
  .slots-container {
    flex-direction: column;
    align-items: center;
  }
  
  .slot-card {
    max-width: 100%;
    min-width: 0;
  }
  
  h2 {
    font-size: 1.3rem;
  }
  
  .modal-subtitle {
    font-size: 0.85rem;
  }
  
  .slot-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .slot-time {
    font-size: 1rem;
  }
  
  .slot-status.mine {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
  
  .unclaim-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-content {
    padding: 1.5rem 0.75rem;
    border-radius: 10px;
  }
  
  h2 {
    font-size: 1.2rem;
  }
  
  .slot-card {
    padding: 0.75rem;
  }
  
  img[alt="Festivall Emblem"],
  img[alt="Open Decks Icon"] {
    height: 48px !important;
  }
}
</style>
