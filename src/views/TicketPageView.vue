<template>
  <div class="ticket-page" v-if="order">
    <img :src="festivall_emblem" style="height: 50px; width: 75px" alt="Festivall Emblem" />
    <h1>Reunion Festival {{ new Date().getFullYear() }}</h1>
    <img :src="frog_image" style="height: 100px; width: 100px" alt="Frog" />
    <h2>Your Digital Ticket</h2>
    <div class="order-info">
      <p><strong>Full Name:</strong> {{ order.fullname }}</p>
      <p>
        <strong>Ticket Type:</strong>
        {{ order.ticket_type === 'Weekend Pass' ? 'Weekend Pass' : `Day Pass` }}
      </p>
      <p v-if="order.ticket_type === 'Weekend Pass'">
        <strong>Valid From:</strong> 12:00 PM Friday August 29th - 12:00 PM Monday September 1st
      </p>

      <p v-if="order.ticket_type === 'Day Pass'">
        <strong>Valid: </strong> 24 hours starting 12:00 PM {{ order.selected_day }}
      </p>
      <div class="quantities">
        <p><strong>Ticket Quantity:</strong>{{ order.ticket_quantity }}</p>
        <div class="icons">
          <img
            v-for="n in Number(order.ticket_quantity)"
            :key="n"
            :src="ticket_icon"
            style="height: auto; width: 32px; transform: rotate(-45deg)"
            alt="Ticket Icon"
          />
        </div>
        <p><strong>Meal Tickets Remaining:</strong>{{ order.meal_tickets_remaining }}</p>
        <div class="icons">
          <img
            v-for="n in Number(order.meal_tickets_remaining)"
            :key="n"
            :src="meals_icon"
            style="height: auto; width: 32px"
            alt="Meal Icon"
          />
        </div>
      </div>

      <p
        v-if="order && typeof order === 'object'"
        style="
          justify-content: center;
          background-color: black;
          color: white;
          padding: 0.5rem;
          border-radius: 5px;
        "
      >
        <strong>Payment Status:</strong>
        <span :class="{ paid: order.paid, 'not-paid': !order.paid }">
          {{ order.paid ? 'Paid' : 'Not Paid' }}
        </span>
      </p>
      <p
        style="
          justify-content: center;
          background-color: black;
          color: white;
          padding: 0.5rem;
          border-radius: 5px;
        "
      >
        <strong>Status:</strong>
        <span :class="{ 'checked-in': order.checked_in, 'not-checked-in': !order.checked_in }">
          {{ order.checked_in ? 'Checked In' : 'Not Checked In' }}
        </span>
      </p>
      <div class="links">
        <p v-if="order.payment_type === 'inkind' && order.applicant_type === 'Volunteer'">
          <img :src="volunteer_icon" style="height: auto; width: 32px" alt="Volunteer Icon" />
          <RouterLink to="/reunion-volunteer-instructions">Volunteer Instructions</RouterLink>
        </p>
        <p>
          <img :src="location_icon" style="height: 32px; width: auto" alt="Location Icon" />
          <RouterLink to="/reunionlocation">Location</RouterLink>
        </p>
        <p>
          <img :src="map_icon" style="height: auto; width: 32px" alt="Grounds Map" />
          <RouterLink to="/reunionmap">Grounds Map</RouterLink>
        </p>
        <p>
          <img :src="lineup_icon" style="height: auto; width: 32px" alt="Lineup Icon" />
          <RouterLink to="/reunionlineup">Lineup</RouterLink>
        </p>
        <p>
          <img :src="quiz_icon" style="height: auto; width: 32px" alt="Scavenger Hunt Icon" />
          <RouterLink
            :to="{
              name: 'ScavengerHunt',
              params: { id_code: order.id_code },
              query: { fullName: order.fullname.split(' ')[0] }
            }"
          >
            Scavenger Hunt
          </RouterLink>
        </p>
      </div>
    </div>

    <div class="qr-code">
      <canvas ref="qrCanvas"></canvas>
    </div>

    <img class="footer" :src="poster_footer" style="width: 100%" alt="Poster Footer" />
  </div>
  <div v-else>
    <p>Loading...</p>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import QRCode from 'qrcode'
