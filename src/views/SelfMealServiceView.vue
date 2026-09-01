<template>
  <div class="self-meal-page" :class="{ landscape: isLandscape }">
    <!-- Layout Toggle -->
    <button @click="toggleLayout" class="layout-toggle" aria-label="Toggle Layout">
      {{ isLandscape ? '📱 Portrait' : '🖥️ Landscape' }}
    </button>

    <!-- Top Nav Bar (Landscape only) -->
    <div v-if="isLandscape" class="top-nav">
      <img
        :src="festivall_emblem"
        class="emblem-nav"
        alt="Festivall Emblem"
      />
      <h1 class="nav-title">REUNION 2026 SELF MEAL SERVICE</h1>
    </div>

    <!-- Main Container -->
    <div class="main-container" :class="{ 'with-nav': isLandscape }">
      <!-- Left Column (Landscape) / Top Section (Portrait) -->
      <div class="section-header">
        <img
          v-if="!isLandscape"
          :src="festivall_emblem"
          class="emblem"
          alt="Festivall Emblem"
        />
        <h1 v-if="!isLandscape">REUNION 2026<br>SELF MEAL SERVICE</h1>

        <div class="instructions">
        <h3>🍽️ How to Use:</h3>
        <ol>
          <li>Enter your ID Code or scan QR code</li>
          <li>Confirm your meal ticket redemption</li>
          <li>Show confirmation to Food Team</li>
          <li>Enjoy your meal!</li>
        </ol>
      </div>

      <div class="meal-info">
        <h3>🕐 Meal Service Hours</h3>
        <div class="service-hours">
          <div class="meal-time"><strong>Lunch:</strong> 12-2 PM</div>
          <div class="meal-time"><strong>Dinner:</strong> 6-8 PM</div>
        </div>
      </div>

      <div class="help-section">
        <h3>Need Help?</h3>
        <p>🍽️ Find a Food Team volunteer</p>
        <p>📱 Or use the food scanner station</p>
        <p>💰 Additional meals: $15 cash</p>
      </div>
      </div>

      <!-- Middle Column (Landscape) / Main Section (Portrait) -->
      <div class="section-main">
      <!-- QR Scanner Section -->
    <div v-if="hasWebcam" class="scanner-section">
      <div class="scanner-toggle">
        <button v-if="!showScanner" @click="showScanner = true" class="scanner-btn">
          📷 Scan QR Code
        </button>
        <button v-else @click="showScanner = false" class="scanner-btn">⌨️ Manual Entry</button>
      </div>

      <div v-if="showScanner" class="qr-scanner-container">
        <QrcodeStream @detect="onQrDetect" @init="onScannerInit" class="qr-scanner" />
        <p class="scanner-hint">Point camera at your QR code</p>
      </div>
    </div>

    <div v-if="!showScanner" class="id-input-section">
      <label for="idCode">Enter Your ID Code:</label>
      <input
        id="idCode"
        v-model="idCode"
        placeholder="Enter your ID code"
        class="id-input"
        @input="lookupParticipant"
      />
      <button @click="resetKiosk" class="refresh-btn">🔄 Refresh / Clear</button>
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
        <button @click="resetKiosk" class="cancel-btn">
          ❌ Cancel
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
      <button @click="resetKiosk" class="done-btn-inline">✅ Done - Next User</button>
    </div>
    </div>

    <!-- Right Column (Landscape) / Bottom Section (Portrait) -->
    <div class="section-info">
      <!-- Menu Display (before participant lookup) -->
      <div v-if="!participant" class="meal-menu-display">
        <h3>🍽️ Meal Schedule</h3>
        <div v-if="currentMeal" class="current-meal-highlight">
          <p class="meal-status" :class="{ 'now-serving': isCurrentlyServing }">
            {{ isCurrentlyServing ? '🔥 NOW SERVING' : '⏰ NEXT UP' }}
          </p>
          <h4>{{ currentMeal.label }}</h4>
          <p class="meal-time">{{ formatMealTime(currentMeal.time) }}</p>
          <ul class="menu-items">
            <li v-for="item in currentMeal.menu" :key="item">{{ item }}</li>
          </ul>
        </div>
        
        <div class="full-menu">
          <h4>Full Menu</h4>
          <div v-for="meal in festivalConfig.meals" :key="meal.label" class="menu-meal-item">
            <strong>{{ meal.label }}:</strong> {{ meal.menu.join(', ') }}
          </div>
        </div>
      </div>
      
      <!-- Recent Redemptions (after participant found) -->
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
    </div>
  </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { reunion_db } from '@/firebase'
