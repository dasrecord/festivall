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
              <span class="status-badge">{{ applicant.status }}</span>
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
              <span :class="{ 'status-paid': applicant.paid, 'status-unpaid': !applicant.paid }">
                {{ applicant.paid ? 'Paid' : 'Unpaid' }}
              </span>
            </div>
            <div class="info-item">
              <label>Check-in Status:</label>
              <span
                :class="{
                  'status-checked-in': applicant.checked_in,
                  'status-not-checked-in': !applicant.checked_in
                }"
              >
                {{ applicant.checked_in ? 'Checked In' : 'Not Checked In' }}
              </span>
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

        <!-- Contract Information -->
        <div v-if="applicant.payment_type === 'inkind'" class="section contract-info">
          <h2>Contract Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Contract Status:</label>
              <span
                :class="{
                  'status-signed': applicant.contract_signed,
                  'status-not-signed': !applicant.contract_signed
                }"
              >
                {{ applicant.contract_signed ? 'Signed' : 'Not Signed' }}
              </span>
            </div>
            <div class="info-item" v-if="applicant.rates">
              <label>Compensation:</label>
              <span>${{ applicant.rates }}</span>
            </div>
          </div>
        </div>

        <!-- Set Times -->
        <div v-if="applicant.settimes && applicant.settimes.length" class="section settimes-info">
          <h2>Set Times</h2>
          <div class="settimes-list">
            <div v-for="(settime, index) in applicant.settimes" :key="index" class="settime-item">
              <span>Set {{ index + 1 }}:</span>
              <span>{{ new Date(settime).toLocaleString() }}</span>
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
        <!-- Basic Actions Row -->
        <div class="basic-actions">
          <button v-if="applicant.id_code" @click="previewTicket" class="preview-btn">
            Preview Ticket
          </button>
          <button v-if="applicant.id_code" @click="generateContract" class="preview-btn">
            Preview Contract
          </button>

          <!-- Conditional Email Actions -->
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
        </div>

        <!-- Applicant Actions (for all applicants) -->
        <div
          v-if="applicant.applicant_types && applicant.applicant_types.length"
          class="applicant-actions"
        >
          <h3>Applicant Management</h3>

          <!-- Mix Track URL -->
          <div v-if="applicant.mix_track_url" class="mix-track-section">
            <a :href="applicant.mix_track_url" target="_blank" class="mix-track-link">
              🎵 Listen to Mix/Track
            </a>
          </div>

          <!-- Contract Status for all applicants -->
          <div class="contract-status-section">
            <h3>Contract Status:</h3>
            <p v-if="applicant.contract_signed" class="status-signed">✅ Signed</p>
            <p v-else class="status-not-signed">❌ Not Signed</p>

            <button
              @click="toggleContractSigned"
              :class="applicant.contract_signed ? 'danger-btn' : 'success-btn'"
            >
              {{ applicant.contract_signed ? 'Mark Contract Not Signed' : 'Mark Contract Signed' }}
            </button>
          </div>

          <button v-if="!applicant.contract_signed" @click="remindContract" class="remind-btn">
            Remind Contract
          </button>

          <button v-if="applicant.email" @click="sendCustomEmail" class="remind-btn">
            Send Custom Email
          </button>

          <!-- SMS Section for all applicants -->
          <div v-if="applicant.phone" class="sms-section">
            <input
              type="text"
              v-model="smsMessage"
              placeholder="Send SMS message..."
              class="sms-input"
            />
            <button @click="sendSMSMessage" class="sms-btn">Send SMS</button>
          </div>

          <!-- Compensation Section -->
          <div class="compensation-section">
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
            <p v-if="applicant.rates" class="current-compensation">
              Current Fee: ${{ applicant.rates }}
            </p>
          </div>

          <!-- Set Times Section -->
          <div
            v-if="
              applicant.applicant_types &&
              (applicant.applicant_types.includes('Artist') ||
                applicant.applicant_types.includes('Workshop'))
            "
            class="settime-section"
          >
            <h3>Manage Set Times</h3>
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

          <!-- Meal Ticket Management -->
          <div class="meal-management-section">
            <h3>Meal Tickets Management</h3>
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

        <!-- Payment Actions -->
        <div v-if="applicant.payment_type !== 'inkind'" class="payment-actions">
          <button v-if="!applicant.paid" @click="confirmPaymentReceived" class="success-btn">
            Confirm Payment Received
          </button>
          <button v-if="applicant.paid" @click="revokeTicket" class="danger-btn">
            Revoke Ticket
          </button>
          <button @click="remindPayment" class="remind-btn">Remind Payment</button>
          <button
            @click="toggleCheckedIn"
            :class="applicant.checked_in ? 'danger-btn' : 'success-btn'"
          >
            {{ applicant.checked_in ? 'Mark Not Checked In' : 'Mark Checked In' }}
          </button>
        </div>

        <!-- In-Kind Payment Actions -->
        <div v-if="applicant.payment_type === 'inkind'" class="inkind-payment-actions">
          <h3>In-Kind Payment Management</h3>

          <div class="info-grid">
            <div class="info-item" v-if="applicant.total_price">
              <label>Compensation Value:</label>
              <span>${{ applicant.total_price }}</span>
            </div>
            <div class="info-item">
              <label>Payment Status:</label>
              <span class="status-badge">In-Kind Arrangement</span>
            </div>
          </div>

          <button
            @click="toggleCheckedIn"
            :class="applicant.checked_in ? 'danger-btn' : 'success-btn'"
          >
            {{ applicant.checked_in ? 'Mark Not Checked In' : 'Mark Checked In' }}
          </button>
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
    const newCompensation = ref('')
    const newSettime = ref('')
    const contractEmailBody = ref('')
    const ticketEmailBody = ref('')
    const mealTickets = ref(0)

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

    // Check-in Management
    const toggleCheckedIn = async () => {
      if (!applicant.value.order) {
        alert('No order information available')
        return
      }

      const newStatus = !applicant.value.checked_in
      try {
        const docRef = doc(reunion_db, 'participants_2026', applicant.value.id)
        await updateDoc(docRef, { 'order.checked_in': newStatus })
        applicant.value.checked_in = newStatus
        console.log(`Check-in status updated: ${newStatus}`)
      } catch (error) {
        console.error('Error updating check-in status:', error)
        alert('Failed to update check-in status')
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
      if (!applicant.value.email) {
        alert('No email available for this applicant')
        return
      }

      const subject = prompt('Email subject:', 'Reunion 2026')
      if (!subject) return

      const message = prompt('Email message:')
      if (!message) return

      try {
        const { sendEmail } = await import('/scripts/notifications.js')
        await sendEmail(applicant.value.email, subject, message)
        alert('Email sent successfully!')
      } catch (error) {
        console.error('Error sending email:', error)
        alert('Failed to send email')
      }
    }

    onMounted(() => {
      loadApplicant()
      loadContractDeliveryTemplate()
      loadTicketDeliveryTemplate()
    })

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

    return {
      applicant,
      loading,
      error,
      previewTicket,
      generateContract,
      emailLink,
      smsMessage,
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
      toggleCheckedIn,
      toggleContractSigned,
      sendCustomEmail
    }
  }
}
</script>

