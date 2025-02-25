<template>
  <div class="contract-page" v-if="applicant">
    <img :src="festivall_emblem" style="height: 50px; width: 75px" alt="Festivall Emblem" />
    <h1>
      Reunion Festival<br />
      {{ applicant.applicant_type }} Contract
    </h1>
    <img :src="frog_image" style="height: 100px; width: 100px" alt="Frog" />
    <!-- <h2>Powered by Festivall</h2> -->
    <h3 class="preamble">PREAMBLE</h3>
    <p>
      This {{ applicant.applicant_type.toUpperCase().toUpperCase() }} Contract (the “Contract”) is
      entered into <strong>{{ currentDate }}</strong> (the “Effective Date”), by and between
      <strong>REUNION FESTIVAL</strong>, with an address of
      <strong>Blucher No. 343, Elstow, Saskatchewan</strong> (the “REUNION FESTIVAL”) and
      <strong>{{ applicant.fullname }}</strong
      >, with an address of
      <strong
        >{{ applicant.street_address }}, {{ applicant.city }}, {{ applicant.region }},
        {{ applicant.country }}, {{ applicant.postal_code }}</strong
      >, (the "{{ applicant.applicant_type.toUpperCase() }}"), also individually referred to as (the
      “Party”) and collectively, (the “Parties). The REUNION FESTIVAL wishes to engage the
      {{ applicant.applicant_type.toUpperCase() }} to provide
      {{ applicant.applicant_type.toUpperCase() }} services.
    </p>

    <h3 class="red">1. EVENT DATE & DESCRIPTION</h3>
    <p>
      <strong>Venue:</strong> Reunion Festival Grounds (51°57'46.6"N 106°03'10.9"W 51.962948,
      -106.053036)<br />
      <strong>Venue Address:</strong> Blucher No. 343, Elstow, Saskatchewan<br /><strong
        >Event Date: </strong
      >AUG 29, 2025 - SEPT 01, 2025
    </p>
    <p v-if="applicant.applicant_type === 'Artist'">
      <strong>Event Hours for {{ applicant.applicant_type.toUpperCase() }} Services:</strong> One
      60-90min DJ/performance set during Event Date<br />
      <strong>Set Time of {{ applicant.applicant_type.toUpperCase() }} Services:</strong> to be
      determined no later than 14 days before Event Date
    </p>
    <p v-if="applicant.applicant_type === 'DJ/Band'">
      <strong>Event Hours for {{ applicant.applicant_type.toUpperCase() }} Services:</strong> One
      60-90min DJ/performance set during Event Date<br />
      <strong>Set Time of {{ applicant.applicant_type.toUpperCase() }} Services:</strong> to be
      determined no later than 14 days before Event Date
    </p>
    <p v-if="applicant.applicant_type === 'Volunteer'">
      <strong>Event Hours for {{ applicant.applicant_type.toUpperCase() }} Services:</strong> One
      4HR volunteer shift during Event Date<br />
      <strong>Shift Time of {{ applicant.applicant_type.toUpperCase() }} Services:</strong> to be
      determined no later than 14 days before Event Date
    </p>
    <p v-if="applicant.applicant_type === 'Workshop'">
      <strong>Event Hours for {{ applicant.applicant_type.toUpperCase() }} Services:</strong> One
      60-90min workshop during Event Date<br />
      <strong>Workshop Time of {{ applicant.applicant_type.toUpperCase() }} Services:</strong> to be
      determined no later than 14 days before Event Date
    </p>

    <h3>2. PAYMENT</h3>
    <p>The Parties agree to the following Payment and Payment Terms:</p>
    <p><strong>Initial Compensation for Services:</strong></p>

    <ul v-if="applicant.applicant_type === 'Artist'">
      <li>One complementary weekend pass for {{ applicant.applicant_type.toUpperCase() }}</li>
      <li>One complementary weekend pass for GUEST</li>
      <li>
        $20 Referral bonus for every weekend pass sold using the ID_CODE:
        <strong>{{ applicant.id_code }}</strong>
      </li>
    </ul>
    <ul v-if="applicant.applicant_type === 'DJ/Band'">
      <li>One complementary weekend pass for {{ applicant.applicant_type.toUpperCase() }}</li>
      <li>One complementary weekend pass for GUEST</li>
      <li>
        $20 Referral bonus for every weekend pass sold using the ID_CODE:
        <strong>{{ applicant.id_code }}</strong>
      </li>
    </ul>
    <ul v-if="applicant.applicant_type === 'Volunteer'">
      <li>One complementary weekend pass for {{ applicant.applicant_type.toUpperCase() }}</li>
      <li>One complementary meal package for each day of service</li>
      <li>
        $20 Referral bonus for every weekend pass sold using the ID_CODE:
        <strong>{{ applicant.id_code }}</strong>
      </li>
    </ul>
    <ul v-if="applicant.applicant_type === 'Workshop'">
      <li>One complementary weekend pass for {{ applicant.applicant_type.toUpperCase() }}</li>
      <li>
        $20 Referral bonus for every weekend pass sold using the ID_CODE:
        <strong>{{ applicant.id_code }}</strong>
      </li>
    </ul>
    <p><strong>Additional Compensation:</strong> {{ applicant.additional_compensation }}</p>
    <p><strong>Balance Due:</strong> no later than 30 days after Event Date</p>

    <h3>3. {{ applicant.applicant_type.toUpperCase() }} REQUIREMENTS</h3>
    <p>
      The {{ applicant.applicant_type.toUpperCase() }} requires the following equipment requirements
      to provide {{ applicant.applicant_type.toUpperCase() }} Services:
    </p>
    <ul v-if="applicant.applicant_type === 'Artist'">
      <li>Flat table/surface 36” in height</li>
      <li>Standard DJ Setup</li>
      <li>Pioneer S9 mixer</li>
      <li>2 CDJs with USB and LINK capabilities</li>
      <li>Turntables with timecode control vinyl</li>
      <li>Adequate booth sound level</li>
      <li>2 Standard 120V Power Sockets</li>
    </ul>
    <ul v-if="applicant.applicant_type === 'Volunteer'">
      <li>In-house Ticket Scanner, Seating, and Shade for Front Gate</li>
      <li>Access to walkie-talkie for team communications</li>
      <li>Water/Juice for refreshment</li>
    </ul>
    <ul v-if="applicant.applicant_type === 'Workshop'">
      <li>Adequate ground space for workshop activities</li>
      <li>Including space for audience participation if required</li>
      <li>Access to microphone with signal flow to main speaker system</li>
      <li>Access to stage management or available DJ to play music provided by WORKSHOP</li>
    </ul>

    <h3>4. CANCELLATION</h3>

    <p>
      By REUNION FESTIVAL. The REUNION FESTIVAL may cancel this Agreement at any time prior to the
      event. Upon cancellation, the REUNION FESTIVAL will be entitled to a refund of any monies
      paid.
    </p>

    <p>
      By {{ applicant.applicant_type.toUpperCase() }}. The
      {{ applicant.applicant_type.toUpperCase() }} may cancel this Agreement at any time. If the
      {{ applicant.applicant_type.toUpperCase() }} cancels, it must provide a suitable, replacement
      {{ applicant.applicant_type.toUpperCase() }}, subject to the REUNION FESTIVAL's approval,
      which shall be obtained in writing. In the alternative, the
      {{ applicant.applicant_type.toUpperCase() }} shall refund all monies previously paid by the
      REUNION FESTIVAL.
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
    <div class="signature">
      <label for="signature">E-Signature:</label>
      By signing and submitting this form, you agree to the terms and conditions of this contract.
      <p><strong>By:</strong> {{ applicant.fullname }} <strong>Date:</strong> {{ currentDate }}</p>
      <input
        type="text"
        id="signature"
        v-model="signature"
        :placeholder="applicant.fullname"
        required
      />
    </div>
    <button
      @click="
        () => {
          saveContract()
          addOrder()
        }
      "
    >
      SIGN & SUBMIT
    </button>
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

    const loadApplicant = async (id_code) => {
      try {
        // Check if the applicant is found in the applications_2025 collection
        let q = query(collection(reunion_db, 'applications_2025'), where('id_code', '==', id_code))
        let querySnapshot = await getDocs(q)

        // Check if the applicant is found in the applications_2024 collection
        if (querySnapshot.empty) {
          q = query(collection(reunion_db, 'applications'), where('id_code', '==', id_code))
          querySnapshot = await getDocs(q)
        }

        if (!querySnapshot.empty) {
          applicant.value = querySnapshot.docs[0].data()
        } else {
          console.error('No such document!')
          router.push({ name: 'EnterIdCode' })
        }
      } catch (error) {
        console.error('Error getting document:', error)
        router.push({ name: 'EnterIdCode' })
      }
    }

    const saveContract = async () => {
      if (!signature.value) {
        alert('Please enter your signature.')
        return
      }

      try {
        const contractDoc = doc(collection(reunion_db, 'contracts_2025'), applicant.value.id_code)
        await setDoc(contractDoc, {
          ...applicant.value,
          signature: signature.value,
          signedAt: new Date().toISOString()
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
          applicant: applicant.value.fullname,
          orderDate: new Date().toISOString(),
          status: 'pending'
        })
        console.log('Order added successfully!')
      } catch (error) {
        console.error('Error adding order:', error)
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
      saveContract,
      addOrder,
      currentDate
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

li {
  margin: 0.25rem 0;
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
