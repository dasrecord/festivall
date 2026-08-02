<template>
  <div class="song-request-container">
    <div class="song-request-card">
      <h1 class="page-title">🎵 Request a Song</h1>
      <p class="page-subtitle">Choose a support option to submit your request!</p>
      
      <form @submit.prevent="submitRequest" class="request-form">
        <!-- Artist Name -->
        <div class="form-section">
          <label for="artist">Artist</label>
          <input 
            id="artist"
            v-model="form.artist" 
            type="text"
            placeholder="e.g., Daft Punk"
            required
          />
        </div>

        <!-- Song Title -->
        <div class="form-section">
          <label for="title">Song Title</label>
          <input 
            id="title"
            v-model="form.title" 
            type="text"
            placeholder="e.g., One More Time"
            required
          />
        </div>

        <!-- Remix/Version (Optional) -->
        <div class="form-section">
          <label for="remix">Remix/Version</label>
          <input 
            id="remix"
            v-model="form.remix" 
            type="text"
            placeholder="Optional (e.g., Radio Edit, Live)"
          />
        </div>

        <!-- Your Name -->
        <div class="form-section">
          <label for="name">Your Name</label>
          <input 
            id="name"
            v-model="form.name" 
            type="text"
            placeholder="Optional"
          />
        </div>

        <!-- Email -->
        <div class="form-section">
          <label for="email">Your Email</label>
          <input 
            id="email"
            v-model="form.email" 
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <!-- Payment Option Selection (REQUIRED) -->
        <div class="payment-section">
          <h3 class="payment-title">💚 Choose How to Support Your DJs *</h3>
          <p class="payment-subtitle">Select one option to submit your request:</p>
          
          <div class="payment-options">
            <!-- Option 1: Cash Tip -->
            <label class="payment-option" :class="{ selected: form.paymentOption === 'cash' }">
              <input 
                type="radio" 
                name="payment" 
                value="cash" 
                v-model="form.paymentOption"
                required
              />
              <div class="option-content">
                <span class="option-icon">💵</span>
                <div class="option-text">
                  <strong>$3 Cash Tip</strong>
                  <small>Hand us cash at the DJ booth</small>
                </div>
              </div>
            </label>

            <!-- Option 2: E-Transfer -->
            <label class="payment-option" :class="{ selected: form.paymentOption === 'etransfer' }">
              <input 
                type="radio" 
                name="payment" 
                value="etransfer" 
                v-model="form.paymentOption"
                required
              />
              <div class="option-content">
                <span class="option-icon">📧</span>
                <div class="option-text">
                  <strong>E-Transfer</strong>
                  <small>reunion@festivall.ca</small>
                </div>
              </div>
            </label>

            <!-- Option 3: Buy Drinks -->
            <label class="payment-option" :class="{ selected: form.paymentOption === 'drinks' }">
              <input 
                type="radio" 
                name="payment" 
                value="drinks" 
                v-model="form.paymentOption"
                required
              />
              <div class="option-content">
                <span class="option-icon">🍹</span>
                <div class="option-text">
                  <strong>Buy Us Drinks</strong>
                  <small>Surprise us at the bar!</small>
                </div>
              </div>
            </label>

            <!-- Option 4: Bitcoin -->
            <label class="payment-option" :class="{ selected: form.paymentOption === 'bitcoin' }">
              <input 
                type="radio" 
                name="payment" 
                value="bitcoin" 
                v-model="form.paymentOption"
                required
              />
              <div class="option-content">
                <span class="option-icon">₿</span>
                <div class="option-text">
                  <strong>Bitcoin Tip</strong>
                  <small>Send BTC now</small>
                </div>
              </div>
            </label>

            <!-- Option 5: Mailing List -->
            <label class="payment-option" :class="{ selected: form.paymentOption === 'mailinglist' }">
              <input 
                type="radio" 
                name="payment" 
                value="mailinglist" 
                v-model="form.paymentOption"
                required
              />
              <div class="option-content">
                <span class="option-icon">🎉</span>
                <div class="option-text">
                  <strong>Join Our Festival Mailing List</strong>
                  <small>Stay in the loop for future events</small>
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- Payment Details Based on Selection -->
        <transition name="fade">
          <div v-if="form.paymentOption === 'etransfer'" class="payment-details">
            <h4>📧 E-Transfer Instructions</h4>
            <p class="detail-text">
              Send to: <strong>reunion@festivall.ca</strong><br>
              No password needed (auto-deposit enabled)
            </p>
          </div>
        </transition>

        <transition name="fade">
          <div v-if="form.paymentOption === 'bitcoin'" class="payment-details bitcoin-details">
            <h4>₿ Bitcoin Payment</h4>
            
            <!-- CAD to BTC Calculator -->
            <div class="form-section mini">
              <label for="cadAmount">CAD Amount</label>
              <input 
                id="cadAmount"
                v-model.number="cadAmount" 
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 5.00"
                @input="convertCadToBtc"
              />
            </div>

            <div v-if="btcAmount" class="conversion-result">
              <p class="btc-value">{{ btcAmount }} BTC <span class="btc-sats">({{ satsAmount }} sats)</span></p>
              <p class="rate-info">Rate: 1 BTC = ${{ btcPriceCAD.toLocaleString() }} CAD</p>
            </div>

            <div class="address-container">
              <code class="btc-address">{{ bitcoinAddress }}</code>
              <button type="button" @click="copyAddress" class="copy-btn" :class="{ copied: addressCopied }">
                {{ addressCopied ? '✓' : '📋' }}
              </button>
            </div>
          </div>
        </transition>

        <transition name="fade">
          <div v-if="form.paymentOption === 'mailinglist'" class="payment-details">
            <h4>🎉 Join Our Festival Mailing List</h4>
            <p class="detail-text">
              We'll add you to the Festivall mailing list and keep you posted on events near you.
            </p>
          </div>
        </transition>

        <!-- Submit Button -->
        <button type="submit" class="submit-btn" :disabled="isSubmitting || !form.paymentOption">
          {{ isSubmitting ? 'Sending Request...' : '🎶 Submit Request' }}
        </button>

        <!-- Success Message -->
        <transition name="fade">
          <div v-if="requestSubmitted" class="success-message">
            ✅ Request sent! {{ getSuccessMessage() }}
          </div>
        </transition>
      </form>

      <div class="footer">
        <p>Powered by <a href="https://festivall.ca" target="_blank">Festivall</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { logEvent } from 'firebase/analytics'
