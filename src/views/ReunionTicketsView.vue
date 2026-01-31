<script setup>
import frog_image from '@/assets/images/frog.png'
import reunion_emblem from '../assets/images/reunion_emblem_white.png'
import ticket from '@/assets/images/icons/ticket.png'
import meals from '@/assets/images/icons/meals.png'
import footer from '@/assets/images/poster_footer_v1.png'
import bitcoin_icon from '../assets/images/bitcoin.svg?url'

import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { reunion_db } from '@/firebase'
import { getDoc, doc, setDoc } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { logEvent } from 'firebase/analytics'
import { reunion_analytics } from '@/firebase'

const form = ref({
  id_code_long: '',
  id_code: '',
  referral_id_code: '',
  fullname: '',
  email: '',
  phone: '',
  ticket_type: '',
  ticket_quantity: 0,
  selected_day: '',
  meal_packages: 0,
  meal_tickets_remaining: 0,
  payment_type: '',
  total_price: 0,
  paid: false,
  checked_in: false,
  timestamp: new Date().toISOString()
})

const ticket_image = ref(ticket)
const meals_image = ref(meals)

const btcRate = ref(0)
const paymentInstructions = ref('')
const isSubmitting = ref(false)

const route = useRoute()

const validateReferralID = async (referral_id_code) => {
  try {
    // First validate the format - ID codes should be exactly 5 characters, alphanumeric
    if (
      !referral_id_code ||
      referral_id_code.length !== 5 ||
      !/^[a-zA-Z0-9]{5}$/.test(referral_id_code)
    ) {
      alert(
        'Invalid ID_CODE format. ID_CODEs are exactly 5 alphanumeric characters (letters and numbers only).'
      )
      return
    }

    // Track referral code usage attempt
    logEvent(reunion_analytics, 'select_content', {
      content_type: 'referral_code',
      item_id: 'referral_validation_attempt'
    })

    // Check 2025 Applications
    const docRef = doc(reunion_db, 'applications_2025', referral_id_code)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      // Track successful referral validation
      logEvent(reunion_analytics, 'select_content', {
        content_type: 'referral_code',
        item_id: 'valid_referral_artist',
        content_name: 'Artist referral validated'
      })

      alert(
        `This Festivall ID_CODE is valid!\n Thanks for supporting your friend ${docSnap.data().fullname} at Reunion ${new Date().getFullYear()}.`
      )
      return
    }

    // Check 2025 Orders
    const docRef2025 = doc(reunion_db, 'orders_2025', referral_id_code)
    const docSnap2025 = await getDoc(docRef2025)
    if (docSnap2025.exists()) {
      // Track successful referral validation
      logEvent(reunion_analytics, 'select_content', {
        content_type: 'referral_code',
        item_id: 'valid_referral_customer',
        content_name: 'Customer referral validated'
      })

      alert(
        `This Festivall ID_CODE is valid!\n Thanks for supporting your friend ${docSnap2025.data().fullname} at Reunion ${new Date().getFullYear()}.`
      )
    } else {
      // Track invalid referral attempt
      logEvent(reunion_analytics, 'select_content', {
        content_type: 'referral_code',
        item_id: 'invalid_referral',
        content_name: 'Invalid referral code entered'
      })

      alert('Hmm, we could not find a matching Festivall ID_CODE. Please check your spelling.')
    }
  } catch (error) {
    console.error('Error validating referral ID_CODE:', error)
  }
}

