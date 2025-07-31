<template>
  <img
    :src="festivall_emblem"
    style="height: 50px; width: 75px; margin: auto; display: block"
    alt="Festivall Emblem"
  />
  <h1>REUNION 2025 TICKET SCANNER</h1>
  <audio id="success-sound" src="/sounds/access-granted.mp3" preload="auto"></audio>
  <audio id="failure-sound" src="/sounds/access-denied.mp3" preload="auto"></audio>
  <QrcodeStream class="qr" @init="onInit" @detect="onDetect" camera="environment" />
  <div class="panel">
    <div class="utilities">
      <button @click="showInstructions = true">Front Gate Instructions</button>
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
        </p>
      </div>
    </div>

    <button
      class="panel-button"
      v-if="matchingOrder && typeof matchingOrder === 'object' && matchingOrder.ticket_quantity > 0"
      @click="checkIn(matchingOrder)"
    >
      Check In 1 Ticket
    </button>
    <button
      class="panel-button"
      v-if="
        matchingOrder &&
        typeof matchingOrder === 'object' &&
        matchingOrder.ticket_quantity < matchingOrder.original_ticket_quantity
      "
      @click="checkOut(matchingOrder)"
    >
      Check Out 1
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
      filter: 'all',
      showInstructions: false
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
    }
  },
  async created() {
    try {
      // const ordersCollection = collection(this.db, 'orders') // fetch 2024 orders
      const ordersCollection = collection(this.db, 'orders_2025') // fetch 2025 orders
      const orderSnapshot = await getDocs(ordersCollection)
      this.orders = orderSnapshot.docs.map((doc) => doc.data())
    } catch (error) {
      console.error('An error occurred in the created hook:', error)
    }
  },
  methods: {
    onInit(error) {
      if (error) {
        console.error('QR Code Reader initialization failed:', error)
      } else {
        console.log('QR Code Reader initialized.')
      }
    },
    onDetect(result) {
      this.fullResult = result[0].rawValue
      this.scanResult = this.fullResult
      // Use short id_code for matching
      // const matchingOrder = this.orders.find((order) => order.id_code === this.scanResult)

      // Use long id_code for matching
      const matchingOrder = this.orders.find((order) => order.id_code_long === this.scanResult)
      if (matchingOrder) {
        this.matchingOrder = matchingOrder
        console.log('Order found:', this.matchingOrder)
        document.getElementById('success-sound').play()
      } else {
        this.matchingOrder = 'No Matching Order Found'
        console.log('Order not found:', this.matchingOrder)
        document.getElementById('failure-sound').play()
      }
    },
    currentStatus(order) {
      if (order.checked_in) {
        return order.checked_in === 'true' ? 'Checked In' : 'Not Checked In'
      } else {
        return 'Not Checked In'
      }
    },
    paidStatus(order) {
      if (order.paid === true || order.paid === 'true') {
        return 'Paid'
      } else {
        return 'Not Paid'
      }
    },

    async checkIn(order) {
      if (!order.original_ticket_quantity) {
        order.original_ticket_quantity = order.ticket_quantity
      }

      if (order.ticket_quantity > 0) {
        const orderRef = doc(this.db, 'orders_2025', order.id_code)
        await updateDoc(orderRef, {
          checked_in: true,
          original_ticket_quantity: order.original_ticket_quantity
        })
        sendReunionFrontGate(`:ticket: ${order.fullname} has checked in.\n:id: ${order.id_code}`)
        order.checked_in = true
        order.ticket_quantity -= 1
      } else {
        console.error('No tickets left to check in.')
      }
    },

    async checkOut(order) {
      if (!order.original_ticket_quantity) {
        order.original_ticket_quantity = order.ticket_quantity
      }

      if (order.ticket_quantity < order.original_ticket_quantity) {
        const orderRef = doc(this.db, 'orders_2025', order.id_code)
        await updateDoc(orderRef, {
          checked_in: order.ticket_quantity + 1 > 0,
          ticket_quantity: order.ticket_quantity + 1,
          original_ticket_quantity: order.original_ticket_quantity
        })
        sendReunionFrontGate(`:ticket: ${order.fullname} has checked out.\n:id: ${order.id_code}`)
        order.checked_in = order.ticket_quantity + 1 > 0
        order.ticket_quantity += 1
      } else {
        console.error('Cannot check out more tickets than the original quantity.')
      }
    },

    refreshPage() {
      window.location.reload()
    },

    toggleView() {
      if (this.filter === 'all') {
        this.filter = 'checkedIn'
      } else if (this.filter === 'checkedIn') {
        this.filter = 'notCheckedIn'
      } else {
        this.filter = 'all'
      }
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
</style>
