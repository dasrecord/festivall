<template>
  <div class="applicant-detail">
    <!-- Loading state -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      Loading applicant details...
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-banner">
      {{ error }}
      <RouterLink to="/dashboard" class="back-link">← Back to Dashboard</RouterLink>
    </div>

    <!-- Applicant details -->
    <div v-if="applicant && !loading" class="applicant-container">
      <div class="header">
        <RouterLink to="/dashboard" class="back-link">← Back to Dashboard</RouterLink>
        <h1>{{ applicant.act_name || applicant.fullname || 'Applicant Details' }}</h1>
      </div>

      <div class="content-grid">
        <!-- Basic Information -->
        <div class="section basic-info">
          <h2>Basic Information</h2>
          <div class="info-grid">
            <div class="info-item" v-if="applicant.fullname">
              <label>Full Name:</label>
              <span>{{ applicant.fullname }}</span>
            </div>
            <div class="info-item" v-if="applicant.email">
              <label>Email:</label>
              <span>{{ applicant.email }}</span>
            </div>
            <div class="info-item" v-if="applicant.phone">
              <label>Phone:</label>
              <span>{{ applicant.phone }}</span>
            </div>
            <div class="info-item" v-if="applicant.id_code">
              <label>ID Code:</label>
              <span class="id-code">#{{ applicant.id_code }}</span>
            </div>
            <div class="info-item" v-if="applicant.status">
              <label>Status:</label>
              <span :class="['status-badge', applicant.status === 'declined' ? 'declined' : '']">{{ applicant.status }}</span>
            </div>
            <div
              class="info-item"
              v-if="applicant.applicant_types && applicant.applicant_types.length"
            >
              <label>Applicant Types:</label>
              <span>{{ applicant.applicant_types.join(', ') }}</span>
            </div>
            <div class="info-item" v-if="applicant.createdAt">
              <label>Application Date:</label>
              <span>{{ new Date(applicant.createdAt).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>

        <!-- Artist Information -->
        <div
          v-if="applicant.applicant_types && applicant.applicant_types.includes('Artist')"
          class="section artist-info"
        >
          <h2>Artist Information</h2>
          <div class="info-grid">
            <div class="info-item" v-if="applicant.act_name">
              <label>Act Name:</label>
              <span>{{ applicant.act_name }}</span>
            </div>
            <div class="info-item" v-if="applicant.act_type">
              <label>Act Type:</label>
              <span>{{ applicant.act_type }}</span>
            </div>
            <div class="info-item" v-if="applicant.genre">
              <label>Genre:</label>
              <span>{{ applicant.genre }}</span>
            </div>
            <div class="info-item full-width" v-if="applicant.act_description">
              <label>Description:</label>
              <p>{{ applicant.act_description }}</p>
            </div>
            <div class="info-item" v-if="applicant.act_website">
              <label>Website:</label>
              <a :href="applicant.act_website" target="_blank">{{ applicant.act_website }}</a>
            </div>
            <div class="info-item" v-if="applicant.social_url">
              <label>Social Media:</label>
              <a :href="applicant.social_url" target="_blank">{{ applicant.social_url }}</a>
            </div>
            <div class="info-item" v-if="applicant.press_kit_url">
              <label>Press Kit:</label>
              <a :href="applicant.press_kit_url" target="_blank">View Press Kit</a>
            </div>
            <div class="info-item" v-if="applicant.mix_track_url">
              <label>Mix/Track:</label>
              <a :href="applicant.mix_track_url" target="_blank">Listen</a>
            </div>
            <div class="info-item" v-if="applicant.logo_url">
              <label>Logo:</label>
              <a :href="applicant.logo_url" target="_blank">View Logo</a>
            </div>
          </div>
        </div>

        <!-- Volunteer Information -->
        <div
          v-if="applicant.applicant_types && applicant.applicant_types.includes('Volunteer')"
          class="section volunteer-info"
        >
          <h2>Volunteer Information</h2>
          <div class="info-grid">
            <div class="info-item" v-if="applicant.volunteer_type">
              <label>Volunteer Type:</label>
              <span>{{ applicant.volunteer_type }}</span>
            </div>
            <div
              class="info-item full-width"
              v-if="applicant.volunteer_availability && applicant.volunteer_availability.length"
            >
              <label>Availability:</label>
              <span>{{ applicant.volunteer_availability.join(', ') }}</span>
            </div>
          </div>
        </div>

        <!-- Workshop Information -->
        <div
          v-if="applicant.applicant_types && applicant.applicant_types.includes('Workshop')"
          class="section workshop-info"
        >
          <h2>Workshop Information</h2>
          <div class="info-grid">
            <div class="info-item" v-if="applicant.workshop_title">
              <label>Workshop Title:</label>
              <span>{{ applicant.workshop_title }}</span>
            </div>
            <div class="info-item full-width" v-if="applicant.workshop_description">
              <label>Workshop Description:</label>
              <p>{{ applicant.workshop_description }}</p>
            </div>
            <div class="info-item full-width" v-if="applicant.workshop_requirements">
              <label>Requirements:</label>
              <p>{{ applicant.workshop_requirements }}</p>
            </div>
          </div>
        </div>

        <!-- Vendor Information -->
        <div
          v-if="applicant.applicant_types && applicant.applicant_types.includes('Vendor')"
          class="section vendor-info"
        >
          <h2>Vendor Information</h2>
          <div class="info-grid">
            <div class="info-item" v-if="applicant.vendor_type">
              <label>Vendor Type:</label>
              <span>{{ applicant.vendor_type }}</span>
            </div>
            <div class="info-item full-width" v-if="applicant.vendor_description">
              <label>Description:</label>
              <p>{{ applicant.vendor_description }}</p>
            </div>
            <div class="info-item full-width" v-if="applicant.vendor_requirements">
              <label>Requirements:</label>
              <p>{{ applicant.vendor_requirements }}</p>
            </div>
            <div class="info-item" v-if="applicant.vendor_url">
              <label>Website:</label>
              <a :href="applicant.vendor_url" target="_blank">{{ applicant.vendor_url }}</a>
            </div>
          </div>
        </div>

        <!-- Art Installation Information -->
        <div
          v-if="applicant.applicant_types && applicant.applicant_types.includes('Art Installation')"
          class="section installation-info"
        >
          <h2>Art Installation Information</h2>
          <div class="info-grid">
            <div class="info-item" v-if="applicant.installation_title">
              <label>Installation Title:</label>
              <span>{{ applicant.installation_title }}</span>
            </div>
            <div class="info-item full-width" v-if="applicant.installation_description">
              <label>Description:</label>
              <p>{{ applicant.installation_description }}</p>
            </div>
            <div class="info-item full-width" v-if="applicant.space_requirements">
              <label>Space Requirements:</label>
              <p>{{ applicant.space_requirements }}</p>
            </div>
            <div class="info-item full-width" v-if="applicant.other_requirements">
              <label>Other Requirements:</label>
              <p>{{ applicant.other_requirements }}</p>
            </div>
            <div class="info-item" v-if="applicant.portfolio_url">
              <label>Portfolio:</label>
              <a :href="applicant.portfolio_url" target="_blank">View Portfolio</a>
            </div>
            <div class="info-item" v-if="applicant.fixture_type">
              <label>Fixture Type:</label>
              <span>{{ applicant.fixture_type }}</span>
            </div>
          </div>
        </div>

        <!-- Payment & Ticket Information -->
        <div v-if="applicant.payment_type" class="section payment-info">
          <h2>Payment & Ticket Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Payment Type:</label>
              <span>{{ applicant.payment_type }}</span>
            </div>
            <div class="info-item" v-if="applicant.total_price">
              <label>Total Price:</label>
              <span>
                <span
                  v-if="
                    applicant.payment_type === 'inkind' || applicant.payment_type === 'etransfer'
                  "
                  >$</span
                >
                {{ applicant.total_price }}
                <span v-if="applicant.payment_type === 'bitcoin'">BTC</span>
              </span>
            </div>
            <div class="info-item">
              <label>Payment Status:</label>
              <div class="info-action-row">
                <span :class="{ 'status-paid': applicant.paid, 'status-unpaid': !applicant.paid }">
                  {{ applicant.paid ? 'Paid' : 'Unpaid' }}
                </span>
                <template v-if="applicant.payment_type !== 'inkind'">
                  <button v-if="!applicant.paid" @click="confirmPaymentReceived" class="success-btn">
                    Confirm Paid
                  </button>
                  <template v-else>
                    <button @click="revokeTicket" class="danger-btn">Revoke</button>
                    <button @click="remindPayment" class="remind-btn">Remind</button>
                  </template>
                </template>
              </div>
            </div>
            <div class="info-item">
              <label>Check-in Status:</label>
              <div class="info-action-row">
                <span
                  :class="{
                    'status-checked-in': applicant.checked_in,
                    'status-not-checked-in': !applicant.checked_in
                  }"
                >
                  {{ applicant.checked_in ? 'Checked In' : 'Not Checked In' }}
                </span>
                <span class="ticket-scan-count">
                  {{ originalTicketQuantity - ticketQuantity }} / {{ originalTicketQuantity }} in
                </span>
                <button
                  @click="checkInTicket"
                  :disabled="ticketQuantity <= 0"
                  class="success-btn"
                >
                  Check In
                </button>
                <button
                  @click="checkOutTicket"
                  :disabled="ticketQuantity >= originalTicketQuantity"
                  class="danger-btn"
                >
                  Check Out
                </button>
              </div>
            </div>
            <div class="info-item" v-if="applicant.ticket_type">
              <label>Ticket Type:</label>
              <span>{{ applicant.ticket_type }}</span>
            </div>
            <div class="info-item" v-if="applicant.ticket_quantity">
              <label>Ticket Quantity:</label>
              <span>{{ applicant.ticket_quantity }}</span>
            </div>
            <div class="info-item" v-if="applicant.meal_tickets_remaining !== undefined">
              <label>Meal Tickets:</label>
              <div class="meal-tickets-control">
                <button
                  @click="decrementMealTickets"
                  :disabled="mealTickets <= 0"
                  class="meal-btn decrement-btn"
                >
                  -
                </button>
                <span class="meal-count">{{ mealTickets }}</span>
                <button @click="incrementMealTickets" class="meal-btn increment-btn">+</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        <div
          v-if="applicant.bio || applicant.statement || applicant.comments"
          class="section additional-info"
        >
          <h2>Additional Information</h2>
          <div class="info-grid">
            <div class="info-item full-width" v-if="applicant.bio">
              <label>Bio:</label>
              <p>{{ applicant.bio }}</p>
            </div>
            <div class="info-item full-width" v-if="applicant.statement">
              <label>Statement:</label>
              <p>{{ applicant.statement }}</p>
            </div>
            <div class="info-item full-width" v-if="applicant.comments">
              <label>Comments:</label>
              <p>{{ applicant.comments }}</p>
            </div>
          </div>
        </div>

        <!-- Administrative Information -->
        <div class="section admin-info">
          <h2>Administrative Information</h2>
          <div class="info-grid">
            <div class="info-item" v-if="applicant.id">
              <label>Document ID:</label>
              <span class="id-code">{{ applicant.id }}</span>
            </div>
            <div class="info-item" v-if="applicant.id_code_long">
              <label>Long ID Code:</label>
              <span class="id-code">{{ applicant.id_code_long }}</span>
            </div>
            <div class="info-item" v-if="applicant.updatedAt">
              <label>Last Updated:</label>
              <span>{{ new Date(applicant.updatedAt).toLocaleString() }}</span>
            </div>
            <div class="info-item" v-if="applicant.referral_id_code">
              <label>Referral Code:</label>
              <span>{{ applicant.referral_id_code }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="actions">
        <div class="actions-grid">

          <!-- Document Delivery card -->
          <div class="action-card">
            <h2>Document Delivery</h2>
            <div class="action-card-btns">
              <button v-if="applicant.id_code" @click="previewTicket" class="preview-btn">
                Preview Ticket
              </button>
              <button v-if="applicant.id_code" @click="generateContract" class="preview-btn">
                Preview Contract
              </button>
              <a
                v-if="applicant.email && applicant.id_code && applicant.paid"
                :href="deliverTicket(applicant.email, applicant.fullname, applicant.id_code)"
                target="_blank"
              >
                <button class="deliver-btn">📧 Deliver Ticket</button>
              </a>
              <a
                v-if="
                  applicant.email &&
                  applicant.id_code &&
                  applicant.payment_type === 'inkind' &&
                  !applicant.contract_signed &&
                  applicant.applicant_types
                "
                :href="
                  deliverContract(
                    applicant.email,
                    applicant.fullname,
                    applicant.applicant_types.join(', and '),
                    applicant.id_code
                  )
                "
                target="_blank"
              >
                <button class="deliver-btn">📋 Deliver Contract</button>
              </a>
              <div v-if="applicant.mix_track_url" class="mix-track-section">
                <a :href="applicant.mix_track_url" target="_blank" class="mix-track-link">
                  🎵 Mix/Track
                </a>
              </div>
            </div>

            <!-- Decline / Restore -->
            <div
              v-if="applicant.applicant_types && applicant.applicant_types.length"
              class="decline-section"
            >
              <div v-if="applicant.status === 'declined'" class="declined-badge-row">
                <span class="declined-badge">✗ Declined</span>
                <button @click="undeclineApplicant" class="restore-btn">↩ Restore</button>
              </div>
              <button
                v-else-if="!declinePending"
                @click="declinePending = true"
                class="decline-trigger-btn"
              >
                ✗ Decline Applicant
              </button>
              <div v-else class="decline-confirm-panel">
                <p class="decline-confirm-warning">⚠ Declining will update their status and automatically send them a notification email.</p>
                <label class="decline-reason-label">Reason to include in email (optional):</label>
                <select v-model="declineReason" class="decline-reason-select">
                  <option v-for="option in declineReasons" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
                <p v-if="declineReason" class="decline-reason-preview">{{ declineReason }}</p>
                <div class="decline-confirm-actions">
                  <button @click="declinePending = false" class="cancel-decline-btn">Cancel</button>
                  <button @click="declineApplicant" class="decline-btn">Confirm Decline</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Contract & Comms card -->
          <div
            v-if="applicant.applicant_types && applicant.applicant_types.length"
            class="action-card"
          >
            <h2>Contract &amp; Communications</h2>
            <div class="action-card-btns">
              <p :class="applicant.contract_signed ? 'status-signed' : 'status-not-signed'">
                {{ applicant.contract_signed ? '✅ Signed' : '❌ Not Signed' }}
              </p>
              <template v-if="!applicant.contract_signed">
                <button @click="remindContract" class="remind-btn">
                  Remind Contract
                </button>
              </template>
            </div>
          </div>

          <!-- SMS & Email card -->
          <div
            v-if="(applicant.phone || applicant.email) && applicant.applicant_types && applicant.applicant_types.length"
            class="action-card"
          >
            <h2>SMS &amp; Email</h2>
            <div v-if="applicant.phone" class="sms-section">
              <input
                type="text"
                v-model="smsMessage"
                placeholder="SMS message..."
                class="sms-input"
              />
              <button @click="sendSMSMessage" class="sms-btn">Send SMS</button>
            </div>
            <div v-if="applicant.email" class="custom-email-section">
              <input
                type="text"
                v-model="emailSubject"
                placeholder="Email subject..."
                class="sms-input"
              />
              <textarea
                v-model="emailBody"
                placeholder="Email message..."
                class="sms-input email-body-input"
              ></textarea>
              <button @click="sendCustomEmail" class="remind-btn">Send Email</button>
            </div>
          </div>

          <!-- Compensation card -->
          <div
            v-if="applicant.applicant_types && applicant.applicant_types.length"
            class="action-card"
          >
            <h2>Compensation</h2>
            <div class="compensation-section">
              <p v-if="applicant.rates" class="current-compensation">
                Current Fee: {{ applicant.rates }}
              </p>
              <input
                type="text"
                v-model="newCompensation"
                placeholder="Update compensation..."
                class="compensation-input"
              />
              <button @click="updateCompensation" class="compensation-btn">
                Update Compensation
              </button>
              <button v-if="applicant.rates" @click="clearCompensation" class="clear-btn">
                Clear Compensation
              </button>
            </div>
          </div>

          <!-- Set Times card -->
          <div
            v-if="
              applicant.applicant_types &&
              (applicant.applicant_types.includes('Artist') ||
                applicant.applicant_types.includes('Workshop'))
            "
            class="action-card"
          >
            <h2>Manage Set Times</h2>
            <div v-if="applicant.settimes && applicant.settimes.length" class="existing-settimes">
              <div v-for="(settime, index) in applicant.settimes" :key="index" class="settime-item">
                <span>{{ new Date(settime).toLocaleString() }}</span>
                <button @click="removeSettime(index)" class="remove-btn">Remove</button>
              </div>
            </div>
            <div class="add-settime">
              <input type="datetime-local" v-model="newSettime" class="settime-input" />
              <button @click="addSettime" class="add-btn">Add Set Time</button>
            </div>
          </div>

          <!-- Meal Tickets card -->
          <div
            v-if="applicant.applicant_types && applicant.applicant_types.length"
            class="action-card"
          >
            <h2>Meal Tickets</h2>
            <div class="meal-tickets-control">
              <button
                @click="decrementMealTickets"
                :disabled="mealTickets <= 0"
                class="meal-btn decrement-btn"
              >
                -
              </button>
              <span class="meal-count">{{ mealTickets }}</span>
              <button @click="incrementMealTickets" class="meal-btn increment-btn">+</button>
            </div>
            <p class="meal-info">Current meal tickets: {{ mealTickets }}</p>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { reunion_db } from '@/firebase'

export default {
  name: 'ApplicantDetailView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const applicant = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const smsMessage = ref('')
    const emailSubject = ref('')
    const emailBody = ref('')
    const newCompensation = ref('')
    const newSettime = ref('')
    const contractEmailBody = ref('')
    const ticketEmailBody = ref('')
    const declineEmailBody = ref('')
    const mealTickets = ref(0)
    const ticketQuantity = ref(0)
    const originalTicketQuantity = ref(0)
    const declineReason = ref('')
    const declinePending = ref(false)

    const declineReasons = [
      { value: '', label: '— No specific reason (optional) —' },
      {
        value: 'Our festival is still growing and we are not yet in a position to meet your performance fee — we hope to make it work in a future edition as we continue to expand.',
        label: 'Budget — festival still growing'
      },
      {
        value: 'Our performance schedule for this year is already fully booked, but we were genuinely impressed by your application and would love to revisit this for a future Reunion.',
        label: 'Schedule full — interested next year'
      },
      {
        value: 'We already have a number of acts with a similar sound or style this year and want to keep the lineup diverse — we would strongly encourage you to apply again next year.',
        label: 'Lineup already filled with similar acts'
      },
      {
        value: 'For local artists, we love to see applicants get more involved in the community throughout the year before we bring them onto our stage. Come out to our events, connect with the scene, and we hope to see your application again.',
        label: 'Local artist — needs more community involvement'
      },
      {
        value: 'We received an exceptional number of applications in your category this year and competition was fierce. A stronger press kit, mix/track, or social presence will help us give your application the full consideration it deserves next year.',
        label: 'High competition — strengthen your application'
      }
    ]

    const loadApplicant = async () => {
      try {
        const applicantId = route.params.id

        // Load from consolidated participants_2026 collection
        const docRef = doc(reunion_db, 'participants_2026', applicantId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const docData = docSnap.data()

          // Normalize data from consolidated structure
          applicant.value = {
            id: docSnap.id,
            id_code: docData.id_code,
            id_code_long: docData.id_code_long,
            fullname: docData.contact?.fullname || '',
            email: docData.contact?.email || '',
            phone: docData.contact?.phone || '',
            status: docData.status || '',
            // Extract from roles (try nested first, then top-level as fallback)
            applicant_types: docData.roles?.applicant_types?.length
              ? docData.roles.applicant_types
              : docData.applicant_types || [],
            act_name: docData.roles?.act_name || docData.act_name || '',
            act_type: docData.roles?.act_type || docData.act_type || '',
            volunteer_type: docData.roles?.volunteer_type || docData.volunteer_type || '',
            // Extract from application.data
            genre: docData.application?.data?.genre || '',
            act_description: docData.application?.data?.act_description || '',
            mix_track_url: docData.application?.data?.mix_track_url || '',
            act_website: docData.application?.data?.act_website || '',
            social_url: docData.application?.data?.social_url || '',
            press_kit_url: docData.application?.data?.press_kit_url || '',
            logo_url: docData.application?.data?.logo_url || '',
            volunteer_availability: docData.application?.data?.volunteer_availability || [],
            workshop_title: docData.application?.data?.workshop_title || '',
            workshop_description: docData.application?.data?.workshop_description || '',
            workshop_requirements: docData.application?.data?.workshop_requirements || '',
            vendor_type: docData.application?.data?.vendor_type || '',
            vendor_description: docData.application?.data?.vendor_description || '',
            vendor_requirements: docData.application?.data?.vendor_requirements || '',
            vendor_url: docData.application?.data?.vendor_url || '',
            installation_title: docData.application?.data?.installation_title || '',
            installation_description: docData.application?.data?.installation_description || '',
            space_requirements: docData.application?.data?.space_requirements || '',
            other_requirements: docData.application?.data?.other_requirements || '',
            portfolio_url: docData.application?.data?.portfolio_url || '',
            fixture_type: docData.application?.data?.fixture_type || '',
            rates: docData.application?.data?.rates || '',
            statement: docData.application?.data?.statement || '',
            bio: docData.bio || '',
            comments: docData.comments || '',
            settimes: docData.settimes || [],
            // Contract and order data (if exists)
            contract_signed: docData.contract?.signed || false,
            ticket_type: docData.order?.ticket_type || '',
            ticket_quantity: docData.order?.ticket_quantity || 0,
            original_ticket_quantity: docData.order?.original_ticket_quantity || 0,
            meal_tickets_remaining: docData.order?.meal_tickets_remaining || 0,
            meal_packages: docData.order?.meal_packages || 0,
            total_price: docData.order?.fiat_total_price_cad || 0,
            payment_type: docData.order?.payment_type || '',
            paid: docData.order?.paid || false,
            checked_in: docData.order?.checked_in || false,
            referral_id_code: docData.referral?.referral_id_code || '',
            createdAt: docData.createdAt || '',
            updatedAt: docData.updatedAt || ''
          }

          // Infer applicant types from the data if applicant_types is empty
          if (!applicant.value.applicant_types.length) {
            const inferredTypes = []
            if (applicant.value.act_type || applicant.value.act_name) inferredTypes.push('Artist')
            if (applicant.value.volunteer_type) inferredTypes.push('Volunteer')
            if (applicant.value.workshop_title) inferredTypes.push('Workshop')
            if (applicant.value.vendor_type) inferredTypes.push('Vendor')
            if (applicant.value.installation_title) inferredTypes.push('Art Installation')
            applicant.value.applicant_types = inferredTypes
          }

          mealTickets.value = applicant.value.meal_tickets_remaining || 0
          ticketQuantity.value = applicant.value.ticket_quantity || 0
          originalTicketQuantity.value = applicant.value.original_ticket_quantity || ticketQuantity.value
        } else {
          error.value = 'Applicant not found'
        }
      } catch (err) {
        error.value = `Failed to load applicant: ${err.message}`
        console.error('Load error:', err)
      } finally {
        loading.value = false
      }
    }

    const previewTicket = () => {
      router.push({ path: `/reunionticket/${applicant.value.id_code}` })
    }

    const generateContract = () => {
      router.push({ path: `/reunioncontract/${applicant.value.id_code}` })
    }

    const emailLink = computed(() => {
      if (!applicant.value?.email) return '#'
      const subject = encodeURIComponent('Reunion 2026')
      const body = encodeURIComponent(`Hello ${applicant.value.fullname || 'there'},\n\n`)
      return `mailto:${applicant.value.email}?subject=${subject}&body=${body}`
    })

    // Payment Actions
    const confirmPaymentReceived = async () => {
      try {
        const docRef = doc(reunion_db, 'participants_2026', applicant.value.id)
        await updateDoc(docRef, { 'order.paid': true })
        applicant.value.paid = true
        console.log('Payment confirmed for:', applicant.value.fullname)
      } catch (error) {
        console.error('Error confirming payment:', error)
      }
    }

    const revokeTicket = async () => {
      if (confirm('Are you sure you want to revoke this ticket?')) {
        try {
          const docRef = doc(reunion_db, 'participants_2026', applicant.value.id)
          await updateDoc(docRef, { 'order.paid': false })
          applicant.value.paid = false
          console.log('Ticket revoked for:', applicant.value.fullname)
        } catch (error) {
          console.error('Error revoking ticket:', error)
        }
      }
    }

    // Enhanced reminder functions with notifications
    const remindPayment = async () => {
      if (!applicant.value.phone) {
        alert('Phone number not available for this applicant.')
        return
      }

      try {
        const { sendSMS } = await import('/scripts/notifications.js')
        const message = `Hello ${applicant.value.fullname || 'there'}. This is a gentle reminder to make your payment for Reunion 2026, if you haven't already.`
        await sendSMS(applicant.value.phone, message)
        alert('Payment reminder sent successfully.')
      } catch (error) {
        console.error('Error sending payment reminder:', error)
        alert('Failed to send payment reminder')
      }
    }

    const remindContract = async () => {
      if (!applicant.value.phone) {
        alert('Phone number not available for this applicant.')
        return
      }

      try {
        const { sendSMS } = await import('/scripts/notifications.js')
        const message = `Hello ${applicant.value.fullname || 'there'}. This is a gentle reminder to sign your contract for Reunion 2026, if you haven't already.`
        await sendSMS(applicant.value.phone, message)
        alert('Contract reminder sent successfully.')
      } catch (error) {
        console.error('Error sending contract reminder:', error)
        alert('Failed to send contract reminder')
      }
    }

    // Meal Tickets Functions
    const updateMealTickets = async (newValue) => {
      if (!applicant.value) return
      try {
        const docRef = doc(reunion_db, 'participants_2026', applicant.value.id)
        await updateDoc(docRef, { 'order.meal_tickets_remaining': newValue })
        applicant.value.meal_tickets_remaining = newValue
        mealTickets.value = newValue
        console.log('Meal tickets updated for:', applicant.value.fullname)
      } catch (error) {
        console.error('Error updating meal tickets:', error)
      }
    }

    const incrementMealTickets = () => {
      const newValue = mealTickets.value + 1
      updateMealTickets(newValue)
    }

    const decrementMealTickets = () => {
      if (mealTickets.value > 0) {
        const newValue = mealTickets.value - 1
        updateMealTickets(newValue)
      }
    }

    // Enhanced SMS Function with notifications
    const sendSMSMessage = async () => {
      if (!smsMessage.value.trim()) {
        alert('Please enter a message')
        return
      }

      try {
        // Import and use the notification function like dashboard does
        const { sendSMS } = await import('/scripts/notifications.js')
        await sendSMS(applicant.value.phone, smsMessage.value)
        console.log('SMS sent successfully')
        smsMessage.value = ''
        alert('SMS sent successfully!')
      } catch (error) {
        console.error('Error sending SMS:', error)
        alert('Failed to send SMS')
      }
    }

    // Compensation Functions
    const updateCompensation = async () => {
      if (!newCompensation.value.trim()) {
        alert('Please enter a compensation amount')
        return
      }

      try {
        const docRef = doc(reunion_db, 'participants_2026', applicant.value.id)
        await updateDoc(docRef, { 'application.data.rates': newCompensation.value })
        applicant.value.rates = newCompensation.value
        newCompensation.value = ''
        console.log('Compensation updated for:', applicant.value.fullname)
      } catch (error) {
        console.error('Error updating compensation:', error)
      }
    }

    const clearCompensation = async () => {
      if (confirm('Are you sure you want to clear the compensation?')) {
        try {
          const docRef = doc(reunion_db, 'participants_2026', applicant.value.id)
          await updateDoc(docRef, { 'application.data.rates': null })
          applicant.value.rates = null
          console.log('Compensation cleared for:', applicant.value.fullname)
        } catch (error) {
          console.error('Error clearing compensation:', error)
        }
      }
    }

    // Set Time Functions
    const addSettime = async () => {
      if (!newSettime.value) {
        alert('Please select a date and time')
        return
      }

      try {
        const currentSettimes = applicant.value.settimes || []
        const updatedSettimes = [...currentSettimes, newSettime.value]

        const docRef = doc(reunion_db, 'participants_2026', applicant.value.id)
        await updateDoc(docRef, { settimes: updatedSettimes })

        applicant.value.settimes = updatedSettimes
        newSettime.value = ''
        console.log('Set time added for:', applicant.value.fullname)
      } catch (error) {
        console.error('Error adding set time:', error)
      }
    }

    const removeSettime = async (index) => {
      if (confirm('Are you sure you want to remove this set time?')) {
        try {
          const updatedSettimes = [...applicant.value.settimes]
          updatedSettimes.splice(index, 1)

          const docRef = doc(reunion_db, 'participants_2026', applicant.value.id)
          await updateDoc(docRef, { settimes: updatedSettimes })

          applicant.value.settimes = updatedSettimes
          console.log('Set time removed for:', applicant.value.fullname)
        } catch (error) {
          console.error('Error removing set time:', error)
        }
      }
    }

    // Check-in Management — mirrors TicketScannerView logic
    const checkInTicket = async () => {
      if (ticketQuantity.value <= 0) {
        alert('No tickets remaining to check in.')
        return
      }
      try {
        const newQty = ticketQuantity.value - 1
        const activityTime = new Date().toISOString()
        const docRef = doc(reunion_db, 'participants_2026', applicant.value.id)
        const existingHistory = applicant.value.entrance_activity_history || []
        const newActivity = {
          timestamp: activityTime,
          action: 'check_in',
          ticket_quantity_after: newQty,
          operator: 'admin',
          operator_name: 'Admin'
        }
        const updatedHistory = [...existingHistory, newActivity]
        await updateDoc(docRef, {
          'order.checked_in': true,
          'order.ticket_quantity': newQty,
          'order.original_ticket_quantity': originalTicketQuantity.value,
          'order.last_entrance_activity': activityTime,
          'order.entrance_activity_history': updatedHistory
        })
        ticketQuantity.value = newQty
        applicant.value.ticket_quantity = newQty
        applicant.value.checked_in = true
        applicant.value.entrance_activity_history = updatedHistory
      } catch (error) {
        console.error('Error checking in:', error)
        alert('Failed to check in')
      }
    }

    const checkOutTicket = async () => {
      if (ticketQuantity.value >= originalTicketQuantity.value) {
        alert('All tickets already checked out — none to restore.')
        return
      }
      try {
        const newQty = ticketQuantity.value + 1
        const activityTime = new Date().toISOString()
        const docRef = doc(reunion_db, 'participants_2026', applicant.value.id)
        const existingHistory = applicant.value.entrance_activity_history || []
        const newActivity = {
          timestamp: activityTime,
          action: 'check_out',
          ticket_quantity_after: newQty,
          operator: 'admin',
          operator_name: 'Admin'
        }
        const updatedHistory = [...existingHistory, newActivity]
        const checkedIn = newQty < originalTicketQuantity.value
        await updateDoc(docRef, {
          'order.checked_in': checkedIn,
          'order.ticket_quantity': newQty,
          'order.original_ticket_quantity': originalTicketQuantity.value,
          'order.last_entrance_activity': activityTime,
          'order.entrance_activity_history': updatedHistory
        })
        ticketQuantity.value = newQty
        applicant.value.ticket_quantity = newQty
        applicant.value.checked_in = checkedIn
        applicant.value.entrance_activity_history = updatedHistory
      } catch (error) {
        console.error('Error checking out:', error)
        alert('Failed to check out')
      }
    }

    // Contract signing toggle
    const toggleContractSigned = async () => {
      const newStatus = !applicant.value.contract_signed
      try {
        const docRef = doc(reunion_db, 'participants_2026', applicant.value.id)
        await updateDoc(docRef, { 'contract.signed': newStatus })
        applicant.value.contract_signed = newStatus
        console.log(`Contract status updated: ${newStatus}`)
      } catch (error) {
        console.error('Error updating contract status:', error)
        alert('Failed to update contract status')
      }
    }

    // Enhanced email functions
    const sendCustomEmail = async () => {
      if (!applicant.value.email) return
      if (!emailSubject.value.trim() || !emailBody.value.trim()) {
        alert('Please fill in both subject and message.')
        return
      }
      try {
        const { sendEmail } = await import('/scripts/notifications.js')
        await sendEmail(applicant.value.email, emailSubject.value.trim(), emailBody.value.trim())
        emailSubject.value = ''
        emailBody.value = ''
      } catch (error) {
        console.error('Error sending email:', error)
        alert('Failed to send email')
      }
    }

    onMounted(() => {
      loadApplicant()
      loadContractDeliveryTemplate()
      loadTicketDeliveryTemplate()
      loadDeclineTemplate()
    })

    const loadDeclineTemplate = () => {
      fetch('/email_templates/decline_template.txt')
        .then((response) => response.text())
        .then((text) => {
          declineEmailBody.value = text
        })
        .catch((error) => {
          console.error('Error loading decline email template:', error)
        })
    }

    const loadContractDeliveryTemplate = () => {
      fetch('/email_templates/contract_delivery_template.txt')
        .then((response) => response.text())
        .then((text) => {
          contractEmailBody.value = text
        })
        .catch((error) => {
          console.error('Error loading contract email template:', error)
        })
    }

    const loadTicketDeliveryTemplate = () => {
      fetch('/email_templates/ticket_delivery_template.txt')
        .then((response) => response.text())
        .then((text) => {
          ticketEmailBody.value = text
        })
        .catch((error) => {
          console.error('Error loading ticket email template:', error)
        })
    }

    const deliverContract = (email, fullname, roles, id_code) => {
      const subject = encodeURIComponent('Reunion 2026')
      const personalizedBody = contractEmailBody.value
        .replace('{name}', fullname || '')
        .replace('{roles}', roles || '')
        .replace('{id_code}', id_code || '')
      const body = encodeURIComponent(personalizedBody)
      return `mailto:${email}?subject=${subject}&body=${body}&cc=prasun.das.89@gmail.com`
    }

    const deliverTicket = (email, fullname, id_code) => {
      const subject = encodeURIComponent('Reunion 2026')
      const personalizedBody = ticketEmailBody.value
        .replace('{name}', fullname || '')
        .replace('{id_code}', id_code || '')
      const body = encodeURIComponent(personalizedBody)
      return `mailto:${email}?subject=${subject}&body=${body}&cc=prasun.das.89@gmail.com`
    }

    const declineApplicant = async () => {
      try {
        const docRef = doc(reunion_db, 'participants_2026', applicant.value.id)
        await updateDoc(docRef, { status: 'declined', updatedAt: new Date().toISOString() })
        applicant.value.status = 'declined'

        if (applicant.value.email) {
          const { sendEmail } = await import('/scripts/notifications.js')
          const roles = applicant.value.applicant_types?.join(', and ') || 'applicant'
          const reasonText = declineReason.value ? `\n\n${declineReason.value}` : ''
          const personalizedBody = declineEmailBody.value
            .replace('{name}', applicant.value.fullname || 'there')
            .replace('{roles}', roles)
            .replace('{reason}', reasonText)
          await sendEmail(applicant.value.email, 'Reunion 2026 — Application Update', personalizedBody)
        }

        declineReason.value = ''
        declinePending.value = false
        alert('Applicant declined and notified.')
      } catch (err) {
        console.error('Error declining applicant:', err)
        alert('Failed to decline applicant.')
      }
    }

    const undeclineApplicant = async () => {
      if (!confirm('Restore this applicant back to active applicant status?')) return

      try {
        const docRef = doc(reunion_db, 'participants_2026', applicant.value.id)
        await updateDoc(docRef, { status: 'applicant', updatedAt: new Date().toISOString() })
        applicant.value.status = 'applicant'
        alert('Applicant status restored.')
      } catch (err) {
        console.error('Error restoring applicant:', err)
        alert('Failed to restore applicant status.')
      }
    }

    return {
      applicant,
      loading,
      error,
      previewTicket,
      generateContract,
      emailLink,
      smsMessage,
      emailSubject,
      emailBody,
      newCompensation,
      newSettime,
      mealTickets,
      confirmPaymentReceived,
      revokeTicket,
      remindPayment,
      remindContract,
      sendSMSMessage,
      updateCompensation,
      clearCompensation,
      addSettime,
      removeSettime,
      incrementMealTickets,
      decrementMealTickets,
      deliverContract,
      deliverTicket,
      checkInTicket,
      checkOutTicket,
      ticketQuantity,
      originalTicketQuantity,
      toggleContractSigned,
      sendCustomEmail,
      declineApplicant,
      undeclineApplicant,
      declineReason,
      declineReasons,
      declinePending
    }
  }
}
</script>

<style scoped>
.applicant-detail {
  width: 100%;
  margin: 0;
  padding: 1rem;
  background-color: #1f1e22;
  color: #e0e0e0;
  min-height: 100vh;
  font-size: 12px;
  line-height: 1.4;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  color: white;
  font-size: 1.2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #333;
  border-top: 4px solid var(--festivall-baby-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-banner {
  background: #ff4444;
  color: white;
  padding: 1rem;
  border-radius: 5px;
  text-align: center;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--festivall-baby-blue);
}

.back-link {
  color: var(--festivall-baby-blue);
  text-decoration: none;
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #0056b3;
}

h1 {
  color: var(--festivall-baby-blue);
  margin: 0;
  font-size: 2rem;
}

.content-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
}

@media (min-width: 1400px) {
  .content-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1800px) {
  .content-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  /* Stretch orphaned last card to fill the row */
  .content-grid .section:last-child:nth-child(4n+1) { grid-column: 1 / -1; }
  .content-grid .section:last-child:nth-child(4n+2) { grid-column: span 3; }
  .content-grid .section:last-child:nth-child(4n+3) { grid-column: span 2; }
}

.section {
  background-color: #252528;
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #333;
}

.section h2 {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #888;
  margin: 0 0 0.4rem 0;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid #333;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.4rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-weight: 600;
  color: #777;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* inline status + action button on same row */
.info-action-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.ticket-scan-count {
  font-size: 10px;
  color: #888;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.info-item span,
.info-item p {
  color: #d0d0d0;
  margin: 0;
  font-size: 12px;
}

.info-item a {
  color: var(--festivall-baby-blue);
  text-decoration: none;
}

.info-item a:hover {
  text-decoration: underline;
}

.id-code {
  font-family: monospace;
  font-weight: bold;
}

.status-paid,
.status-signed,
.status-checked-in {
  color: #4caf50;
  font-weight: bold;
}

.status-unpaid,
.status-not-signed,
.status-not-checked-in {
  color: #f44336;
  font-weight: bold;
}

.status-badge {
  background-color: var(--festivall-baby-blue);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: capitalize;
}

.settimes-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.settime-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background-color: #444;
  border-radius: 5px;
}

.actions {
  display: block;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #333;
  grid-column: 1 / -1;
}

.actions button,
.section button {
  padding: 0.4rem 0.9rem;
  border: none;
  border-radius: 5px;
  background-color: var(--festivall-baby-blue);
  color: white;
  font-weight: 600;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.actions button:hover,
.section button:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.actions a {
  text-decoration: none;
}

/* ── Actions card grid ── mirrors content-grid ────────────────── */
.actions-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.action-card {
  background-color: #252528;
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #333;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.action-card h2 {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #888;
  margin: 0 0 0.3rem 0;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid #333;
}

/* buttons inside a card stack full-width */
.action-card > button,
.action-card > a,
.action-card-btns {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.action-card > button {
  width: 100%;
}

.action-card > a > button,
.action-card-btns button,
.action-card-btns a > button {
  width: 100%;
}

.action-card-btns a {
  display: block;
}

/* inkind row inside card */
.inkind-badge {
  align-self: flex-start;
}

.inkind-info-row {
  display: flex;
  gap: 0.4rem;
  align-items: baseline;
}

.inkind-label {
  font-size: 9px;
  color: #777;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.inkind-value {
  font-size: 11px;
  color: #d0d0d0;
  font-weight: 600;
}

/* Action Sections */
.payment-actions,
.inkind-payment-actions {
  display: contents;
}

.sms-section,
.custom-email-section,
.compensation-section,
.settime-section {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.settime-section h3 {
  margin: 0 0 0.3rem 0;
  color: #888;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.existing-settimes {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.4rem;
}

.settime-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.2rem 0.4rem;
  background-color: #252528;
  border-radius: 3px;
  font-size: 11px;
}

.add-settime {
  display: flex;
  gap: 0.35rem;
  align-items: center;
}

/* Input Styles */
.sms-input,
.compensation-input,
.settime-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.3rem 0.4rem;
  border: 1px solid #444;
  border-radius: 4px;
  background-color: #1f1e22;
  color: #d0d0d0;
  font-size: 11px;
}

.sms-input::placeholder,
.compensation-input::placeholder {
  color: #666;
}

/* Button Variations */
.success-btn {
  background-color: #2e7d32 !important;
  font-size: 11px !important;
  padding: 0.3rem 0.75rem !important;
}

.success-btn:hover {
  background-color: #1b5e20 !important;
}

.danger-btn {
  background-color: #c62828 !important;
  font-size: 11px !important;
  padding: 0.3rem 0.75rem !important;
}

.danger-btn:hover {
  background-color: #8e0000 !important;
}

.remind-btn {
  background-color: #e65100 !important;
  color: #fff !important;
  font-size: 11px !important;
  padding: 0.3rem 0.75rem !important;
}

.remind-btn:hover {
  background-color: #bf360c !important;
}

.email-body-input {
  min-height: 70px;
  resize: vertical;
  line-height: 1.4;
}

.sms-btn {
  background-color: #00838f !important;
  font-size: 11px !important;
  padding: 0.3rem 0.75rem !important;
}

.sms-btn:hover {
  background-color: #006064 !important;
}

.compensation-btn {
  background-color: #4527a0 !important;
  font-size: 11px !important;
  padding: 0.3rem 0.75rem !important;
}

.compensation-btn:hover {
  background-color: #311b92 !important;
}

.clear-btn {
  background-color: #424242 !important;
  color: #bbb !important;
  font-size: 11px !important;
  padding: 0.3rem 0.75rem !important;
}

.clear-btn:hover {
  background-color: #616161 !important;
}

.add-btn {
  background-color: #00695c !important;
  font-size: 11px !important;
  padding: 0.3rem 0.75rem !important;
  white-space: nowrap;
}

.add-btn:hover {
  background-color: #004d40 !important;
}

.remove-btn {
  background-color: #c62828 !important;
  font-size: 10px !important;
  padding: 0.2rem 0.4rem !important;
}

.remove-btn:hover {
  background-color: #8e0000 !important;
}

/* ── Decline section ──────────────────────────────────────────────── */
.decline-section {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #333;
}

.declined-badge-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.declined-badge {
  font-size: 10px;
  font-weight: 700;
  color: #ef5350;
  letter-spacing: 0.05em;
}

.decline-trigger-btn {
  width: 100%;
  background-color: #4a1515 !important;
  color: #ef9a9a !important;
  border: 1px solid #7f1f1f !important;
  font-size: 10px !important;
  padding: 0.3rem 0.7rem !important;
}

.decline-trigger-btn:hover {
  background-color: #7f1f1f !important;
  color: #fff !important;
}

.decline-confirm-panel {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.5rem;
  background-color: #2a1515;
  border: 1px solid #7f1f1f;
  border-radius: 5px;
}

.decline-confirm-warning {
  margin: 0 !important;
  font-size: 10px !important;
  color: #ef9a9a !important;
  font-style: italic;
}

.decline-reason-label {
  font-size: 9px;
  color: #888;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.decline-reason-select {
  padding: 0.35rem 0.4rem;
  border: 1px solid #555;
  border-radius: 4px;
  background-color: #1f1e22;
  color: #d0d0d0;
  font-size: 11px;
  cursor: pointer;
}

.decline-reason-select:focus {
  outline: none;
  border-color: #ef5350;
}

.decline-reason-preview {
  margin: 0 !important;
  padding: 0.35rem 0.5rem;
  background-color: #1a1a1a;
  border-left: 2px solid #7f1f1f;
  border-radius: 3px;
  color: #aaa !important;
  font-size: 10px !important;
  font-style: italic;
  line-height: 1.4;
}

.decline-confirm-actions {
  display: flex;
  gap: 0.4rem;
  justify-content: flex-end;
}

.cancel-decline-btn {
  background-color: #444 !important;
  color: #ccc !important;
  font-size: 10px !important;
  padding: 0.3rem 0.6rem !important;
}

.cancel-decline-btn:hover {
  background-color: #555 !important;
}

.decline-btn {
  background-color: #b71c1c !important;
  font-size: 10px !important;
  padding: 0.3rem 0.7rem !important;
}

.decline-btn:hover {
  background-color: #7f0000 !important;
}

.restore-btn {
  background-color: #37474f !important;
  color: #ccc !important;
  font-size: 10px !important;
  padding: 0.3rem 0.6rem !important;
}

.restore-btn:hover {
  background-color: #546e7a !important;
}

.meal-management-section {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.4rem 0.5rem;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: #1f1e22;
  margin-top: 0.5rem;
}

.meal-management-section h3 {
  margin: 0;
  color: #888;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.meal-info {
  margin: 0;
  color: #999;
  font-size: 10px;
}

.status-badge.declined {
  background-color: #b71c1c;
}

.deliver-btn {
  background-color: #2e7d32 !important;
  font-size: 11px !important;
  padding: 0.3rem 0.75rem !important;
}

.deliver-btn:hover {
  background-color: #1b5e20 !important;
}

/* Mix Track Section */
.mix-track-section {
  margin-bottom: 0.5rem;
}

.mix-track-link {
  display: block;
  text-align: center;
  padding: 0.3rem 0.75rem;
  background-color: #4a148c !important;
  color: #ce93d8 !important;
  text-decoration: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.mix-track-link:hover {
  background-color: #6a1b9a !important;
  color: #fff !important;
}

/* Current Compensation Display */
.current-compensation {
  margin: 0.2rem 0 0 0 !important;
  padding: 0.25rem 0.4rem;
  background-color: #252528;
  border-radius: 3px;
  color: #aaa !important;
  font-size: 10px;
  font-style: italic;
}

/* Meal Tickets Control */
.status-signed {
  color: #4caf50 !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  margin: 0 !important;
}

.status-not-signed {
  color: #f44336 !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  margin: 0 !important;
}

.meal-tickets-control {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.meal-btn {
  width: 22px !important;
  height: 22px !important;
  border: 1px solid #555 !important;
  border-radius: 50% !important;
  background-color: transparent !important;
  color: #aaa !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.15s ease !important;
  padding: 0 !important;
  margin: 0 !important;
  min-height: 22px !important;
  max-height: 22px !important;
  line-height: 1 !important;
}

.meal-btn:hover:not(:disabled) {
  border-color: var(--festivall-baby-blue) !important;
  color: var(--festivall-baby-blue) !important;
  background-color: transparent !important;
  transform: none !important;
}

.meal-btn:disabled {
  opacity: 0.25 !important;
  cursor: not-allowed !important;
  transform: none !important;
}

.meal-btn:disabled:hover {
  border-color: #555 !important;
  color: #aaa !important;
}

.increment-btn {
  border-color: #2e7d32 !important;
  color: #81c784 !important;
}

.increment-btn:hover:not(:disabled) {
  border-color: #4caf50 !important;
  color: #4caf50 !important;
}

.decrement-btn {
  border-color: #c62828 !important;
  color: #ef9a9a !important;
}

.decrement-btn:hover:not(:disabled) {
  border-color: #ef5350 !important;
  color: #ef5350 !important;
}

.meal-count {
  font-size: 12px !important;
  font-weight: 600 !important;
  color: #d0d0d0 !important;
  min-width: 20px !important;
  text-align: center !important;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .applicant-detail {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .actions {
    flex-direction: column;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .actions-main-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }

  .actions-two-col {
    grid-template-columns: 1fr;
  }
}
</style>
