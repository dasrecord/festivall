<template>
  <div class="bbp-admin">
    <!-- Unauthenticated State -->
    <div v-if="!isAuthenticated" class="auth-required">
      <h2>🔒 Authentication Required</h2>
      <p>Please log in to access the Bitcoin Block Party admin dashboard.</p>
      <RouterLink to="/login" class="login-button">Go to Login</RouterLink>
    </div>

    <!-- Unauthorized State (logged in but not BBP admin) -->
    <div v-else-if="!isAdmin" class="access-denied">
      <h2>⛔ Access Denied</h2>
      <p>You do not have permission to access the Bitcoin Block Party admin dashboard.</p>
      <RouterLink to="/dashboard" class="back-button">Go to Dashboard</RouterLink>
    </div>

    <!-- Admin Interface -->
    <div v-else class="admin-interface">
      <!-- Edit Contact Modal -->
      <div v-if="editingApplicant" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>✏️ Edit Contact Info</h2>
            <button @click="closeEditModal" class="modal-close">✕</button>
          </div>
          <div class="modal-body">
            <p class="modal-subtitle">{{ editingApplicant.contact_name }} ({{ editingApplicant.role }})</p>
            <div class="edit-field">
              <label>Email *</label>
              <input 
                type="email" 
                v-model="editForm.email" 
                placeholder="email@example.com"
                class="edit-input"
              />
            </div>
            <div class="edit-field">
              <label>Phone *</label>
              <input 
                type="tel" 
                v-model="editForm.phone" 
                placeholder="+1 (555) 555-5555"
                class="edit-input"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeEditModal" class="btn-cancel">Cancel</button>
            <button @click="saveContactInfo" class="btn-save" :disabled="!editForm.email.trim() || !editForm.phone.trim()">
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <!-- Header -->
      <div class="header">
        <RouterLink to="/bitcoinblockparty" class="back-link">← Bitcoin Block Party</RouterLink>
        <h1>₿ Bitcoin Block Party Admin</h1>
        <p>Manage sponsors, vendors, and volunteers for {{ BBP.year }}</p>
      </div>

      <!-- Stats Overview -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-label">Sponsors</div>
          <div class="stat-value">{{ stats.sponsors.pending }} pending</div>
          <div class="stat-subvalue">{{ stats.sponsors.onboarded }} onboarded</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Vendors</div>
          <div class="stat-value">{{ stats.vendors.pending }} pending</div>
          <div class="stat-subvalue">{{ stats.vendors.onboarded }} onboarded</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Volunteers</div>
          <div class="stat-value">{{ stats.volunteers.pending }} pending</div>
          <div class="stat-subvalue">{{ stats.volunteers.onboarded }} onboarded</div>
        </div>
      </div>

      <!-- Role Filter Tabs -->
      <div class="filter-tabs">
        <button
          v-for="tab in roleTabs"
          :key="tab.value"
          class="filter-tab"
          :class="{ active: selectedRole === tab.value }"
          @click="selectedRole = tab.value"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <!-- Status Filter & Search -->
      <div class="controls">
        <div class="status-filters">
          <label class="status-filter">
            <input type="radio" v-model="selectedStatus" value="all" />
            All
          </label>
          <label class="status-filter">
            <input type="radio" v-model="selectedStatus" value="pending" />
            Pending
          </label>
          <label class="status-filter">
            <input type="radio" v-model="selectedStatus" value="onboarded" />
            Onboarded
          </label>
        </div>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search by name, email, or organization..."
          class="search-input"
        />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        Loading applicants...
      </div>

      <!-- Applicant Table -->
      <div v-else-if="filteredApplicants.length > 0" class="applicants-table">
        <div class="table-header">
          <div class="col-name">Name</div>
          <div class="col-contact">Contact</div>
          <div class="col-org">Organization / Tier</div>
          <div class="col-status">Status</div>
          <div class="col-actions">Actions</div>
        </div>
        <div
          v-for="applicant in filteredApplicants"
          :key="applicant.id"
          class="applicant-row"
          :class="{ onboarded: applicant.status === 'onboarded' }"
        >
          <div class="col-name">
            <strong>{{ applicant.contact_name }}</strong>
            <div class="role-badge" :class="applicant.role">{{ applicant.role }}</div>
          </div>
          <div class="col-contact">
            <div v-if="applicant.email" class="contact-item">
              📧 {{ applicant.email }}
            </div>
            <div v-if="applicant.phone" class="contact-item">
              📱 {{ applicant.phone }}
            </div>
            <div v-if="!applicant.email || !applicant.phone" class="contact-warning">
              ⚠️ Missing {{ !applicant.email ? 'email' : 'phone' }}
            </div>
          </div>
          <div class="col-org">
            <div v-if="applicant.org_name">{{ applicant.org_name }}</div>
            <div v-if="applicant.tier" class="tier-badge">{{ applicant.tier }}</div>
          </div>
          <div class="col-status">
            <span class="status-badge" :class="applicant.status">
              {{ applicant.status }}
            </span>
            <div v-if="applicant.onboarding?.sent_at" class="onboarding-info">
              Sent {{ formatDate(applicant.onboarding.sent_at) }}
              <br />by {{ applicant.onboarding.sent_by_email }}
            </div>
          </div>
          <div class="col-actions">
            <div v-if="!canOnboard(applicant) && applicant.status === 'pending'" class="missing-contact-warning">
              ⚠️ Cannot onboard: missing {{ getMissingFields(applicant) }}
              <button @click="editContact(applicant)" class="btn-edit-contact">✏️ Edit Contact</button>
            </div>
            <button
              v-else-if="applicant.status === 'pending'"
              @click="onboardApplicant(applicant)"
              :disabled="onboardingStates[applicant.id]?.sending"
              class="btn-onboard"
            >
              {{ onboardingStates[applicant.id]?.sending ? 'Sending...' : '✉️ Onboard' }}
            </button>
            <button
              v-else-if="applicant.status === 'onboarded' && applicant.onboarding?.sent_at"
              @click="confirmResend(applicant)"
              :disabled="onboardingStates[applicant.id]?.sending"
              class="btn-resend"
            >
              {{ onboardingStates[applicant.id]?.sending ? 'Sending...' : '🔄 Resend' }}
            </button>
            <div v-if="onboardingStates[applicant.id]?.error" class="error-message">
              {{ onboardingStates[applicant.id].error }}
            </div>
            <div v-if="onboardingStates[applicant.id]?.success" class="success-message">
              ✅ {{ onboardingStates[applicant.id].success }}
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <p>No {{ selectedStatus === 'all' ? '' : selectedStatus }} {{ selectedRole }} applicants found.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore'
import { festivall_db } from '@/firebase'
import { useBitcoinBlockPartyAdmin } from '@/composables/useBitcoinBlockPartyAdmin'
import { BITCOIN_BLOCK_PARTY as BBP } from '@/config/bitcoinBlockPartyConfig'
import { sendEmail, sendSMS } from '/scripts/notifications.js'

