<template>
  <img
    :src="festivall_emblem"
    style="height: 50px; width: 75px; margin: auto; display: block"
    alt="Festivall Emblem"
  />
  <h1>REUNION 2025 TICKET SCANNER</h1>

  <!-- Scanner Operator Identification -->
  <div class="operator-section">
    <div class="operator-input">
      <label for="operatorId">Scanner Operator ID:</label>
      <input
        id="operatorId"
        v-model="operatorIdCode"
        placeholder="Enter your ID code"
        class="operator-id-input"
        @blur="saveOperatorId"
      />
      <span
        v-if="operatorIdCode"
        class="operator-status"
        :class="{ 'valid-operator': isValidOperator, 'invalid-operator': !isValidOperator }"
      >
        <span v-if="isValidOperator"
          >✓ Logged in as: {{ operatorFullName || operatorIdCode }}
          <span v-if="operatorFullName" class="operator-id">({{ operatorIdCode }})</span>
        </span>
        <span v-else>⚠️ Invalid Operator ID: {{ operatorIdCode }}</span>
      </span>
    </div>
  </div>

  <audio id="success-sound" src="/sounds/access-granted.mp3" preload="auto"></audio>
  <audio id="failure-sound" src="/sounds/access-denied.mp3" preload="auto"></audio>

  <!-- Processing Overlay -->
  <div v-if="isProcessing" class="processing-overlay">
    <div class="processing-content">
      <h3>Processing...</h3>
      <p>Please wait while we update the ticket information.</p>
    </div>
  </div>

  <QrcodeStream
    v-if="isValidOperator"
    class="qr"
    @init="onInit"
    @detect="onDetect"
    camera="environment"
  />
  <div v-else class="scanner-disabled">
    <div class="scanner-disabled-message">
      <h3>🔒 Scanner Disabled</h3>
      <p>Please enter a valid Scanner Operator ID to enable QR code scanning.</p>
    </div>
  </div>
  <div class="panel">
    <div class="utilities">
      <button @click="showInstructions = true">Front Gate Instructions</button>
      <button @click="refreshOrders">Refresh Orders</button>
      <button @click="refreshPage">Refresh Scanner</button>
    </div>

    <div v-if="showInstructions" class="modal">
      <div class="modal-content">
        <img
          :src="festivall_emblem"
          style="width: 100px; height: auto; margin: auto; display: block"
          alt="Festivall Emblem"
        />
        <h3><u>Front Gate Instructions</u></h3>
        <br />
        <div>
          <p>1. Welcome the guest warmly and introduce yourself.</p>
          <br />
          <p>2. Kindly ask the guest to present their Festivall QR Code for scanning.</p>
          <br />
          <p>
            3. If a match is found and the status is "Paid," admit the appropriate number of persons
            checking in or out.
          </p>
          <br />
          <p>
            4. If the status is "Unpaid" collect the Total Price in cash. A $10/ticket fee will be
            added for unpaid orders.
          </p>
          <br />

          <p>5. Please radio the admin team if there are any issues.</p>
          <br />
        </div>
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
          <span
            v-if="matchingOrder.applicant_types && matchingOrder.applicant_types.includes('Artist')"
          >
            <img
              :src="artist_icon"
              alt="Artist Icon"
              style="width: 24px; height: auto; margin: 5px"
            />
          </span>
          <span
            v-if="
              matchingOrder.applicant_types && matchingOrder.applicant_types.includes('Volunteer')
            "
          >
            <img
              :src="volunteer_icon"
              alt="Volunteer Icon"
              style="width: 24px; height: auto; margin: 5px"
            />
          </span>
          <span
            v-if="
              matchingOrder.applicant_types && matchingOrder.applicant_types.includes('Workshop')
            "
          >
            <img
              :src="workshop_icon"
              alt="Workshop Icon"
              style="width: 24px; height: auto; margin: 5px"
            />
          </span>
        </p>
        <p v-if="matchingOrder && typeof matchingOrder === 'object'">
          Matching Order: {{ matchingOrder.id_code }}
          <br />
          Name: {{ matchingOrder.fullname }} <br />
          Email: {{ matchingOrder.email }} <br />
          Phone: {{ matchingOrder.phone }} <br />
          Ticket Type: {{ matchingOrder.ticket_type }}<br />
          <span v-if="matchingOrder.selected_day"
            >Valid starting 12:00 PM {{ matchingOrder.selected_day }} for 24 Hours<br
          /></span>
          Total Price:
          <span v-if="matchingOrder.paid">
            <span v-if="matchingOrder.currency === 'BTC'">
              {{ matchingOrder.total_price }} BTC
            </span>
            <span v-else> ${{ matchingOrder.total_price }} CAD </span>
          </span>
          <span v-else style="color: red">
            <span v-if="matchingOrder.currency === 'BTC'">
              {{
                (
                  parseFloat(matchingOrder.total_price) +
                  matchingOrder.ticket_quantity * 10
                ).toFixed(2)
              }}
              BTC
            </span>

            <span v-else>
              ${{
                (
                  parseFloat(matchingOrder.total_price) +
                  matchingOrder.ticket_quantity * 10
                ).toFixed(2)
              }}
              CAD </span
            ><br />
            $10/ticket fee added for unpaid orders
          </span>
          <br />
        </p>
      </div>

      <div>
        <p v-if="matchingOrder && typeof matchingOrder === 'object'">
          Payment Status:
          <span :style="{ color: paidStatus(matchingOrder) === 'Paid' ? 'green' : 'red' }">
            {{ paidStatus(matchingOrder) }}</span
          >
          <br />
          Current Status:
          <span
            :style="{ color: currentStatus(matchingOrder) === 'Checked In' ? 'orange' : 'yellow' }"
          >
            {{ currentStatus(matchingOrder) }}
          </span>
          <br />
          Admit: <br />
          <span v-for="n in parseInt(matchingOrder.ticket_quantity)" :key="n">
            <img
              src="@/assets/images/icons/ticket.png"
              alt="Ticket"
              style="width: 24px; height: auto; transform: rotate(-45deg); margin: 5px"
            />
          </span>
          <br />

          Meal Tickets Remaining:<br />
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

          <!-- Entrance Activity History -->
          <div
            v-if="matchingOrder.entrance_activity_history && matchingOrder.entrance_activity_history.length > 0"
            class="activity-history"
          >
            <h5>Recent Activity:</h5>
            <div class="activity-list">
              <div
                v-for="(activity, index) in matchingOrder.entrance_activity_history.slice(-3)"
                :key="index"
                class="activity-item"
              >
                <small>
                  {{ activity.festival_day }}
                  {{ new Date(activity.timestamp).toLocaleTimeString() }}
                  - {{ activity.action === 'check_in' ? 'Checked In' : 'Checked Out' }}
                  by {{ activity.operator_name || activity.operator }}
                </small>
              </div>
            </div>
          </div>
        </p>
      </div>
    </div>

    <button
      class="panel-button"
      v-if="matchingOrder && typeof matchingOrder === 'object' && matchingOrder.ticket_quantity > 0"
      @click="checkIn(matchingOrder)"
      :disabled="isProcessing || !isValidOperator"
    >
      {{
        isProcessing
          ? 'Processing...'
          : !isValidOperator
            ? 'Invalid Operator - Cannot Check In'
            : 'Check In 1 Ticket'
      }}
    </button>
    <button
      class="panel-button"
      v-if="
        matchingOrder &&
        typeof matchingOrder === 'object' &&
        matchingOrder.ticket_quantity < matchingOrder.original_ticket_quantity
      "
      @click="checkOut(matchingOrder)"
      :disabled="isProcessing || !isValidOperator"
    >
      {{
        isProcessing
          ? 'Processing...'
          : !isValidOperator
            ? 'Invalid Operator - Cannot Check Out'
            : 'Check Out 1 Ticket'
      }}
    </button>

    <div
      v-if="matchingOrder && typeof matchingOrder === 'object' && !isValidOperator"
      class="operator-warning"
    >
      ⚠️ Please enter a valid Scanner Operator ID to enable ticket check-in/check-out.
    </div>
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
        <div>
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
        </div>
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
      </li>
    </ul>
  </div>
  <div class="database">
    <h2>Order Database</h2>
    <button @click="toggleView">
      Show Me
      {{ filter === 'all' ? 'Checked In' : filter === 'checkedIn' ? 'Checked Out' : 'All' }}
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
          <!-- <p>{{ order.email }}</p> -->
          <!-- <p>{{ order.phone }}</p> -->
        </div>

        <div class="order-status">
          <h4>Admit {{ order.ticket_quantity }}</h4>
          <div class="tickets">
            <img
              v-for="n in parseInt(order.ticket_quantity)"
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
          </h4>
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
import { sendReunionFrontGate } from '/scripts/notifications.js'
import artist_icon from '@/assets/images/icons/artist.png'
import volunteer_icon from '@/assets/images/icons/volunteer.png'
import workshop_icon from '@/assets/images/icons/workshop.png'

