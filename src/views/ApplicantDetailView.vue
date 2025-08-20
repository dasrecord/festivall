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
            <div
              class="info-item"
              v-if="applicant.applicant_types && applicant.applicant_types.length"
            >
              <label>Applicant Types:</label>
              <span>{{ applicant.applicant_types.join(', ') }}</span>
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
                <button 
                  @click="incrementMealTickets" 
                  class="meal-btn increment-btn"
                >
                  +
                </button>
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

        <!-- Payment Actions -->
        <div v-if="applicant.payment_type !== 'inkind'" class="payment-actions">
          <button v-if="!applicant.paid" @click="confirmPaymentReceived" class="success-btn">
            Confirm Payment Received
          </button>
          <button v-if="applicant.paid" @click="revokeTicket" class="danger-btn">
            Revoke Ticket
          </button>
          <button @click="remindPayment" class="remind-btn">Remind Payment</button>
        </div>

        <!-- In-Kind Actions -->
        <div v-if="applicant.payment_type === 'inkind'" class="inkind-actions">
          <!-- Mix Track URL -->
          <div v-if="applicant.mix_track_url" class="mix-track-section">
            <a :href="applicant.mix_track_url" target="_blank" class="mix-track-link">
              🎵 Listen to Mix/Track
            </a>
          </div>

          <!-- Contract Status Display -->
          <div class="contract-status-section">
            <h3>Contract Status:</h3>
            <p v-if="applicant.contract_signed" class="status-signed">✅ Signed</p>
            <p v-else class="status-not-signed">❌ Not Signed</p>
          </div>

          <button v-if="!applicant.contract_signed" @click="remindContract" class="remind-btn">
            Remind Contract
          </button>

          <!-- SMS Section -->
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

        // Try to load from orders_2025 first, then applications_2025
        let docRef = doc(reunion_db, 'orders_2025', applicantId)
        let docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          docRef = doc(reunion_db, 'applications_2025', applicantId)
          docSnap = await getDoc(docRef)
        }

        if (docSnap.exists()) {
          applicant.value = { id: docSnap.id, ...docSnap.data() }
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
      const subject = encodeURIComponent('Reunion 2025')
      const body = encodeURIComponent(`Hello ${applicant.value.fullname || 'there'},\n\n`)
      return `mailto:${applicant.value.email}?subject=${subject}&body=${body}`
    })

    // Payment Actions
    const confirmPaymentReceived = async () => {
      try {
        const docRef = doc(reunion_db, 'orders_2025', applicant.value.id)
        await updateDoc(docRef, { paid: true })
        applicant.value.paid = true
        console.log('Payment confirmed for:', applicant.value.fullname)
      } catch (error) {
        console.error('Error confirming payment:', error)
      }
    }

    const revokeTicket = async () => {
      if (confirm('Are you sure you want to revoke this ticket?')) {
        try {
          const docRef = doc(reunion_db, 'orders_2025', applicant.value.id)
          await updateDoc(docRef, { paid: false })
          applicant.value.paid = false
          console.log('Ticket revoked for:', applicant.value.fullname)
        } catch (error) {
          console.error('Error revoking ticket:', error)
        }
      }
    }

    const remindPayment = () => {
      window.open(
        `/scripts/notifications.js?action=remind_payment&id=${applicant.value.id}`,
        '_blank'
      )
    }

    const remindContract = () => {
      window.open(
        `/scripts/notifications.js?action=remind_contract&id=${applicant.value.id}`,
        '_blank'
      )
    }

    // Meal Tickets Functions
    const updateMealTickets = async (newValue) => {
      if (!applicant.value) return
      try {
        const docRef = doc(reunion_db, 'orders_2025', applicant.value.id)
        await updateDoc(docRef, { meal_tickets_remaining: newValue })
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

    // SMS Function
    const sendSMSMessage = async () => {
      if (!smsMessage.value.trim()) {
        alert('Please enter a message')
        return
      }

      try {
        const response = await fetch('/scripts/notifications.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send_sms',
            phone: applicant.value.phone,
            message: smsMessage.value
          })
        })

        if (response.ok) {
          console.log('SMS sent successfully')
          smsMessage.value = ''
        } else {
          console.error('Failed to send SMS')
        }
      } catch (error) {
        console.error('Error sending SMS:', error)
      }
    }

    // Compensation Functions
    const updateCompensation = async () => {
      if (!newCompensation.value.trim()) {
        alert('Please enter a compensation amount')
        return
      }

      try {
        const docRef = doc(reunion_db, 'applications_2025', applicant.value.id)
        await updateDoc(docRef, { rates: newCompensation.value })
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
          const docRef = doc(reunion_db, 'applications_2025', applicant.value.id)
          await updateDoc(docRef, { rates: null })
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

        const docRef = doc(reunion_db, 'applications_2025', applicant.value.id)
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

          const docRef = doc(reunion_db, 'applications_2025', applicant.value.id)
          await updateDoc(docRef, { settimes: updatedSettimes })

          applicant.value.settimes = updatedSettimes
          console.log('Set time removed for:', applicant.value.fullname)
        } catch (error) {
          console.error('Error removing set time:', error)
        }
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
      const subject = encodeURIComponent('Reunion 2025')
      const personalizedBody = contractEmailBody.value
        .replace('{name}', fullname || '')
        .replace('{roles}', roles || '')
        .replace('{id_code}', id_code || '')
      const body = encodeURIComponent(personalizedBody)
      return `mailto:${email}?subject=${subject}&body=${body}&cc=prasun.das.89@gmail.com`
    }

    const deliverTicket = (email, fullname, id_code) => {
      const subject = encodeURIComponent('Reunion 2025')
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
      deliverTicket
    }
  }
}
</script>

<style scoped>
.applicant-detail {
  max-width: 1200px;
  margin: 0 auto;
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
  grid-template-columns: 1fr;
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
}
</style>
