<template>
  <div class="self-checkin-page" :class="{ landscape: isLandscape }">
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
      <h1 class="nav-title">REUNION 2026 SELF CHECK-IN</h1>
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
        <h1 v-if="!isLandscape">REUNION 2026<br>SELF CHECK-IN</h1>

        <div class="instructions">
        <h3>📱 How to Use:</h3>
        <ol>
          <li>Enter your ID Code or scan QR code</li>
          <li>Select Check In or Check Out</li>
          <li>Show confirmation to Front Gate if needed</li>
        </ol>
      </div>

      <div class="help-section">
        <h3>Need Help?</h3>
        <p>🚪 Find a Front Gate volunteer</p>
        <p>📱 Or use the regular scanner station</p>
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
        <p>
          <strong>Tickets On-Site:</strong>
          <span class="checked-in">
            {{ participant.original_ticket_quantity - participant.ticket_quantity }}
          </span>
          /
          <span>{{ participant.original_ticket_quantity }}</span>
        </p>
        <p>
          <strong>Current Status:</strong>
          <span :class="participant.checked_in ? 'checked-in' : 'checked-out'">
            {{ participant.checked_in ? 'Checked In' : 'Checked Out' }}
          </span>
        </p>

        <div class="action-buttons">
          <button
            v-if="participant.ticket_quantity > 0"
            @click="checkIn"
            :disabled="isProcessing"
            class="check-in-btn"
          >
            {{ isProcessing ? 'Processing...' : '🟢 Check In' }}
          </button>

          <button
            v-if="participant.ticket_quantity < participant.original_ticket_quantity"
            @click="checkOut"
            :disabled="isProcessing"
            class="check-out-btn"
          >
            {{ isProcessing ? 'Processing...' : '🔴 Check Out' }}
          </button>

          <button @click="resetKiosk" class="cancel-btn">
            {{ resultMessage ? '✅ Done' : '❌ Cancel' }}
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
        <button @click="resetKiosk" class="done-btn-inline">✅ Done - Next User</button>
      </div>
      </div>

      <!-- Right Column (Landscape) / Bottom Section (Portrait) -->
      <div class="section-info">
      <!-- Festival Hours -->
      <div v-if="!participant" class="festival-hours">
        <h3>🎪 Festival Hours</h3>
        <div class="hours-info">
          <p><strong>Entry Opens:</strong><br>{{ formatDate(festivalConfig.startDate) }}<br>12:00 PM</p>
          <p><strong>Gate Closes Nightly:</strong><br>{{ festivalConfig.gateCloseTime }}</p>
          <p><strong>Festival Ends:</strong><br>{{ formatDate(festivalConfig.mondayDate) }}</p>
        </div>
      </div>
      
      <!-- Recent Activity (after participant found) -->
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
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { reunion_db } from '@/firebase'
import { collection, doc, updateDoc, getDocs, query, where } from 'firebase/firestore'
import festivall_emblem from '@/assets/images/festivall_emblem_white.png'
import { QrcodeStream } from 'vue-qrcode-reader'
import { sendReunionFrontGate } from '/scripts/notifications.js'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'

