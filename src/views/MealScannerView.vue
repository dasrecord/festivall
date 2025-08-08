<template>
  <img
    :src="festivall_emblem"
    style="height: 50px; width: 75px; margin: auto; display: block"
    alt="Festivall Emblem"
  />
  <h1>REUNION 2025 MEAL SCANNER</h1>
  <audio id="success-sound" src="/sounds/access-granted.mp3" preload="auto"></audio>
  <audio id="failure-sound" src="/sounds/access-denied.mp3" preload="auto"></audio>

  <!-- Processing Overlay -->
  <div v-if="isProcessing" class="processing-overlay">
    <div class="processing-content">
      <h3>Processing...</h3>
      <p>Please wait while we redeem the meal ticket.</p>
    </div>
  </div>

  <QrcodeStream class="qr" @init="onInit" @detect="onDetect" camera="environment" />
  <div class="panel">
    <div class="utilities">
      <button @click="showInstructions = true">Meal Team Instructions</button>
      <button @click="refreshOrders">Refresh Orders</button>
      <button class="refresh-button" @click="refreshPage">Refresh Scanner</button>
    </div>

    <div v-if="showInstructions" class="modal">
      <div class="modal-content">
        <img
          :src="festivall_emblem"
          style="width: 100px; height: auto; margin: auto; display: block"
          alt="Festivall Emblem"
        />
        <h3><u> Meal Team Instructions </u></h3>
        <br />
        <p>1. Welcome and warmly introduce yourself.</p>
        <br />
        <p>2. Kindly ask the guest to present their Festivall QR Code for scanning.</p>
        <br />
        <p>3. Redeem 1 meal ticket per meal ordered.</p>
        <br />
        <p>4. If the guest has no meal tickets remaining, please charge $15 cash per meal.</p>
        <br />
        <p>5. Please radio the admin team if there are any issues.</p>
        <br />
        <button @click="showInstructions = false">Close</button>
      </div>
    </div>
    <div class="scan-result">
      <h2 v-if="fullResult">
        Scan Result:<br />
        {{ fullResult }}
      </h2>
      <h2 v-else>Ready to Scan</h2>
    </div>
    <div class="order-details">
      <div>
        <p v-if="matchingOrder && typeof matchingOrder === 'string'">
          {{ matchingOrder }}
        </p>
        <p v-if="matchingOrder && typeof matchingOrder === 'object'">
          Matching Order: {{ matchingOrder.id_code }}
        </p>
        <p v-if="matchingOrder && typeof matchingOrder === 'object'">
          Name: {{ matchingOrder.fullname }} <br />
          Email: {{ matchingOrder.email }} <br />
          Phone: {{ matchingOrder.phone }} <br />
          Ticket Type: {{ matchingOrder.ticket_type }}<br />
          <span v-if="matchingOrder.selected_day"
            >Valid starting 12:00 PM {{ matchingOrder.selected_day }} for 24 Hours<br
          /></span>
        </p>
      </div>
      <div>
        <p v-if="matchingOrder && typeof matchingOrder === 'object'">
          Payment Status:
          <span :style="{ color: paidStatus(matchingOrder) === 'Paid' ? 'green' : 'red' }">
            {{ paidStatus(matchingOrder) }}</span
          >
          <br />
          Current Status: {{ currentStatus(matchingOrder) }} <br />
          Admit:
          <span v-for="n in parseInt(matchingOrder.ticket_quantity)" :key="n">
            <img
              src="@/assets/images/icons/ticket.png"
              alt="Ticket"
              style="width: 24px; height: auto; transform: rotate(-45deg); margin: 5px"
            />
          </span>
          <br />

          Meal Tickets Remaining:
          <span v-if="matchingOrder.meal_tickets_remaining > 0" class="meals">
            <img
              v-for="n in parseInt(matchingOrder.meal_tickets_remaining) || 0"
              :key="n"
              src="@/assets/images/icons/meals.png"
              alt="Meal Ticket"
              style="width: 24px; height: auto; margin: 5px"
            />
          </span>
          <br />
        </p>
      </div>
    </div>

    <button
      class="panel-button"
      v-if="
        matchingOrder &&
        typeof matchingOrder === 'object' &&
        matchingOrder.meal_tickets_remaining > 0
      "
      @click="decrementMealTickets(matchingOrder, 1)"
      :disabled="isProcessing"
    >
      {{ isProcessing ? 'Processing...' : 'Redeem 1 Meal Ticket' }}
    </button>
  </div>
  <div class="at-a-glance">
    <h2>At A Glance</h2>
    <ul>
      <li>
        <div>
          <h4 style="color: var(--festivall-baby-blue)">Total Orders</h4>
          <h2>
            {{ orders.length }}
          </h2>
        </div>
        <!-- <div>
          <h4 style="color: green">Paid</h4>
          <h2>
            {{ orders.filter((order) => order.paid).length }}
          </h2>
        </div>
        <div>
          <h4 style="color: red">Not Paid</h4>
          <h2>
            {{ orders.filter((order) => !order.paid).length }}
          </h2>
        </div> -->
        <div>
          <h4 style="color: orange">Checked In</h4>
          <h2>
            {{ orders.filter((order) => order.checked_in).length }}
          </h2>
        </div>
        <div>
          <h4 style="color: yellow">Not Checked In</h4>
          <h2>
            {{ orders.filter((order) => !order.checked_in).length }}
          </h2>
        </div>
        <div>
          <h4 style="color: white">Meal Tickets Remaining</h4>
          <h2>
            {{ orders.reduce((total, order) => total + (order.meal_tickets_remaining || 0), 0) }}
          </h2>
        </div>
      </li>
    </ul>
  </div>
  <!-- Admin Controls Section -->
  <div class="admin-controls">
    <h3>🔐 Admin Controls</h3>
    <button
      @click="showEndServiceModal = true"
      class="admin-button end-service"
      :disabled="isProcessing || !canEndMealService"
    >
      🚨 End Current Meal Service
    </button>
    <p v-if="!canEndMealService" class="cooldown-message">
      Service ended recently. Wait {{ remainingCooldownMinutes }} minutes.
    </p>
  </div>

  <!-- End Service Modal -->
  <div v-if="showEndServiceModal" class="modal danger-modal">
    <div class="modal-content">
      <h3>⚠️ END MEAL SERVICE</h3>
      <p><strong>WARNING:</strong> This will decrement 1 meal ticket from ALL orders.</p>
      <p>
        Orders affected: <strong>{{ ordersWithMealTickets.length }}</strong>
      </p>
      <p>
        Total tickets to be decremented: <strong>{{ ordersWithMealTickets.length }}</strong>
      </p>

      <!-- Step 1: Type confirmation -->
      <div v-if="confirmationStep === 1">
        <p><strong>Type "END SERVICE" to continue:</strong></p>
        <input
          v-model="confirmationText"
          placeholder="Type: END SERVICE"
          @input="confirmationText = $event.target.value.toUpperCase()"
          class="confirmation-input"
        />
        <button
          @click="confirmationStep = 2"
          :disabled="confirmationText !== 'END SERVICE'"
          class="warning-button"
        >
          Continue
        </button>
      </div>

      <!-- Step 2: Final confirmation -->
      <div v-else-if="confirmationStep === 2">
        <p><strong>FINAL CONFIRMATION:</strong></p>
        <p>Are you absolutely sure you want to end the meal service?</p>
        <button @click="endMealService" class="danger-button">YES - End Service Now</button>
      </div>

      <button @click="cancelEndService" class="cancel-button">Cancel</button>
    </div>
  </div>

  <div class="database">
    <h2>Order Database</h2>
    <button @click="toggleView">
      Show Me
      {{ filter === 'all' ? 'Meal Ticket Only' : 'All' }}
      Orders
    </button>
    <ul>
      <li v-for="order in filteredOrders" :key="order.id_code" class="order">
        <div>
          <IconFestivall height="24px" />
          <h2>
            <a
              :href="
                'https://console.firebase.google.com/u/0/project/reunionfestivall/firestore/databases/-default-/data/~2Forders_2025~2F' +
                order.id_code
              "
              target="_blank"
            >
              #{{ order.id_code }}
            </a>
          </h2>
        </div>

        <div>
          <h2>{{ order.fullname }}</h2>
          <!-- <p>{{ order.email }}</p>
          <p>{{ order.phone }}</p> -->
        </div>
        <div class="order-status">
          <!-- <h4>Admit {{ order.ticket_quantity }}</h4>
          <div class="tickets">
            <img
              v-for="n in parseInt(order.ticket_quantity) || 0"
              :key="n"
              src="@/assets/images/icons/ticket.png"
              alt="Meal Ticket"
              style="width: 24px"
            />
          </div>
          <h4 :style="{ color: paidStatus(order) === 'Paid' ? 'green' : 'red' }">
            {{ paidStatus(order) }}
          </h4>
          <h4 :style="{ color: currentStatus(order) === 'Checked In' ? 'orange' : 'yellow' }">
            {{ currentStatus(order) }}
          </h4> -->
          <h4 v-if="order.meal_tickets_remaining > 0">Meal Tickets Remaining</h4>
          <div class="meals">
            <template v-if="parseInt(order.meal_tickets_remaining) || 0">
              <img
                v-for="n in parseInt(order.meal_tickets_remaining)"
                :key="n"
                src="@/assets/images/icons/meals.png"
                alt="Meal Ticket"
                style="width: 24px"
              />
            </template>
            <h4 v-else>No Meal Tickets Remaining</h4>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import festivall_emblem from '@/assets/images/festivall_emblem_white.png'
