<template>
  <div class="contract-page" v-if="applicant">
    <img :src="festivall_emblem" style="height: 50px; width: 75px" alt="Festivall Emblem" />
    <h1>
      Reunion Festival<br />
      {{ applicant.applicant_types.join(' and ') }} Contract
    </h1>
    <img :src="frog_image" style="height: 100px; width: 100px" alt="Frog" />
    <!-- <h2>Powered by Festivall</h2> -->
    <h3 class="preamble">PREAMBLE</h3>
    <p>
      This {{ applicant.applicant_types.join(' and ').toUpperCase() }} Contract (the “Contract”) is
      entered into <strong>{{ currentDate }}</strong> (the “Effective Date”), by and between
      <strong>REUNION FESTIVAL</strong>, with an address of
      <strong>Blucher No. 343, Elstow, Saskatchewan</strong> (the “REUNION FESTIVAL”) and
      <strong>{{ applicant.fullname }}</strong
      >, with an address of
      <strong
        >{{ applicant.street_address }}, {{ applicant.city }}, {{ applicant.province }},
        {{ applicant.country }}, {{ applicant.postal_code }}</strong
      >, (the "{{ applicant.applicant_types.join(' and ').toUpperCase() }}"), also individually
      referred to as (the “Party”) and collectively, (the “Parties). The REUNION FESTIVAL wishes to
      engage the {{ applicant.applicant_types.join(' and ').toUpperCase() }} to provide
      {{ applicant.applicant_types.join(' and ').toUpperCase() }} services.
    </p>

    <h3 class="red">1. EVENT DATE & DESCRIPTION</h3>
    <p>
      <strong>Venue:</strong> Reunion Festival Grounds (51°57'46.6"N 106°03'10.9"W 51.962948,
      -106.053036)<br />
      <strong>Venue Address:</strong> Blucher No. 343, Elstow, Saskatchewan<br />
      <strong>Venue Location/Directions:</strong>
      <a href="https://festivall.ca/reunionlocation" target="_blank">festivall.ca/reunionlocation</a
      ><br />
      <strong>Event Date: </strong>AUG 29, 2025 - SEPT 01, 2025
    </p>
    <p v-if="applicant.applicant_types.includes('Artist')">
      <strong>Event Hours for ARTIST Services:</strong> One 60-90min DJ/performance set during Event
      Date by {{ applicant.act_type }} - {{ applicant.act_name }}<br />
      <strong>Set Time of ARTIST Services:</strong> to be determined no later than 14 days before
      Event Date
    </p>
    <p v-if="applicant.applicant_types.includes('Volunteer')">
      <strong>Minimum shifts for VOLUNTEER Services by Team:</strong><br />
      Front Gate: [Three 2-Hour Shifts Per Weekend]<br />
      Food Team: [Two 4-Hour Shifts Per Weekend]<br />
      Setup Crew: [One 8-Hour Shift PreShow]<br />
      Cleanup Crew: [One 8-Hour Shift PostShow]<br />
      Stage Crew: [Two 4-Hour Shifts Per Weekend]<br />
    </p>
    <p v-if="applicant.applicant_types.includes('Workshop')">
      <strong>Event Hours for WORKSHOP Services:</strong>
      One 60-90min workshop during Event Date entitled<br />
      {{ applicant.workshop_title }} - {{ applicant.workshop_description }}<br />
      <strong>Workshop Time of WORKSHOP Services:</strong>
      to be determined no later than 14 days before Event Date
    </p>
    <p v-if="applicant.applicant_types.includes('Art Installation')">
      <strong>Event Hours for ART INSTALLATION Services:</strong>
      Art installation operational during Event Date<br />
      <strong>Installation Title:</strong> {{ applicant.installation_title }}<br />
      <strong>Fixture Type:</strong> {{ applicant.fixture_type }}
    </p>
    <p v-if="applicant.applicant_types.includes('Vendor')">
      <strong>Vendor Requirements:</strong> {{ applicant.vendor_requirements }}
    </p>

    <h3>2. PAYMENT</h3>
    <p>The Parties agree to the following Payment and Payment Terms:</p>
    <p><strong>Compensation for Services:</strong></p>

    <ul>
      <li v-if="applicant.applicant_types.includes('Artist')">
        One complementary weekend pass for ARTIST*
      </li>
      <li v-if="applicant.applicant_types.includes('Artist')">
        One complementary weekend pass for GUEST
      </li>
      <li v-if="applicant.applicant_types.includes('Volunteer')">
        One complementary weekend pass for VOLUNTEER*
      </li>
      <li v-if="applicant.applicant_types.includes('Volunteer')">
        One complementary meal package for each festival day worked
      </li>
      <li v-if="applicant.applicant_types.includes('Workshop')">
        One complementary weekend pass for WORKSHOP*
      </li>
      <li>
        $20 Referral bonus for every weekend pass sold using the ID_CODE:
        <strong>{{ applicant.id_code }}</strong>
      </li>
    </ul>
    * Applicants with multiple roles will only receive one complementary weekend pass.
    <p v-if="applicant.rates">
      <strong>Additional Compensation:</strong> {{ applicant.rates
      }}<strong><br />Balance Due:</strong> no later than 30 days after Event Date unless otherwise
      specified in Additional Compensation.
    </p>

    <h3>3. {{ applicant.applicant_types.join(' and ').toUpperCase() }} REQUIREMENTS</h3>
    <p>
      The {{ applicant.applicant_types.join(' and ').toUpperCase() }} requires the following
      equipment to provide {{ applicant.applicant_types.join(' and ').toUpperCase() }} Services:
    </p>
    <ul v-if="applicant.applicant_types.includes('Artist')">
      ARTIST REQUIREMENTS
      <li><strong>Flat table/surface 36” in height</strong></li>
      <li><strong>Standard DJ Setup</strong></li>
      <li><strong>Pioneer S9 mixer</strong></li>
      <li><strong>2 CDJs with USB and LINK capabilities</strong></li>
      <li><strong>Turntables with timecode control vinyl</strong></li>
      <li><strong>Adequate booth sound level</strong></li>
      <li><strong>2 Standard 120V Power Sockets</strong></li>
    </ul>
    <ul v-if="applicant.applicant_types.includes('Volunteer')">
      VOLUNTEER REQUIREMENTS
      <li><strong>In-house Ticket Scanner, Seating, and Shade for Front Gate</strong></li>
      <li><strong>Access to walkie-talkie for team communications</strong></li>
      <li><strong>Water/Juice for refreshment</strong></li>
    </ul>
    <ul v-if="applicant.applicant_types.includes('Workshop')">
      WORKSHOP REQUIREMENTS
      <li><strong>Adequate ground space for workshop activities</strong></li>
      <li><strong>Including space for audience participation if required</strong></li>
      <li><strong>Access to microphone with signal flow to main speaker system</strong></li>
      <li>
        <strong>Access to stage management or available DJ to play music</strong>
      </li>
      <li>
        <strong>{{ applicant.workshop_requirements }}</strong>
      </li>
    </ul>
    <ul v-if="applicant.applicant_types.includes('Art Installation')">
      ART INSTALLATION REQUIREMENTS
      <li>
        <strong>{{ applicant.other_requirements }}</strong>
      </li>
    </ul>
    <ul v-if="applicant.applicant_types.includes('Vendor')">
      VENDOR REQUIREMENTS

      <li>
        <strong>{{ applicant.vendor_requirements }}</strong>
      </li>
    </ul>

    <h3>4. CANCELLATION</h3>

    <p>
      By REUNION FESTIVAL. The REUNION FESTIVAL may cancel this Agreement at any time prior to the
      event. Upon cancellation, the REUNION FESTIVAL will be entitled to a refund of any monies
      paid.
    </p>

    <p>
      By {{ applicant.applicant_types.join(' and ').toUpperCase() }}. The
      {{ applicant.applicant_types.join(' and ').toUpperCase() }} may cancel this Agreement at any
      time. If the {{ applicant.applicant_types.join(' and ').toUpperCase() }} cancels, it must
      provide a suitable, replacement {{ applicant.applicant_types.join(' and ').toUpperCase() }},
      subject to the REUNION FESTIVAL's approval, which shall be obtained in writing. In the
      alternative, the {{ applicant.applicant_types.join(' and ').toUpperCase() }} shall refund all
      monies previously paid by the REUNION FESTIVAL.
    </p>
    <ul>
      <li>
        A. Dispute Resolution and Legal Fees. In the event of a dispute arising out of this Contract
        that cannot be resolved by mutual agreement, the Parties agree to engage in mediation. If
        the matter cannot be resolved through mediation, and legal action ensues, the successful
        party will be entitled to its legal fees, including, but not limited to its attorneys' fees.
      </li>
      <li>
        B. Severability. In the event any provision of this Agreement is deemed invalid or
        unenforceable, in whole or in part, that part shall be severed from the remainder of the
        Agreement and all other provisions should continue in full force and effect as valid and
        enforceable.
      </li>
      <li>
        C. Legal and Binding Agreement. This Agreement is legal and binding between the Parties as
        stated above. This Agreement may be entered into and is legal and binding in Canada. The
        Parties each represent that they have the authority to enter into this Agreement.
      </li>
      <li>
        D. Governing Law and Jurisdiction. The Parties agree that this Agreement shall be governed
        by the province and/or Country in which both Parties do business.
      </li>
      <li>
        E. Entire Agreement. The Parties acknowledge and agree that this Agreement represents the
        entire agreement between the Parties. If the Parties desire to change, add, or otherwise
        modify any terms, they shall do so mutually aiming for agreement by both parties.
      </li>
      <li>
        F. Please remember that this is a family-centered event and ensure that you and your party
        conduct yourselves accordingly.
      </li>
      <li>
        G. We encourage you to join us for the entire weekend, you've been selected not only for
        your skills, but because of who you are - your character.
      </li>
    </ul>
    <div v-if="applicant.contract_signed === false" class="signature">
      <label for="signature">E-Signature:</label>
      By signing and submitting this form, you agree to the terms and conditions of this contract.
      <p><strong>By:</strong> {{ applicant.fullname }} <strong>Date:</strong> {{ currentDate }}</p>
      <input
        type="text"
        id="signature"
        v-model="signature"
        :placeholder="applicant.fullname"
        required
        style="width: 100%"
      />
      <button @click="handleSubmit" style="width: 100%; max-width: 400px">SIGN & SUBMIT</button>
    </div>
    <div v-else>
      <div class="signed-contract">
        <p>Thank you, {{ applicant.fullname }}.</p>
        <p v-if="applicant.signedAt">
          Your contract has been signed on {{ formatDate(applicant.signedAt) }}
        </p>
        <p v-if="applicant.signature"><strong>Signature:</strong> {{ applicant.signature }}</p>
      </div>
    </div>

    <img
      class="footer"
      :src="poster_footer"
      style="width: 100%; margin-top: 2rem"
      alt="Poster Footer"
    />
  </div>
  <div v-else>
    <p>Loading...</p>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collection, getDocs, query, where, setDoc, doc } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import { sendSMS, sendEmail, sendReunionApplications } from '/scripts/notifications.js'
