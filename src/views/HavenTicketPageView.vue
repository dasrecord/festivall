<template>
  <div class="ticket-page" v-if="order">
    <img :src="festivall_emblem" alt="Festivall Emblem" class="festivall-emblem" />
    <img :src="haven_emblem" alt="Haven Emblem" class="haven-emblem" /><br />

    Your Digitial Ticket

    <div class="order-info">
      <p><strong>Name:</strong></p>
      <p>
        {{ order.fullname }}
      </p>
      <p><strong>Date:</strong></p>
      <p>
        {{ order.event_date }}
      </p>

      <p><strong>Location:</strong></p>
      <p>
        <a
          href="https://maps.app.goo.gl/gsydSXgD2Z3hTH3q8"
          target="_blank"
          style="color: white; text-decoration: underline"
        >
          105 21st St E
        </a>
      </p>
      <p><strong>ID Code:</strong></p>
      <p>{{ order.id_code }}</p>
    </div>

    <div class="qr-code">
      <canvas ref="qrCanvas" />
    </div>

    <div class="buttons">
      <button @click="showPaymentModal = true" class="haven-button">Payment Status</button>
      <button @click="showCheckInModal = true" class="haven-button">Check-In Status</button>
    </div>

    <div v-if="showPaymentModal" class="modal" @click.self="showPaymentModal = false">
      <div class="modal-content">
        <h2>Payment Status</h2>
        <p>{{ order.paid ? 'Paid' : 'Not Paid' }}</p>
        <p>
          If this is incorrect, please contact
          <a href="mailto:haven@festivall.ca" style="color: white; text-decoration: underline"
            >haven@festivall.ca</a
          >
        </p>
        <button @click="showPaymentModal = false" class="haven-button">Close</button>
      </div>
    </div>

    <div v-if="showCheckInModal" class="modal" @click.self="showCheckInModal = false">
      <div class="modal-content">
        <h2>Check-In Status</h2>
        <p>{{ order.checked_in ? 'Checked In' : 'Not Checked In' }}</p>
        <p>
          If you have any questions, please contact
          <a href="mailto:haven@festivall.ca" style="color: white; text-decoration: underline"
            >haven@festivall.ca</a
          >
        </p>
        <button @click="showCheckInModal = false" class="haven-button">Close</button>
      </div>
    </div>
  </div>
  <div v-else>
    <p>Loading...</p>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { festivall_db } from '@/firebase'
import QRCode from 'qrcode'
import festivall_emblem from '@/assets/images/festivall_emblem_white.png'
import haven_emblem from '@/assets/images/haven_emblem_white.png'

export default {
  name: 'HavenTicketPageView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const order = ref(null)
    const qrCanvas = ref(null)
    const showPaymentModal = ref(false)
    const showCheckInModal = ref(false)

    const loadOrder = async (id_code) => {
      try {
        const qHaven = query(collection(festivall_db, 'haven'), where('id_code', '==', id_code))
        const snapshot = await getDocs(qHaven)
        if (!snapshot.empty) {
          order.value = snapshot.docs[0].data()
          await nextTick()
          generateQRCode(order.value.id_code_long)
        } else {
          alert('No order found with that ID code.')
          router.push({ name: 'EnterIDCode' })
        }
      } catch (error) {
        console.error('Error loading Haven order:', error)
        router.push({ name: 'havenlogin' })
      }
    }

    const generateQRCode = (text) => {
      if (qrCanvas.value) {
        QRCode.toCanvas(qrCanvas.value, text, { width: 200, height: 200 }, (error) => {
          if (error) {
            console.error('Error generating QR:', error)
          }
        })
      }
    }

    onMounted(() => {
      const id_code = route.params.id_code
      if (id_code) loadOrder(id_code)
      else router.push({ name: 'havenlogin' })
    })

    return {
      order,
      qrCanvas,
      showPaymentModal,
      showCheckInModal,
      festivall_emblem,
      haven_emblem
    }
  }
}
</script>

<style scoped>
.ticket-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100vw;
  background-color: #1b1b1b; /* charcoal */
  color: #ffffff; /* white */
  padding: 1rem;
  border: 1px solid white;
  border-radius: 10px;
}

.festivall-emblem {
  width: 100%;
  max-width: 100px;
  margin-bottom: 1rem;
}

.haven-emblem {
  width: 100%;
  max-width: 600px;
}

.order-info {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  padding: 0.5rem;
  margin: 1rem;
  border: 1px solid #444;
  border-radius: 8px;
}

.qr-code {
  margin: 1rem 0;
}

.haven-button {
  border-radius: 5px;
  background-color: #1b1b1b;
  color: white;
  padding: 0.5rem;
  :display:;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  z-index: 999;
}

.modal-content {
  margin: auto;
  background: #2b2b2b;
  color: #ffffff;
  padding: 1.5rem;
  border-radius: 6px;
  text-align: center;
  width: 80%;
}
</style>
