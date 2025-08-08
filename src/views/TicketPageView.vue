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

    <!-- Development Mode Indicator -->
    <div v-if="isDevelopmentMode" class="dev-indicator">
      🎭 Development Mode: Sample activity data loaded for preview
    </div>

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
        <div
          class="quantity clickable-entrance-section"
          @click="showEntranceActivityModal = true"
          title="Click for entrance activity history"
        >
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

        <div
          class="quantity clickable-meal-section"
          @click="showMealRedemptionHistoryModal = true"
          title="Click for meal redemption history"
        >
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
          @click="showGateInfoModal = true"
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
          <strong>Gate Information</strong>
        </p>
        <p
          @click="showMealServiceModal = true"
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
            :src="meals_icon"
            style="height: auto; width: 32px; margin: 0; filter: invert(1)"
            alt="Meal Service Icon"
          />
          <strong>Meal Service Info</strong>
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
            💳
            <strong style="text-decoration: underline; color: orange">Payment Instructions:</strong>
            <br />
            To complete your payment, please send <strong>${{ order.total_price }}</strong> to the
            following email address:
            <br />
            💰 <strong>humanoidtwo@gmail.com</strong>
            <br />
            Make sure to include the following code in the message section:
            <br />
            🔢 <strong>{{ order.id_code }}</strong> <br /><br />
            ℹ️
            <strong style="text-decoration: underline; color: orange"
              >Additional Information:</strong
            >
            <br />
            We only accept cash and bitcoin at the Front Gate
            <br />
            💵 If you are paying with cash, please bring the exact amount.
            <br />
            ₿ If you are paying with bitcoin, please send the payment to the address provided in the
            <strong>Payment Instructions</strong> section above.
          </h3>
          <h3 v-else>Thank you so much for supporting Reunion Festival.<br /></h3>
          <h3>
            📧 If you have any issues with your payment, please contact
            <a href="mailto:reunion@festivall.ca" style="text-decoration: underline; color: orange">
              reunion@festivall.ca</a
            >
          </h3>

          <button @click="showPaymentModal = false">Close</button>
        </div>
      </div>

      <!-- Meal Redemption History Modal -->
      <div
        v-if="showMealRedemptionHistoryModal"
        class="modal"
        @click.self="showMealRedemptionHistoryModal = false"
      >
        <div class="modal-content">
          <img
            :src="festivall_emblem_white"
            style="height: 64px; width: auto"
            alt="Festivall Emblem"
          />
          <img
            :src="meals_icon"
            style="height: 64px; width: auto; margin: 0; filter: invert(1)"
            alt="Meal Icon"
          />
          <h2>Meal Redemption History</h2>
          <h3>
            <strong style="color: orange"
              >Remaining Tickets: {{ order.meal_tickets_remaining }}</strong
            >
          </h3>

          <!-- Show meal redemption history if available -->
          <div
            v-if="order.meal_redemption_history && order.meal_redemption_history.length > 0"
            class="redemption-section"
          >
            <h3>
              🍽️
              <strong style="text-decoration: underline; color: orange"
                >Your Redemption History:</strong
              >
            </h3>
            <div class="history-list">
              <div
                v-for="(redemption, index) in order.meal_redemption_history"
                :key="index"
                class="history-item redemption-item"
              >
                <div class="redemption-time">
                  <strong>{{ redemption.festival_day }}</strong> -
                  {{ new Date(redemption.timestamp).toLocaleString() }}
                </div>
                <div class="redemption-details">
                  <span class="meal-badge">
                    🎫 {{ redemption.tickets_redeemed }} ticket{{
                      redemption.tickets_redeemed > 1 ? 's' : ''
                    }}
                    used
                  </span>
                  <span class="remaining-info"
                    >{{ redemption.remaining_after }} remaining after</span
                  >
                  <span class="operator-info">by {{ redemption.redeemed_by }}</span>
                  <span
                    v-if="redemption.reason && redemption.reason !== 'Normal redemption'"
                    class="reason-info"
                  >
                    ({{ redemption.reason }})
                  </span>
                </div>
              </div>
            </div>
            <br />
          </div>

          <h3 v-else>
            📊 <strong style="color: orange">No redemptions yet!</strong><br />
            Your meal tickets are ready to use during service hours.<br /><br />
          </h3>

          <h3>
            📧
            <strong style="color: orange">Questions about your redemption history?</strong> Contact
            the Meal Team at the food station or
            <strong style="color: orange">Email:</strong>
            <a href="mailto:reunion@festivall.ca" style="text-decoration: underline; color: orange">
              reunion@festivall.ca
            </a>
          </h3>
          <button @click="showMealRedemptionHistoryModal = false">Close</button>
        </div>
      </div>

      <!-- Entrance Activity Modal -->
      <div
        v-if="showEntranceActivityModal"
        class="modal"
        @click.self="showEntranceActivityModal = false"
      >
        <div class="modal-content">
          <img
            :src="festivall_emblem_white"
            style="height: 64px; width: auto"
            alt="Festivall Emblem"
          />
          <img
            :src="status_icon"
            style="height: 64px; width: auto; margin: 0; filter: invert(1)"
            alt="Entrance Icon"
          />
          <h2>Entrance Activity History</h2>

          <!-- Show entrance activity history if available -->
          <div
            v-if="order.entrance_activity_history && order.entrance_activity_history.length > 0"
            class="activity-section"
          >
            <h3>
              🎪
              <strong style="text-decoration: underline; color: orange"
                >Your Gate Activity Timeline:</strong
              >
            </h3>
            <div class="history-list">
              <div
                v-for="(activity, index) in order.entrance_activity_history"
                :key="index"
                class="history-item"
                :class="{
                  'check-in-item': activity.action === 'check_in',
                  'check-out-item': activity.action === 'check_out'
                }"
              >
                <div class="activity-time">
                  <strong>{{ activity.festival_day }}</strong> -
                  {{ new Date(activity.timestamp).toLocaleString() }}
                </div>
                <div class="activity-details">
                  <span class="action-badge" :class="activity.action">
                    {{ activity.action === 'check_in' ? '🎪 Checked In' : '🚪 Checked Out' }}
                  </span>
                  <span class="operator-info"
                    >by {{ activity.operator_name || activity.operator }}</span
                  >
                </div>
              </div>
            </div>
            <br />
          </div>

          <h3 v-else>
            📊 <strong style="color: orange">No gate activity yet!</strong><br />
            Your entrance activities will appear here once you check in at the festival.<br /><br />
          </h3>

          <h3>
            📧 <strong style="color: orange">Questions about your activity history?</strong> Contact
            the Gate Team or
            <strong style="color: orange">Email:</strong>
            <a href="mailto:reunion@festivall.ca" style="text-decoration: underline; color: orange">
              reunion@festivall.ca
            </a>
          </h3>
          <button @click="showEntranceActivityModal = false">Close</button>
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
            💰
            <strong style="text-decoration: underline; color: orange">Referral Instructions:</strong
            ><br />
            You can share your Festivall ID_CODE or your referral link with your friends and
            family.<br />
            🎫 Remember, you earn $20 for each Weekend Pass and $10 for each Day Pass.<br /><br />
          </h3>

          <h3>
            🔗
            <strong style="text-decoration: underline; color: orange">
              This is your referral link: </strong
            ><br />
            Copy and paste this link anywhere!
            <a
              :href="`https://festivall.ca/reuniontickets/${order.id_code}`"
              target="_blank"
              style="color: orange"
              >{{ `https://festivall.ca/reuniontickets/${order.id_code}` }} </a
            ><br /><br />
          </h3>
          <h3>
            📱
            <strong style="text-decoration: underline; color: orange">
              This is your referral QR code:
            </strong>
          </h3>

          <div class="qr-code">
            <canvas ref="referralQrCanvas"></canvas>
          </div>
          <h3>
            👫 Have your friends scan this QR code to get their tickets.<br />
            🔢 Your ID_CODE will be automatically added to their order.<br />
          </h3>
          <h3>
            📞 If you have any questions or concerns, please contact
            <a href="mailto:reunion@festivall.ca" style="text-decoration: underline; color: orange"
              >reunion@festivall.ca</a
            >
          </h3>

          <button @click="showReferralModal = false">Close</button>
        </div>
      </div>

      <!-- Gate Information Modal -->
      <div v-if="showGateInfoModal" class="modal" @click.self="showGateInfoModal = false">
        <div class="modal-content">
          <img
            :src="festivall_emblem_white"
            style="height: 64px; width: auto"
            alt="Festivall Emblem"
          />
          <img
            :src="status_icon"
            style="height: 64px; width: auto; margin: 0"
            alt="Gate Info Icon"
          />
          <h2>Front Gate Information</h2>
          <h3>
            <strong style="color: orange">Current Check-In Status:</strong>
            <span :class="{ 'checked-in': order.checked_in, 'not-checked-in': !order.checked_in }">
              {{ order.checked_in ? 'Checked In' : 'Not Checked In' }}
            </span>
          </h3>

          <h3 v-if="order.checked_in === false">
            📋
            <strong style="text-decoration: underline; color: orange"
              >Check-In Instructions:</strong
            >
            <br />
            Present your QR code at the Front Gate along with a valid form of identification.<br />
            🎫 Your {{ order.ticket_quantity }} tickets will be scanned at the gate.<br />

            💲 Last-minute door sales will be subject to an additional $10 fee per ticket.<br /><br />
            ℹ️
            <strong style="text-decoration: underline; color: orange"
              >Additional Information:</strong
            >
            <br />
            🕐 The Front Gate will close at 2:00 AM each night.<br />
            Please try to arrive before then.<br />
            🚫 With respected to substances, we have a<br />
            <strong> No Open Use Policy.<br /> </strong>
            👶 Please keep all adult materials out of sight and reach of minors.<br /><br />
          </h3>
          <h3 v-else>
            🚪
            <strong style="text-decoration: underline; color: orange">
              Check-Out Instructions:</strong
            >
            <br />
            Please present your QR code at the Front Gate on your way out.<br />
            📊 This will help us keep track of how many people are still on the grounds.<br /><br />
            ℹ️
            <strong style="text-decoration: underline; color: orange"
              >Additional Information:</strong
            >
            <br />
            🕐 The Front Gate will close at 2 AM on each night.<br />
            Please try to check out before then.<br />
            🎒 If you are leaving the grounds, please make sure to take all of your belongings with
            you.<br />
            ⚠️ We are not responsible for any lost or stolen items.<br />
            <br />
          </h3>

          <h3
            v-if="order.applicant_types && order.applicant_types.includes('Artist' || 'Workshop')"
          >
            🎨
            <strong style="text-decoration: underline; color: orange">
              Artists and Workshops:</strong
            ><br />
            After checking in, please proceed to the Artist Loading Zone to drop off your gear and
            introduce yourself to the Stage Crew.<br />
            🚗 Once you're oriented, please take your vehicle to your campsite allowing others to
            load in.<br /><br />
          </h3>

          <h3>
            📧 If you have any questions or concerns, please contact
            <a href="mailto:reunion@festivall.ca" style="text-decoration: underline; color: orange">
              reunion@festivall.ca
            </a>
          </h3>
          <button @click="showGateInfoModal = false">Close</button>
        </div>
      </div>

      <!-- Meal Service Information Modal -->
      <div v-if="showMealServiceModal" class="modal" @click.self="showMealServiceModal = false">
        <div class="modal-content">
          <img
            :src="festivall_emblem_white"
            style="height: 64px; width: auto"
            alt="Festivall Emblem"
          />
          <img
            :src="meals_icon"
            style="height: 64px; width: auto; margin: 0; filter: invert(1)"
            alt="Meal Service Icon"
          />
          <h2>Meal Service Information</h2>

          <h3>
            📅
            <strong style="text-decoration: underline; color: orange">Meal Service Schedule:</strong
            ><br />
            Friday, Saturday & Sunday<br />
            Lunch: 12:00 PM - 2:00 PM<br />
            Supper: 6:00 PM - 8:00 PM<br /><br />
          </h3>

          <h3>
            ✅ <strong style="text-decoration: underline; color: orange">How to Redeem:</strong
            ><br />
            Present your QR code at the meal station during service hours. <br /><br />
            One ticket will be automatically deducted per meal.<br /><br />
          </h3>

          <h3>
            ⚖️ <strong style="text-decoration: underline; color: orange">Important Policy:</strong
            ><br />
            Unused meal tickets are automatically decremented at the end of each meal service to
            ensure fairness for all attendees.<br /><br />
            This prevents ticket hoarding and ensures equal access to meals throughout the
            festival.<br /><br />
          </h3>

          <h3>
            ℹ️
            <strong style="text-decoration: underline; color: orange"
              >Additional Information:</strong
            ><br />
            💰 No meal tickets remaining? Meals are $15 cash each<br />
            🌱 We accommodate dietary restrictions when possible<br />
            ⏰ Service may end early if food runs out<br />
          </h3>

          <h3>
            📧 <strong style="color: orange">Questions?</strong> Contact the Meal Team at the food
            station or
            <strong style="color: orange">Email:</strong>
            <a href="mailto:reunion@festivall.ca" style="text-decoration: underline; color: orange">
              reunion@festivall.ca
            </a>
          </h3>
          <button @click="showMealServiceModal = false">Close</button>
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
            Signup for your Volunteer Shifts
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
        <RouterLink v-if="new Date() >= new Date(2025, 7, 1)" to="/reunionlineup">
          <p>
            <img :src="lineup_icon" style="height: auto; width: 32px" alt="Lineup Icon" />
            2025 Lineup<br />Look & Listen!<br />
          </p>
        </RouterLink>
        <RouterLink v-else to="#">
          <p>
            <img :src="lineup_icon" style="height: auto; width: 32px" alt="Coming Soon Icon" />
            Final Lineup<br />coming soon!
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
            Scavenger Hunt<br />Coming Soon!
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
    const showGateInfoModal = ref(false)
    const showMealServiceModal = ref(false)
    const showReferralModal = ref(false)
    const showMealRedemptionHistoryModal = ref(false)
    const showEntranceActivityModal = ref(false)

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

          // Add sample data for development/preview (only if no real data exists)
          addSampleDataForPreview(order.value)

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

    const addSampleDataForPreview = (orderData) => {
      // Only add sample data if no real activity data exists and we're in development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Add sample entrance activity if none exists
        if (
          !orderData.entrance_activity_history ||
          orderData.entrance_activity_history.length === 0
        ) {
          orderData.entrance_activity_history = [
            {
              timestamp: '2025-08-29T14:30:00.000Z',
              action: 'check_in',
              ticket_quantity_after: 0,
              operator: 'JS123',
              operator_name: 'Jane Smith',
              festival_day: 'Friday'
            },
            {
              timestamp: '2025-08-30T02:15:00.000Z',
              action: 'check_out',
              ticket_quantity_after: 1,
              operator: 'MB456',
              operator_name: 'Mike Brown',
              festival_day: 'Saturday'
            },
            {
              timestamp: '2025-08-30T12:45:00.000Z',
              action: 'check_in',
              ticket_quantity_after: 0,
              operator: 'SL789',
              operator_name: 'Sarah Lee',
              festival_day: 'Saturday'
            }
          ]
          orderData.last_entrance_activity = '2025-08-30T12:45:00.000Z'
        }

        // Add sample meal redemption history if none exists
        if (!orderData.meal_redemption_history || orderData.meal_redemption_history.length === 0) {
          orderData.meal_redemption_history = [
            {
              timestamp: '2025-08-29T13:15:00.000Z',
              tickets_redeemed: 1,
              remaining_after: 5,
              redeemed_by: 'KT234',
              festival_day: 'Friday',
              reason: 'Normal redemption'
            },
            {
              timestamp: '2025-08-29T19:30:00.000Z',
              tickets_redeemed: 1,
              remaining_after: 4,
              redeemed_by: 'RM567',
              festival_day: 'Friday',
              reason: 'Normal redemption'
            },
            {
              timestamp: '2025-08-30T13:00:00.000Z',
              tickets_redeemed: 1,
              remaining_after: 3,
              redeemed_by: 'DP890',
              festival_day: 'Saturday',
              reason: 'Normal redemption'
            },
            {
              timestamp: '2025-08-30T20:00:00.000Z',
              tickets_redeemed: 2,
              remaining_after: 1,
              redeemed_by: 'ADMIN',
              festival_day: 'Saturday',
              reason: 'End of meal service - automatic deduction'
            }
          ]
          orderData.last_meal_redemption = '2025-08-30T20:00:00.000Z'
        }

        console.log('🎭 Sample activity data added for development preview!')
      }
    }

    const downloadSettimes = () => {
      if (!order.value || !order.value.settimes || order.value.settimes.length === 0) {
        alert('Set time information not available')
        return
      }

      // Helper function to format dates for iCalendar (YYYYMMDDTHHMMSS)
      const formatDate = (date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${year}${month}${day}T${hours}${minutes}${seconds}`
      }

      // Get current timestamp for DTSTAMP
      const now = new Date()
      const timestamp = formatDate(now)

      // Start building the iCalendar content
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Festivall//Reunion Festival//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
      ]

      // Iterate over all settimes and create a VEVENT for each
      order.value.settimes.forEach((settime, index) => {
        const startDate = new Date(settime)
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // Add 1 hour to start time

        const startFormatted = formatDate(startDate)
        const endFormatted = formatDate(endDate)

        // Create a unique UID
        const uid = `${order.value.id_code_long}-${index}-${timestamp}@festivall.ca`

        icsContent.push(
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `DTSTAMP:${timestamp}`,
          `CREATED:${timestamp}`,
          `DTSTART:${startFormatted}`,
          `DTEND:${endFormatted}`,
          `SUMMARY:Your Set at Reunion Festival ${new Date().getFullYear()}`,
          'LOCATION:Reunion Festival',
          `DESCRIPTION:Your performance slot at Reunion Festival ${new Date().getFullYear()}. Please arrive at the stage a few minutes early to ensure smooth changeovers. Your main point of contact is Arthur, the Lead Sound Tech. If Arthur is unavailable, other stage crew members include Brandon, Cory, and Prasenjit.`,
          'STATUS:CONFIRMED',
          'SEQUENCE:0',
          'TRANSP:OPAQUE',
          'CLASS:PUBLIC',
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

    // Development mode detection
    const isDevelopmentMode = ref(
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    )

    onMounted(() => {
      const id_code = route.params.id_code
      referralEarnings.value = 20
      if (id_code) {
        loadOrder(id_code)
      } else {
        router.push({ name: 'EnterIDCode' })
      }
      console.log('Settimes:', order.value?.settimes)
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
      showGateInfoModal,
      showMealServiceModal,
      showReferralModal,
      showMealRedemptionHistoryModal,
      showEntranceActivityModal,
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
      quiz_icon,
      isDevelopmentMode
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

.clickable-meal-section {
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.clickable-meal-section:hover {
  border-color: var(--reunion-frog-green);
  border-width: 2px;
}

.clickable-entrance-section {
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.clickable-entrance-section:hover {
  border-color: var(--reunion-frog-green);
  border-width: 2px;
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
  color: orange;
  font-weight: bold;
}

/* Activity and Redemption History Styles */
.activity-section,
.redemption-section {
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 165, 0, 0.3);
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
  margin: 0.5rem 0;
}

.history-item {
  background: rgba(255, 255, 255, 0.05);
  margin: 0.5rem 0;
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 4px solid transparent;
}

.history-item.check-in-item {
  border-left-color: #4caf50;
}

.history-item.check-out-item {
  border-left-color: #ff9800;
}

.history-item.redemption-item {
  border-left-color: var(--reunion-frog-green);
}

.activity-time,
.redemption-time {
  font-size: 0.9rem;
  color: #ccc;
  margin-bottom: 0.25rem;
}

.activity-details,
.redemption-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.action-badge,
.meal-badge {
  font-weight: bold;
  font-size: 0.9rem;
}

.action-badge.check_in {
  color: #4caf50;
}

.action-badge.check_out {
  color: #ff9800;
}

.meal-badge {
  color: var(--reunion-frog-green);
}

.operator-info {
  font-size: 0.8rem;
  color: #aaa;
  font-style: italic;
}

.remaining-info {
  font-size: 0.8rem;
  color: #ddd;
}

.reason-info {
  font-size: 0.8rem;
  color: #ffeb3b;
  font-style: italic;
}

/* Development Mode Indicator */
.dev-indicator {
  background: linear-gradient(45deg, #ff6b35, #f7931e);
  color: white;
  padding: 0.5rem 1rem;
  margin: 0.5rem 0;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
  text-align: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 10px rgba(247, 147, 30, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 2px 10px rgba(247, 147, 30, 0.3);
  }
  50% {
    box-shadow: 0 2px 20px rgba(247, 147, 30, 0.6);
  }
  100% {
    box-shadow: 0 2px 10px rgba(247, 147, 30, 0.3);
  }
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
  font-size: 12px;
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