<style scoped>
.applicant-detail {
  width: 100%;
  margin: 0;
  padding: 2rem;
  background-color: #1f1e22;
  color: #f0f4f8;
  min-height: 100vh;
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
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
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
}

.section {
  background-color: #333;
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--festivall-baby-blue);
}

.section h2 {
  color: var(--festivall-baby-blue);
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-weight: bold;
  color: var(--festivall-baby-blue);
  font-size: 0.9rem;
}

.info-item span,
.info-item p {
  color: #f0f4f8;
  margin: 0;
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
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #444;
  grid-column: 1 / -1;
}

.actions button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background-color: var(--festivall-baby-blue);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.actions button:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.actions a {
  text-decoration: none;
}

/* Basic Actions Row */
.basic-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #444;
  border-radius: 8px;
  background-color: #2a2930;
  align-items: flex-start;
}

.basic-actions button {
  flex: none !important;
  height: auto !important;
  min-height: auto !important;
  max-height: 40px !important;
  width: auto !important;
  max-width: 200px !important;
  padding: 0.5rem 1rem !important;
  font-size: 0.9rem !important;
  line-height: 1.2 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  display: inline-block !important;
  vertical-align: top !important;
}

.basic-actions a {
  display: inline-block !important;
  max-height: 40px !important;
}

.basic-actions .preview-btn {
  background-color: var(--festivall-baby-blue) !important;
}

.basic-actions .deliver-btn {
  background-color: #28a745 !important;
}

/* Action Sections */
.payment-actions,
.inkind-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #444;
  border-radius: 8px;
  background-color: #2a2930;
}

.sms-section,
.compensation-section,
.settime-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #555;
  border-radius: 6px;
  background-color: #1f1e22;
}

.sms-section {
  flex-direction: row;
  align-items: center;
}

.compensation-section {
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
}

.settime-section h3 {
  margin: 0 0 0.5rem 0;
  color: var(--festivall-baby-blue);
  font-size: 1rem;
}

