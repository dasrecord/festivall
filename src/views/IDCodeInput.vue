<template>
  <div class="id-code-input">
    <img :src="festivall_emblem" style="width: 100px" alt="Festivall Emblem" class="emblem" />
    <h1>Reunion Festival</h1>
    <img :src="frog_image" style="width: 200px" alt="Frog" class="frog" />

    <h3>Enter Your ID Code</h3>

    <form @submit.prevent="checkIdCode">
      <input type="text" v-model="idCode" placeholder="" required />
      <button type="submit">ENTER</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>

  <!-- Email Verification Modal -->
  <div v-if="showEmailVerifyModal" class="ev-modal" @click.self="cancelEmailVerify">
    <div class="ev-modal-content" @click.stop>
      <button class="ev-close" @click="cancelEmailVerify">✕</button>
      <h2 style="color:var(--reunion-frog-green);margin:0 0 0.5rem;">🔐 Verify Your Identity</h2>
      <p style="color:#ccc;margin:0 0 1.25rem;font-size:0.95rem;">Enter the email address associated with this ticket.</p>
      <div style="width:100%;text-align:left;">
        <label style="color:white;font-size:0.9rem;display:block;margin-bottom:4px;">Email Address:</label>
        <input
          type="email"
          v-model="emailVerifyInput"
          placeholder="you@example.com"
          @keyup.enter="submitEmailVerify"
          autofocus
          class="ev-input"
        />
      </div>
      <button class="ev-btn" @click="submitEmailVerify">Continue</button>
      <button class="ev-btn ev-btn-cancel" @click="cancelEmailVerify">Cancel</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import festivall_emblem from '@/assets/images/festivall_emblem_black.png'
import frog_image from '@/assets/images/frog.png'
import { sendReunionDevops } from '/scripts/notifications.js'

export default {
  name: 'EnterIDCode',
  setup() {
    const idCode = ref('')
    const errorMessage = ref('')
    const router = useRouter()
    const route = useRoute()

    const showEmailVerifyModal = ref(false)
    const emailVerifyInput = ref('')
    let _emailVerifyResolve = null
    const promptEmail = () => new Promise((resolve) => {
      emailVerifyInput.value = ''
      _emailVerifyResolve = resolve
      showEmailVerifyModal.value = true
    })
    const submitEmailVerify = () => {
      showEmailVerifyModal.value = false
      _emailVerifyResolve?.(emailVerifyInput.value.trim())
    }
    const cancelEmailVerify = () => {
      showEmailVerifyModal.value = false
      _emailVerifyResolve?.(null)
    }

    const checkIdCode = async () => {
      try {
        // Convert to lowercase since UUIDs are stored in lowercase
        const normalizedIdCode = idCode.value.toLowerCase()

        // Check if the ID code exists in 'participants_2026'
        const q = query(
          collection(reunion_db, 'participants_2026'),
          where('id_code', '==', normalizedIdCode)
        )
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const participantData = querySnapshot.docs[0].data()
          const participantEmail = (participantData.contact?.email || '').toLowerCase().trim()

          const enteredEmail = await promptEmail()
          if (enteredEmail === null) return // user cancelled

          if (enteredEmail.toLowerCase().trim() !== participantEmail) {
            errorMessage.value = 'Email does not match. Please try again.'
            sendReunionDevops(
              `⚠️ *Failed Login — Email Mismatch*\n*Page:* ${route.path}\n*ID Code:* \`${normalizedIdCode}\`\n*Entered Email:* ${enteredEmail.toLowerCase().trim()}\n*Time:* ${new Date().toISOString()}\n*User Agent:* ${navigator.userAgent}`
            )
            return
          }

          // Store verification so TicketPageView skips its own prompt
          sessionStorage.setItem(`verified_${normalizedIdCode}`, 'true')
          const paymentType = participantData.order?.payment_type || participantData.payment_type || ''
          const hasApplicantTypes = Array.isArray(participantData.roles?.applicant_types) && participantData.roles.applicant_types.length > 0
          const isInKindParticipant = paymentType === 'inkind' || paymentType === 'In Kind' || (paymentType === '' && hasApplicantTypes)
          const contractSigned = participantData.contract?.signed === true

          if (isInKindParticipant && !contractSigned) {
            router.push({ name: 'ContractPage', params: { id_code: normalizedIdCode } })
          } else {
            router.push({ name: 'TicketPage', params: { id_code: normalizedIdCode } })
          }
        } else {
          errorMessage.value = 'Invalid ID code. Please try again.'
          sendReunionDevops(
            `⚠️ *Failed Login — Invalid ID Code*\n*Page:* ${route.path}\n*Attempted Code:* \`${normalizedIdCode}\`\n*Time:* ${new Date().toISOString()}\n*User Agent:* ${navigator.userAgent}`
          )
        }
      } catch (error) {
        console.error('Error checking ID code:', error)
        errorMessage.value = 'An error occurred. Please contact webmaster.'
      }
    }

    return {
      festivall_emblem,
      frog_image,
      idCode,
      errorMessage,
      checkIdCode,
      showEmailVerifyModal,
      emailVerifyInput,
      submitEmailVerify,
      cancelEmailVerify,
    }
  }
}
</script>

<style scoped>
.id-code-input {
  padding: 2rem;
  background-color: #f9f9f9;
  color: #333;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 2rem auto;
  text-align: center;
}

h1 {
  color: var(--reunion-frog-green);
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

input {
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: 100%;
  max-width: 300px;
  margin-bottom: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  background-color: var(--reunion-frog-green);
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #404224;
}

.error {
  color: red;
  margin-top: 1rem;
}

/* Email verification modal */
.ev-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}
.ev-modal-content {
  background: #111;
  border: 2px solid var(--reunion-frog-green);
  border-radius: 14px;
  padding: 1.75rem 1.5rem 1.25rem;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.ev-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  padding: 0;
  font-size: 14px;
  cursor: pointer;
}
.ev-input {
  width: 100%;
  max-width: 100% !important;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--reunion-frog-green);
  background: #1a1a1a;
  color: white;
  -webkit-text-fill-color: white;
  font-size: 1rem;
  margin-bottom: 0.75rem;
}
.ev-btn {
  width: 80%;
  max-width: 220px;
  padding: 0.65rem 1.5rem;
  background: var(--reunion-frog-green);
  color: white;
  border: 2px solid var(--reunion-frog-green);
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 0.5rem;
}
.ev-btn-cancel {
  background: transparent;
  color: white;
  border-color: white;
  margin-top: 0.4rem;
}
</style>