import { collection, doc, updateDoc, getDocs, query, where } from 'firebase/firestore'
import festivall_emblem from '@/assets/images/festivall_emblem_white.png'
import { QrcodeStream } from 'vue-qrcode-reader'
import { sendReunionFood } from '/scripts/notifications.js'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'

export default {
  name: 'SelfMealServiceView',
  components: {
    QrcodeStream
  },
  setup() {
    const idCode = ref('')
    const participant = ref(null)
    const isProcessing = ref(false)
    const resultMessage = ref('')
    const resultType = ref('')
    const hasWebcam = ref(false)
    const showScanner = ref(false)
    const isLandscape = ref(false)
    const festivalConfig = REUNION_FESTIVAL

    const currentMeal = computed(() => {
      const now = new Date()
      const meals = festivalConfig.meals
      
      // Find the next upcoming meal or currently being served
      const currentOrNext = meals.find((meal) => {
        const mealTime = new Date(meal.time)
        const mealEnd = new Date(mealTime.getTime() + 2 * 60 * 60 * 1000) // 2 hours after start
        return now < mealEnd
      })
      
      return currentOrNext || meals[meals.length - 1] // Default to last meal if past all
    })

    const isCurrentlyServing = computed(() => {
      if (!currentMeal.value) return false
      const now = new Date()
      const mealTime = new Date(currentMeal.value.time)
      const mealEnd = new Date(mealTime.getTime() + 2 * 60 * 60 * 1000) // 2 hours
      return now >= mealTime && now < mealEnd
    })

    const toggleLayout = () => {
      isLandscape.value = !isLandscape.value
      localStorage.setItem('kioskMealLayout', isLandscape.value ? 'landscape' : 'portrait')
    }

    const checkWebcamAvailability = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        hasWebcam.value = devices.some((device) => device.kind === 'videoinput')
      } catch (error) {
        console.log('No webcam access:', error)
        hasWebcam.value = false
      }
    }

    const onQrDetect = (detectedCodes) => {
      if (detectedCodes.length > 0) {
        const qrContent = detectedCodes[0].rawValue
        idCode.value = qrContent.trim().toLowerCase()
        showScanner.value = false
        lookupParticipant()
      }
    }

    const onScannerInit = async (promise) => {
      try {
        await promise
      } catch (error) {
        console.error('Scanner initialization failed:', error)
        hasWebcam.value = false
        showScanner.value = false
      }
    }

    const lookupParticipant = async () => {
      if (!idCode.value || idCode.value.length < 3) {
        participant.value = null
        return
      }

      try {
        const searchValue = idCode.value.toLowerCase().trim()
        // Try short id_code first (manual entry), then id_code_long (QR scan)
        let querySnapshot = await getDocs(
          query(collection(reunion_db, 'participants_2026'), where('id_code', '==', searchValue))
        )
        if (querySnapshot.empty) {
          querySnapshot = await getDocs(
            query(collection(reunion_db, 'participants_2026'), where('id_code_long', '==', searchValue))
          )
        }

        if (!querySnapshot.empty) {
          const p = querySnapshot.docs[0].data()
          // Don't allow declined applicants to redeem meals
          if (p.status === 'declined') {
            participant.value = null
          } else {
            participant.value = {
              id_code: p.id_code,
              id_code_long: p.id_code_long,
              fullname: p.contact?.fullname || '',
              ticket_type: p.order?.ticket_type || '',
              meal_tickets_remaining: p.order?.meal_tickets_remaining || 0,
              meal_redemption_history: p.order?.meal_redemption_history || [],
              last_meal_redemption: p.order?.last_meal_redemption || null
            }
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
          'order.last_meal_redemption': timestamp,
          'order.meal_redemption_history': updatedHistory
        })

        participant.value.meal_tickets_remaining = newMealTickets
        participant.value.meal_redemption_history = updatedHistory

        sendReunionFood(
          `:fork_and_knife: ${participant.value.fullname} redeemed 1 meal ticket (self).\n:id: ${participant.value.id_code}\n:ticket: Remaining: ${newMealTickets}\n:bust_in_silhouette: Operator: Self Meal Service`
        )

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

    const formatMealTime = (timeString) => {
      const date = new Date(timeString)
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    }

    const resetKiosk = () => {
      idCode.value = ''
      participant.value = null
      isProcessing.value = false
      resultMessage.value = ''
      resultType.value = ''
      showScanner.value = false
      
      // Focus on input after reset
      setTimeout(() => {
        const input = document.getElementById('idCode')
        if (input) input.focus()
      }, 100)
    }

    onMounted(() => {
      // Check for webcam availability
      checkWebcamAvailability()

      // Restore layout preference
      const savedLayout = localStorage.getItem('kioskMealLayout')
      if (savedLayout === 'landscape') {
        isLandscape.value = true
      }

      // Focus on input when page loads
      const input = document.getElementById('idCode')
      if (input) input.focus()
    })

    return {
      festivall_emblem,
      festivalConfig,
      currentMeal,
      isCurrentlyServing,
      idCode,
      participant,
      isProcessing,
      resultMessage,
      resultType,
      hasWebcam,
      showScanner,
      isLandscape,
      toggleLayout,
      lookupParticipant,
      redeemMealTicket,
      formatTime,
      formatMealTime,
      onQrDetect,
      onScannerInit,
      resetKiosk
    }
  }
}
</script>

