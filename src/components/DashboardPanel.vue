<template>
  <div class="dashboard">
    <div class="banner">
      <a href="/">
        <img
          src="@/assets/images/festivall_emblem_white.png"
          alt="Festivall Logo"
          class="logo"
          style="display: flex; align-items: center"
        />
      </a>
      <h1>DASHBOARD</h1>
    </div>

    <div class="controls">
      <h2>Ticket Pool</h2>
      <div class="buttons">
        <button @click="loadApplicants('orders_2025', true)">Reunion Orders 2025</button>
      </div>
      <h2>Talent Pool</h2>
      <div class="buttons">
        <button @click="loadApplicants('blessed_coast')">Blessed Coast</button>
        <button @click="loadApplicants('impact')">Impact</button>
        <button @click="loadApplicants('cream_collective')">Cream Collective</button>
        <button @click="loadApplicants('evolved_music_group')">Evolved Music Group</button>
        <button @click="loadApplicants('rapture')">Rapture</button>
        <button @click="loadApplicants('partywell')">PartyWell</button>
        <button @click="loadApplicants('festivall', true)">Festivall</button>
        <button @click="loadApplicants('reunion')">Reunion Static</button>
        <button @click="loadApplicants('applications', true)">Reunion Applicants 2024</button>
        <button @click="loadApplicants('applications_2025', true)">Reunion Applicants 2025</button>
      </div>
    </div>

    <div class="filters">
      <h2>Filter By</h2>
      <div class="buttons">
        <button
          v-for="filter in relevantFilters"
          :key="filter.property"
          @click="applyFilter(filter.property, filter.value)"
        >
          {{ filter.label }}
        </button>
        <button @click="clearFilters">Clear Filters</button>
      </div>
    </div>

    <div class="view-toggle">
      <label> <input type="radio" value="rows" v-model="viewStyle" /> Rows </label>
      <label> <input type="radio" value="cards" v-model="viewStyle" /> Cards </label>
    </div>

    <div class="dashboard-panel">
      <h2>Current View <br />{{ filteredApplicants.length }}</h2>
      <div class="applicants" :class="viewStyle">
        <div v-for="applicant in filteredApplicants" :key="applicant.id" class="applicant">
          <div class="applicant-content">
            <h2>
              <a v-if="applicant.url" :href="applicant.url" target="_blank">
                {{ applicant.act_name || applicant.full_name }}
              </a>
              <span v-else>
                {{ applicant.fullname || applicant.email.split('@')[0] }}
              </span>
            </h2>
            <p v-if="applicant.id_code" class="id_code">{{ applicant.id_code }}</p>
            <p v-if="applicant.applicant_type">{{ applicant.applicant_type }}</p>
            <p v-if="applicant.genre">{{ applicant.genre }}</p>
            <p v-if="applicant.volunteer_type">{{ applicant.volunteer_type }}</p>
            <p v-if="applicant.workshop_title">{{ applicant.workshop_title }}</p>
            <p v-if="applicant.workshop_description">{{ applicant.workshop_description }}</p>

            <p>{{ applicant.bio }}</p>
            <p>{{ applicant.statement }}</p>
            <span v-if="applicant.comments">{{ applicant.comments }} </span>
            <span v-if="applicant.rates"> Fee: {{ applicant.rates }} </span>
          </div>
          <div v-if="applicant.payment_type" class="ticket-content">
            <p v-if="applicant.paid">
              Paid<br />

              <button @click="revokeTicket(applicant.id_code)">Revoke Ticket</button><br />
            </p>
            <p v-else>
              Unpaid<br />

              <button @click="confirmPaymentReceived(applicant.id_code)">
                Confirm Payment Received</button
              ><br />
            </p>
            <p v-if="applicant.checked_in">Checked In</p>
            <p v-else>Not Checked In</p>
            <br />
            <p v-if="applicant.ticket_type">Ticket Type: {{ applicant.ticket_type }}</p>
            <p><strong>Ticket Quantity:</strong>&nbsp;{{ applicant.ticket_quantity }}</p>
            <img
              v-for="n in Number(applicant.ticket_quantity)"
              :key="n"
              :src="ticket_icon"
              style="height: auto; width: 32px; transform: rotate(-45deg)"
              alt="Ticket Icon"
            />

            <p>
              <strong>Meal Tickets Remaining:</strong>&nbsp;{{ applicant.meal_tickets_remaining }}
            </p>

            <img
              v-for="n in Number(applicant.meal_tickets_remaining)"
              :key="n"
              :src="meals_icon"
              style="height: auto; width: 32px"
              alt="Meal Icon"
            />
            <br />
            <p v-if="applicant.total_price">Total Price: {{ applicant.total_price }}</p>
            <p v-if="applicant.payment_type">Payment Type: {{ applicant.payment_type }}</p>
            <br />
            <button @click="previewTicket(applicant.id_code)">Preview Ticket</button><br />
            <a
              :href="deliverTicket(applicant.email, applicant.fullname, applicant.id_code)"
              target="_blank"
              style="display: inline-block"
            >
              <img
                :src="ticket_icon"
                alt="Deliver Ticket"
                class="action-icon"
                style="height: 42px; width: auto"
              />
            </a>
          </div>
          <div v-if="applicant.applicant_type !== 'inkind'"></div>
          <div v-if="applicant.payment_type !== 'inkind'" class="actions">
            <a v-if="applicant.mix_track_url" :href="applicant.mix_track_url" target="_blank">
              <img :src="mixTrack" alt="Listen to Mix/Track" class="action-icon" />
            </a>
            <a
              v-if="applicant.applicant_type"
              :href="
                deliverContract(
                  applicant.email,
                  applicant.fullname,
                  applicant.applicant_type,
                  applicant.id_code
                )
              "
            >
              <img :src="contract" alt="Book Applicant" class="action-icon" />
            </a>
            <div v-if="applicant.phone" class="message-section">
              <input type="text" v-model="applicant.message" />
              <img
                @click="sendSMS(applicant), (applicant.message = '')"
                :src="sms_icon"
                alt="Send SMS"
                class="action-icon"
                style="width: auto; height: 42px; transform: translateY(18px)"
              /><br />
              <div v-if="applicant.applicant_type">
                <input type="text" v-model="applicant.additional_compensation" />
                <img
                  @click="
                    updateCompensation(applicant.id_code, applicant.additional_compensation),
                      (applicant.additional_compensation = '')
                  "
                  :src="compensation_icon"
                  alt="Update Compensation"
                  class="action-icon"
                  style="width: auto; height: 32px; transform: translateY(12px)"
                />
                <br />
                <button @click="generateContract(applicant.id_code)">Preview Contract</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import mixTrack from '@/assets/images/icons/mix_track.png'
