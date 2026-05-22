<template>
  <div class="page">
    <div class="banner">
      <RouterLink to="/services" class="back-link">← Services</RouterLink>
      <h1>BITCOIN WORKSHOP</h1>
      <span></span>
    </div>

    <div class="content">
      <!-- SUCCESS STATE -->
      <div v-if="submitted" class="budget-card success-card">
        <div class="card-header"><span class="card-title">Request Received!</span></div>
        <p class="muted">Thanks! We'll be in touch to confirm your free workshop session.</p>
        <button class="btn-primary" @click="submitted = false">Book Another</button>
      </div>

      <template v-else>
        <div class="budget-card intro-card">
          <div class="card-header"><span class="card-title">Free Bitcoin Workshop</span></div>
          <p class="muted">Whether you're completely new to Bitcoin or want to learn more, we'll meet you at your level. Fill out the form below and we'll reach out to schedule a free one-on-one session.</p>
        </div>

        <div class="section-label">Your Request</div>
        <div class="budget-card">
          <div class="form-section">
            <label for="b_name">Name</label>
            <input type="text" id="b_name" v-model="form.name" required />
          </div>
          <div class="form-section">
            <label for="b_email">Email</label>
            <input type="email" id="b_email" v-model="form.email" required />
          </div>
          <div class="form-section">
            <label for="b_phone">Phone (optional)</label>
            <input type="tel" id="b_phone" v-model="form.phone" />
          </div>
          <div class="form-section">
            <label for="b_topic">Topic</label>
            <select id="b_topic" v-model="form.topic" required>
              <option value="" disabled>Select a topic...</option>
              <option value="General Bitcoin Intro">General Bitcoin Intro</option>
              <option value="Wallet Setup">Wallet Setup</option>
              <option value="Bitcoin for Merchants">Bitcoin for Merchants</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="form-section">
            <label for="b_date">Preferred date</label>
            <!--
              TODO: Replace this date input with Google Calendar free-slot picker
              when configured with the Calendar API (https://calendar.app.google/18VPBcwYU6HLcpL98)
            -->
            <input type="date" id="b_date" v-model="form.preferred_date" required />
          </div>
          <div class="form-section">
            <label for="b_time">Preferred time</label>
            <select id="b_time" v-model="form.preferred_time" required>
              <option value="" disabled>Select...</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
            </select>
          </div>
          <div class="form-section">
            <label for="b_msg">Message</label>
            <textarea id="b_msg" v-model="form.message"></textarea>
          </div>
        </div>

        <div class="budget-card submit-card">
          <p v-if="submitError" class="field-error">{{ submitError }}</p>
          <button class="btn-primary" @click="submitRequest" :disabled="submitting">
            {{ submitting ? 'Submitting...' : 'REQUEST WORKSHOP' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { sendReunionSlack } from '/scripts/notifications.js'

const submitted = ref(false)
const submitting = ref(false)
const submitError = ref('')

const form = reactive({
  name: '',
  email: '',
  phone: '',
  topic: '',
  preferred_date: '',
  preferred_time: '',
  message: ''
})

const submitRequest = async () => {
  submitError.value = ''
  if (!form.name || !form.email || !form.topic || !form.preferred_date || !form.preferred_time) {
    submitError.value = 'Please fill in all required fields.'
    return
  }

  const text = `₿ *Bitcoin Workshop Request*\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone || 'n/a'}\nTopic: ${form.topic}\nPreferred Date: ${form.preferred_date}\nPreferred Time: ${form.preferred_time}\nMessage: ${form.message || 'n/a'}`

  submitting.value = true
  try {
    await sendReunionSlack(text)
    submitted.value = true
  } catch (err) {
    console.error(err)
    submitError.value = 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page {
  width: 100%;
  min-height: 100vh;
  background-color: #1f1e22;
  color: #e0e0e0;
  padding-bottom: 3rem;
}

.banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  padding: 0.75rem 1rem;
}

.back-link { font-size: 11px; color: var(--festivall-baby-blue); text-decoration: none; }
h1 { font-size: 13px; letter-spacing: 0.12em; color: #ff9900; margin: 0; }

.content { max-width: 700px; margin: 0 auto; padding: 1rem; }

.section-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: #666; margin: 1rem 0 2px;
}

.budget-card { background-color: #252528; padding: 0.75rem; margin-bottom: 1px; }

.card-header {
  border-bottom: 1px solid #333; padding-bottom: 0.35rem; margin-bottom: 0.5rem;
}
.card-title { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #ccc; }

.muted { font-size: 12px; color: #888; line-height: 1.6; margin: 0 0 0.5rem; }

.form-section {
  display: flex; flex-direction: row; align-items: stretch; margin-bottom: 6px;
}
.form-section label {
  width: 30%; min-width: 130px;
  font-size: 11px; padding: 8px 10px;
  background-color: var(--festivall-baby-blue); color: #000;
  border-radius: 4px 0 0 4px; display: flex; align-items: center;
}
.form-section input,
.form-section select,
.form-section textarea {
  flex: 1; font-size: 11px; padding: 8px 10px;
  background-color: #1a1a1d; color: #e0e0e0;
  border: 1px solid #444; border-left: none;
  border-radius: 0 4px 4px 0; outline: none;
}
.form-section textarea { min-height: 70px; resize: vertical; }
.form-section input:focus,
.form-section select:focus,
.form-section textarea:focus { border-color: var(--festivall-baby-blue); }
.form-section select option { background-color: #252528; color: #e0e0e0; }

.submit-card { margin-top: 1px; }
.success-card p { margin: 0.5rem 0 1rem; }

.field-error { font-size: 11px; color: #ef5350; margin: 0 0 6px; }

.btn-primary {
  width: 100%; padding: 10px;
  background-color: #ff9900; color: #000;
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  border: none; border-radius: 4px; cursor: pointer;
}
.btn-primary:hover:not(:disabled) { background-color: #ffb84d; }
.btn-primary:disabled { opacity: 0.5; cursor: default; }

@media (max-width: 600px) {
  .form-section { flex-direction: column; }
  .form-section label { width: 100%; border-radius: 4px 4px 0 0; min-width: unset; }
  .form-section input,
  .form-section select,
  .form-section textarea { border-left: 1px solid #444; border-top: none; border-radius: 0 0 4px 4px; }
}
</style>
