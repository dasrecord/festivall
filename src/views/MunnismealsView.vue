<template>
  <div class="page">
    <div class="banner">
      <RouterLink to="/services" class="back-link">← Services</RouterLink>
      <h1>MUNNI'S MEALS</h1>
      <span></span>
    </div>

    <!-- CLOSED STATE -->
    <div v-if="!config.accepting_orders" class="content">
      <div class="budget-card">
        <div class="card-header"><span class="card-title">Orders Closed</span></div>
        <p class="muted">We're not taking orders right now. Check back soon!</p>
      </div>
    </div>

    <!-- OPEN STATE -->
    <div v-else class="content">

      <!-- SUCCESS STATE -->
      <div v-if="submitted" class="budget-card success-card">
        <div class="card-header"><span class="card-title">Order Received!</span></div>
        <p class="muted">Thank you! Your order has been submitted. We'll be in touch to confirm.</p>
        <button class="btn-primary" @click="resetForm">Place Another Order</button>
      </div>

      <template v-else>
        <!-- MENU -->
        <div class="section-label">Menu</div>
        <div class="menu-grid">
          <div class="budget-card menu-item" v-for="item in config.menu" :key="item.id">
            <div class="card-header">
              <div>
                <span class="card-title">{{ item.name }}</span>
                <span class="bengali">{{ item.bengali }}</span>
              </div>
              <span class="price">${{ item.price }}</span>
            </div>
            <p class="desc">{{ item.desc }}</p>
            <div class="qty-row">
              <button class="qty-btn" @click="decrement(item.id)" :disabled="quantities[item.id] === 0">−</button>
              <span class="qty-val">{{ quantities[item.id] }}</span>
              <button class="qty-btn" @click="increment(item.id)">+</button>
            </div>
          </div>
        </div>

        <div class="budget-card subtotal-card">
          <div class="line-item">
            <span class="muted">Subtotal</span>
            <span>${{ subtotal }}</span>
          </div>
          <div class="line-item" v-if="form.fulfillment === 'delivery'">
            <span class="muted">Delivery fee</span>
            <span>${{ config.delivery_fee }}</span>
          </div>
          <div class="line-item total">
            <span>Total</span>
            <span>${{ total }}</span>
          </div>
        </div>

        <!-- FULFILLMENT -->
        <div class="section-label">Fulfillment</div>
        <div class="budget-card">
          <div class="radio-row">
            <label class="radio-label">
              <input type="radio" v-model="form.fulfillment" value="delivery" />
              Delivery (+${{ config.delivery_fee }})
            </label>
            <label class="radio-label">
              <input type="radio" v-model="form.fulfillment" value="pickup" />
              Pickup ({{ config.pickup_hours }})
            </label>
          </div>
          <div class="form-section" style="margin-top: 8px;">
            <label for="order_date">Date needed</label>
            <input type="date" id="order_date" v-model="form.order_date" required />
          </div>
          <p v-if="dateError" class="field-error">{{ dateError }}</p>
          <div class="form-section" v-if="form.fulfillment === 'delivery'">
            <label for="address">Delivery address</label>
            <input type="text" id="address" v-model="form.address" required />
          </div>
        </div>

        <!-- CONTACT -->
        <div class="section-label">Contact</div>
        <div class="budget-card">
          <div class="form-section">
            <label for="c_name">Name</label>
            <input type="text" id="c_name" v-model="form.name" required />
          </div>
          <div class="form-section">
            <label for="c_email">Email</label>
            <input type="email" id="c_email" v-model="form.email" required />
          </div>
          <div class="form-section">
            <label for="c_phone">Phone</label>
            <input type="tel" id="c_phone" v-model="form.phone" />
          </div>
        </div>

        <!-- PAYMENT -->
        <div class="section-label">Payment</div>
        <div class="budget-card">
          <div class="radio-row">
            <label class="radio-label green">
              <input type="radio" v-model="form.payment" value="bitcoin" />
              Bitcoin (Preferred)
            </label>
            <label class="radio-label">
              <input type="radio" v-model="form.payment" value="cash" />
              Cash
            </label>
            <label class="radio-label">
              <input type="radio" v-model="form.payment" value="etransfer" />
              E-Transfer
            </label>
          </div>
          <div class="payment-info" v-if="form.payment === 'bitcoin'">
            <p class="muted">We'll send you a Bitcoin invoice with your order confirmation.</p>
          </div>
          <div class="payment-info" v-else-if="form.payment === 'cash'">
            <p class="muted">Pay at the time of pickup/delivery.</p>
          </div>
          <div class="payment-info" v-else-if="form.payment === 'etransfer'">
            <p class="muted">Send payment to: <strong>{{ config.etransfer_address }}</strong>. Use your name as the message.</p>
          </div>
        </div>

        <!-- SUBMIT -->
        <div class="budget-card submit-card">
          <p v-if="submitError" class="field-error">{{ submitError }}</p>
          <button class="btn-primary" @click="submitOrder" :disabled="submitting">
            {{ submitting ? 'Submitting...' : 'PLACE ORDER' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { sendFestivallNotifications } from '/scripts/notifications.js'
import { MUNNIS_CONFIG } from '@/config/munnisConfig.js'

const config = MUNNIS_CONFIG
const submitted = ref(false)
const submitting = ref(false)
const dateError = ref('')
const submitError = ref('')

const quantities = reactive(
  Object.fromEntries(config.menu.map((item) => [item.id, 0]))
)

const form = reactive({
  fulfillment: 'pickup',
  order_date: '',
  address: '',
  name: '',
  email: '',
  phone: '',
  payment: 'bitcoin'
})

const increment = (id) => { quantities[id]++ }
const decrement = (id) => { if (quantities[id] > 0) quantities[id]-- }

const subtotal = computed(() =>
  config.menu.reduce((sum, item) => sum + item.price * quantities[item.id], 0)
)

const total = computed(() =>
  subtotal.value + (form.fulfillment === 'delivery' ? config.delivery_fee : 0)
)

const validateDate = () => {
  if (!form.order_date) {
    dateError.value = 'Please select a date.'
    return false
  }
  const selected = new Date(form.order_date)
  const minDate = new Date()
  minDate.setHours(minDate.getHours() + config.advance_hours)
  if (selected < minDate) {
    dateError.value = `Orders require at least ${config.advance_hours} hours advance notice.`
    return false
  }
  dateError.value = ''
  return true
}

const resetForm = () => {
  submitted.value = false
  Object.keys(quantities).forEach((k) => { quantities[k] = 0 })
  Object.assign(form, { fulfillment: 'pickup', order_date: '', address: '', name: '', email: '', phone: '', payment: 'bitcoin' })
}

const submitOrder = async () => {
  submitError.value = ''
  if (subtotal.value === 0) {
    submitError.value = 'Please add at least one item to your order.'
    return
  }
  if (!form.name || !form.email) {
    submitError.value = 'Please fill in your name and email.'
    return
  }
  if (!validateDate()) return
  if (!form.payment) {
    submitError.value = 'Please select a payment method.'
    return
  }

  const itemLines = config.menu
    .filter((item) => quantities[item.id] > 0)
    .map((item) => `  ${item.name} × ${quantities[item.id]} = $${item.price * quantities[item.id]}`)
    .join('\n')

  const text = `🍽 *New Munni's Meals Order*\n\n*Items:*\n${itemLines}\n\n*Subtotal:* $${subtotal.value}\n*Fulfillment:* ${form.fulfillment}${form.fulfillment === 'delivery' ? ` (+$${config.delivery_fee}) → ${form.address}` : ''}\n*Date:* ${form.order_date}\n*Total:* $${total.value}\n\n*Contact:*\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone || 'n/a'}\n*Payment:* ${form.payment}`

  submitting.value = true
  try {
    await sendFestivallNotifications(text)
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
h1 { font-size: 13px; letter-spacing: 0.12em; color: var(--festivall-baby-blue); margin: 0; }

.content { max-width: 800px; margin: 0 auto; padding: 1rem; }

.section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #666;
  margin: 1rem 0 2px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1px;
  background-color: #2a2a2e;
  margin-bottom: 1px;
}

.budget-card { background-color: #252528; padding: 0.75rem; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #333;
  padding-bottom: 0.35rem;
  margin-bottom: 0.5rem;
}

.card-title { font-size: 12px; font-weight: 600; color: #ccc; display: block; }
.bengali { font-size: 11px; color: #666; display: block; }
.price { font-size: 13px; font-weight: 700; color: var(--festivall-baby-blue); white-space: nowrap; }
.desc { font-size: 11px; color: #888; line-height: 1.5; margin: 0 0 0.5rem; }

.qty-row { display: flex; align-items: center; gap: 8px; }
.qty-btn {
  width: 26px; height: 26px;
  background-color: #1f1e22;
  border: 1px solid #555;
  border-radius: 3px;
  color: #e0e0e0;
  font-size: 14px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.qty-btn:disabled { opacity: 0.3; cursor: default; }
.qty-btn:hover:not(:disabled) { border-color: var(--festivall-baby-blue); }
.qty-val { font-size: 13px; font-weight: 600; min-width: 20px; text-align: center; }

.subtotal-card { margin-bottom: 0; }
.line-item { display: flex; justify-content: space-between; font-size: 12px; padding: 3px 0; }
.line-item.total { border-top: 1px solid #333; margin-top: 4px; padding-top: 6px; font-weight: 700; }

.radio-row { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.5rem; }
.radio-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: #ccc; cursor: pointer;
}
.radio-label.green { color: #4caf50; }
.radio-label input[type='radio'] { accent-color: var(--festivall-baby-blue); }

.payment-info { margin-top: 0.5rem; padding: 0.5rem; background-color: #1f1e22; border-radius: 4px; }
.payment-info p { margin: 0; font-size: 11px; }

.form-section {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  margin-bottom: 6px;
}
.form-section label {
  width: 30%; min-width: 110px;
  font-size: 11px; padding: 8px 10px;
  background-color: var(--festivall-baby-blue); color: #000;
  border-radius: 4px 0 0 4px; display: flex; align-items: center;
}
.form-section input {
  flex: 1; font-size: 11px; padding: 8px 10px;
  background-color: #1a1a1d; color: #e0e0e0;
  border: 1px solid #444; border-left: none;
  border-radius: 0 4px 4px 0; outline: none;
}
.form-section input:focus { border-color: var(--festivall-baby-blue); }

.muted { font-size: 11px; color: #888; margin: 0; }
.field-error { font-size: 11px; color: #ef5350; margin: 4px 0; }

.submit-card { margin-top: 1px; }
.success-card p { margin: 0.5rem 0 1rem; }

.btn-primary {
  width: 100%; padding: 10px;
  background-color: var(--festivall-baby-blue); color: #000;
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  border: none; border-radius: 4px; cursor: pointer;
}
.btn-primary:hover:not(:disabled) { background-color: #fff; }
.btn-primary:disabled { opacity: 0.5; cursor: default; }

@media (max-width: 600px) {
  .form-section { flex-direction: column; }
  .form-section label { width: 100%; border-radius: 4px 4px 0 0; min-width: unset; }
  .form-section input { border-left: 1px solid #444; border-top: none; border-radius: 0 0 4px 4px; }
}
</style>