// Auth
const isAuthenticated = ref(false)
const { isAdmin, currentUser } = useBitcoinBlockPartyAdmin()

onMounted(() => {
  isAuthenticated.value = !!localStorage.getItem('user')
})

// Role tabs
const roleTabs = [
  { value: 'all', label: 'All', icon: '📋' },
  { value: 'sponsor', label: 'Sponsors', icon: '₿' },
  { value: 'vendor', label: 'Vendors', icon: '🏪' },
  { value: 'volunteer', label: 'Volunteers', icon: '🙌' },
]

// State
const applicants = ref([])
const loading = ref(false)
const selectedRole = ref('all')
const selectedStatus = ref('all')
const searchQuery = ref('')
const onboardingStates = reactive({})

// Stats
const stats = computed(() => {
  const result = {
    sponsors: { pending: 0, onboarded: 0 },
    vendors: { pending: 0, onboarded: 0 },
    volunteers: { pending: 0, onboarded: 0 },
  }
  applicants.value.forEach((app) => {
    const category = app.role === 'volunteer' ? 'volunteers' : `${app.role}s`
    if (result[category]) {
      if (app.status === 'pending') result[category].pending++
      else if (app.status === 'onboarded') result[category].onboarded++
    }
  })
  return result
})

// Filtered applicants
const filteredApplicants = computed(() => {
  let result = applicants.value

  // Role filter
  if (selectedRole.value !== 'all') {
    result = result.filter((app) => app.role === selectedRole.value)
  }

  // Status filter
  if (selectedStatus.value !== 'all') {
    result = result.filter((app) => app.status === selectedStatus.value)
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (app) =>
        app.contact_name?.toLowerCase().includes(query) ||
        app.email?.toLowerCase().includes(query) ||
        app.org_name?.toLowerCase().includes(query)
    )
  }

  return result.sort((a, b) => {
    // Pending first, then by submission date (newest first)
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    return new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0)
  })
})