import { QrcodeStream } from 'vue-qrcode-reader'
import { reunion_db } from '@/firebase'
import { collection, doc, updateDoc, getDocs } from 'firebase/firestore'
import IconFestivall from '@/components/icons/IconFestivall.vue'

export default {
  components: {
    QrcodeStream,
    IconFestivall
  },
  data() {
    return {
      festivall_emblem,
      db: reunion_db,
      fullResult: null,
      scanResult: null,
      orders: [],
      matchingOrder: null,
      filter: 'all',
      showInstructions: false,
      isProcessing: false,
      qrScanner: null,
      scanCooldown: false,
      // Admin controls
      showEndServiceModal: false,
      confirmationStep: 1,
      confirmationText: '',
      lastMealServiceEnd: null
    }
  },
  computed: {
    filteredOrders() {
      if (this.filter === 'all') {
        return this.orders
      } else if (this.filter === 'mealTickets') {
        return this.orders.filter((order) => order.meal_tickets_remaining > 0)
      } else {
        return this.orders
      }
    },
    ordersWithMealTickets() {
      return this.orders.filter((order) => order.meal_tickets_remaining > 0)
    },
    canEndMealService() {
      if (!this.lastMealServiceEnd) return true
      const now = new Date()
      const lastEnd = new Date(this.lastMealServiceEnd)
      const minutesSince = (now - lastEnd) / (1000 * 60)
      return minutesSince >= 30 // 30 minute cooldown
    },
    remainingCooldownMinutes() {
      if (!this.lastMealServiceEnd) return 0
      const now = new Date()
      const lastEnd = new Date(this.lastMealServiceEnd)
      const minutesSince = (now - lastEnd) / (1000 * 60)
      return Math.ceil(30 - minutesSince)
    }
  },
  async created() {
    // Load last meal service end time from localStorage
    this.lastMealServiceEnd = localStorage.getItem('lastMealServiceEnd')

    try {
      const ordersCollection = collection(this.db, 'orders_2025')
      const orderSnapshot = await getDocs(ordersCollection)
      this.orders = orderSnapshot.docs.map((doc) => {
        const data = doc.data()
        data.meal_tickets_remaining = parseInt(data.meal_tickets_remaining, 10) || 0
        data.ticket_quantity = parseInt(data.ticket_quantity, 10) || 0
        return data
      })
      console.log(`Loaded ${this.orders.length} orders successfully`)
    } catch (error) {
      console.error('Error loading orders:', error)
      alert('Failed to load orders. Please refresh the page.')
    }
  },
  methods: {
    onInit(promise) {
      promise
        .then((scanner) => {
          this.qrScanner = scanner
          console.log('QR Code Reader initialized.')
        })
        .catch((error) => {
          console.error('QR Code Reader initialization failed:', error)
        })
    },
    onDetect(result) {
      // Prevent rapid scanning
      if (this.scanCooldown) return
      this.scanCooldown = true
      setTimeout(() => {
        this.scanCooldown = false
      }, 2000) // 2 second cooldown

      this.fullResult = result[0].rawValue
      this.scanResult = this.fullResult

      // Use long id_code for matching
      const matchingOrder = this.orders.find((order) => order.id_code_long === this.scanResult)

      if (matchingOrder) {
        this.matchingOrder = matchingOrder
        console.log('Order found:', this.matchingOrder)
        this.playSuccessSound()
      } else {
        this.matchingOrder = 'No Matching Order Found'
        console.log('Order not found:', this.matchingOrder)
        this.playFailureSound()
      }
    },
    currentStatus(order) {
      if (order.checked_in !== undefined && order.checked_in !== null) {
        return order.checked_in === true || order.checked_in === 'true'
          ? 'Checked In'
          : 'Not Checked In'
      } else {
        return 'Not Checked In'
      }
    },
    paidStatus(order) {
      if (order.paid !== undefined && order.paid !== null) {
        return order.paid === true || order.paid === 'true' ? 'Paid' : 'Not Paid'
      } else {
        return 'Not Paid'
      }
    },
    playSuccessSound() {
      try {
        const audio = document.getElementById('success-sound')
        if (audio) {
          audio.currentTime = 0
          audio.play().catch((e) => console.warn('Could not play success sound:', e))
        }
      } catch (error) {
        console.warn('Audio playback failed:', error)
      }
    },
    playFailureSound() {
      try {
        const audio = document.getElementById('failure-sound')
        if (audio) {
          audio.currentTime = 0
          audio.play().catch((e) => console.warn('Could not play failure sound:', e))
        }
      } catch (error) {
        console.warn('Audio playback failed:', error)
      }
    },
    async decrementMealTickets(order, amount) {
      if (this.isProcessing) return
      this.isProcessing = true

      try {
        const currentMealTickets = parseInt(order.meal_tickets_remaining, 10) || 0

        if (currentMealTickets >= amount) {
          const newMealTickets = currentMealTickets - amount
          const redemptionTime = new Date().toISOString()
          const orderRef = doc(this.db, 'orders_2025', order.id_code)

          await updateDoc(orderRef, {
            meal_tickets_remaining: newMealTickets,
            last_meal_redemption: redemptionTime
          })

          // Update local state after successful database update
          order.meal_tickets_remaining = newMealTickets
          order.last_meal_redemption = redemptionTime

          console.log(`Meal ticket redeemed for ${order.fullname}. Remaining: ${newMealTickets}`)
        } else {
          alert('Not enough meal tickets remaining.')
        }
      } catch (error) {
        console.error('Error redeeming meal ticket:', error)
        alert('Failed to redeem meal ticket. Please try again.')
      } finally {
        this.isProcessing = false
      }
    },
    refreshPage() {
      window.location.reload()
    },
    async refreshOrders() {
      try {
        const ordersCollection = collection(this.db, 'orders_2025')
        const orderSnapshot = await getDocs(ordersCollection)
        this.orders = orderSnapshot.docs.map((doc) => {
          const data = doc.data()
          data.meal_tickets_remaining = parseInt(data.meal_tickets_remaining, 10) || 0
          data.ticket_quantity = parseInt(data.ticket_quantity, 10) || 0
          return data
        })
        console.log('Orders refreshed successfully')
      } catch (error) {
        console.error('Error refreshing orders:', error)
      }
    },
    toggleView() {
      if (this.filter === 'all') {
        this.filter = 'mealTickets'
      } else if (this.filter === 'mealTickets') {
        this.filter = 'all'
      } else {
        this.filter = 'mealTickets'
      }
    },
    // Admin Methods
    cancelEndService() {
      this.showEndServiceModal = false
      this.confirmationStep = 1
      this.confirmationText = ''
    },
    async endMealService() {
      if (!this.canEndMealService) {
        alert('Meal service was ended recently. Please wait 30 minutes.')
        return
      }

      if (this.isProcessing) return
      this.isProcessing = true

      try {
        const now = new Date()

        // Determine current meal service window
        const currentHour = now.getHours()
        let serviceStartTime

        if (currentHour >= 12 && currentHour < 14) {
          // Lunch service (12:00 PM - 2:00 PM)
          serviceStartTime = new Date(now)
          serviceStartTime.setHours(12, 0, 0, 0)
        } else if (currentHour >= 18 && currentHour < 20) {
          // Supper service (6:00 PM - 8:00 PM)
          serviceStartTime = new Date(now)
          serviceStartTime.setHours(18, 0, 0, 0)
        } else {
          // Outside meal times - use 4 hour window
          serviceStartTime = new Date(now.getTime() - 4 * 60 * 60 * 1000)
        }

        // Filter orders: only decrement those who haven't redeemed since service started
        const ordersToUpdate = this.orders.filter((order) => {
          if (order.meal_tickets_remaining <= 0) return false

          // Skip if they redeemed since this service period started
          if (order.last_meal_redemption) {
            const lastRedemption = new Date(order.last_meal_redemption)
            if (lastRedemption >= serviceStartTime) {
              return false // Don't decrement - they participated this service
            }
          }
          return true // Decrement - they didn't participate this service
        })

        console.log(`MEAL SERVICE ENDED at ${new Date().toISOString()}`)
        console.log(`Service started at: ${serviceStartTime.toISOString()}`)
        console.log(
          `Orders to update: ${ordersToUpdate.length} (skipped ${this.orders.filter((o) => o.meal_tickets_remaining > 0).length - ordersToUpdate.length} who participated)`
        )

        // Update orders that didn't participate in this service
        const updatePromises = ordersToUpdate.map(async (order) => {
          const newMealTickets = Math.max(0, order.meal_tickets_remaining - 1)
          const orderRef = doc(this.db, 'orders_2025', order.id_code)

          await updateDoc(orderRef, {
            meal_tickets_remaining: newMealTickets
          })

          // Update local state
          order.meal_tickets_remaining = newMealTickets
        })

        // Execute all updates
        await Promise.all(updatePromises)

        // Set cooldown timestamp
        this.lastMealServiceEnd = new Date().toISOString()
        localStorage.setItem('lastMealServiceEnd', this.lastMealServiceEnd)

        const participantsProtected =
          this.orders.filter((o) => o.meal_tickets_remaining > 0).length - ordersToUpdate.length
        alert(
          `Meal service ended successfully!\n${ordersToUpdate.length} meal tickets decremented.\n${participantsProtected} participants protected from double-decrement.`
        )
        this.cancelEndService()
      } catch (error) {
        console.error('Error ending meal service:', error)
        alert('Failed to end meal service. Please try again.')
      } finally {
        this.isProcessing = false
      }
    }
  },
  beforeUnmount() {
    // Clean up QR scanner
    if (this.qrScanner) {
      this.qrScanner.stop()
    }
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: baseline;
  align-items: center;
  z-index: 10;
}
.modal-content {
  padding: 10px;
  border-radius: 10px;
  text-align: center;
  width: 80%;
  max-width: 500px;
  font-size: larger;
}
.modal-content p {
  font-size: medium;
}
.modal button {
  margin-top: 10px;
  width: 100%;
}

h1,
h2 {
  text-align: center;
}
p {
  font-size: 12px;
}
button {
  border: 1px solid rgba(121, 188, 255, 0.25);
  border-radius: 25px;
  padding: 1rem;
  box-shadow: inset 0 0 20px rgba(121, 188, 255, 0.25);
  position: relative;
  background-color: var(--q-color-primary);
  color: var(--q-color-white);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: rgba(121, 188, 255, 0.1);
}

.processing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20;
}

