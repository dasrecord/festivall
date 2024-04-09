<script>
import { QrcodeStream } from 'vue-qrcode-reader'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, updateDoc, getDocs } from 'firebase/firestore'
import IconFestivall from '@/components/icons/IconFestivall.vue'
import { auth } from '@/main'

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
        apiKey: auth.currentUser.apiKey,
        authDomain: auth.currentUser.authDomain,
        projectId: auth.currentUser.projectId,
        storageBucket: auth.currentUser.storageBucket,
        messagingSenderId: auth.currentUser.messagingSenderId,
        appId: auth.currentUser.appId
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
    <h2>At A Glance</h2>
    <ul>
      <li>
        <p>Total Orders: {{ orders.length }}</p>
        <p>Checked In: {{ orders.filter((order) => order.checked_in === 'true').length }}</p>
        <p>Not Checked In: {{ orders.filter((order) => order.checked_in === 'false').length }}</p>
        <p>Paid: {{ orders.filter((order) => order.paid === 'true').length }}</p>
        <p>Not Paid: {{ orders.filter((order) => order.paid === 'false').length }}</p>
      </li>
    </ul>
  </div>
  <div class="database">
    <h2>Order Database:</h2>
    <ul>
      <li v-for="order in orders" :key="order.id_code" class="order">
        <div><IconFestivall height="32px" /></div>
        <div>
          <p>ID_Code: {{ order.id_code }}</p>
          <p>Name: {{ order.fullname }}</p>
          <p>Email: {{ order.email }}</p>
          <p>Phone: {{ order.phone }}</p>
        </div>
        <div class="order-status">
          <p>Quantity: {{ order.quantity }}</p>
          <p>Paid: {{ paidStatus(order) }}</p>
          <p>Status: {{ currentStatus(order) }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
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
  max-height: 500px;
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

ul {
  padding: 0;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
}
li {
  display: flex;
  justify-content: space-between;
  list-style-type: none;
  border: 1px solid rgba(121, 188, 255, 0.25);
  box-shadow: inset 0 0 20px rgba(121, 188, 255, 0.25);
  padding: 30px;
  margin: 5px;
  border-radius: 20px;
}
.order {
  display: flex;
  justify-content: space-between;
}

.order-status {
  align-self: flex-start;
}
</style>