import contract from '@/assets/images/icons/contract.png'
import { useRoute, useRouter } from 'vue-router'
import { sendSMS, sendEmail } from '/scripts/notifications.js'
import sms_icon from '@/assets/images/icons/sms.png'
import compensation_icon from '@/assets/images/icons/compensation.png'
import ticket_icon from '@/assets/images/icons/ticket.png'
import meal_icon from '@/assets/images/icons/meals.png'

export default {
  name: 'DashboardPanel',
  setup() {
    const applicants = ref([])
    const filteredApplicants = ref([])
    const viewStyle = ref('cards') // Default view style
    const filters = ref([
      { property: 'applicant_type', value: 'Artist', label: 'Artists' },
      { property: 'applicant_type', value: 'Musician', label: 'Musicians' },
      { property: 'act_type', value: 'Musician', label: 'Musicians' },
      { property: 'applicant_type', value: 'Dancer', label: 'Dancers' },
      { property: 'applicant_type', value: 'Workshop', label: 'Workshops' },
      { property: 'applicant_type', value: 'DJ', label: 'DJs' },
      { property: 'act_type', value: 'dj', label: 'DJs' },
      { property: 'applicant_type', value: 'DJ/Band', label: 'DJ/Band' },
      { property: 'act_type', value: 'Live Band', label: 'Live Bands' },
      { property: 'applicant_type', value: 'Volunteer', label: 'Volunteers' },
      { property: 'volunteer_type', value: 'Setup Crew', label: 'Setup Crew' },
      { property: 'volunteer_type', value: 'Cleanup Crew', label: 'Cleanup Crew' },
      { property: 'volunteer_type', value: 'Stage Crew', label: 'Stage Crew' },
      { property: 'volunteer_type', value: 'Front Gate', label: 'Front Gate' },
      { property: 'volunteer_type', value: 'Food Team', label: 'Food Team' },
      { property: 'applicant_type', value: 'Vendor', label: 'Vendors' },
      { property: 'applicant_type', value: 'Promoter', label: 'Promoters' },
      { property: 'applicant_type', value: 'Art Vendor', label: 'Art Vendors' },
      { property: 'applicant_type', value: 'Event Manager', label: 'Event Manager' },
      { property: 'applicant_type', value: 'A&R', label: 'A&R' },
      { property: 'applicant_type', value: 'Accounts Manager', label: 'Accounts Manager' },
      { property: 'applicant_type', value: 'Marketing', label: 'Marketing' },
      { property: 'applicant_type', value: 'Operations Manager', label: 'Operations Manager' },
      { property: 'applicant_type', value: 'Market Analyst', label: 'Market Analyst' },
      { property: 'applicant_type', value: 'Social Media', label: 'Social Media' },
      { property: 'applicant_type', value: 'UX', label: 'UX' },
      { property: 'applicant_type', value: 'Web Dev', label: 'Web Dev' },
      { property: 'applicant_type', value: 'Customer', label: 'Customer' },
      { property: 'mix_track_url', value: '', label: 'Mix/Track' },
      { property: 'willing', value: '', label: 'Willing' },
      { property: 'url', value: '', label: 'URL' },
      { property: 'build_crew', value: '', label: 'Build Crew' },
      { property: 'kitchen_crew', value: '', label: 'Kitchen Crew' },
      { property: 'security', value: '', label: 'Security' },
      { property: 'first_aid', value: '', label: 'First Aid' },
      { property: 'front_gate', value: '', label: 'Front Gate' },
      { property: 'parking_attendant', value: '', label: 'Parking Attendant' },
      { property: 'front_of_house', value: '', label: 'Front of House' },
      { property: 'stage_tech', value: '', label: 'Stage Tech' },
      { property: 'hospitality', value: '', label: 'Hospitality' },
      { property: 'green_team', value: '', label: 'Green Team' },
      { property: 'childrens_area', value: '', label: "Children's Area" },
      { property: 'merch_table', value: '', label: 'Merch Table' },
      { property: 'float_crew', value: '', label: 'Float Crew' },
      { property: 'cleanup_crew', value: '', label: 'Cleanup Crew' },
      // contract filters
      { property: 'contract_signed', value: true, label: 'Contract Signed' },
      { property: 'contract_signed', value: false, label: 'Contract Not Signed' },
      // ticket filters
      { property: 'paid', value: true, label: 'Paid' },
      { property: 'paid', value: false, label: 'Unpaid' },
      { property: 'checked_in', value: true, label: 'Checked In' },
      { property: 'checked_in', value: false, label: 'Not Checked In' }
    ])

    const relevantFilters = computed(() => {
      return filters.value.filter((filter) => {
        return applicants.value.some((applicant) => {
          if (filter.value === '') {
            return applicant[filter.property] !== undefined && applicant[filter.property] !== ''
          }
          return applicant[filter.property] === filter.value
        })
      })
    })

    const loadApplicants = async (type, isFirestore = false) => {
      try {
        let data = []
        if (isFirestore) {
          // Fetch data from Firestore
          const applicantsCollection = collection(reunion_db, type)
          const applicantsSnapshot = await getDocs(applicantsCollection)
          data = applicantsSnapshot.docs.map((doc) => doc.data())
        } else {
          // Fetch static data from public folder
          const response = await fetch(`/data/applicants/${type}.json`)
          if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText)
          }
          data = await response.json()
        }
        applicants.value = data
          .map((applicant) => ({ ...applicant, message: '' }))
          .sort((a, b) => {
            if (a.url && !b.url) return -1
            if (!a.url && b.url) return 1
            return 0
          })
        filteredApplicants.value = applicants.value
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error)
      }
    }

    const applyFilter = (property, value) => {
      filteredApplicants.value = applicants.value.filter((applicant) => {
        if (value === '') {
          return applicant[property] !== undefined && applicant[property] !== ''
        }
        return applicant[property] === value
      })
    }

    const clearFilters = () => {
      filteredApplicants.value = applicants.value
    }

    const contractEmailBody = ref('')
    const ticketEmailBody = ref('')

    const loadContractDeliveryTemplate = () => {
      fetch('/email_templates/contract_delivery_template.txt')
        .then((response) => response.text())
        .then((text) => {
          contractEmailBody.value = text
        })
        .catch((error) => {
          console.error('Error loading email template:', error)
        })
    }

    const loadTicketDeliveryTemplate = () => {
      fetch('/email_templates/ticket_delivery_template.txt')
        .then((response) => response.text())
        .then((text) => {
          ticketEmailBody.value = text
        })
        .catch((error) => {
          console.error('Error loading email template:', error)
        })
    }

    const router = useRouter()

    const updateCompensation = async (id_code, additional_compensation) => {
      try {
        const docRef = doc(reunion_db, 'applications_2025', id_code)
        await updateDoc(docRef, {
          rates: additional_compensation
        })
        applicants.value = applicants.value.map((applicant) => {
          if (applicant.id_code === id_code) {
            applicant.additional_compensation = ''
          }
          return applicant
        })
      } catch (error) {
        console.error('Error updating compensation:', error)
      }
    }

    const generateContract = (id_code) => {
      router.push({ path: `/reunioncontract/${id_code}` })
    }

    const deliverContract = (email, fullname, role, id_code) => {
      const subject = encodeURIComponent('Reunion 2025')
      const personalizedBody = contractEmailBody.value
        .replace('{name}', fullname || '')
        .replace('{role}', role || '')
        .replace('{id_code}', id_code || '')
      const body = encodeURIComponent(personalizedBody)
      return `mailto:${email}?subject=${subject}&body=${body}`
    }

    const confirmPaymentReceived = async (id_code) => {
      try {
        const docRef = doc(reunion_db, 'orders_2025', id_code)
        await updateDoc(docRef, {
          paid: true
        })
        applicants.value = applicants.value.map((applicant) => {
          if (applicant.id_code === id_code) {
            applicant.paid = true
          }
          return applicant
        })
      } catch (error) {
        console.error('Error updating paid status:', error)
      }
    }

    const revokeTicket = async (id_code) => {
      try {
        const docRef = doc(reunion_db, 'orders_2025', id_code)
        await updateDoc(docRef, {
          paid: false
        })
        applicants.value = applicants.value.map((applicant) => {
          if (applicant.id_code === id_code) {
            applicant.paid = false
          }
          return applicant
        })
      } catch (error) {
        console.error('Error updating paid status:', error)
      }
    }

    const previewTicket = (id_code) => {
      router.push({ path: `/reunionticket/${id_code}` })
    }

    const deliverTicket = (email, fullname, id_code) => {
      const subject = encodeURIComponent('Reunion 2025')
      const personalizedBody = ticketEmailBody.value
        .replace('{name}', fullname || '')
        .replace('{id_code}', id_code || '')
      const body = encodeURIComponent(personalizedBody)
      return `mailto:${email}?subject=${subject}&body=${body}`
    }

    onMounted(() => {
      loadApplicants('orders_2025', true)
      loadContractDeliveryTemplate()
      loadTicketDeliveryTemplate()
    })

    return {
      applicants,
      filteredApplicants,
      viewStyle,
      relevantFilters,
      loadApplicants,
      applyFilter,
      clearFilters,
      deliverContract,
      deliverTicket,
      sendSMS,
      sms_icon,
      ticket_icon,
      meals_icon: meal_icon,
      sendEmail,
      compensation_icon,
      updateCompensation,
      generateContract,
      confirmPaymentReceived,
      revokeTicket,
      previewTicket,
      mixTrack,
      contract,
      contractEmailBody,
      ticketEmailBody
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 0.5rem;
  background-color: #1f1e22;
  color: #f0f4f8;
}

.banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #333;
  padding: 1rem;
  border-radius: 10px;
}

.logo {
  height: auto;
  width: 150px;
}

h1 {
  color: var(--festivall-baby-blue);
}

.controls,
.filters {
  margin-bottom: 0.5rem;
}

.buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
}

button {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 5px;
  background-color: var(--festivall-baby-blue);
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

.view-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.view-toggle label {
  margin: 0 1rem;
  cursor: pointer;
}

.dashboard-panel {
  background-color: #333;
  padding: 0.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.applicants {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.applicants.rows {
  flex-direction: column;
  width: 100%;
}

.applicant {
  background-color: #444;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  text-align: left;
}

.applicants.cards .applicant {
  width: 100%;
  max-width: 300px;
  height: 350px;
  align-items: center;
  text-align: center;
  overflow: hidden;
  position: relative;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid var(--festivall-baby-blue);
}

.applicant:hover {
  transform: scale(1.05);
}

.applicant-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.id_code {
  color: var(--festivall-baby-blue);
}

.actions {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  border-radius: 8px;
}

input {
  width: 40%;
  padding: 0.4rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--festivall-baby-blue);
}

h2 {
  margin: 0;
  padding: 0;
  color: var(--festivall-baby-blue);
}

p {
  margin: 0;
  color: #f0f4f8;
}

a {
  color: var(--festivall-baby-blue);
  text-decoration: none;
  border-radius: 6px;
}

.action-icon {
  height: 42px;
  width: 42px;
  cursor: pointer;
  margin: 3px;
}
</style>