.existing-settimes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.settime-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: #2a2930;
  border-radius: 4px;
}

.add-settime {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Input Styles */
.sms-input,
.compensation-input,
.settime-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #555;
  border-radius: 4px;
  background-color: #333;
  color: #f0f4f8;
  font-size: 0.9rem;
}

.sms-input::placeholder,
.compensation-input::placeholder {
  color: #999;
}

/* Button Variations */
.success-btn {
  background-color: #28a745 !important;
}

.success-btn:hover {
  background-color: #218838 !important;
}

.danger-btn {
  background-color: #dc3545 !important;
}

.danger-btn:hover {
  background-color: #c82333 !important;
}

.remind-btn {
  background-color: #ffc107 !important;
  color: #212529 !important;
}

.remind-btn:hover {
  background-color: #e0a800 !important;
}

.sms-btn {
  background-color: #17a2b8 !important;
}

.sms-btn:hover {
  background-color: #138496 !important;
}

.compensation-btn {
  background-color: #6f42c1 !important;
}

.compensation-btn:hover {
  background-color: #5a32a3 !important;
}

.clear-btn {
  background-color: #6c757d !important;
}

.clear-btn:hover {
  background-color: #5a6268 !important;
}

.add-btn {
  background-color: #20c997 !important;
}

.add-btn:hover {
  background-color: #1ba085 !important;
}

.remove-btn {
  background-color: #dc3545 !important;
  padding: 0.25rem 0.5rem !important;
  font-size: 0.8rem !important;
}

.remove-btn:hover {
  background-color: #c82333 !important;
}

.deliver-btn {
  background-color: #28a745 !important;
  font-size: 0.9rem !important;
}

.deliver-btn:hover {
  background-color: #218838 !important;
}

/* Mix Track Section */
.mix-track-section {
  margin-bottom: 1rem;
}

.mix-track-link {
  display: inline-block;
  padding: 0.75rem 1rem;
  background-color: #9b59b6 !important;
  color: white !important;
  text-decoration: none;
  border-radius: 6px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.mix-track-link:hover {
  background-color: #8e44ad !important;
  transform: translateY(-2px);
}

/* Contract Status Section */
.contract-status-section {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #555;
  border-radius: 6px;
  background-color: #2a2930;
}

.contract-status-section h3 {
  margin: 0 0 0.5rem 0;
  color: var(--festivall-baby-blue);
  font-size: 1rem;
}

.status-signed {
  color: #28a745 !important;
  font-size: 1.1rem !important;
  font-weight: bold !important;
  margin: 0 !important;
}

.status-not-signed {
  color: #dc3545 !important;
  font-size: 1.1rem !important;
  font-weight: bold !important;
  margin: 0 !important;
}

/* Current Compensation Display */
.current-compensation {
  margin: 0.5rem 0 0 0 !important;
  padding: 0.5rem;
  background-color: #2a2930;
  border-radius: 4px;
  color: var(--festivall-baby-blue) !important;
  font-weight: bold;
}

/* Meal Tickets Control */
.meal-management-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #555;
  border-radius: 6px;
  background-color: #2a2930;
  margin-top: 1rem;
}

.meal-management-section h3 {
  margin: 0;
  color: var(--festivall-baby-blue);
  font-size: 1rem;
}

.meal-info {
  margin: 0;
  color: #f0f4f8;
  font-size: 0.9rem;
}

.meal-tickets-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meal-btn {
  width: 32px !important;
  height: 32px !important;
  border: none !important;
  border-radius: 50% !important;
  background-color: var(--festivall-baby-blue) !important;
  color: white !important;
  font-size: 1.2rem !important;
  font-weight: bold !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.2s ease !important;
  padding: 0 !important;
  margin: 0 !important;
  min-height: 32px !important;
  max-height: 32px !important;
  line-height: 1 !important;
}

.meal-btn:hover {
  background-color: #0056b3 !important;
  transform: scale(1.1) !important;
}

.meal-btn:disabled {
  background-color: #6c757d !important;
  cursor: not-allowed !important;
  transform: none !important;
  opacity: 0.6 !important;
}

.meal-btn:disabled:hover {
  background-color: #6c757d !important;
  transform: none !important;
}

.increment-btn {
  background-color: #28a745 !important;
}

.increment-btn:hover {
  background-color: #218838 !important;
}

.decrement-btn {
  background-color: #dc3545 !important;
}

.decrement-btn:hover {
  background-color: #c82333 !important;
}

.meal-count {
  font-size: 1.2rem !important;
  font-weight: bold !important;
  color: var(--festivall-baby-blue) !important;
  min-width: 40px !important;
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
}
</style>