// Load applicants
async function loadApplicants() {
  loading.value = true
  try {
    const allApplicants = []

    // Load sponsors and vendors from bbp_applications_2026
    const appsSnapshot = await getDocs(collection(festivall_db, BBP.collections.applications))
    appsSnapshot.forEach((docSnap) => {
      const data = docSnap.data()
      if (data.role === 'sponsor' || data.role === 'vendor') {
        allApplicants.push({
          id: docSnap.id,
          role: data.role,
          contact_name: data.contact_name || '',
          email: data.email || '',
          phone: data.phone || '',
          org_name: data.org_name || '',
          tier: data.tier || '',
          status: data.status || 'pending',
          submitted_at: data.submitted_at || '',
          onboarding: data.onboarding || null,
        })
      }
    })

    // Load volunteers from bbp_volunteers_2026
    const volsSnapshot = await getDocs(collection(festivall_db, BBP.collections.volunteers))
    volsSnapshot.forEach((docSnap) => {
      const data = docSnap.data()
      allApplicants.push({
        id: docSnap.id,
        role: data.role || 'volunteer',
        contact_name: data.contact_name || '',
        email: data.email || '',
        phone: data.phone || '',
        org_name: '',
        tier: '',
        status: data.status || 'pending',
        submitted_at: data.submitted_at || '',
        onboarding: data.onboarding || null,
      })
    })

    applicants.value = allApplicants
  } catch (error) {
    console.error('Error loading applicants:', error)
  } finally {
    loading.value = false
  }
}

// Watch for admin status and load data when authenticated
watch(isAdmin, (newValue) => {
  if (newValue && applicants.value.length === 0) {
    loadApplicants()
  }
}, { immediate: true })

// Validation
function canOnboard(applicant) {
  return !!(applicant.email && applicant.phone)
}

// Helper to show what's missing
function getMissingFields(applicant) {
  const missing = []
  if (!applicant.email) missing.push('email')
  if (!applicant.phone) missing.push('phone')
  return missing.join(' and ')
}

// Edit contact modal
const editingApplicant = ref(null)
const editForm = ref({ email: '', phone: '' })

function editContact(applicant) {
  editingApplicant.value = applicant
  editForm.value = {
    email: applicant.email || '',
    phone: applicant.phone || ''
  }
}

function closeEditModal() {
  editingApplicant.value = null
  editForm.value = { email: '', phone: '' }
}

async function saveContactInfo() {
  if (!editingApplicant.value) return
  
  try {
    const collectionName = editingApplicant.value.role === 'volunteer' 
      ? BBP.collections.volunteers 
      : BBP.collections.applications
    
    await updateDoc(doc(festivall_db, collectionName, editingApplicant.value.id), {
      email: editForm.value.email.trim(),
      phone: editForm.value.phone.trim()
    })
    
    // Update local state
    const index = applicants.value.findIndex(a => a.id === editingApplicant.value.id)
    if (index !== -1) {
      applicants.value[index].email = editForm.value.email.trim()
      applicants.value[index].phone = editForm.value.phone.trim()
    }
    
    closeEditModal()
  } catch (error) {
    console.error('Error updating contact info:', error)
    alert('Failed to update contact info. Please try again.')
  }
}

