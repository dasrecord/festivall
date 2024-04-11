<script>
import { QrcodeStream } from 'vue-qrcode-reader'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, updateDoc, getDocs, or } from 'firebase/firestore'
import IconFestivall from '@/components/icons/IconFestivall.vue'

export default {
  components: {
    QrcodeStream,
    IconFestivall
  },
  data() {
    return {
      db: null,
      fullResult: null,
      scanResult: null,
      orders: [],
      matchingOrder: null
    }
  },
  created: async function () {
    try {
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_APP_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_APP_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_APP_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_APP_FIREBASE_MEASUREMENT_ID
      }

      const app = initializeApp(firebaseConfig)
      this.db = getFirestore(app)
      const ordersCollection = collection(this.db, 'orders')
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
      if (typeof this.fullResult === 'string' && this.fullResult.includes('_')) {
        this.scanResult = this.fullResult.split('_')[0]
        const matchingOrder = this.orders.find((order) => order.id_code === this.scanResult)
        if (matchingOrder) {
          this.matchingOrder = matchingOrder
          console.log('Order found:', this.matchingOrder)
        } else {
          this.matchingOrder = 'No Matching Order Found'
          console.log('Order not found:', this.matchingOrder)
        }
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
      if (order.paid) {
        return order.paid === 'true' ? 'Paid' : 'Not Paid'
      } else {
        return 'Not Paid'
      }
    },
    async checkIn(order) {
      const orderRef = doc(this.db, 'orders', order.id_code)
      await updateDoc(orderRef, {
        checked_in: 'true'
      })
      order.checked_in = 'true'
    },
    async checkOut(order) {
      const orderRef = doc(this.db, 'orders', order.id_code)
      await updateDoc(orderRef, {
        checked_in: 'false'
      })
      order.checked_in = 'false'
    },
    refreshPage() {
      window.location.reload()
    }
  }
}
</script>

<template>
  <h1>Reunion Ticket Scanner</h1>
  <qrcode-stream class="qr" @init="onInit" @detect="onDetect" camera="environment"></qrcode-stream>
  <div class="panel">
    <button class="refresh-button" @click="refreshPage">Refresh Scanner</button>

    <h4>
      Scan Result:<br />
      {{ fullResult }}<br /><br />
    </h4>
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
      Quantity: {{ matchingOrder.quantity }}<br />
      Paid: {{ paidStatus(matchingOrder) }} <br />
      Status: {{ currentStatus(matchingOrder) }} <br /><br />
    </p>
    <button
      class="panel-button"
      v-if="
        matchingOrder && typeof matchingOrder === 'object' && matchingOrder.checked_in === 'false'
      "
      @click="checkIn(matchingOrder)"
    >
      Check In
    </button>
    <button
      class="panel-button"
      v-if="
        matchingOrder && typeof matchingOrder === 'object' && matchingOrder.checked_in === 'true'
      "
      @click="checkOut(matchingOrder)"
    >
      Check Out
    </button>
  </div>
  <div class="at-a-glance">
    <h3>At A Glance</h3>
    <ul>
      <li>
        <div>
          <h4>Total Orders</h4>
          <h3>
            {{ orders.length }}
          </h3>
        </div>
        <div>
          <h4>Checked In</h4>
          <h3>
            {{ orders.filter((order) => order.checked_in === 'true').length }}
          </h3>
        </div>
        <div>
          <h4>Not Checked In</h4>
          <h3>
            {{ orders.filter((order) => order.checked_in === 'false').length }}
          </h3>
        </div>
        <div>
          <h4>Paid</h4>
          <h3>
            {{ orders.filter((order) => order.paid === 'true').length }}
          </h3>
        </div>
        <div>
          <h4>Not Paid</h4>
          <h3>
            {{ orders.filter((order) => order.paid === 'false').length }}
          </h3>
        </div>
      </li>
    </ul>
  </div>
  <div class="database">
    <h3>Order Database</h3>
    <ul>
      <li v-for="order in orders" :key="order.id_code" class="order">
        <div>
          <IconFestivall height="24px" />
          <h3>{{ order.id_code }}</h3>
        </div>

        <div>
          <h3>{{ order.fullname }}</h3>
          <p>{{ order.email }}</p>
          <p>{{ order.phone }}</p>
        </div>
        <div class="order-status">
          <h4>Admit {{ order.quantity }}</h4>
          <h4>{{ paidStatus(order) }}</h4>
          <h4>{{ currentStatus(order) }}</h4>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
h1,
h3 {
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
  padding: 30px;
  margin-bottom: 2rem;
}
.refresh-button {
  position: absolute;
  right: 30px;
  width: auto;
  max-width: 150px;
}
.panel-button {
  width: 100%;
  max-width: 150px;
  margin: 0 auto;
}
.at-a-glance {
  margin-bottom: 2rem;
}
ul {
  padding: 0;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
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
</style>