import { festivall_analytics, festivall_db } from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useHead } from '@vueuse/head'
import axios from 'axios'

useHead({
  title: 'DJ Song Requests & Tips',
  meta: [
    { name: 'description', content: 'Request songs from your DJs or send Bitcoin tips!' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

// Song Request Form
const form = ref({
  artist: '',
  title: '',
  remix: '',
  name: '',
  paymentOption: '',
  email: ''
})

const requestSubmitted = ref(false)
const isSubmitting = ref(false)

// Bitcoin Calculator
const bitcoinAddress = ref('bc1q3se6zjjpd9qz6scdz4604tu9qm6ps6m79fvye5')
const cadAmount = ref(null)
const btcAmount = ref(null)
const satsAmount = ref(null)
const btcPriceCAD = ref(0)
const getPaymentLabel = (option) => {
  const labels = {
    cash: '💵 $3 Cash',
    etransfer: '📧 E-Transfer',
    bitcoin: '₿ Bitcoin',
    drinks: '🍹 Drinks',
    mailinglist: '🎉 Mailing List'
  }
  return labels[option] || option
}

const getSuccessMessage = () => {
  const messages = {
    cash: 'Come find us at the DJ booth!',
    etransfer: 'Check your email for confirmation.',
    bitcoin: 'Your DJs will see it soon!',
    drinks: 'We\'ll be waiting at the bar!',
    mailinglist: 'You\'re now on our list!'
  }
  return messages[form.value.paymentOption] || 'Your DJs will see it soon!'
}

const sendSlackNotification = async (requestData) => {
  const remixText = requestData.remix ? ` (${requestData.remix})` : ''
  const nameText = requestData.name ? `\nRequested by: ${requestData.name}` : ''
  const paymentLabel = getPaymentLabel(requestData.paymentOption)
  const emailText = requestData.email ? `\nEmail: ${requestData.email}` : ''
  
  const message = `🎵 *New Song Request*\n\n*Artist:* ${requestData.artist}\n*Title:* ${requestData.title}${remixText}${nameText}\n*Support:* ${paymentLabel}${emailText}\n\n_Submitted at ${new Date().toLocaleTimeString()}_`

  try {
    await axios.post('https://relayproxy.vercel.app/festivall_notifications', {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message
          }
        }
      ]
    })
  } catch (error) {
    console.error('Error sending Slack notification:', error)
  }
}

const submitRequest = async () => {
  // Validate payment option selected
  if (!form.value.paymentOption || isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    const requestData = {
      artist: form.value.artist,
      title: form.value.title,
      remix: form.value.remix || null,
      name: form.value.name || 'Anonymous',
      paymentOption: form.value.paymentOption,
      email: form.value.email || null,
      timestamp: serverTimestamp(),
      source: 'wedding_dj_portal'
    }

    // Save to Firestore
    await addDoc(collection(festivall_db, 'song_requests'), requestData)
    
    // If mailing list option, also save to mailing list collection
    if (form.value.paymentOption === 'mailinglist' && form.value.email) {
      await addDoc(collection(festivall_db, 'wedding_mailing_list'), {
        email: form.value.email,
        timestamp: serverTimestamp(),
        source: 'song_request_portal'
      })
    }
    
    // Send Slack notification
    await sendSlackNotification(requestData)
    
    // Track analytics
    logEvent(festivall_analytics, 'song_request', {
      artist: form.value.artist,
      title: form.value.title,
      has_remix: !!form.value.remix,
      has_name: !!form.value.name,
      payment_option: form.value.paymentOption
    })
    
    // Show success and reset form
    requestSubmitted.value = true
    
    setTimeout(() => {
      form.value = {
        artist: '',
        title: '',
        remix: '',
        name: '',
        paymentOption: '',
        email: ''
      }
      requestSubmitted.value = false
    }, 3000)
    
  } catch (error) {
    console.error('Error submitting request:', error)
    alert('Oops! Something went wrong. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

// Fetch Bitcoin price in CAD
const fetchBitcoinPrice = async () => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=cad')
    btcPriceCAD.value = response.data.bitcoin.cad
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error)
    // Fallback price if API fails
    btcPriceCAD.value = 85000
  }
}

const convertCadToBtc = () => {
  if (!cadAmount.value || cadAmount.value <= 0 || btcPriceCAD.value === 0) {
    btcAmount.value = null
    satsAmount.value = null
    return
  }
  
  const btc = cadAmount.value / btcPriceCAD.value
  btcAmount.value = btc.toFixed(8)
  satsAmount.value = Math.round(btc * 100000000).toLocaleString()
}

const copyAddress = async () => {
  try {
    await navigator.clipboard.writeText(bitcoinAddress.value)
    addressCopied.value = true
    
    // Track analytics
    logEvent(festivall_analytics, 'bitcoin_address_copied', {
      address: bitcoinAddress.value
    })
    
    setTimeout(() => {
      addressCopied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy address:', error)
    // Fallback: select the text
    const addressElement = document.querySelector('.btc-address')
    if (addressElement) {
      const range = document.createRange()
      range.selectNode(addressElement)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)
    }
  }
}

onMounted(() => {
  fetchBitcoinPrice()
  // Refresh price every 5 minutes
  setInterval(fetchBitcoinPrice, 300000)
})
</script>

<style scoped>
/* Reunion Theme Styling */
.song-request-container {
  min-height: 100vh;
  background-color: #000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: Helvetica, Arial, sans-serif;
}

.song-request-card {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--reunion-frog-green, #767a44);
  border-radius: 15px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.page-title {
  font-size: 2rem;
  margin: 0 0 0.5rem;
  text-align: center;
  color: var(--reunion-frog-green, #767a44);
  font-weight: bold;
}

.page-subtitle {
  text-align: center;
  color: #ddd;
  margin: 0 0 2rem;
  font-size: 1.1rem;
}

.request-form {
  width: 100%;
}

.form-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: auto;
  width: 100%;
  margin-bottom: 1rem;
}

.form-section > label {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 33%;
  min-height: 40px;
  text-align: left;
  padding: 10px;
  background-color: var(--reunion-frog-green, #767a44);
  color: white;
  border-radius: 15px 0 0 15px;
  font-weight: bold;
  font-size: 0.95rem;
}

.form-section > input {
  width: 67%;
  min-height: 40px;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 1rem;
  border: 1px solid #444;
  border-radius: 0 15px 15px 0;
  padding: 10px;
  background-color: white;
  color: black;
}

.form-section > input:focus {
  outline: none;
  border-color: var(--reunion-frog-green, #767a44);
}

.form-section > input::placeholder {
  color: #999;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  margin-top: 1rem;
  font-size: 1.1rem;
  font-weight: bold;
  background-color: var(--reunion-frog-green, #767a44);
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: #8a8f55;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(118, 122, 68, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message {
  background-color: rgba(76, 175, 80, 0.2);
  border: 1px solid var(--reunion-frog-green, #767a44);
  color: var(--reunion-frog-green, #767a44);
  font-weight: bold;
  text-align: center;
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
}

/* Payment Section */
.payment-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: rgba(118, 122, 68, 0.1);
  border: 2px solid var(--reunion-frog-green, #767a44);
  border-radius: 15px;
}

.payment-title {
  font-size: 1.2rem;
  color: var(--reunion-frog-green, #767a44);
  margin: 0 0 0.5rem;
  text-align: center;
  font-weight: bold;
}

.payment-subtitle {
  font-size: 0.9rem;
  color: #bbb;
  margin: 0 0 1.5rem;
  text-align: center;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.03);
  border: 2px solid #444;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-option:hover {
  background-color: rgba(255, 255, 255, 0.08);
  border-color: var(--reunion-frog-green, #767a44);
}

.payment-option.selected {
  background-color: rgba(118, 122, 68, 0.2);
  border-color: var(--reunion-frog-green, #767a44);
  box-shadow: 0 0 0 2px rgba(118, 122, 68, 0.3);
}

.payment-option input[type="radio"] {
  width: auto;
  min-height: auto;
  margin-right: 1rem;
  cursor: pointer;
  accent-color: var(--reunion-frog-green, #767a44);
}

.option-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.option-icon {
  font-size: 1.5rem;
  min-width: 30px;
  text-align: center;
}

.option-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.option-text strong {
  color: #fff;
  font-size: 0.95rem;
}

.option-text small {
  color: #999;
  font-size: 0.8rem;
}

/* Payment Details */
.payment-details {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid #444;
  border-radius: 10px;
}

.payment-details h4 {
  color: var(--reunion-frog-green, #767a44);
  margin: 0 0 1rem;
  font-size: 1.1rem;
}

.payment-details.bitcoin-details h4 {
  color: #f7931a;
}

.detail-text {
  line-height: 1.6;
  color: #ddd;
  margin: 0;
}

.form-section.mini {
  margin-bottom: 1rem;
}

.form-section.mini label {
  width: 40%;
}

.form-section.mini input {
  width: 60%;
}

.conversion-result {
  margin: 1rem 0;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.btc-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #f7931a;
  font-family: monospace;
  margin: 0 0 0.5rem;
}

.btc-sats {
  font-size: 0.85rem;
  color: #888;
  font-weight: normal;
}

.rate-info {
  font-size: 0.8rem;
  color: #888;
  margin: 0;
}

.address-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.btc-address {
  flex: 1;
  font-family: monospace;
  font-size: 0.75rem;
  color: #f7931a;
  word-break: break-all;
  background-color: transparent;
  padding: 0;
}

.copy-btn {
  padding: 0.5rem 0.75rem;
  background-color: var(--reunion-frog-green, #767a44);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: bold;
  white-space: nowrap;
  transition: all 0.2s ease;
  min-width: 50px;
}

.copy-btn:hover {
  background-color: #8a8f55;
}

.copy-btn.copied {
  background-color: #4caf50;
}

.info-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid #333;
  display: none; /* Hidden - not needed anymore */
}

.info-text {
  text-align: center;
  color: #bbb;
  font-size: 0.95rem;
  line-height: 1.8;
  margin: 0;
}

.footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #333;
  color: #888;
  font-size: 0.9rem;
}

.footer a {
  color: var(--reunion-frog-green, #767a44);
  text-decoration: none;
  font-weight: bold;
}

.footer a:hover {
  text-decoration: underline;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .song-request-card {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .bitcoin-title {
    font-size: 1.3rem;
  }

  .form-section {
    flex-direction: column;
    align-items: stretch;
  }

  .form-section > label {
    width: 100%;
    border-radius: 15px 15px 0 0;
    font-size: 0.9rem;
  }

  .form-section > input {
    width: 100%;
    border-radius: 0 0 15px 15px;
    font-size: 0.95rem;
  }

  .submit-btn {
    font-size: 1rem;
    padding: 12px;
  }

  .info-text {
    font-size: 0.9rem;
  }

  .btc-address {
    font-size: 0.75rem;
  }

  .copy-btn {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
  }

  .btc-value {
    font-size: 1.1rem;
  }
}
</style>
