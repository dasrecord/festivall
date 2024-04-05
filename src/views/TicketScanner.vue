<script>
import { QrcodeStream } from 'vue-qrcode-reader'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, updateDoc, getDocs } from 'firebase/firestore'

export default {
  components: {
    QrcodeStream
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
      this.scanResult = this.fullResult.split('_')[0]
      const matchingOrder = this.orders.find((order) => order.id_code === this.scanResult)
      if (matchingOrder) {
        this.matchingOrder = matchingOrder
        console.log('Order found:', this.matchingOrder)
      } else {
        this.matchingOrder = 'No Matching Order Found'
        console.log('Order not found:', this.matchingOrder)
      }
    },
    currentStatus(order) {
      if (order.checked_in) {
        return 'Checked In'
      } else {
        return 'Not Checked In'
      }
    },
    async checkIn(order) {
      const orderRef = doc(this.db, 'orders', order.id_code)
      await updateDoc(orderRef, {
        checked_in: true
      })
      order.checked_in = true
    },
    async checkOut(order) {
      const orderRef = doc(this.db, 'orders', order.id_code)
      await updateDoc(orderRef, {
        checked_in: false
      })
      order.checked_in = false
    },
    refreshPage() {
      window.location.reload()
    }
  }
}
</script>

<template>
  <h1>Ticket Scanner</h1>
  <qrcode-stream class="qr" @init="onInit" @detect="onDetect" camera="environment"></qrcode-stream>
  <div class="panel">
    <button class="refresh-button" @click="refreshPage">Refresh Ticket Scanner</button>

    <h3>Scan Result: {{ fullResult }} {{}}</h3>
    <p v-if="this.matchingOrder">
      Matching Order: {{ this.matchingOrder.id_code || this.matchingOrder }}
    </p>
    <p v-if="this.matchingOrder">
      Status: {{ currentStatus(matchingOrder) }} <br />Name:{{
        matchingOrder.fullname.replace(/"/g, '')
      }}
      <br />Email: {{ matchingOrder.email }} <br />Phone: {{ matchingOrder.phone }} <br />Quantity:
      {{ matchingOrder.quantity }}
    </p>

    <button
      class="panel-button"
      v-if="matchingOrder && !matchingOrder.checked_in"
      @click="checkIn(matchingOrder)"
    >
      Check In
    </button>
    <button
      class="panel-button"
      v-if="matchingOrder && matchingOrder.checked_in"
      @click="checkOut(matchingOrder)"
    >
      Check Out
    </button>
  </div>
  <div class="database">
    <h2>Order Database:</h2>
    <ul>
      <li v-for="order in orders" :key="order.id_code">
        <p>ID_CODE: {{ order.id_code }}</p>
        <p>Name: {{ order.fullname }}</p>
        <p>Email: {{ order.email }}</p>
        <p>Phone: {{ order.phone }}</p>
        <p>Quantity: {{ order.quantity }}</p>
        <p>Status: {{ currentStatus(order) }}</p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
h1 {
  text-align: center;
}
ul {
  padding: 0;
  display: flex;
  flex-direction: column;
}
li {
  list-style-type: none;
  border: 1px solid white;
  padding: 10px;
  margin: 10px;
  border-radius: 20px;
}
button {
  border: 1px solid rgba(121, 188, 255, 0.25);
  border-radius: 25px;
  padding: 1rem;
  box-shadow: inset 0 0 50px rgba(121, 188, 255, 0.25);
  position: relative;
  background-color: var(--q-color-primary);
  color: var(--q-color-white);
}
.qr {
  display: flex;
  width: 100%;
  max-height: 300px;
  border: 2px solid white;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
}
.panel {
  position: relative;
  display: flex;
  flex-direction: column;
}
.refresh-button {
  position: absolute;
  right: 0;
  width: auto;
  max-width: 150px;
}
</style>