.processing-content {
  background-color: var(--q-color-primary);
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  border: 1px solid rgba(121, 188, 255, 0.5);
  box-shadow: 0 0 20px rgba(121, 188, 255, 0.3);
}

.qr {
  display: flex;
  width: 100%;
  max-height: 400px;
  border: 2px solid white;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
}
.panel {
  position: relative;
  display: flex;
  flex-direction: column;
  height: fit-content;
  border: 1px solid rgba(121, 188, 255, 0.25);
  box-shadow: inset 0 0 20px rgba(121, 188, 255, 0.25);
  padding: 10px;
  margin: 1rem;
  border-radius: 20px;
}
.order-details {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}
.utilities {
  width: 100%;
  display: flex;
  flex-direction: row;
}
.utilities button {
  width: 100%;
  max-width: 150px;
  margin: 0 auto;
  padding: 0.5rem;
}
.panel-button {
  width: 100%;
  max-width: 150px;
  margin: 0 auto;
}
.at-a-glance {
  margin: 1rem;
}
.database {
  display: flex;
  flex-direction: column;
}
.database button {
  margin: 0 auto;
}
ul {
  padding: 0;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  width: 100%;
}
li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  list-style-type: none;
  border: 1px solid rgba(121, 188, 255, 0.25);
  box-shadow: inset 0 0 20px rgba(121, 188, 255, 0.25);
  padding: 10px;
  margin: 5px;
  border-radius: 20px;
}
.order {
  display: flex;
  justify-content: space-around;
}
.tickets img {
  margin: 3px;
  transform: rotate(-45deg);
}
.meals {
  display: flex;
  flex-wrap: wrap;
  width: 125px;
}
.meals img {
  margin: 3px;
}