import frog_image from '@/assets/images/frog.png'
import festivall_emblem from '@/assets/images/festivall_emblem_black.png'
import poster_footer from '@/assets/images/poster_footer_v1.png'

export default {
  name: 'ContractPageView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const applicant = ref(null)
    const signature = ref('')
    const currentDate = new Date().toLocaleDateString()
    const formatDate = (dateString) => {
      if (!dateString) return ''

      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const loadApplicant = async (id_code) => {
      try {
        let applicantData = null

        // First, try to get from orders_2025 (most complete data)
        let q = query(collection(reunion_db, 'orders_2025'), where('id_code', '==', id_code))
        let querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          applicantData = querySnapshot.docs[0].data()
          console.log('Loaded from orders_2025:', applicantData)
        } else {
          // Second, try contracts_2025 (has signature data)
          q = query(collection(reunion_db, 'contracts_2025'), where('id_code', '==', id_code))
          querySnapshot = await getDocs(q)

          if (!querySnapshot.empty) {
            applicantData = querySnapshot.docs[0].data()
            console.log('Loaded from contracts_2025:', applicantData)
          } else {
            // Last, try applications_2025 (original application)
            q = query(collection(reunion_db, 'applications_2025'), where('id_code', '==', id_code))
            querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
              applicantData = querySnapshot.docs[0].data()
              console.log('Loaded from applications_2025:', applicantData)
            } else {
              console.error('No document found in any collection!')
              router.push({ name: 'EnterIDCode' })
              return
            }
          }
        }

        applicant.value = applicantData
      } catch (error) {
        console.error('Error getting document:', error)
        router.push({ name: 'EnterIDCode' })
      }
    }

    const updateApplication = async () => {
      try {
        const applicantDoc = doc(
          collection(reunion_db, 'applications_2025'),
          applicant.value.id_code
        )
        await setDoc(applicantDoc, {
          ...applicant.value,
          contract_signed: true
        })
        console.log('Application updated successfully!')
      } catch (error) {
        console.error('Error updating application:', error)
      }
    }

    const saveContract = async () => {
      if (!signature.value) {
        alert('Please enter your signature.')
        return
      }

      try {
        const contractDoc = doc(collection(reunion_db, 'contracts_2025'), applicant.value.id_code)
        console.log('Saving contract with data:', {
          ...applicant.value,
          signature: signature.value,
          signedAt: new Date().toISOString(),
          contract_signed: true
        })

        await setDoc(contractDoc, {
          ...applicant.value,
          signature: signature.value,
          signedAt: new Date().toISOString(),
          contract_signed: true
        })

        alert('Contract saved successfully!')
      } catch (error) {
        console.error('Error saving contract:', error)
        alert('Failed to save the contract.')
      }
    }

    const addOrder = async () => {
      try {
        const orderDoc = doc(collection(reunion_db, 'orders_2025'), applicant.value.id_code)
        await setDoc(orderDoc, {
          ...applicant.value,
          signature: signature.value,
          signedAt: new Date().toISOString(),
          contract_signed: true,
          checked_in: false,
          paid: true,
          ticket_type: 'Weekend Pass',
          total_price: 0,
          ticket_quantity: applicant.value.applicant_types.includes('Artist') ? 2 : 1,
          meal_packages: applicant.value.applicant_types.includes('Volunteer') ? 2 : 0,
          meal_tickets_remaining: applicant.value.applicant_types.includes('Volunteer') ? 4 : 0
        })
        alert('Please enter your ID Code on the next page to access your ticket.')
        console.log('Order added successfully!')
      } catch (error) {
        console.error('Error adding order:', error)
      }
    }

    const handleSubmit = async () => {
      try {
        // Complete all critical database operations first
        await updateApplication()
        await saveContract()
        await addOrder()

        // Send notifications after all critical operations are complete
        // Use Promise.allSettled to handle both notifications independently
        const notificationResults = await Promise.allSettled([
          sendSMS(
            applicant.value.phone_number,
            `Thank you ${applicant.value.fullname} for signing your contract.\nTo access your interactive ticket, please navigate to https://festivall.ca/reunionticket and enter your ID Code: ${applicant.value.id_code}`
          ),
          sendEmail(
            applicant.value.email,
            'Contract Signed - Reunion 2025',
            `Hello ${applicant.value.fullname},\n\nThank you for signing your contract for Reunion 2025!\n\nYour ID Code: ${applicant.value.id_code}\n\nTo access your interactive ticket, please visit: https://festivall.ca/reunionticket\n\nSee you at the festival!\n\nBest regards,\nReunion Festival Team`
          ),
          sendReunionApplications(
            `:white_check_mark: Contract saved for ${applicant.value.fullname}.\n:ticket: ID Code: ${applicant.value.id_code}`
          )
        ])

        // Log results for debugging
        notificationResults.forEach((result, index) => {
          const type = index === 0 ? 'SMS' : 'Email'
          if (result.status === 'fulfilled') {
            console.log(`${type} sent successfully`)
          } else {
            console.error(`${type} failed:`, result.reason)
          }
        })

        // Redirect regardless of notification success/failure
        router.push({ name: 'reunionticket' })
      } catch (error) {
        console.error('Error in handleSubmit:', error)
        alert('An error occurred while processing your contract. Please try again.')
      }
    }

    onMounted(() => {
      const id_code = route.params.id_code
      loadApplicant(id_code)
    })

    return {
      frog_image,
      festivall_emblem,
      poster_footer,
      applicant,
      signature,
      updateApplication,
      saveContract,
      addOrder,
      handleSubmit,
      currentDate,
      sendSMS,
      sendEmail,
      formatDate
    }
  }
}
</script>

<style scoped>
* {
  font-family: 'Helvetica', sans-serif;
}

strong {
  font-weight: bold;
}

.contract-page {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  background-color: white;
  color: black;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 1rem 1rem;
}

img {
  margin: 0 auto;
}

h1,
h2 {
  color: var(--reunion-frog-green);
  text-align: center;
  font-weight: bold;
  /* margin-bottom: 1rem; */
}

h3 {
  color: red;
  margin-top: 1.5rem;
  font-weight: bold;
}

p,
ul {
  margin: 0.5rem 0;
}

ul {
  list-style: none;
  text-indent: -1.25rem;
}

.signature {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.signature label {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.signature input {
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: 100%;
  max-width: 400px;
}

button {
  margin-top: 1rem;
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
</style>
