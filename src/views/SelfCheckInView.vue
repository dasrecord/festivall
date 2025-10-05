<template>
  <div class="self-checkin-page">
    <img
      :src="festivall_emblem"
      style="height: 50px; width: 75px; margin: auto; display: block"
      alt="Festivall Emblem"
    />
    <h1>REUNION 2026 SELF CHECK-IN</h1>

    <div class="instructions">
      <h3>📱 How to Use Self Check-In:</h3>
      <ol>
        <li>Enter your ID Code below</li>
        <li>Select Check In or Check Out</li>
        <li>Show confirmation to Front Gate volunteer if needed</li>
      </ol>
    </div>

    <div class="id-input-section">
      <label for="idCode">Enter Your ID Code:</label>
      <input
        id="idCode"
        v-model="idCode"
        placeholder="Enter your ID code"
        class="id-input"
        @input="lookupParticipant"
      />
    </div>

    <div v-if="participant" class="participant-info">
      <h3>✅ Participant Found</h3>
      <p><strong>Name:</strong> {{ participant.fullname }}</p>
      <p><strong>Ticket Type:</strong> {{ participant.ticket_type }}</p>
      <p>
        <strong>Current Status:</strong>
        <span :class="participant.checked_in ? 'checked-in' : 'checked-out'">
          {{ participant.checked_in ? 'Checked In' : 'Checked Out' }}
        </span>
      </p>

      <div class="action-buttons">
        <button
          v-if="!participant.checked_in"
          @click="checkIn"
          :disabled="isProcessing"
          class="check-in-btn"
        >
          {{ isProcessing ? 'Processing...' : '🟢 Check In' }}
        </button>

        <button
          v-if="participant.checked_in"
          @click="checkOut"
          :disabled="isProcessing"
          class="check-out-btn"
        >
          {{ isProcessing ? 'Processing...' : '🔴 Check Out' }}
        </button>
      </div>
    </div>

    <div v-else-if="idCode && idCode.length > 2" class="no-participant">
      <p>❌ No participant found with ID code: {{ idCode }}</p>
      <p>Please check your ID code or contact Front Gate for assistance.</p>
    </div>

    <div v-if="resultMessage" class="result-message" :class="resultType">
      <h3>{{ resultMessage }}</h3>
      <p v-if="resultType === 'success'">✅ Please show this screen to Front Gate if requested</p>
    </div>

    <!-- Recent Activity -->
    <div v-if="participant && participant.entrance_activity_history" class="recent-activity">
      <h3>Recent Activity</h3>
      <div class="activity-list">
        <div
          v-for="(activity, index) in participant.entrance_activity_history.slice(-3)"
          :key="index"
          class="activity-item"
        >
          <span class="activity-action">{{
            activity.action === 'check_in' ? '🟢 Check In' : '🔴 Check Out'
          }}</span>
          <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
          <span class="activity-day">{{ activity.festival_day }}</span>
        </div>
      </div>
    </div>

    <div class="help-section">
      <h3>Need Help?</h3>
      <p>🚪 Find a Front Gate volunteer</p>
      <p>📱 Or use the regular scanner station</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { reunion_db } from '@/firebase'
import { collection, doc, updateDoc, getDocs, query, where } from 'firebase/firestore'
import festivall_emblem from '@/assets/images/festivall_emblem_white.png'

export default {
  name: 'SelfCheckInView',
  setup() {
    const idCode = ref('')
    const participant = ref(null)
    const isProcessing = ref(false)
    const resultMessage = ref('')
    const resultType = ref('')

    const lookupParticipant = async () => {
      if (!idCode.value || idCode.value.length < 3) {
        participant.value = null
        return
      }

      try {
        const q = query(
          collection(reunion_db, 'participants_2026'),
          where('id_code', '==', idCode.value.toLowerCase().trim())
        )
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const p = querySnapshot.docs[0].data()
          participant.value = {
            id_code: p.id_code,
            fullname: p.contact?.fullname || '',
            ticket_type: p.order?.ticket_type || '',
            checked_in: p.order?.checked_in || false,
            entrance_activity_history: p.activity?.entrance_activity_history || []
          }
        } else {
          participant.value = null
        }
      } catch (error) {
        console.error('Error looking up participant:', error)
        participant.value = null
      }
    }

    const checkIn = async () => {
      if (!participant.value) return

      isProcessing.value = true
      resultMessage.value = ''

      try {
        const timestamp = new Date().toISOString()
        const festivalDay = getFestivalDay(timestamp)

        const activityEntry = {
          timestamp,
          action: 'check_in',
          festival_day: festivalDay,
          operator: 'self_service',
          operator_name: 'Self Check-In'
        }

        const existingHistory = participant.value.entrance_activity_history || []
        const updatedHistory = [...existingHistory, activityEntry]

        await updateDoc(doc(reunion_db, 'participants_2026', participant.value.id_code), {
          'order.checked_in': true,
          'activity.entrance_activity_history': updatedHistory,
          'activity.last_entrance_activity': timestamp
        })

        participant.value.checked_in = true
        participant.value.entrance_activity_history = updatedHistory

        resultMessage.value = `Welcome to Reunion 2026, ${participant.value.fullname}!`
        resultType.value = 'success'
      } catch (error) {
        console.error('Error checking in:', error)
        resultMessage.value = 'Check-in failed. Please try again or contact Front Gate.'
        resultType.value = 'error'
      } finally {
        isProcessing.value = false
      }
    }

    const checkOut = async () => {
      if (!participant.value) return

      isProcessing.value = true
      resultMessage.value = ''

      try {
        const timestamp = new Date().toISOString()
        const festivalDay = getFestivalDay(timestamp)

        const activityEntry = {
          timestamp,
          action: 'check_out',
          festival_day: festivalDay,
          operator: 'self_service',
          operator_name: 'Self Check-Out'
        }

        const existingHistory = participant.value.entrance_activity_history || []
        const updatedHistory = [...existingHistory, activityEntry]

        await updateDoc(doc(reunion_db, 'participants_2026', participant.value.id_code), {
          'order.checked_in': false,
          'activity.entrance_activity_history': updatedHistory,
          'activity.last_entrance_activity': timestamp
        })

        participant.value.checked_in = false
        participant.value.entrance_activity_history = updatedHistory

        resultMessage.value = `Thank you for visiting, ${participant.value.fullname}! Safe travels.`
        resultType.value = 'success'
      } catch (error) {
        console.error('Error checking out:', error)
        resultMessage.value = 'Check-out failed. Please try again or contact Front Gate.'
        resultType.value = 'error'
      } finally {
        isProcessing.value = false
      }
    }

    const getFestivalDay = (timestamp) => {
      const date = new Date(timestamp)
      const festivalStart = new Date('2026-09-04T12:00:00')
      const daysDiff = Math.floor((date - festivalStart) / (1000 * 60 * 60 * 24))

      if (daysDiff < 0) return 'Pre-Festival'
      if (daysDiff === 0) return 'Friday'
      if (daysDiff === 1) return 'Saturday'
      if (daysDiff === 2) return 'Sunday'
      if (daysDiff === 3) return 'Monday (Labour Day)'
      return 'Post-Festival'
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleString()
    }

    // Clear result message after 10 seconds
    const clearResultMessage = () => {
      setTimeout(() => {
        resultMessage.value = ''
        resultType.value = ''
      }, 10000)
    }

    onMounted(() => {
      // Focus on input when page loads
      const input = document.getElementById('idCode')
      if (input) input.focus()
    })

    // Watch for result messages and auto-clear
    const originalResultMessage = resultMessage.value
    if (originalResultMessage !== resultMessage.value) {
      clearResultMessage()
    }

    return {
      festivall_emblem,
      idCode,
      participant,
      isProcessing,
      resultMessage,
      resultType,
      lookupParticipant,
      checkIn,
      checkOut,
      formatTime
    }
  }
}
</script>