const formatPhoneNumber = (phone) => {
  const cleaned = ('' + phone).replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]})${match[2]}-${match[3]}`
  }
  return phone
}

const handlePhoneInput = (event) => {
  form.value.phone = formatPhoneNumber(event.target.value)
}

const handleReferralIDInput = (event) => {
  // Only allow alphanumeric characters and limit to 5 characters
  const value = event.target.value
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 5)
    .toLowerCase()
  form.value.referral_id_code = value
}

const fetchBtcRate = async () => {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=cad'
    )
    btcRate.value = response.data.bitcoin.cad
  } catch (error) {
    console.error('Error fetching BTC rate:', error)
  }
}

const calculateMealTickets = () => {
  form.value.meal_tickets_remaining = form.value.meal_packages * 2
}

const calculateTotalPrice = () => {
  let ticketPrice = 0
  if (form.value.ticket_type === 'Weekend Pass') {
    ticketPrice = 140
  } else if (form.value.ticket_type === 'Day Pass') {
    ticketPrice = 80
  }

  // Calculate total fiat price
  let totalPrice = ticketPrice * form.value.ticket_quantity + form.value.meal_packages * 20

  if (form.value.payment_type === 'bitcoin') {
    totalPrice *= 0.75 // Apply 25% discount
    form.value.total_price = (totalPrice / btcRate.value).toFixed(8) // Store Bitcoin price
  } else if (form.value.payment_type === 'cash') {
    // Add cash admin fee: $20 per Weekend Pass, $10 per Day Pass
    const surchargePer =
      form.value.ticket_type === 'Weekend Pass'
        ? 20
        : form.value.ticket_type === 'Day Pass'
          ? 10
          : 0
    totalPrice += surchargePer * form.value.ticket_quantity
    form.value.total_price = totalPrice // Store fiat price with surcharge
  } else {
    form.value.total_price = totalPrice // Store fiat price (e-transfer or others)
  }
}

const generatePaymentInstructions = () => {
  if (form.value.payment_type === 'etransfer') {
    paymentInstructions.value = `Please etransfer $${form.value.total_price} CAD to humanoidtwo@gmail.com\nEnter this id_code in the message section: ${form.value.id_code}\nOrder Details:\nFull Name: ${form.value.fullname}\nTicket Type: ${form.value.ticket_type}\nTicket Quantity: ${form.value.ticket_quantity}\nMeal Packages: ${form.value.meal_packages}\nIf you still wish to get 25% off but need help getting setup with bitcoin, <a href='https://festivall.ca/bitcoinmeetup'>click here</a> to book a free workshop with us.`
  } else if (form.value.payment_type === 'bitcoin') {
    paymentInstructions.value = `Pay with BTC Pay Server:\n https://mainnet.demo.btcpayserver.org/api/v1/invoices?storeId=DhbYQPomEo8H3t79Kh4HsZYMnHdrHAskctcdekY2E9Jb&price=${form.value.total_price}&currency=BTC \nYour 25% discount has already been applied.\nOrder Details:\nFull Name: ${form.value.fullname}\nTicket Type: ${form.value.ticket_type}\nTicket Quantity: ${form.value.ticket_quantity}\nMeal Packages: ${form.value.meal_packages}`
  } else if (form.value.payment_type === 'cash') {
    const feeNote =
      form.value.ticket_type === 'Weekend Pass'
        ? '$20 per Weekend Pass'
        : form.value.ticket_type === 'Day Pass'
          ? '$10 per Day Pass'
          : '$0'
    paymentInstructions.value = `Please bring $${form.value.total_price} CAD in cash to the front gate.\nAn admin fee (${feeNote}) is included in your total.\nOrder Details:\nFull Name: ${form.value.fullname}\nTicket Type: ${form.value.ticket_type}\nTicket Quantity: ${form.value.ticket_quantity}\nMeal Packages: ${form.value.meal_packages}\nID Code: ${form.value.id_code}`
  }
}