// Onboarding templates
function getOnboardingTemplates(applicant) {
  const role = applicant.role
  const name = applicant.contact_name || 'there'
  const eventDate = BBP.date
  const venue = `${BBP.venue}, ${BBP.city}`
  const contactEmail = BBP.contactEmail

  const templates = {
    sponsor: {
      emailSubject: `Bitcoin Block Party ${BBP.year} — Sponsor Onboarding`,
      emailBody: `Hi ${name},\n\nThank you for sponsoring Bitcoin Block Party ${BBP.year}!\n\nEvent Details:\n• Date: ${eventDate}\n• Location: ${venue}\n• Time: ${BBP.startTime} - ${BBP.endTime}\n\nNext Steps:\n1. Review your sponsorship tier benefits\n2. Provide your logo and materials (high-res)\n3. Confirm your booth/table requirements\n4. Let us know if you plan to give away any items\n\nWe'll follow up with detailed logistics closer to the event.\n\nQuestions? Reply to this email or contact ${contactEmail}.\n\nBest,\nBitcoin Block Party Team`,
      smsBody: `Hi ${name}! Thanks for sponsoring Bitcoin Block Party ${BBP.year} on ${eventDate} at ${venue}. Check your email for onboarding details. Questions? ${contactEmail}`,
    },
    vendor: {
      emailSubject: `Bitcoin Block Party ${BBP.year} — Vendor Onboarding`,
      emailBody: `Hi ${name},\n\nWelcome as a vendor at Bitcoin Block Party ${BBP.year}!\n\nEvent Details:\n• Date: ${eventDate}\n• Location: ${venue}\n• Time: ${BBP.startTime} - ${BBP.endTime}\n\nNext Steps:\n1. Confirm your Bitcoin payment setup (required)\n2. List the items you'll be selling\n3. Let us know your power/table requirements\n4. Provide any special setup needs\n\nVendor setup begins 2 hours before doors open.\n\nQuestions? Reply to this email or contact ${contactEmail}.\n\nBest,\nBitcoin Block Party Team`,
      smsBody: `Hi ${name}! You're confirmed as a vendor for Bitcoin Block Party ${BBP.year} on ${eventDate} at ${venue}. Check your email for setup details. ${contactEmail}`,
    },
    volunteer: {
      emailSubject: `Bitcoin Block Party ${BBP.year} — Volunteer Onboarding`,
      emailBody: `Hi ${name},\n\nThank you for volunteering at Bitcoin Block Party ${BBP.year}!\n\nEvent Details:\n• Date: ${eventDate}\n• Location: ${venue}\n• Time: ${BBP.startTime} - ${BBP.endTime}\n\nNext Steps:\n1. Confirm your availability and preferred shift\n2. Arrival time: 11:30 AM for volunteer briefing\n3. Bring comfortable shoes and a positive attitude!\n\nVolunteers receive:\n• Free admission\n• Volunteer t-shirt\n• Meal voucher\n• Good vibes and Bitcoin community connections\n\nWe'll send shift assignments and final details 1 week before the event.\n\nQuestions? Reply to this email or contact ${contactEmail}.\n\nBest,\nBitcoin Block Party Team`,
      smsBody: `Hi ${name}! Thanks for volunteering at Bitcoin Block Party ${BBP.year} on ${eventDate}. Check your email for details. Briefing at 11:30 AM. ${contactEmail}`,
    },
  }

  return templates[role] || templates.volunteer
}