export default {
  components: {
    QrcodeStream,
    IconFestivall
  },
  data() {
    return {
      festivall_emblem,
      artist_icon,
      volunteer_icon,
      workshop_icon,
      db: reunion_db,
      fullResult: null,
      scanResult: null,
      orders: [],
      matchingOrder: null,
      operatorIdCode: '', // Scanner operator identification
      operatorFullName: '', // Scanner operator full name from Firebase
      filter: 'all',
      showInstructions: false,
      isProcessing: false,
      qrScanner: null,
      scanCooldown: false
    }
  },

  computed: {
    filteredOrders() {
      if (this.filter === 'all') {
        return this.orders
      } else if (this.filter === 'checkedIn') {
        return this.orders.filter((order) => order.checked_in)
      } else {
        return this.orders.filter((order) => !order.checked_in)
      }
    },
    isValidOperator() {
      if (!this.operatorIdCode.trim()) return false
      // Check if operator exists in either orders or has a full name (meaning they were found in Firebase)
      return (
        this.operatorFullName !== '' ||
        this.orders.some((order) => order.id_code === this.operatorIdCode.trim())
      )
    }
  },
  async created() {
    // Load saved operator ID
    this.loadOperatorId()

    try {
      const ordersCollection = collection(this.db, 'orders_2025') // fetch 2025 orders
      const orderSnapshot = await getDocs(ordersCollection)
      this.orders = orderSnapshot.docs.map((doc) => doc.data())
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
      return order.checked_in === true || order.checked_in === 'true'
        ? 'Checked In'
        : 'Not Checked In'
    },
    paidStatus(order) {
      return order.paid === true || order.paid === 'true' ? 'Paid' : 'Not Paid'
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

    async checkIn(order) {
      if (this.isProcessing) return

      // Validate operator ID is entered and valid
      if (!this.operatorIdCode.trim()) {
        alert('Please enter your Scanner Operator ID before processing check-ins.')
        return
      }

      if (!this.isValidOperator) {
        alert(
          'Invalid Scanner Operator ID. Please enter a valid ID code that exists in the system.'
        )
        return
      }

      this.isProcessing = true

      try {
        if (!order.original_ticket_quantity) {
          order.original_ticket_quantity = order.ticket_quantity
        }

        if (order.ticket_quantity > 0) {
          const newTicketQuantity = order.ticket_quantity - 1
          const activityTime = new Date().toISOString()
          const orderRef = doc(this.db, 'orders_2025', order.id_code)

          // Get existing entrance activity history or initialize empty array
          const existingActivity = order.entrance_activity_history || []

          // Create new activity record
          const newActivity = {
            timestamp: activityTime,
            action: 'check_in',
            ticket_quantity_after: newTicketQuantity,
            operator: this.operatorIdCode.trim(),
            operator_name: this.operatorFullName || this.operatorIdCode.trim(),
            festival_day: this.getFestivalDay(activityTime)
          }

          // Add to activity history
          const updatedActivity = [...existingActivity, newActivity]

          await updateDoc(orderRef, {
            checked_in: true,
            ticket_quantity: newTicketQuantity,
            original_ticket_quantity: order.original_ticket_quantity,
            last_entrance_activity: activityTime,
            entrance_activity_history: updatedActivity
          })
          
          sendReunionFrontGate(
            `:ticket: ${order.fullname} has checked in.\n:id: ${order.id_code}\n:bust_in_silhouette: Operator: ${this.operatorFullName || this.operatorIdCode}`
          )

          // Update local state after successful database update
          order.checked_in = true
          order.ticket_quantity = newTicketQuantity
          order.last_entrance_activity = activityTime
          order.entrance_activity_history = updatedActivity
        } else {
          alert('No tickets left to check in.')
        }
      } catch (error) {
        console.error('Error checking in:', error)
        alert('Failed to check in. Please try again.')
      } finally {
        this.isProcessing = false
      }
    },

    async checkOut(order) {
      if (this.isProcessing) return

      // Validate operator ID is entered and valid
      if (!this.operatorIdCode.trim()) {
        alert('Please enter your Scanner Operator ID before processing check-outs.')
        return
      }

      if (!this.isValidOperator) {
        alert(
          'Invalid Scanner Operator ID. Please enter a valid ID code that exists in the system.'
        )
        return
      }

      this.isProcessing = true

      try {
        if (!order.original_ticket_quantity) {
          order.original_ticket_quantity = order.ticket_quantity
        }

        if (order.ticket_quantity < order.original_ticket_quantity) {
          const newTicketQuantity = order.ticket_quantity + 1
          const activityTime = new Date().toISOString()
          const orderRef = doc(this.db, 'orders_2025', order.id_code)

          // Get existing entrance activity history or initialize empty array
          const existingActivity = order.entrance_activity_history || []

          // Create new activity record
          const newActivity = {
            timestamp: activityTime,
            action: 'check_out',
            ticket_quantity_after: newTicketQuantity,
            operator: this.operatorIdCode.trim(),
            operator_name: this.operatorFullName || this.operatorIdCode.trim(),
            festival_day: this.getFestivalDay(activityTime)
          }

          // Add to activity history
          const updatedActivity = [...existingActivity, newActivity]

          await updateDoc(orderRef, {
            checked_in: newTicketQuantity > 0,
            ticket_quantity: newTicketQuantity,
            original_ticket_quantity: order.original_ticket_quantity,
            last_entrance_activity: activityTime,
            entrance_activity_history: updatedActivity
          })
          
          sendReunionFrontGate(
            `:ticket: ${order.fullname} has checked out.\n:id: ${order.id_code}\n:bust_in_silhouette: Operator: ${this.operatorFullName || this.operatorIdCode}`
          )

          // Update local state after successful database update
          order.checked_in = newTicketQuantity > 0
          order.ticket_quantity = newTicketQuantity
          order.last_entrance_activity = activityTime
          order.entrance_activity_history = updatedActivity
        } else {
          alert('Cannot check out more tickets than the original quantity.')
        }
      } catch (error) {
        console.error('Error checking out:', error)
        alert('Failed to check out. Please try again.')
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
        this.orders = orderSnapshot.docs.map((doc) => doc.data())
        console.log('Orders refreshed successfully')
      } catch (error) {
        console.error('Error refreshing orders:', error)
      }
    },
    toggleView() {
      if (this.filter === 'all') {
        this.filter = 'checkedIn'
      } else if (this.filter === 'checkedIn') {
        this.filter = 'notCheckedIn'
      } else {
        this.filter = 'all'
      }
    },
    getFestivalDay(timestamp) {
      const activityDate = new Date(timestamp)
      const festivalStart = new Date('2025-08-29T12:00:00') // Friday Aug 29, 12:00 PM
      const daysDiff = Math.floor((activityDate - festivalStart) / (1000 * 60 * 60 * 24))

      if (daysDiff < 0) return 'Pre-Festival'
      if (daysDiff === 0) return 'Friday'
      if (daysDiff === 1) return 'Saturday'
      if (daysDiff === 2) return 'Sunday'
      if (daysDiff === 3) return 'Monday'
      return 'Post-Festival'
    },
    async lookupOperatorName(idCode) {
      if (!idCode) {
        this.operatorFullName = ''
        return false
      }

      try {
        // Try to find the operator in the orders collection first
        const operator = this.orders.find((order) => order.id_code === idCode)
        if (operator && operator.fullname) {
          this.operatorFullName = operator.fullname
          return true
        }

        // If not found in loaded orders, query Firebase directly
        const { doc, getDoc } = await import('firebase/firestore')

        // Check orders_2025 collection
        const orderRef = doc(this.db, 'orders_2025', idCode)
        const orderSnap = await getDoc(orderRef)

        if (orderSnap.exists() && orderSnap.data().fullname) {
          this.operatorFullName = orderSnap.data().fullname
          return true
        }

        // Check applications_2025 collection as fallback
        const appRef = doc(this.db, 'applications_2025', idCode)
        const appSnap = await getDoc(appRef)

        if (appSnap.exists() && appSnap.data().fullname) {
          this.operatorFullName = appSnap.data().fullname
          return true
        }

        // If no name found, clear the full name
        this.operatorFullName = ''
        console.warn(`No name found for operator ID: ${idCode}`)
        return false
      } catch (error) {
        console.error('Error looking up operator name:', error)
        this.operatorFullName = ''
        return false
      }
    },
    async saveOperatorId() {
      if (this.operatorIdCode.trim()) {
        const trimmedId = this.operatorIdCode.trim()
        localStorage.setItem('ticketScannerOperatorId', trimmedId)

        // Look up and save the operator's full name
        await this.lookupOperatorName(trimmedId)
        if (this.operatorFullName) {
          localStorage.setItem('ticketScannerOperatorName', this.operatorFullName)
        }
      }
    },
    loadOperatorId() {
      const savedId = localStorage.getItem('ticketScannerOperatorId')
      const savedName = localStorage.getItem('ticketScannerOperatorName')

      if (savedId) {
        this.operatorIdCode = savedId
        this.operatorFullName = savedName || ''

        // Refresh the name lookup in case data has changed
        this.lookupOperatorName(savedId)
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

.operator-section {
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 8px;
  border: 2px solid var(--festivall-baby-blue);
}

.operator-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.operator-input label {
  color: white;
  font-weight: bold;
}

.operator-id-input {
  padding: 0.5rem;
  border: 2px solid var(--festivall-baby-blue);
  border-radius: 4px;
  background: white;
  color: black;
  font-size: 1rem;
  text-align: center;
  min-width: 200px;
}

.operator-id-input:focus {
  outline: none;
  border-color: #0056b3;
  box-shadow: 0 0 5px rgba(5, 155, 250, 0.5);
}

.operator-status {
  font-weight: bold;
  font-size: 0.9rem;
}

.operator-status.valid-operator {
  color: #4caf50;
}

.operator-status.invalid-operator {
  color: #ff4444;
}

.operator-warning {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(255, 68, 68, 0.1);
  border: 2px solid #ff4444;
  border-radius: 5px;
  color: #ff6666;
  text-align: center;
  font-weight: bold;
}

.panel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(100, 100, 100, 0.5) !important;
}

.scanner-disabled {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #ff4444;
  border-radius: 8px;
  margin: 1rem 0;
}

.scanner-disabled-message {
  text-align: center;
  color: #ff6666;
}

.scanner-disabled-message h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.scanner-disabled-message p {
  margin: 0;
  font-size: 1rem;
}

.activity-history {
  margin-top: 10px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.activity-history h5 {
  margin: 0 0 5px 0;
  font-size: 12px;
  color: #666;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.activity-item {
  font-size: 10px;
  color: #888;
  line-height: 1.2;
}

.activity-item small {
  display: block;
}
</style>