const textPaymentInstructions = async () => {
  try {
    const smsInstructions = paymentInstructions.value.replace(/<[^>]*>/g, '') // Remove HTML tags for SMS
    await axios.post(
      'https://relayproxy.vercel.app/sms',
      {
        value1: form.value.phone,
        value2: smsInstructions,
        value3: 'Powered by Festivall'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error texting payment instructions:', error)
  }
}

const emailPaymentInstructions = async () => {
  try {
    const emailInstructions = paymentInstructions.value.replace(/\n/g, '<br />') // Add line breaks for email
    await axios.post(
      'https://relayproxy.vercel.app/email',
      {
        value1: form.value.email,
        value2: 'Payment Instructions - Reunion 2026',
        value3: emailInstructions
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error emailing payment instructions:', error)
  }
}

const addOrder = async () => {
  try {
    const nowIso = new Date().toISOString()
    // Compute fiat total (discount applied for bitcoin)
    let ticketPrice = 0
    if (form.value.ticket_type === 'Weekend Pass') ticketPrice = 140
    else if (form.value.ticket_type === 'Day Pass') ticketPrice = 80
    let fiatTotal =
      ticketPrice * (form.value.ticket_quantity || 0) + (form.value.meal_packages || 0) * 20
    if (form.value.payment_type === 'bitcoin') fiatTotal = fiatTotal * 0.75
    else if (form.value.payment_type === 'cash') {
      const surchargePer =
        form.value.ticket_type === 'Weekend Pass'
          ? 20
          : form.value.ticket_type === 'Day Pass'
            ? 10
            : 0
      fiatTotal += surchargePer * (form.value.ticket_quantity || 0)
    }

    const participantsDocRef = doc(reunion_db, 'participants_2026', form.value.id_code)

    // Build order object conditionally to avoid undefined values
    const orderData = {
      timestamp: form.value.timestamp || nowIso,
      payment_type: form.value.payment_type || '',
      currency: 'CAD',
      fiat_total_price_cad: Number(fiatTotal) || 0,
      paid: !!form.value.paid,
      payment_reference: null,
      ticket_type: form.value.ticket_type || '',
      selected_day: form.value.selected_day || '',
      original_ticket_quantity: Number(form.value.ticket_quantity || 0),
      ticket_quantity: Number(form.value.ticket_quantity || 0),
      meal_packages: Number(form.value.meal_packages || 0),
      meal_tickets_remaining: Number(form.value.meal_tickets_remaining || 0),
      checked_in: !!form.value.checked_in
    }

    // Only add btc fields if payment type is bitcoin
    if (form.value.payment_type === 'bitcoin') {
      orderData.btc_amount = Number(form.value.total_price) || 0
      orderData.btc_rate_cad = Number(btcRate.value || 0)
    }

    await setDoc(
      participantsDocRef,
      {
        id_code: form.value.id_code,
        id_code_long: form.value.id_code_long,
        status: 'customer',
        createdAt: nowIso,
        updatedAt: nowIso,
        contact: {
          fullname: form.value.fullname || '',
          email: form.value.email || '',
          phone: form.value.phone || ''
        },
        referral: {
          referral_id_code: form.value.referral_id_code || null
        },
        order: orderData,
        activity: {
          checked_in: !!form.value.checked_in
        }
      },
      { merge: true }
    )
    console.log('Wrote order to participants_2026')
  } catch (error) {
    console.error('Error writing document:', error)
  }
}

const submitForm = async () => {
  if (isSubmitting.value) return // Prevent duplicate submissions

  try {
    isSubmitting.value = true

    // Validate that they're purchasing something
    if (form.value.ticket_quantity === 0 && form.value.meal_packages === 0) {
      alert('Please select at least one ticket or meal package.')
      isSubmitting.value = false
      return
    }

    if (!form.value.id_code) {
      form.value.id_code_long = uuidv4()
      form.value.id_code = form.value.id_code_long.slice(0, 5)
    }
    calculateTotalPrice()
    calculateMealTickets()
    generatePaymentInstructions()
    await textPaymentInstructions()
    await emailPaymentInstructions()

    // Write to database FIRST
    await addOrder()

    // Only send Slack notification AFTER successful database write
    // Calculate display prices for Slack notification
    let displayPrice = ''
    if (form.value.payment_type === 'bitcoin') {
      displayPrice = `:bitcoin: ${form.value.total_price} BTC`
    } else {
      // For cash/etransfer, use the fiatTotal calculated in addOrder
      let ticketPrice = 0
      if (form.value.ticket_type === 'Weekend Pass') ticketPrice = 140
      else if (form.value.ticket_type === 'Day Pass') ticketPrice = 80
      let fiatTotal =
        ticketPrice * (form.value.ticket_quantity || 0) + (form.value.meal_packages || 0) * 20

      if (form.value.payment_type === 'cash') {
        const surchargePer =
          form.value.ticket_type === 'Weekend Pass'
            ? 20
            : form.value.ticket_type === 'Day Pass'
              ? 10
              : 0
        fiatTotal += surchargePer * (form.value.ticket_quantity || 0)
      }
      displayPrice = `:moneybag: $${fiatTotal}`
    }

    const response = await axios.post(
      'https://relayproxy.vercel.app/reunion_sales',
      {
        text: `:bust_in_silhouette: ${form.value.fullname}\\n:email: ${form.value.email}\\n:phone: ${form.value.phone}\\n:ticket: ${form.value.ticket_type}\\n:hash: ${form.value.ticket_quantity}\\n:knife_fork_plate: ${form.value.meal_packages}\\n:id: ${form.value.id_code}\\n:label: ${form.value.referral_id_code || 'None'}\\n${displayPrice}`
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    if (response.status === 200) {
      // Track successful ticket purchase
      logEvent(reunion_analytics, 'purchase', {
        transaction_id: form.value.id_code,
        value: form.value.total_price,
        currency: 'CAD',
        items: [
          {
            item_id: form.value.ticket_type.toLowerCase().replace(' ', '_'),
            item_name: form.value.ticket_type,
            item_category: 'ticket',
            quantity: form.value.ticket_quantity,
            price: form.value.total_price
          }
        ],
        payment_type: form.value.payment_type
      })
      // Track successful ticket purchase with Facebook Pixel
      if (typeof fbq !== 'undefined') {
        fbq('track', 'Purchase', {
          value: form.value.total_price,
          currency: 'CAD',
          content_name: form.value.ticket_type,
          content_category: 'Ticket',
          content_ids: [form.value.id_code],
          num_items: form.value.ticket_quantity
        })
      }

      alert(
        'Your ticket request has been submitted successfully!\nCheck your email and phone for payment instructions.'
      )

      form.value = {
        id_code_long: '',
        id_code: '',
        referral_id_code: '',
        fullname: '',
        email: '',
        phone: '',
        ticket_type: '',
        ticket_quantity: 1,
        selected_day: '',
        meal_packages: 1,
        payment_type: '',
        total_price: 0
      }
    } else {
      alert('Failed to submit the form.')
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    alert('An error occurred while submitting the form. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

// Analytics tracking functions
const trackTicketSelection = (ticketType) => {
  logEvent(reunion_analytics, 'add_to_cart', {
    currency: 'CAD',
    value: ticketType === 'Weekend Pass' ? 140 : 80,
    items: [
      {
        item_id: ticketType.toLowerCase().replace(' ', '_'),
        item_name: ticketType,
        item_category: 'ticket',
        quantity: 1
      }
    ]
  })
}

const trackPaymentMethodSelection = (paymentType) => {
  logEvent(reunion_analytics, 'select_content', {
    content_type: 'payment_method',
    item_id: paymentType,
    content_name: paymentType === 'etransfer' ? 'E-Transfer' : 'Bitcoin'
  })
}

// Track when someone starts filling out the form
const trackFormStart = () => {
  logEvent(reunion_analytics, 'begin_checkout', {
    currency: 'CAD'
  })
}

// Track when someone adds meal packages
const trackMealSelection = (mealPackages) => {
  if (mealPackages > 0) {
    logEvent(reunion_analytics, 'add_to_cart', {
      currency: 'CAD',
      value: mealPackages * 20,
      items: [
        {
          item_id: 'meal_package',
          item_name: 'Meal Package',
          item_category: 'food',
          quantity: mealPackages,
          price: 20
        }
      ]
    })
  }
}

// Combined handlers to avoid template formatting issues
const handleTicketTypeChange = () => {
  calculateTotalPrice()
  trackTicketSelection(form.value.ticket_type)
}

const handlePaymentTypeChange = () => {
  calculateTotalPrice()
  trackPaymentMethodSelection(form.value.payment_type)
}

const handleMealPackagesInput = () => {
  calculateMealTickets()
  calculateTotalPrice()
  trackMealSelection(form.value.meal_packages)
}

onMounted(() => {
  // Track page view for ticket page
  logEvent(reunion_analytics, 'page_view', {
    page_title: 'Reunion Tickets',
    page_location: window.location.href
  })

  fetchBtcRate()
  // if (import.meta.env.MODE === 'development') {
  //   form.value = {
  //     id_code_long: 'a2c4e' + uuidv4().slice(5),
  //     id_code: 'a2c4e',
  //     referral_id_code: '1b3d5',
  //     fullname: 'Second Ticket',
  //     email: 'dasrecord@protonmail.com',
  //     phone: '(306)491-6040',
  //     ticket_type: 'Weekend Pass',
  //     ticket_quantity: 1,
  //     selected_day: 'Saturday, August 30th, 2025',
  //     meal_packages: 0,
  //     meal_tickets_remaining: 0,
  //     payment_type: 'bitcoin',
  //     total_price: calculateTotalPrice(),
  //     paid: false,
  //     checked_in: false
  //   }
  // }

  const id_code = route.params.id_code
  if (id_code) {
    form.value.referral_id_code = id_code
    console.log('Prefilled referral_id_code:', id_code)
  } else {
    console.log('No referral ID_CODE provided in the URL.')
  }
})
</script>

<template>
  <div class="basic">
    <a href="/">
      <img
        src="@/assets/images/festivall_emblem_white.png"
        alt="Festivall Logo"
        class="logo"
        style="display: flex; align-items: center; height: auto; width: 100px; margin: auto"
      />
    </a>
    <h3 class="application-form">
      <div class="splash">
        <img
          :src="reunion_emblem"
          alt="reunion"
          class="reunion-emblem"
          style="cursor: pointer"
          @click="$router.push('/reunion')"
        />
        <img :src="frog_image" alt="frog" class="frog-image" />
      </div>
      <h1>Want to buy tickets for Reunion 2026?</h1>
      <h2>
        If you know an Artist's or Volunteer's
        <span class="highlight">Festivall ID_CODE</span><br />
        please enter it so they can earn a referral bonus.<br /><br />
      </h2>
      <h4 class="disclaimer">
        <div>
          <h1>Ticket Prices:<br /></h1>
          *Children 12 and under free!*<br />
          *Youth 18 and under must be accompanied by an adult.*<br /><br />
          <div class="bitcoin">
            <h2>
              <img :src="bitcoin_icon" alt="bitcoin" style="height: 16px; width: 16px" /> Earlybird
              pricing available until Dec 21st, 2025!
              <br />
            </h2>
          </div>

          <div class="ticket">
            <img :src="ticket_image" alt="meal ticket" class="icon" />
            <h2>
              <span class="highlight"> WEEKEND PASS</span><br />
              $140 CAD/PERSON/WEEKEND<br />
            </h2>
            <h3>
              (Valid from 12:00PM Friday September 4th, 2026 - 12:00PM Monday September 7th, 2026)
            </h3>
          </div>
          <div class="ticket">
            <img :src="ticket_image" alt="meal ticket" class="icon" />
            <h2>
              <span class="highlight"> DAY PASS</span><br />
              $80 CAD/PERSON/DAY<br />
            </h2>
            <h3>(Valid from 12:00PM - 12:00PM the following day)</h3>
          </div>
          <div class="ticket">
            <img :src="meals_image" alt="meals" class="icon" />
            <h2>
              <span class="highlight"> MEAL PACKAGE</span><br />
              $20 CAD/PERSON/DAY<br />
            </h2>
            <h3>
              (Includes 1 lunch and 1 supper<br />
              during scheduled service hours)
            </h3>
            <br />
            <h4>
              Our food is obtained from local Saskatchewan farmers via the Wandering Market.<br />
              Our seasonal menu will prepared by a Red Seal chef and her team.
            </h4>
          </div>

          <div class="bitcoin">
            <h2>
              25% off if you pay in Bitcoin
              <img :src="bitcoin_icon" alt="bitcoin" style="height: 16px; width: 16px" /><br />
            </h2>
            <h3>
              <span id="btc-rate">Current Exchange Rate: ${{ btcRate }} CAD/BTC</span>
            </h3>
          </div>
        </div>
      </h4>
      <br />
      <!-- FORM -->
      <form @submit.prevent="submitForm">
        <div class="form-section">
          <label for="referral_id_code">Referral ID_CODE:</label>
          <input
            type="text"
            id="referral_id_code"
            v-model="form.referral_id_code"
            placeholder="Enter a Festivall ID_CODE if you know one! (e.g., x7y8z9)"
            maxlength="5"
            @input="handleReferralIDInput"
            @blur="validateReferralID(form.referral_id_code)"
          />
        </div>
        <div class="form-section">
          <label for="name">Full Name:</label>
          <input
            type="text"
            id="name"
            v-model="form.fullname"
            placeholder="Please use your legal name."
            @focus="trackFormStart()"
            required
          />
        </div>
        <div class="form-section">
          <label for="email">Email:</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            placeholder="What is the best email to reach you at?"
            required
          />
        </div>
        <div class="form-section">
          <label for="phone">Phone:</label>
          <input
            type="tel"
            id="phone"
            v-model="form.phone"
            @input="handlePhoneInput"
            placeholder="123-456-7890"
            required
          />
        </div>
        <div class="form-section">
          <label for="ticket_type">Ticket Type:</label>
          <select
            id="ticket_type"
            v-model="form.ticket_type"
            @change="handleTicketTypeChange"
            required
          >
            <option value="" disabled>What kind of tickets would you like?</option>
            <option value="Weekend Pass">Weekend Pass - $140 CAD</option>
            <option value="Day Pass">Day Pass - $80 CAD</option>
          </select>
        </div>
        <div class="form-section">
          <label for="ticket_quantity">Ticket Quantity:</label>
          <input
            type="number"
            id="ticket_quantity"
            v-model="form.ticket_quantity"
            min="0"
            @input="calculateTotalPrice"
            required
          />
        </div>
        <div class="form-section" v-if="form.ticket_type === 'Day Pass'">
          <label for="day_selection">Select Day:</label>
          <select id="day_selection" v-model="form.selected_day" required>
            <option value="" disabled>Select a day</option>
            <option value="Friday, September 4th, 2026">Friday, September 4th, 2026</option>
            <option value="Saturday, September 5th, 2026">Saturday, September 5th, 2026</option>
            <option value="Sunday, September 6th, 2026">Sunday, September 6th, 2026</option>
          </select>
        </div>
        <div class="form-section">
          <label for="meal_packages">Meal Packages:</label>
          <input
            type="number"
            id="meal_packages"
            v-model="form.meal_packages"
            min="0"
            @input="handleMealPackagesInput"
          />
        </div>
        <div class="form-section">
          <label for="payment_type">Payment Type:</label>
          <select
            id="payment_type"
            v-model="form.payment_type"
            @change="handlePaymentTypeChange"
            required
          >
            <option value="" disabled>Choose a payment method.</option>
            <option value="etransfer">E-transfer</option>
            <option value="bitcoin">Bitcoin (25% off)</option>
            <option value="cash">Cash at the door (+admin fee)</option>
          </select>
        </div>
        <div class="total">
          <div v-if="form.payment_type === 'etransfer'">
            Total Fiat Price: ${{ form.total_price }} CAD<br />
            <span v-if="form.payment_type === 'etransfer'" class="bitcoin">
              (You could save ${{ (form.total_price * 0.25).toFixed(2) }} CAD by paying with
              Bitcoin)
              <br />
              <a class="highlight" href="https://festivall.ca/bitcoinmeetup">Click here</a> to book
              a free workshop with us.
            </span>
          </div>
          <div v-else-if="form.payment_type === 'bitcoin'">
            Total Price: {{ form.total_price }} BTC (25% Discount Applied)
          </div>
        </div>
        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'PROCESSING...' : 'CONFIRM' }}
        </button>
      </form>
      <div class="footer">
        <img :src="footer" alt="footer" style="max-width: 700px" />
      </div>
    </h3>
  </div>
</template>

<style scoped>
.reunion-emblem {
  border-radius: 0%;
  width: 75%;
}
.basic {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  justify-items: flex-start;
  align-items: center;
  text-align: center;
  padding: 1rem;
}
.splash {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem;
}
.frog-image {
  width: 100%;
  max-width: 150px;
}

.ticket {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid var(--reunion-frog-green);
  border-radius: 15px;
  padding: 0.5rem;
  margin: 0.5rem;
}
.icon {
  float: left;
  width: 50px;
  height: auto;
}

.application-form {
  width: 80vw;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 15px;
}
.form-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: auto;
  font-family: Helvetica;
  width: 100%;
}

label {
  display: flex;
  flex-direction: column;
  width: 33%;
  height: 40px;
  text-align: left;
  padding: 10px;
  background-color: var(--reunion-frog-green);
  color: white;
  border-radius: 15px 0 0 15px;
}
input,
textarea,
select {
  width: 67%;
  height: 42px;
  font-family: Helvetica;
  gap: 0.5rem;
  border-radius: 0 15px 15px 0;
  padding: 5px;
  margin: 5px;
}
button {
  background-color: white;
  color: black; /* Explicit text color for iOS Safari */
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 5px;
  /* iOS Safari specific fixes */
  -webkit-appearance: none;
  appearance: none;
  -webkit-text-fill-color: black;
  text-decoration: none;
  outline: none;
}
button:hover {
  background-color: var(--reunion-frog-green);
  color: white;
  -webkit-text-fill-color: white;
}
button:disabled {
  background-color: #ccc;
  color: #666;
  -webkit-text-fill-color: #666;
  cursor: not-allowed;
}
button:disabled:hover {
  background-color: #ccc;
  color: #666;
  -webkit-text-fill-color: #666;
}
.highlight {
  color: var(--reunion-frog-green);
  text-shadow: 0px 0px 5px rgba(255, 255, 255, 0.5);
}
.bitcoin {
  color: var(--bitcoin-orange);
  font-weight: bold;
}

@media (max-width: 600px) {
  .application-form {
    width: 100%;
    padding: 0.5rem;
  }

  .form-section {
    flex-direction: column;
    align-items: flex-start;
  }

  label {
    width: 100%;
    height: auto;
    padding: 5px;
    border-radius: 15px 15px 0 0;
  }

  input,
  textarea,
  select {
    width: 100%;
    height: auto;
    padding: 5px;
    margin: 5px 0;
    border-radius: 0 0 15px 15px;
  }

  button {
    padding: 5px;
  }

  .basic {
    padding: 0.5rem;
  }

  .form-section,
  label,
  input,
  textarea,
  select,
  button {
    font-size: 0.8rem;
  }
}
.footer {
  background-color: white;
  padding: 1rem;
  border-radius: 15px;
  margin-top: 1rem;
}
.footer img {
  width: 100%;
  max-width: 700px;
}
</style>