/* Admin Controls Styles */
.admin-controls {
  border: 2px solid #ff4444;
  background: rgba(255, 68, 68, 0.1);
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 10px;
  text-align: center;
}

.admin-controls h3 {
  margin: 0 0 1rem 0;
  color: #ff6666;
}

.admin-button {
  background: linear-gradient(45deg, #ff4444, #cc0000) !important;
  border: 2px solid #ff6666 !important;
  font-weight: bold !important;
  color: white !important;
  width: 100%;
  max-width: 300px;
}

.admin-button:hover:not(:disabled) {
  background: linear-gradient(45deg, #cc0000, #990000) !important;
  transform: scale(1.02);
}

.admin-button:disabled {
  background: rgba(255, 68, 68, 0.3) !important;
  opacity: 0.5;
  cursor: not-allowed;
}

.cooldown-message {
  color: #ff6666;
  font-size: 12px;
  margin-top: 0.5rem;
  font-weight: bold;
}

/* Danger Modal Styles */
.danger-modal {
  background-color: rgba(0, 0, 0, 0.98);
}

.danger-modal .modal-content {
  border: 3px solid #ff4444;
  background: rgba(20, 20, 20, 0.98);
  color: white;
  box-shadow: 0 0 20px rgba(255, 68, 68, 0.5);
}

.danger-modal h3 {
  color: #ff6666;
  text-shadow: 0 0 10px rgba(255, 68, 68, 0.8);
}

.confirmation-input {
  width: 100%;
  padding: 0.75rem;
  margin: 1rem 0;
  border: 2px solid #ff4444;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 16px;
  text-align: center;
}

.confirmation-input:focus {
  outline: none;
  border-color: #ff6666;
  box-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
}

.warning-button {
  background: linear-gradient(45deg, #ff8800, #ff6600) !important;
  border: 2px solid #ffaa00 !important;
  color: white !important;
  font-weight: bold !important;
}

.warning-button:disabled {
  background: rgba(255, 136, 0, 0.3) !important;
  opacity: 0.5;
  cursor: not-allowed;
}

.danger-button {
  background: linear-gradient(45deg, #ff0000, #cc0000) !important;
  border: 2px solid #ff3333 !important;
  color: white !important;
  font-weight: bold !important;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
}

.danger-button:hover {
  background: linear-gradient(45deg, #cc0000, #990000) !important;
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
}

.cancel-button {
  background: rgba(100, 100, 100, 0.8) !important;
  border: 2px solid #666 !important;
  color: white !important;
}

.cancel-button:hover {
  background: rgba(150, 150, 150, 0.8) !important;
}
</style>