// Onboard applicant
async function onboardApplicant(applicant) {
  if (!canOnboard(applicant)) {
    onboardingStates[applicant.id] = {
      error: 'Missing required contact info (email and phone)',
    }
    setTimeout(() => delete onboardingStates[applicant.id], 5000)
    return
  }

  // Check idempotency
  if (applicant.onboarding?.sent_at && applicant.status === 'onboarded') {
    const confirm = window.confirm(
      `This applicant was already onboarded on ${formatDate(applicant.onboarding.sent_at)}. Resend onboarding messages?`
    )
    if (!confirm) return
  }

  onboardingStates[applicant.id] = { sending: true, error: null, success: null }

  try {
    const templates = getOnboardingTemplates(applicant)

    // Send email and SMS in parallel
    const [emailResult, smsResult] = await Promise.allSettled([
      sendEmail(applicant.email, templates.emailSubject, templates.emailBody),
      sendSMS(applicant.phone, templates.smsBody),
    ])

    // Check for failures
    const emailFailed = emailResult.status === 'rejected'
    const smsFailed = smsResult.status === 'rejected'

    if (emailFailed && smsFailed) {
      throw new Error('Both email and SMS failed. Please check contact info and try again.')
    }

    if (emailFailed || smsFailed) {
      const failedChannel = emailFailed ? 'Email' : 'SMS'
      console.error(`${failedChannel} failed:`, emailFailed ? emailResult.reason : smsResult.reason)
      throw new Error(`${failedChannel} failed. Please verify contact info and try again.`)
    }

    // Both succeeded - update Firestore
    const collectionName =
      applicant.role === 'volunteer' ? BBP.collections.volunteers : BBP.collections.applications

    const onboardingMetadata = {
      status: 'onboarded',
      onboarding: {
        sent_at: new Date().toISOString(),
        sent_by_uid: currentUser.value?.uid || '',
        sent_by_email: currentUser.value?.email || '',
        channels: ['email', 'sms'],
        template_version: '1.0',
        resends: applicant.onboarding?.sent_at
          ? [
              ...(applicant.onboarding.resends || []),
              {
                sent_at: new Date().toISOString(),
                sent_by_uid: currentUser.value?.uid || '',
              },
            ]
          : [],
      },
    }

    await updateDoc(doc(festivall_db, collectionName, applicant.id), onboardingMetadata)

    // Update local state
    const index = applicants.value.findIndex((a) => a.id === applicant.id)
    if (index !== -1) {
      applicants.value[index] = {
        ...applicants.value[index],
        ...onboardingMetadata,
      }
    }

    onboardingStates[applicant.id] = {
      sending: false,
      success: 'Onboarding sent successfully!',
    }

    setTimeout(() => {
      if (onboardingStates[applicant.id]?.success) {
        delete onboardingStates[applicant.id]
      }
    }, 5000)
  } catch (error) {
    console.error('Onboarding error:', error)
    onboardingStates[applicant.id] = {
      sending: false,
      error: error.message || 'Failed to send onboarding messages.',
    }

    setTimeout(() => {
      if (onboardingStates[applicant.id]?.error) {
        delete onboardingStates[applicant.id]
      }
    }, 8000)
  }
}

// Confirm resend
function confirmResend(applicant) {
  onboardApplicant(applicant)
}

// Format date
function formatDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<style scoped>
.bbp-admin {
  min-height: 100vh;
  background: #0a0a0a;
  color: #e0e0e0;
  font-family: var(--bbp-font-family);
}

/* Auth States */
.auth-required,
.access-denied {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 2rem;
}

.auth-required h2,
.access-denied h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #f7931a;
}

.login-button,
.back-button {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.75rem 2rem;
  background: #f7931a;
  color: #000;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s;
}

.login-button:hover,
.back-button:hover {
  transform: scale(1.05);
}

/* Admin Interface */
.admin-interface {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  margin-bottom: 2rem;
}

.back-link {
  color: #f7931a;
  text-decoration: none;
  font-size: 0.9rem;
  display: inline-block;
  margin-bottom: 0.5rem;
}

.back-link:hover {
  text-decoration: underline;
}

