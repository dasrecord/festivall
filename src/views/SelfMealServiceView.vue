<template>
  <div class="self-meal-page">
    <img
      :src="festivall_emblem"
      style="height: 50px; width: 75px; margin: auto; display: block"
      alt="Festivall Emblem"
    />
    <h1>REUNION 2026 SELF MEAL SERVICE</h1>

    <div class="instructions">
      <h3>🍽️ How to Redeem Meal Tickets:</h3>
      <ol>
        <li>Enter your ID Code below</li>
        <li>Confirm your meal ticket redemption</li>
        <li>Show confirmation to Food Team if needed</li>
        <li>Enjoy your meal!</li>
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

      <div class="meal-tickets-display">
        <h4>Meal Tickets Remaining:</h4>
        <div class="meal-tickets">
          <img
            v-for="n in participant.meal_tickets_remaining"
            :key="n"
            src="@/assets/images/icons/meals.png"
            alt="Meal Ticket"
            class="meal-icon"
          />
          <span v-if="participant.meal_tickets_remaining === 0" class="no-meals">
            No meal tickets remaining
          </span>
        </div>
        <p class="meal-count">{{ participant.meal_tickets_remaining }} tickets available</p>
      </div>

      <div v-if="participant.meal_tickets_remaining > 0" class="action-section">
        <button @click="redeemMealTicket" :disabled="isProcessing" class="redeem-btn">
          {{ isProcessing ? 'Processing...' : '🍽️ Redeem 1 Meal Ticket' }}
        </button>
      </div>

      <div v-else class="no-tickets">
        <h4>❌ No Meal Tickets Available</h4>
        <p>You can purchase additional meals for $15 cash at the food station.</p>
      </div>
    </div>

    <div v-else-if="idCode && idCode.length > 2" class="no-participant">
      <p>❌ No participant found with ID code: {{ idCode }}</p>
      <p>Please check your ID code or contact Food Team for assistance.</p>
    </div>

    <div v-if="resultMessage" class="result-message" :class="resultType">
      <h3>{{ resultMessage }}</h3>
      <p v-if="resultType === 'success'">✅ Please show this screen to Food Team</p>
      <p v-if="resultType === 'success'">🍽️ Enjoy your meal!</p>
    </div>

    <!-- Recent Redemptions -->
    <div
      v-if="
        participant &&
        participant.meal_redemption_history &&
        participant.meal_redemption_history.length > 0
      "
      class="recent-redemptions"
    >
      <h3>Recent Meal Redemptions</h3>
      <div class="redemption-list">
        <div
          v-for="(redemption, index) in participant.meal_redemption_history.slice(-5)"
          :key="index"
          class="redemption-item"
        >
          <span class="redemption-count"
            >{{ redemption.tickets_redeemed }} ticket{{
              redemption.tickets_redeemed !== 1 ? 's' : ''
            }}</span
          >
          <span class="redemption-time">{{ formatTime(redemption.timestamp) }}</span>
          <span class="redemption-day">{{ redemption.festival_day }}</span>
          <span v-if="redemption.reason" class="redemption-reason">{{ redemption.reason }}</span>
        </div>
      </div>
    </div>

    <div class="meal-info">
      <h3>🕐 Meal Service Hours</h3>
      <div class="service-hours">
        <div class="meal-time"><strong>Lunch:</strong> 11:00 AM - 3:00 PM</div>
        <div class="meal-time"><strong>Dinner:</strong> 5:00 PM - 9:00 PM</div>
      </div>
    </div>

    <div class="help-section">
      <h3>Need Help?</h3>
      <p>🍽️ Find a Food Team volunteer</p>
      <p>📱 Or use the food scanner station</p>
      <p>💰 Additional meals: $15 cash</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { reunion_db } from '@/firebase'
import { collection, doc, updateDoc, getDocs, query, where } from 'firebase/firestore'
import festivall_emblem from '@/assets/images/festivall_emblem_white.png'

