<template>
  <div class="ticket-page" v-if="order">
    <img :src="festivall_emblem_black" style="height: 50px; width: 75px" alt="Festivall Emblem" />

    <CountdownTimer
      v-if="order.ticket_type === 'Weekend Pass'"
      :targetYear="2025"
      :targetMonth="8"
      :targetDay="29"
    />
    <CountdownTimer
      v-if="order.ticket_type === 'Day Pass'"
      :targetYear="2025"
      :targetMonth="8"
      :targetDay="parseInt(order.selected_day.split(',')[1].split(' ')[2].split('t')[0], 10)"
    />
    <h1>Reunion Festival {{ new Date().getFullYear() }}</h1>
    <img :src="frog_image" style="height: 100px; width: 100px" alt="Frog" />

    <h2>Your Digital Ticket<br /></h2>

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
        <strong>Valid: </strong> 12:00 PM {{ order.selected_day }}
        for 24H
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
      <div class="status-bar">
        <p
          @click="showPaymentModal = true"
          style="
            justify-content: center;
            background-color: black;
            color: white;
            padding: 0.5rem;
            border-radius: 5px;
            cursor: pointer;
          "
        >
          <img
            :src="payment_icon"
            style="height: auto; width: 32px; margin: 0"
            alt="Payment Icon"
          />
          <strong>Payment Status:</strong>
          <span :class="{ paid: order.paid, 'not-paid': !order.paid }">
            {{ order.paid ? 'Paid' : 'Not Paid' }}
          </span>
        </p>
        <p
          @click="showCheckInModal = true"
          style="
            justify-content: center;
            background-color: black;
            color: white;
            padding: 0.5rem;
            border-radius: 5px;
            cursor: pointer;
          "
        >
          <img :src="status_icon" style="height: auto; width: 32px; margin: 0" alt="Status Icon" />
          <strong>Check-In Status:</strong>
          <span :class="{ 'checked-in': order.checked_in, 'not-checked-in': !order.checked_in }">
            {{ order.checked_in ? 'Checked In' : 'Not Checked In' }}
          </span>
        </p>
        <p
          @click="showReferralModal = true"
          v-if="referralEarnings >= 0"
          style="
            justify-content: center;
            background-color: black;
            color: white;
            padding: 0.5rem;
            border-radius: 5px;
            cursor: pointer;
          "
        >
          <img :src="bonus_icon" style="height: 32px; width: auto; margin: 0" alt="Bonus Icon" />
          <strong>Referral Earnings: ${{ referralEarnings }}</strong>
        </p>
      </div>

      <div v-if="showPaymentModal" class="modal" @click.self="showPaymentModal = false">
        <div class="modal-content">
          <img
            :src="festivall_emblem_white"
            style="height: 64px; width: auto"
            alt="Festivall Emblem"
          />
          <img
            :src="payment_icon"
            style="height: 64px; width: auto; margin: 0"
            alt="Payment Icon"
          />
          <h2>Payment Status</h2>
          <span :class="{ paid: order.paid, 'not-paid': !order.paid }">
            {{ order.paid ? 'Paid' : 'Not Paid' }} </span
          ><br />

          <h3 v-if="order.paid === false">
            <strong style="text-decoration: underline">Payment Instructions:</strong>
            <br />
            To complete your payment, please send <strong>${{ order.total_price }}</strong> to the
            following email address:
            <br />
            <strong>humanoidtwo@gmail.com</strong>
            <br />
            Make sure to include the following code in the message section:
            <br />
            <strong>{{ order.id_code }}</strong>
            <br /><br />
            <strong style="text-decoration: underline">Additional Information:</strong>
            <br />
            We only accept cash and bitcoin at the Front Gate
            <br />
            If you are paying with cash, please bring the exact amount.
            <br />
            If you are paying with bitcoin, please send the payment to the address provided in the
            <strong>Payment Instructions</strong> section above.
          </h3>
          <h3 v-else>Thank you so much for supporting Reunion Festival.<br /></h3>
          <h3>
            If you have any issues with your payment, please contact
            <a href="mailto:reunion@festivall.ca" style="text-decoration: underline">
              reunion@festivall.ca</a
            >
          </h3>

          <button @click="showPaymentModal = false">Close</button>
        </div>
      </div>

      <div v-if="showCheckInModal" class="modal" @click.self="showCheckInModal = false">
        <div class="modal-content">
          <img
            :src="festivall_emblem_white"
            style="height: 64px; width: auto"
            alt="Festivall Emblem"
          />
          <img
            :src="status_icon"
            style="height: 64px; width: auto; margin: 0"
            alt="Check-In Icon"
          />
          <h2>Check-In Status:</h2>
          <span :class="{ 'checked-in': order.checked_in, 'not-checked-in': !order.checked_in }">
            {{ order.checked_in ? 'Checked In' : 'Not Checked In' }} </span
          ><br />
          <h3 v-if="order.checked_in === false">
            <strong style="text-decoration: underline">Check-In Instructions:</strong>
            <br />
            Present your QR code at the Front Gate along with a valid form of identification.<br />
            Your {{ order.ticket_quantity }} tickets will be scanned at the gate.<br />

            Last-minute door sales will be subject to an additional $10 fee per ticket.<br /><br />
            <strong style="text-decoration: underline">Additional Information:</strong>
            <br />
            The Front Gate will close at 2:00 AM each night.<br />
            Please try to arrive before then.<br />
            With respected to substances, we have a No Open Use Policy.<br />
            Please keep all adult materials out of sight and reach of minors.<br /><br />
          </h3>
          <h3 v-else>
            <strong style="text-decoration: underline"> Check-Out Instructions:</strong>
            <br />
            Please present your QR code at the Front Gate on your way out.<br />
            This will help us keep track of how many people are still on the grounds.<br /><br />
            <strong style="text-decoration: underline">Additional Information:</strong>
            <br />
            The Front Gate will close at 2 AM on each night.<br />
            Please try to check out before then.<br />
            If you are leaving the grounds, please make sure to take all of your belongings with
            you.<br />
            We are not responsible for any lost or stolen items.<br />
            <br />
          </h3>

          <h3
            v-if="order.applicant_types && order.applicant_types.includes('Artist' || 'Workshop')"
          >
            <strong style="text-decoration: underline"> Artists and Workshops:</strong><br />
            After checking in, please proceed to the Artist Loading Zone to drop off your gear and
            introduce yourself to the Stage Crew.<br />
            Once you're oriented, please take your vehicle to your campsite allowing others to load
            in.<br />
          </h3>

          <h3>
            If you have any questions or concerns, please contact
            <a href="mailto:reunion@festivall.ca" style="text-decoration: underline">
              reunion@festivall.ca
            </a>
          </h3>
          <button @click="showCheckInModal = false">Close</button>
        </div>
      </div>

      <div v-if="showReferralModal" class="modal" @click.self="showReferralModal = false">
        <div class="modal-content">
          <img
            :src="festivall_emblem_white"
            style="height: 64px; width: auto"
            alt="Festivall Emblem"
          />
          <img :src="bonus_icon" style="height: 64px; width: auto; margin: 0" alt="Bonus Icon" />
          <h2>Referral Earnings</h2>
          <strong> #{{ order.id_code }} </strong>
          <strong>${{ referralEarnings }}</strong
          ><br />
          <h3>
            <strong style="text-decoration: underline">Referral Instructions:</strong><br />
            You can share your Festivall ID_CODE or your referral link with your friends and
            family.<br />
            Remember, you earn $20 for each Weekend Pass and $10 for each Day Pass.<br /><br />
          </h3>

          <h3>
            <strong style="text-decoration: underline"> This is your referral link: </strong><br />
            Copy and paste this link anywhere!
            <a :href="`https://festivall.ca/reuniontickets/${order.id_code}`" target="_blank"
              >{{ `https://festivall.ca/reuniontickets/${order.id_code}` }} </a
            ><br /><br />
          </h3>
          <h3>
            <strong style="text-decoration: underline"> This is your referral QR code: </strong>
          </h3>

          <div class="qr-code">
            <canvas ref="referralQrCanvas"></canvas>
          </div>
          <h3>
            Have your friends scan this QR code to get their tickets.<br />
            Your ID_CODE will be automatically added to their order.<br />
          </h3>
          <h3>
            If you have any questions or concerns, please contact
            <a href="mailto:reunion@festivall.ca" style="text-decoration: underline"
              >reunion@festivall.ca</a
            >
          </h3>

          <button @click="showReferralModal = false">Close</button>
        </div>
      </div>

      <div class="links">
        <RouterLink
          v-if="
            (order.payment_type === 'inkind' || order.payment_type === 'In Kind') &&
            order.applicant_types.includes('Volunteer')
          "
          style="grid-column: span 2"
          to="/reunion-volunteer-instructions"
          id="volunteer-instructions"
        >
          <p>
            <img :src="volunteer_icon" style="height: auto; width: 36px" alt="Volunteer Icon" />
            Volunteer Instructions
          </p>
        </RouterLink>
        <div
          v-if="
            (order.applicant_types?.includes('Artist') ||
              order.applicant_types?.includes('Workshop')) &&
            order.settimes?.length > 0
          "
          style="grid-column: span 2; cursor: pointer"
          @click.prevent="downloadSettimes"
        >
          <p style="text-align: center">
            <img
              :src="order.applicant_types?.includes('Artist') ? dj_icon : workshop_icon"
              style="height: auto; width: 36px"
              :alt="order.applicant_types?.includes('Artist') ? 'Artist Icon' : 'Workshop Icon'"
            />
            Download Your Set Times:
            <span v-for="(settime, index) in order.settimes" :key="index">
              {{
                new Date(settime).toLocaleString([], {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })
              }}
            </span>
          </p>
        </div>
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
        <RouterLink v-if="new Date() >= new Date(2025, 7, 26)" to="/reunionlineup">
          <p>
            <img :src="lineup_icon" style="height: auto; width: 32px" alt="Lineup Icon" />
            2025 Lineup
          </p>
        </RouterLink>
        <RouterLink v-else to="#">
          <p>
            <img :src="lineup_icon" style="height: auto; width: 32px" alt="Coming Soon Icon" />
            Lineup TBA
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
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import QRCode from 'qrcode'
import frog_image from '@/assets/images/frog.png'
import festivall_emblem_black from '@/assets/images/festivall_emblem_black.png'
import festivall_emblem_white from '@/assets/images/festivall_emblem_white.png'
import poster_footer from '@/assets/images/poster_footer_v1.png'
import ticket_icon from '@/assets/images/icons/ticket_black.png'
import meals_icon from '@/assets/images/icons/meals_black.png'
import payment_icon from '@/assets/images/icons/compensation.png'
import status_icon from '@/assets/images/icons/front_gate.png'