<style scoped>
.self-meal-page {
  height: 100vh;
  width: 100vw;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.layout-toggle {
  position: fixed;
  top: 10px;
  right: 10px;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid var(--festivall-baby-blue);
  border-radius: 8px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s;
}

.layout-toggle:hover {
  background: rgba(0, 100, 200, 0.8);
  transform: scale(1.05);
}

/* Top Navigation Bar (Landscape) */
.top-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.7);
  border-bottom: 3px solid var(--festivall-baby-blue);
  flex-shrink: 0;
}

.emblem-nav {
  height: 45px;
  width: 67px;
}

.nav-title {
  color: var(--festivall-baby-blue);
  font-size: 1.8rem;
  margin: 0;
  line-height: 1;
}

.nav-reset-btn {
  padding: 0.8rem 1.5rem;
  background: rgba(255, 100, 0, 0.8);
  border: 2px solid #ff6600;
  border-radius: 8px;
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-reset-btn:hover {
  background: rgba(255, 80, 0, 0.9);
  transform: scale(1.05);
}

/* Main Container */
.main-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 1rem;
  overflow: hidden;
  min-height: 0;
}

.main-container.with-nav {
  flex-direction: row;
}

/* Portrait Mode (Default) */
.section-header,
.section-main,
.section-info {
  width: 100%;
  overflow: hidden;
}

.section-header {
  text-align: center;
  flex-shrink: 0;
}

.section-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
}

.section-info {
  flex-shrink: 0;
  overflow-y: auto;
  max-height: 40vh;
}

.emblem {
  height: 50px;
  width: 75px;
  margin: 0 auto 0.5rem;
  display: block;
}

h1 {
  color: var(--festivall-baby-blue);
  font-size: 1.6rem;
  margin-bottom: 1rem;
  line-height: 1.1;
}

/* Landscape Mode */
.self-meal-page.landscape {
  flex-direction: column;
  gap: 0;
  padding: 0;
}

.self-meal-page.landscape .main-container {
  flex-direction: row;
  gap: 1.5rem;
  padding: 1.5rem;
}

.self-meal-page.landscape .section-header {
  flex: 0 0 22%;
  text-align: left;
  overflow: hidden;
  max-height: 100%;
}

.self-meal-page.landscape .main-container .section-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  min-width: 0;
  padding: 2rem;
}

.self-meal-page.landscape .main-container .section-info {
  flex: 0 0 22%;
  overflow-y: auto;
  max-height: 100%;
}

.self-meal-page.landscape .emblem {
  margin: 0 0 1rem 0;
}

.self-meal-page.landscape h1 {
  text-align: left;
  font-size: 1.5rem;
}