export default {
  name: 'SelfCheckInView',
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

    const toggleLayout = () => {
      isLandscape.value = !isLandscape.value
      localStorage.setItem('kioskLayout', isLandscape.value ? 'landscape' : 'portrait')
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
        // Extract ID code from QR content (assuming it contains the ID code)
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
          participant.value = {
            id_code: p.id_code,
            id_code_long: p.id_code_long,
            fullname: p.contact?.fullname || '',
            ticket_type: p.order?.ticket_type || '',
            checked_in: p.order?.checked_in || false,
            ticket_quantity: p.order?.ticket_quantity || 0,
            original_ticket_quantity: p.order?.original_ticket_quantity || 0,
            entrance_activity_history: p.order?.entrance_activity_history || [],
            last_entrance_activity: p.order?.last_entrance_activity || null
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
        if (participant.value.ticket_quantity <= 0) {
          resultMessage.value = 'No tickets remaining to check in.'
          resultType.value = 'error'
          return
        }

        if (!participant.value.original_ticket_quantity) {
          participant.value.original_ticket_quantity = participant.value.ticket_quantity
        }

        const newTicketQuantity = participant.value.ticket_quantity - 1
        const timestamp = new Date().toISOString()
        const festivalDay = getFestivalDay(timestamp)

        const activityEntry = {
          timestamp,
          action: 'check_in',
          ticket_quantity_after: newTicketQuantity,
          festival_day: festivalDay,
          operator: 'self_service',
          operator_name: 'Self Check-In'
        }

        const existingHistory = participant.value.entrance_activity_history || []
        const updatedHistory = [...existingHistory, activityEntry]

        await updateDoc(doc(reunion_db, 'participants_2026', participant.value.id_code), {
          'order.checked_in': true,
          'order.ticket_quantity': newTicketQuantity,
          'order.original_ticket_quantity': participant.value.original_ticket_quantity,
          'order.entrance_activity_history': updatedHistory,
          'order.last_entrance_activity': timestamp
        })

        sendReunionFrontGate(
          `:ticket: ${participant.value.fullname} has checked in (self).\n:id: ${participant.value.id_code}\n:bust_in_silhouette: Operator: Self Check-In`
        )

        participant.value.checked_in = true
        participant.value.ticket_quantity = newTicketQuantity
        participant.value.entrance_activity_history = updatedHistory
        participant.value.last_entrance_activity = timestamp

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
        if (participant.value.ticket_quantity >= participant.value.original_ticket_quantity) {
          resultMessage.value = 'Cannot check out more tickets than the original quantity.'
          resultType.value = 'error'
          return
        }

        const newTicketQuantity = participant.value.ticket_quantity + 1
        const timestamp = new Date().toISOString()
        const festivalDay = getFestivalDay(timestamp)

        const activityEntry = {
          timestamp,
          action: 'check_out',
          ticket_quantity_after: newTicketQuantity,
          festival_day: festivalDay,
          operator: 'self_service',
          operator_name: 'Self Check-Out'
        }

        const existingHistory = participant.value.entrance_activity_history || []
        const updatedHistory = [...existingHistory, activityEntry]

        await updateDoc(doc(reunion_db, 'participants_2026', participant.value.id_code), {
          'order.checked_in': newTicketQuantity > 0,
          'order.ticket_quantity': newTicketQuantity,
          'order.original_ticket_quantity': participant.value.original_ticket_quantity,
          'order.entrance_activity_history': updatedHistory,
          'order.last_entrance_activity': timestamp
        })

        sendReunionFrontGate(
          `:ticket: ${participant.value.fullname} has checked out (self).\n:id: ${participant.value.id_code}\n:bust_in_silhouette: Operator: Self Check-Out`
        )

        participant.value.checked_in = newTicketQuantity > 0
        participant.value.ticket_quantity = newTicketQuantity
        participant.value.entrance_activity_history = updatedHistory
        participant.value.last_entrance_activity = timestamp

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
      const festivalStart = REUNION_FESTIVAL.startDate
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

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
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

    // Clear result message after 10 seconds
    const clearResultMessage = () => {
      setTimeout(() => {
        resultMessage.value = ''
        resultType.value = ''
      }, 10000)
    }

    onMounted(() => {
      // Check for webcam availability
      checkWebcamAvailability()

      // Restore layout preference
      const savedLayout = localStorage.getItem('kioskLayout')
      if (savedLayout === 'landscape') {
        isLandscape.value = true
      }

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
      festivalConfig: REUNION_FESTIVAL,
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
      checkIn,
      checkOut,
      formatTime,
      formatDate,
      onQrDetect,
      onScannerInit,
      resetKiosk
    }
  }
}
</script>

<style scoped>
.self-checkin-page {
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
.self-checkin-page.landscape {
  flex-direction: column;
  gap: 0;
  padding: 0;
}

.self-checkin-page.landscape .main-container {
  flex-direction: row;
  gap: 1.5rem;
  padding: 1.5rem;
}

.self-checkin-page.landscape .section-header {
  flex: 0 0 22%;
  text-align: left;
  overflow: hidden;
  max-height: 100%;
}

.self-checkin-page.landscape .main-container .section-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  min-width: 0;
  padding: 2rem;
}

.self-checkin-page.landscape .main-container .section-info {
  flex: 0 0 22%;
  overflow-y: auto;
  max-height: 100%;
}

.self-checkin-page.landscape .emblem {
  margin: 0 0 1rem 0;
}

.self-checkin-page.landscape h1 {
  text-align: left;
  font-size: 1.5rem;
}

/* Make section-main scrollable in portrait for action buttons visibility */
.section-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
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

.checked-in {
  color: #4caf50;
  font-weight: bold;
  font-size: 1.2rem;
}

.checked-out {
  color: #ff9800;
  font-weight: bold;
  font-size: 1.2rem;
}

.action-buttons {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  flex-shrink: 0;
}

.check-in-btn,
.check-out-btn,
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

.check-in-btn {
  background: linear-gradient(45deg, #4caf50, #2e7d32);
  color: white;
}

.check-in-btn:hover:not(:disabled) {
  background: linear-gradient(45deg, #2e7d32, #1b5e20);
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

.check-out-btn {
  background: linear-gradient(45deg, #f44336, #c62828);
  color: white;
}

.check-out-btn:hover:not(:disabled) {
  background: linear-gradient(45deg, #c62828, #b71c1c);
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

.check-in-btn:disabled,
.check-out-btn:disabled {
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

.cancel-btn {
  background: linear-gradient(45deg, #9e9e9e, #616161);
  color: white;
}

.cancel-btn:hover {
  background: linear-gradient(45deg, #757575, #424242);
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
  width: 100%;
  max-width: 600px;
  margin: 0 auto 1rem;
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

.festival-hours {
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid var(--festivall-baby-blue);
  padding: 1rem;
  border-radius: 10px;
}

.festival-hours h3 {
  color: var(--festivall-baby-blue);
  margin-bottom: 0.8rem;
  font-size: 1.2rem;
}

.hours-info {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.hours-info p {
  margin: 0;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 6px;
  font-size: 0.9rem;
  line-height: 1.4;
}

.hours-info strong {
  color: #ff9800;
  display: block;
  margin-bottom: 0.2rem;
}

.recent-activity {
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid var(--festivall-baby-blue);
  padding: 1rem;
  border-radius: 10px;
}

.recent-activity h3 {
  color: var(--festivall-baby-blue);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
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
  padding: 0.6rem;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 6px;
  font-size: 0.9rem;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.activity-action {
  font-weight: bold;
  font-size: 1rem;
}

.activity-time {
  color: #ccc;
  font-size: 0.8rem;
}

.activity-day {
  color: var(--festivall-baby-blue);
  font-weight: bold;
  font-size: 0.9rem;
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
  .self-checkin-page.landscape {
    flex-direction: column;
  }

  .self-checkin-page.landscape .section-header,
  .self-checkin-page.landscape .section-main,
  .self-checkin-page.landscape .section-info {
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

  .check-in-btn,
  .check-out-btn {
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
}
</style>