import bonus_icon from '@/assets/images/icons/bonus.png'
import volunteer_icon from '@/assets/images/icons/volunteer.png'
import dj_icon from '@/assets/images/icons/dj.png'
import workshop_icon from '@/assets/images/icons/workshop.png'
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
    const referralEarnings = ref(0)
    const referralQrCanvas = ref(null)

    const showPaymentModal = ref(false)
    const showCheckInModal = ref(false)
    const showReferralModal = ref(false)

    const calculateReferralEarnings = async (id_code) => {
      try {
        const referralQuery = query(
          collection(reunion_db, 'orders_2025'),
          where('referral_id_code', '==', id_code)
        )

        const referralSnapshot = await getDocs(referralQuery)

        let totalEarnings = 0
        referralSnapshot.forEach((doc) => {
          const ticketType = doc.data().ticket_type
          totalEarnings += ticketType === 'Weekend Pass' ? 20 : ticketType === 'Day Pass' ? 10 : 0
        })

        referralEarnings.value = totalEarnings // Update the reactive variable
      } catch (error) {
        console.error('Error calculating referral earnings:', error)
      }
    }

    const loadOrder = async (id_code) => {
      try {
        if (!id_code) {
          throw new Error('ID code is undefined')
        }

        // Security check: require email verification
        const storedAuth = sessionStorage.getItem(`verified_${id_code}`)
        if (!storedAuth) {
          const email = prompt(
            'For security, please enter the email address associated with this ticket:'
          )
          if (!email) {
            router.push({ name: 'EnterIDCode' })
            return
          }

          // Verify email matches ticket
          const verificationQuery = query(
            collection(reunion_db, 'orders_2025'),
            where('id_code', '==', id_code),
            where('email', '==', email.toLowerCase().trim())
          )
          const verificationSnapshot = await getDocs(verificationQuery)

          if (verificationSnapshot.empty) {
            alert('Email does not match this ticket. Access denied.')
            router.push({ name: 'EnterIDCode' })
            return
          }

          // Store verification for this session
          sessionStorage.setItem(`verified_${id_code}`, 'true')
        }

        // Rest of your existing loadOrder code...
        const q = query(collection(reunion_db, 'orders_2025'), where('id_code', '==', id_code))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          order.value = querySnapshot.docs[0].data()
          await nextTick()
          generateQRCode(order.value.id_code_long, qrCanvas.value)
          await calculateReferralEarnings(order.value.id_code)
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

    const generateQRCode = (text, targetCanvas) => {
      if (targetCanvas) {
        QRCode.toCanvas(targetCanvas, text, { width: 200, height: 200 }, (error) => {
          if (error) {
            console.error('Error generating QR code:', error)
          }
        })
      }
    }

    const downloadSettimes = () => {
      if (!order.value || !order.value.settimes || order.value.settimes.length === 0) {
        alert('Set time information not available')
        return
      }

      // Helper function to format dates for iCalendar (YYYYMMDDTHHmmssZ)
      const formatDate = (date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '')
      }

      // Start building the iCalendar content
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Festivall//Reunion Festival//EN'
      ]

      // Iterate over all settimes and create a VEVENT for each
      order.value.settimes.forEach((settime, index) => {
        const startDate = new Date(settime)
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // Add 1 hour to start time

        const startFormatted = formatDate(startDate)
        const endFormatted = formatDate(endDate)

        icsContent.push(
          'BEGIN:VEVENT',
          `UID:${order.value.id_code_long}-${index}`, // Unique ID for each event
          `DTSTART:${startFormatted}`,
          `DTEND:${endFormatted}`,
          `SUMMARY:Your Set at Reunion Festival ${new Date().getFullYear()}`,
          'LOCATION:Reunion Festival',
          `DESCRIPTION:Your set time at Reunion Festival ${new Date().getFullYear()}`,
          'STATUS:CONFIRMED',
          'SEQUENCE:0',
          'TRANSP:OPAQUE',
          'END:VEVENT'
        )
      })

      // End the iCalendar content
      icsContent.push('END:VCALENDAR')

      // Create blob and trigger download
      const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `reunion_festival_set_times.ics`)
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    watch(showReferralModal, async (isVisible) => {
      if (isVisible && order.value) {
        await nextTick() // Wait for the DOM to update
        generateQRCode(
          `https://festivall.ca/reuniontickets/${order.value.id_code}`,
          referralQrCanvas.value
        )
      }
    })

    onMounted(() => {
      const id_code = route.params.id_code
      referralEarnings.value = 20
      if (id_code) {
        loadOrder(id_code)
      } else {
        router.push({ name: 'EnterIDCode' })
      }
      console.log('Settimes:', order.settimes)
    })

    return {
      frog_image,
      festivall_emblem_white,
      festivall_emblem_black,
      poster_footer,
      order,
      qrCanvas,
      referralQrCanvas,
      generateQRCode,
      referralEarnings,
      calculateReferralEarnings,
      showPaymentModal,
      showCheckInModal,
      showReferralModal,
      downloadSettimes,
      ticket_icon,
      meals_icon,
      payment_icon,
      status_icon,
      bonus_icon,
      volunteer_icon,
      workshop_icon,
      dj_icon,
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
h2,
a {
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
  margin-bottom: 10px;
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
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: baseline;
  /* align-items: center; */
  z-index: 10;
}
.modal-content {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  place-content: start;
  text-align: center;
  color: white;
  border: 1pc solid var(--reunion-frog-green);
  border-radius: 0px;
}

.modal-content button {
  width: 50%;
  border: 1px solid rgba(121, 188, 255, 0.25);
  border-radius: 25px;
  padding: 1rem;
  box-shadow: inset 0 0 20px rgba(121, 188, 255, 0.25);
  position: relative;
  background-color: var(--q-color-primary);
  color: white;
  margin-top: 1rem;
}

.modal-content img {
  margin: 0 0 0.5rem 0;
}

.modal-content .qr-code {
  margin-top: 1rem;
  padding: 0;
}
</style>
