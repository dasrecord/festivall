<template>
  <h1>REUNION 2025 TICKET SCANNER</h1>
  <QrcodeStream class="qr" @init="onInit" @detect="onDetect" camera="environment" />
  <div class="panel">
    <div class="utilities">
      <button @click="refreshPage">Refresh Scanner</button>
      <button @showInstructions="true">Front Gate Instructions</button>
    </div>

    <div v-if="showInstructions" class="modal">
      <div class="modal-content">
        <h3>Front Gate Instructions</h3>
        <div>
          <p>1. Welcome the guest warmly and introduce yourself.</p>
          <p>2. Kindly ask the guest to present their Festivall QR Code for scanning.</p>
          <p>
            3. If a match is found and the status is "Paid," admit the appropriate number of persons
            checking in or out.
          </p>
          <p>
            4. If the status is "Unpaid" or there is an error, please radio the admin team for
            assistance.
          </p>
        </div>

        <button @click="showInstructions = false">Close</button>
      </div>
    </div>
    <h3>
      Scan Result:<br />
      {{ fullResult }}<br /><br />
    </h3>
    <p v-if="matchingOrder && typeof matchingOrder === 'string'">
      {{ matchingOrder }}
    </p>
    <p v-if="matchingOrder && typeof matchingOrder === 'object'">
      Matching Order: {{ matchingOrder.id_code }}
    </p>
    <p v-if="matchingOrder && typeof matchingOrder === 'object'">
      Name: {{ matchingOrder.fullname }} <br />
      Email: {{ matchingOrder.email }} <br />
      Phone: {{ matchingOrder.phone }} <br /><br />
      Admit:
      <span v-for="n in parseInt(matchingOrder.ticket_quantity)" :key="n">
        <img
          src="@/assets/images/icons/ticket.png"
          alt="Ticket"
          style="width: 24px; margin-right: 5px"
        />
      </span>
      <br />
      Paid:
      <span :style="{ color: paidStatus(matchingOrder) === 'Paid' ? 'green' : 'red' }">
        {{ paidStatus(matchingOrder) }}</span
      >
      <br />
      Status: {{ currentStatus(matchingOrder) }} <br /><br />
    </p>
    <button
      class="panel-button"
      v-if="matchingOrder && typeof matchingOrder === 'object' && !matchingOrder.checked_in"
      @click="checkIn(matchingOrder)"
    >
      Check In
    </button>
    <button
      class="panel-button"
      v-if="matchingOrder && typeof matchingOrder === 'object' && matchingOrder.checked_in"
      @click="checkOut(matchingOrder)"
    >
      Check Out
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
          <h2>{{ order.id_code }}</h2>
        </div>

        <div>
          <h2>{{ order.fullname }}</h2>
          <p>{{ order.email }}</p>
          <p>{{ order.phone }}</p>
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
          <h4>{{ currentStatus(order) }}</h4>
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
      const matchingOrder = this.orders.find((order) => order.id_code === this.scanResult)
      // const matchingOrder = this.orders.find((order) => order.id_code_long === this.scanResult)
      if (matchingOrder) {
        this.matchingOrder = matchingOrder
        console.log('Order found:', this.matchingOrder)
      } else {
        this.matchingOrder = 'No Matching Order Found'
        console.log('Order not found:', this.matchingOrder)
      }
    },
    currentStatus(order) {
      return order.checked_in ? 'Checked In' : 'Not Checked In'
    },
    paidStatus(order) {
      return order.paid ? 'Paid' : 'Not Paid'
    },

    async checkIn(order) {
      const orderRef = doc(this.db, 'orders_2025', order.id_code)
      await updateDoc(orderRef, {
        checked_in: true
      })
      sendReunionFrontGate(
        `:bust_in_silhouette: ${order.fullname} has checked in.\n:ticket: ${order.id_code}`
      )
      order.checked_in = true
    },
    async checkOut(order) {
      const orderRef = doc(this.db, 'orders_2025', order.id_code)
      await updateDoc(orderRef, {
        checked_in: false
      })
      sendReunionSlackAdmin(`:bust_in_silhouette: ${order.fullname} has checked out.`)
      order.checked_in = false
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
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}
.modal-content {
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  width: 80%;
  max-width: 500px;
  font-size: larger;
}
.modal-content p {
  font-size: medium;
}
button {
  margin-top: 10px;
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