<style scoped>
.self-checkin-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  color: var(--festivall-baby-blue);
  margin-bottom: 2rem;
}

.instructions {
  background: rgba(0, 0, 0, 0.6);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 2px solid var(--festivall-baby-blue);
}

.instructions ol {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
}

.id-input-section {
  margin-bottom: 2rem;
}

.id-input-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: white;
}

.id-input {
  padding: 1rem;
  font-size: 1.2rem;
  border: 2px solid var(--festivall-baby-blue);
  border-radius: 8px;
  background: white;
  color: black;
  text-align: center;
  min-width: 300px;
}

.id-input:focus {
  outline: none;
  border-color: #0056b3;
  box-shadow: 0 0 10px rgba(121, 188, 255, 0.5);
}

.participant-info {
  background: rgba(0, 100, 0, 0.2);
  border: 2px solid #4caf50;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.participant-info h3 {
  color: #4caf50;
  margin-bottom: 1rem;
}

.participant-info p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.checked-in {
  color: #4caf50;
  font-weight: bold;
}

.checked-out {
  color: #ff9800;
  font-weight: bold;
}

.action-buttons {
  margin-top: 1.5rem;
}

.check-in-btn,
.check-out-btn {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  min-width: 200px;
}

.check-in-btn {
  background: linear-gradient(45deg, #4caf50, #2e7d32);
  color: white;
}

.check-in-btn:hover:not(:disabled) {
  background: linear-gradient(45deg, #2e7d32, #1b5e20);
}

.check-out-btn {
  background: linear-gradient(45deg, #f44336, #c62828);
  color: white;
}

.check-out-btn:hover:not(:disabled) {
  background: linear-gradient(45deg, #c62828, #b71c1c);
}

.check-in-btn:disabled,
.check-out-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.no-participant {
  background: rgba(100, 0, 0, 0.2);
  border: 2px solid #f44336;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  color: #ff6666;
}

.result-message {
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  font-weight: bold;
}

.result-message.success {
  background: rgba(0, 150, 0, 0.2);
  border: 2px solid #4caf50;
  color: #4caf50;
}

.result-message.error {
  background: rgba(150, 0, 0, 0.2);
  border: 2px solid #f44336;
  color: #ff6666;
}

.recent-activity {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--festivall-baby-blue);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.recent-activity h3 {
  color: var(--festivall-baby-blue);
  margin-bottom: 1rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  font-size: 0.9rem;
}

.activity-action {
  font-weight: bold;
}

.activity-time {
  color: #ccc;
  font-size: 0.8rem;
}

.activity-day {
  color: var(--festivall-baby-blue);
  font-weight: bold;
}

.help-section {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid #666;
  padding: 1rem;
  border-radius: 8px;
  color: #ccc;
}

.help-section h3 {
  color: white;
  margin-bottom: 0.5rem;
}

.help-section p {
  margin: 0.25rem 0;
}

@media (max-width: 768px) {
  .self-checkin-page {
    padding: 1rem;
  }

  .id-input {
    min-width: 250px;
    font-size: 1rem;
  }

  .check-in-btn,
  .check-out-btn {
    font-size: 1rem;
    padding: 0.8rem 1.5rem;
    min-width: 180px;
  }

  .activity-item {
    flex-direction: column;
    text-align: center;
    gap: 0.25rem;
  }
}
</style>