.header h1 {
  font-size: 2.5rem;
  margin: 0.5rem 0;
  color: #f7931a;
}

.header p {
  color: #888;
  font-size: 1rem;
}

/* Stats Overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1.25rem;
}

.stat-label {
  font-size: 0.85rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f7931a;
}

.stat-subvalue {
  font-size: 0.9rem;
  color: #aaa;
  margin-top: 0.25rem;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #333;
  padding-bottom: 0.5rem;
}

.filter-tab {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 0.95rem;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.filter-tab:hover {
  color: #f7931a;
}

.filter-tab.active {
  color: #f7931a;
  border-bottom-color: #f7931a;
}

/* Controls */
.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.status-filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.status-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.status-filter input {
  cursor: pointer;
}

.search-input {
  flex: 1;
  min-width: 300px;
  padding: 0.75rem;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 0.95rem;
}

.search-input:focus {
  outline: none;
  border-color: #f7931a;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #888;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #333;
  border-top-color: #f7931a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Applicants Table */
.applicants-table {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1.5fr 2fr 1.5fr 1fr 1.5fr;
  gap: 1rem;
  padding: 1rem;
  background: #111;
  border-bottom: 1px solid #333;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #888;
}

.applicant-row {
  display: grid;
  grid-template-columns: 1.5fr 2fr 1.5fr 1fr 1.5fr;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #222;
  transition: background 0.2s;
}

.applicant-row:hover {
  background: #151515;
}

.applicant-row.onboarded {
  opacity: 0.7;
}

.col-name strong {
  display: block;
  margin-bottom: 0.25rem;
}

.role-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-badge.sponsor {
  background: rgba(247, 147, 26, 0.2);
  color: #f7931a;
}

.role-badge.vendor {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.role-badge.volunteer {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
}

.contact-item {
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.contact-warning {
  color: #ff9800;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.tier-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.status-badge {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
}

.status-badge.onboarded {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.onboarding-info {
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.5rem;
  line-height: 1.4;
}

.btn-onboard,
.btn-resend {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-onboard {
  background: #f7931a;
  color: #000;
}

.btn-onboard:hover:not(:disabled) {
  background: #ff9f2e;
  transform: translateY(-1px);
}

.btn-onboard:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-resend {
  background: #444;
  color: #e0e0e0;
}

.btn-resend:hover:not(:disabled) {
  background: #555;
}

.error-message {
  color: #f44336;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.success-message {
  color: #4caf50;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.missing-contact-warning {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #ff9800;
  padding: 0.5rem;
  background: rgba(255, 152, 0, 0.1);
  border-radius: 6px;
}

.btn-edit-contact {
  padding: 0.4rem 0.8rem;
  background: #f7931a;
  color: #000;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;
}

.btn-edit-contact:hover {
  background: #ff9f2e;
  transform: translateY(-1px);
}

/* Edit Contact Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #333;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #f7931a;
}

.modal-close {
  background: none;
  border: none;
  color: #888;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #f7931a;
}

.modal-body {
  padding: 1.5rem;
}

.modal-subtitle {
  color: #888;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.edit-field {
  margin-bottom: 1.25rem;
}

.edit-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #aaa;
}

.edit-input {
  width: 100%;
  padding: 0.75rem;
  background: #0a0a0a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 1rem;
  box-sizing: border-box;
}

.edit-input:focus {
  outline: none;
  border-color: #f7931a;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #333;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid #555;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #222;
}

.btn-save {
  padding: 0.75rem 1.5rem;
  background: #f7931a;
  border: none;
  border-radius: 6px;
  color: #000;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #ff9f2e;
  transform: translateY(-1px);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  padding: 4rem;
  text-align: center;
  color: #666;
}

/* Responsive */
@media (max-width: 1200px) {
  .table-header,
  .applicant-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .col-name,
  .col-contact,
  .col-org,
  .col-status,
  .col-actions {
    display: flex;
    flex-direction: column;
  }
}
</style>