import frog_image from '@/assets/images/frog.png'
import festivall_emblem from '@/assets/images/festivall_emblem_black.png'
import poster_footer from '@/assets/images/poster_footer_v1.png'
import ticket_icon from '@/assets/images/icons/ticket_black.png'
import meals_icon from '@/assets/images/icons/meals_black.png'
import volunteer_icon from '@/assets/images/icons/volunteer.png'
import location_icon from '@/assets/images/icons/location.png'
import map_icon from '@/assets/images/icons/grounds_map.png'
import lineup_icon from '@/assets/images/icons/lineup.png'
import quiz_icon from '@/assets/images/icons/quiz.png'

export default {
  name: 'TicketPageView',

  setup() {
    const route = useRoute()
    const router = useRouter()
    const order = ref(null)
    const qrCanvas = ref(null)

    const loadOrder = async (id_code) => {
      try {
        if (!id_code) {
          throw new Error('ID code is undefined')
        }

        // Check if the order is found in the orders_2025 collection
        const q = query(collection(reunion_db, 'orders_2025'), where('id_code', '==', id_code))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          order.value = querySnapshot.docs[0].data()
          console.log('Order data:', order.value) // Debug log
          await nextTick() // Wait for the DOM to update

          // generateQRCode(order.value.id_code) // Use short id_code for QR code generation
          generateQRCode(order.value.id_code_long) // Use long id_code for QR code generation
        } else {
          console.error('No such document!')
          alert('No order found with this ID code. Please check your ID code and try again.')
          router.push({ name: 'EnterIDCode' })
        }
      } catch (error) {
        console.error('Error getting document:', error)
        router.push({ name: 'EnterIDCode' })
      }
    }

    const generateQRCode = (text) => {
      if (qrCanvas.value) {
        QRCode.toCanvas(qrCanvas.value, text, { width: 200, height: 200 }, (error) => {
          if (error) {
            console.error('Error generating QR code:', error)
          } else {
            console.log('QR code generated successfully') // Debug log
          }
        })
      } else {
        console.error('QR canvas element is not available') // Debug log
      }
    }

    onMounted(() => {
      const id_code = route.params.id_code
      if (id_code) {
        loadOrder(id_code)
      } else {
        console.error('ID code is missing from route parameters')
        router.push({ name: 'EnterIDCode' })
      }
    })

    return {
      frog_image,
      festivall_emblem,
      poster_footer,
      order,
      qrCanvas,
      ticket_icon,
      meals_icon,
      volunteer_icon,
      location_icon,
      map_icon,
      lineup_icon,
      quiz_icon
    }
  }
}
</script>

<style scoped>
* {
  font-family: 'Helvetica', sans-serif;
}

strong {
  font-weight: bold;
}

.ticket-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  background-color: white;
  color: black;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 100vw;
  height: auto;
  /* padding: 1rem 3rem; */
}

h1,
h2 {
  color: var(--reunion-frog-green);
  text-align: center;
  font-weight: bold;
  margin: 0;
  padding: 0;
}

.order-info {
  border: 1px solid var(--reunion-frog-green);
  border-radius: 10px;
  /* max-width: 85%; */
  padding: 1rem 1rem;
  z-index: 2;
}

.order-info p {
  margin: 0 0 0.5rem 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.order-info img {
  margin: 0 0.5rem 0.7rem 0;
}

.quantities {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}
.type {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.order-info .links img {
  margin: 0;
}
.links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  color: white;
}

.links p {
  background-color: var(--reunion-frog-green);
  color: white;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  padding: 0.5rem 0.5rem;
  margin: 0;
}

.links a {
  color: white;
  padding: 0;
  /* text-decoration: underline; */
}

a:hover {
  text-decoration: underline;
  background: none;
}

.qr-code {
  display: flex;
  justify-content: center;
  margin-top: -10px;
  z-index: 1;
}
.footer {
  max-width: 432px;
  height: auto;
}

.paid {
  color: green;
}

.not-paid {
  color: red;
}
.checked-in {
  color: orange;
}
.not-checked-in {
  color: yellow;
}
</style>