export default {
  name: 'SelfMealServiceView',
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
            meal_tickets_remaining: p.order?.meal_tickets_remaining || 0,
            meal_redemption_history: p.activity?.meal_redemption_history || []
          }
        } else {
          participant.value = null
        }
      } catch (error) {
        console.error('Error looking up participant:', error)
        participant.value = null
      }
    }

    const redeemMealTicket = async () => {
      if (!participant.value || participant.value.meal_tickets_remaining <= 0) return

      isProcessing.value = true
      resultMessage.value = ''

      try {
        const timestamp = new Date().toISOString()
        const festivalDay = getFestivalDay(timestamp)
        const newMealTickets = participant.value.meal_tickets_remaining - 1

        const redemptionEntry = {
          timestamp,
          tickets_redeemed: 1,
          remaining_after: newMealTickets,
          redeemed_by: 'self_service',
          festival_day: festivalDay,
          reason: 'Self-service redemption'
        }

        const existingHistory = participant.value.meal_redemption_history || []
        const updatedHistory = [...existingHistory, redemptionEntry]

        await updateDoc(doc(reunion_db, 'participants_2026', participant.value.id_code), {
          'order.meal_tickets_remaining': newMealTickets,
          'activity.last_meal_redemption': timestamp,
          'activity.meal_redemption_history': updatedHistory
        })

        participant.value.meal_tickets_remaining = newMealTickets
        participant.value.meal_redemption_history = updatedHistory

        resultMessage.value = `Meal ticket redeemed successfully! ${newMealTickets} tickets remaining.`
        resultType.value = 'success'

        // Clear result message after 10 seconds
        setTimeout(() => {
          resultMessage.value = ''
          resultType.value = ''
        }, 10000)
      } catch (error) {
        console.error('Error redeeming meal ticket:', error)
        resultMessage.value = 'Redemption failed. Please try again or contact Food Team.'
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

    onMounted(() => {
      // Focus on input when page loads
      const input = document.getElementById('idCode')
      if (input) input.focus()
    })

    return {
      festivall_emblem,
      idCode,
      participant,
      isProcessing,
      resultMessage,
      resultType,
      lookupParticipant,
      redeemMealTicket,
      formatTime
    }
  }
}
</script>

<style scoped>
.self-meal-page {
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

.meal-tickets-display {
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.meal-tickets-display h4 {
  color: white;
  margin-bottom: 1rem;
}

.meal-tickets {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.meal-icon {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.5));
}

.no-meals {
  color: #ff6666;
  font-weight: bold;
  font-style: italic;
}

.meal-count {
  color: var(--festivall-baby-blue);
  font-weight: bold;
  font-size: 1.1rem;
}

.action-section {
  margin-top: 1.5rem;
}

.redeem-btn {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  min-width: 250px;
  background: linear-gradient(45deg, #ff9800, #f57c00);
  color: white;
}

.redeem-btn:hover:not(:disabled) {
  background: linear-gradient(45deg, #f57c00, #ef6c00);
  transform: scale(1.02);
}

.redeem-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.no-tickets {
  background: rgba(100, 0, 0, 0.2);
  border: 2px solid #f44336;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  color: #ff6666;
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

.recent-redemptions {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--festivall-baby-blue);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.recent-redemptions h3 {
  color: var(--festivall-baby-blue);
  margin-bottom: 1rem;
}

.redemption-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.redemption-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  font-size: 0.9rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.redemption-count {
  font-weight: bold;
  color: #ff9800;
}

.redemption-time {
  color: #ccc;
  font-size: 0.8rem;
}

.redemption-day {
  color: var(--festivall-baby-blue);
  font-weight: bold;
}

.redemption-reason {
  color: #999;
  font-style: italic;
  font-size: 0.8rem;
}

.meal-info {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid #4caf50;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.meal-info h3 {
  color: #4caf50;
  margin-bottom: 1rem;
}

.service-hours {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 1rem;
}

.meal-time {
  background: rgba(0, 100, 0, 0.2);
  padding: 0.8rem;
  border-radius: 4px;
  border: 1px solid #4caf50;
  color: white;
  font-size: 1.1rem;
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
  .self-meal-page {
    padding: 1rem;
  }

  .id-input {
    min-width: 250px;
    font-size: 1rem;
  }

  .redeem-btn {
    font-size: 1rem;
    padding: 0.8rem 1.5rem;
    min-width: 200px;
  }

  .redemption-item {
    flex-direction: column;
    text-align: center;
    gap: 0.25rem;
  }

  .service-hours {
    flex-direction: column;
    align-items: center;
  }

  .meal-time {
    width: 100%;
    max-width: 250px;
    text-align: center;
  }
}
</style>