.instructions {
  background: rgba(0, 0, 0, 0.6);
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  border: 2px solid var(--festivall-baby-blue);
}

.instructions h3 {
  color: var(--festivall-baby-blue);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.instructions ol {
  text-align: left;
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.95rem;
  line-height: 1.4;
}

.instructions li {
  margin-bottom: 0.3rem;
}

.scanner-section {
  margin: 0 auto 0.8rem;
  padding: 1rem;
  border: 3px solid #4caf50;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.6);
  max-width: 400px;
  width: 100%;
}

.scanner-toggle {
  text-align: center;
  margin-bottom: 1rem;
}

.scanner-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 220px;
}

.scanner-btn:hover {
  background-color: #45a049;
  transform: scale(1.05);
}

.qr-scanner-container {
  text-align: center;
}

.qr-scanner {
  max-width: 300px;
  width: 100%;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  margin: 0 auto;
  border: 3px solid #4caf50;
}

.scanner-hint {
  margin-top: 0.8rem;
  font-style: italic;
  color: #ccc;
  font-size: 1rem;
}

.id-input-section {
  margin-bottom: 1rem;
  text-align: center;
  width: 100%;
  max-width: 500px;
}

.id-input-section label {
  display: block;
  margin-bottom: 0.8rem;
  font-weight: bold;
  color: white;
  font-size: 1.2rem;
}

.id-input {
  padding: 1.2rem;
  font-size: 1.5rem;
  border: 3px solid var(--festivall-baby-blue);
  border-radius: 12px;
  background: white;
  color: black;
  text-align: center;
  min-width: 300px;
  font-weight: bold;
  letter-spacing: 2px;
}

.id-input:focus {
  outline: none;
  border-color: #0056b3;
  box-shadow: 0 0 20px rgba(121, 188, 255, 0.6);
}

.participant-info {
  background: rgba(0, 100, 0, 0.25);
  border: 3px solid #4caf50;
  padding: 1.2rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 600px;
}

.participant-info h3 {
  color: #4caf50;
  margin-bottom: 0.8rem;
  font-size: 1.4rem;
}

.participant-info p {
  margin: 0.6rem 0;
  font-size: 1.1rem;
  line-height: 1.4;
}

.meal-tickets-display {
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
}

.meal-tickets-display h4 {
  color: white;
  margin-bottom: 0.8rem;
  font-size: 1.2rem;
}

.meal-tickets {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
}

.meal-icon {
  width: 36px;
  height: 36px;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.6));
}

.no-meals {
  color: #ff6666;
  font-weight: bold;
  font-style: italic;
  font-size: 1.1rem;
}

.meal-count {
  color: var(--festivall-baby-blue);
  font-weight: bold;
  font-size: 1.2rem;
}

.action-section {
  margin-top: 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  flex-shrink: 0;
}

