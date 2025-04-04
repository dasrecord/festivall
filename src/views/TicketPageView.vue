<template>
  <div class="ticket-page" v-if="order">
    <img :src="festivall_emblem" style="height: 50px; width: 75px" alt="Festivall Emblem" />

    <CountdownTimer
      v-if="order.ticket_type === 'Weekend Pass'"
      :targetYear="2025"
      :targetMonth="7"
      :targetDay="29"
    />
    <CountdownTimer
      v-if="order.ticket_type === 'Day Pass'"
      :targetYear="2025"
      :targetMonth="7"
      :targetDay="order.selected_day.split(',')[1].split(' ')[2].split('t')[0]"
    />
    <h1>Reunion Festival {{ new Date().getFullYear() }}</h1>
    <img :src="frog_image" style="height: 100px; width: 100px" alt="Frog" />
    <h2>Your Digital Ticket</h2>

    <div class="order-info">
      <p>
        <strong>Full Name:</strong> {{ order.fullname }}
        <strong>Ticket Type:</strong>
        {{ order.ticket_type === 'Weekend Pass' ? 'Weekend Pass' : `Day Pass` }}
      </p>
      <p v-if="order.ticket_type === 'Weekend Pass'">
        <strong>Valid:</strong> 12:00 PM Friday August 29th - 12:00 PM Monday September 1st
      </p>

      <p v-if="order.ticket_type === 'Day Pass'">
        <strong>Valid: </strong> 24 hours starting 12:00 PM {{ order.selected_day }}
      </p>
      <div class="quantities">
        <div class="quantity">
          <p><strong>Admit:</strong>{{ order.ticket_quantity }}</p>
          <div class="icons">
            <img
              v-for="n in Number(order.ticket_quantity)"
              :key="n"
              :src="ticket_icon"
              style="
                height: auto;
                width: 32px;
                transform: translateY(8px) translateX(5px) rotate(-45deg);
              "
              alt="Ticket Icon"
            />
          </div>
        </div>
        <div class="quantity">
          <p><strong>Meal Tickets:</strong>{{ order.meal_tickets_remaining }}</p>
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
        <RouterLink
          v-if="order.payment_type === 'inkind' && order.applicant_type === 'Volunteer'"
          style="grid-column: span 2"
          to="/reunion-volunteer-instructions"
          id="volunteer-instructions"
        >
          <p>
            <img :src="volunteer_icon" style="height: auto; width: 36px" alt="Volunteer Icon" />
            Volunteer Instructions
          </p>
        </RouterLink>
        <RouterLink to="/reunionlocation">
          <p>
            <img :src="location_icon" style="height: auto; width: 20px" alt="Location Icon" />
            Location
          </p>
        </RouterLink>
        <RouterLink to="/reunionmap">
          <p>
            <img :src="map_icon" style="height: auto; width: 40px" alt="Grounds Map" />
            Grounds Map
          </p>
        </RouterLink>
        <RouterLink to="/reunionlineup">
          <p>
            <img :src="lineup_icon" style="height: auto; width: 32px" alt="Lineup Icon" />
            Lineup
          </p>
        </RouterLink>
        <RouterLink
          v-if="new Date() >= new Date(2025, 7, 26)"
          :to="{
            name: 'ScavengerHunt',
            params: { id_code: order.id_code },
            query: { fullName: order.fullname.split(' ')[0] }
          }"
        >
          <p>
            <img :src="quiz_icon" style="height: auto; width: 32px" alt="Scavenger Hunt Icon" />
            Scavenger Hunt
          </p>
        </RouterLink>
        <RouterLink v-else to="#">
          <p>
            <img :src="quiz_icon" style="height: auto; width: 32px" alt="Coming Soon Icon" />
            More coming soon!
          </p>
        </RouterLink>
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
import CountdownTimer from '@/components/CountdownTimer.vue'

export default {
  name: 'TicketPageView',
  components: {
    CountdownTimer
  },

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
          }
        })
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
  /* border: 1px solid lime; */
}
.countdowntimer {
  background-color: var(--reunion-frog-green);
  color: white;
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
.ticket-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  /* justify-content: center; */
  margin-bottom: 1rem;
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
  padding: 0.5rem 0.5rem;
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
  justify-content: space-evenly;
  text-align: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.quantity {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  border: 1px solid var(--reunion-frog-green);
  border-radius: 10px;
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
  padding: 0.5rem 0 0.3rem 0;
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
  color: limegreen;
  font-weight: bold;
}

.not-paid {
  color: red;
  font-weight: bold;
}
.checked-in {
  color: orange;
  font-weight: bold;
}
.not-checked-in {
  color: yellow;
  font-weight: bold;
}
</style>