.redeem-btn,
.cancel-btn {
  padding: 1.5rem 2.5rem;
  font-size: 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  min-width: 300px;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.redeem-btn {
  background: linear-gradient(45deg, #ff9800, #f57c00);
  color: white;
}

.redeem-btn:hover:not(:disabled) {
  background: linear-gradient(45deg, #f57c00, #ef6c00);
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

.redeem-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.cancel-btn {
  background: linear-gradient(45deg, #9e9e9e, #616161);
  color: white;
}

.cancel-btn:hover {
  background: linear-gradient(45deg, #757575, #424242);
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

.refresh-btn {
  margin-top: 1rem;
  padding: 1rem 1.8rem;
  font-size: 1.2rem;
  border: 2px solid #0066cc;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  min-width: 250px;
  background: linear-gradient(45deg, #0066cc, #004499);
  color: white;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.refresh-btn:hover {
  background: linear-gradient(45deg, #0055aa, #003377);
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

.done-btn-inline {
  margin-top: 1rem;
  padding: 1.2rem 2rem;
  font-size: 1.3rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  min-width: 250px;
  background: linear-gradient(45deg, #4caf50, #2e7d32);
  color: white;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.done-btn-inline:hover {
  background: linear-gradient(45deg, #2e7d32, #1b5e20);
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

.no-tickets {
  background: rgba(100, 0, 0, 0.25);
  border: 3px solid #f44336;
  padding: 1.2rem;
  border-radius: 12px;
  margin-top: 1rem;
  color: #ff6666;
  font-size: 1.1rem;
}

.no-participant {
  background: rgba(100, 0, 0, 0.25);
  border: 3px solid #f44336;
  padding: 1.2rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  color: #ff6666;
  font-size: 1.1rem;
  width: 100%;
  max-width: 500px;
  margin: 0 auto 1rem;
}

.result-message {
  padding: 1.2rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  font-weight: bold;
  font-size: 1.2rem;
  text-align: center;
  flex-shrink: 0;
}

.result-message h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.result-message.success {
  background: rgba(0, 150, 0, 0.25);
  border: 3px solid #4caf50;
  color: #4caf50;
}

.result-message.error {
  background: rgba(150, 0, 0, 0.25);
  border: 3px solid #f44336;
  color: #ff6666;
}

.meal-menu-display {
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid var(--festivall-baby-blue);
  padding: 1rem;
  border-radius: 10px;
}

.meal-menu-display h3 {
  color: var(--festivall-baby-blue);
  margin-bottom: 0.8rem;
  font-size: 1.2rem;
}

.meal-menu-display h4 {
  color: #ff9800;
  margin: 0.5rem 0;
  font-size: 1rem;
}

.current-meal-highlight {
  background: rgba(255, 152, 0, 0.15);
  border: 2px solid #ff9800;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.meal-status {
  font-size: 0.9rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  text-align: center;
}

.meal-status.now-serving {
  color: #4caf50;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.meal-time {
  color: #ccc;
  font-size: 0.9rem;
  margin: 0.3rem 0;
}

.menu-items {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
}

.menu-items li {
  padding: 0.4rem 0;
  color: white;
  font-size: 0.9rem;
}

.full-menu {
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(121, 188, 255, 0.3);
}

.menu-meal-item {
  padding: 0.5rem 0;
  font-size: 0.85rem;
  line-height: 1.4;
  color: #ddd;
}

.menu-meal-item strong {
  color: var(--festivall-baby-blue);
}

.recent-redemptions {
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid var(--festivall-baby-blue);
  padding: 1rem;
  border-radius: 10px;
}

.recent-redemptions h3 {
  color: var(--festivall-baby-blue);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
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
  padding: 0.6rem;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 6px;
  font-size: 0.9rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.redemption-count {
  font-weight: bold;
  color: #ff9800;
  font-size: 1rem;
}

.redemption-time {
  color: #ccc;
  font-size: 0.8rem;
}

.redemption-day {
  color: var(--festivall-baby-blue);
  font-weight: bold;
  font-size: 0.9rem;
}

.redemption-reason {
  color: #999;
  font-style: italic;
  font-size: 0.8rem;
}

.meal-info {
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #4caf50;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.meal-info h3 {
  color: #4caf50;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.service-hours {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.meal-time {
  background: rgba(0, 100, 0, 0.25);
  padding: 0.6rem;
  border-radius: 6px;
  border: 2px solid #4caf50;
  color: white;
  font-size: 0.95rem;
  font-weight: bold;
}

.help-section {
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #666;
  padding: 1rem;
  border-radius: 10px;
  color: #ccc;
}

.help-section h3 {
  color: white;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.help-section p {
  margin: 0.3rem 0;
  font-size: 0.95rem;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .self-meal-page.landscape {
    flex-direction: column;
  }

  .self-meal-page.landscape .section-header,
  .self-meal-page.landscape .section-main,
  .self-meal-page.landscape .section-info {
    flex: auto;
    width: 100%;
  }
}

@media (max-width: 768px) {
  h1 {
    font-size: 1.6rem;
  }

  .id-input {
    min-width: 280px;
    font-size: 1.4rem;
    padding: 1.2rem;
  }

  .redeem-btn {
    font-size: 1.4rem;
    padding: 1.5rem 2rem;
    min-width: 280px;
  }

  .scanner-btn {
    font-size: 1.1rem;
    padding: 15px 30px;
    min-width: 200px;
  }

  .qr-scanner {
    max-width: 300px;
    height: 300px;
  }

  .meal-icon {
    width: 36px;
    height: 36px;
  }
}
</style>
