<template>
  <div class="dashboard">
    <div class="banner">
      <a href="/">
        <img src="@/assets/images/festivall_emblem_white.png" alt="Festivall Logo" class="logo" />
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
        <!-- <button @click="loadApplicants('blessed_coast')">Blessed Coast</button> -->
        <!-- <button @click="loadApplicants('impact')">Impact</button> -->
        <!-- <button @click="loadApplicants('cream_collective')">Cream Collective</button> -->
        <!-- <button @click="loadApplicants('evolved_music_group')">Evolved Music Group</button> -->
        <!-- <button @click="loadApplicants('rapture')">Rapture</button> -->
        <!-- <button @click="loadApplicants('partywell')">PartyWell</button> -->
        <!-- <button @click="loadApplicants('festivall', true)">Festivall</button> -->
        <!-- <button @click="loadApplicants('reunion')">Reunion Static</button> -->
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
      <div>
        <!-- <button @click="generateLineup">Download .ics</button> -->
      </div>
      <h2>Current View <br />{{ filteredApplicants.length }}</h2>
      <div class="applicants" :class="viewStyle">
        <div v-for="applicant in filteredApplicants" :key="applicant.id" class="applicant">
          <div class="applicant-content" :class="viewStyle">
            <div class="name-section">
              <h2>
                <!-- ACT NAME OR FULLNAME -->

                <a v-if="applicant.url" :href="applicant.url" target="_blank">
                  {{ applicant.act_name || applicant.full_name }}
                </a>
                <!-- EMAIL PREFIX FALL BACK -->
                <span v-else>
                  {{ applicant.fullname || applicant.email.split('@')[0] }}
                </span>
              </h2>
              <!-- ID CODE -->
              <p v-if="applicant.id_code" class="id_code">{{ applicant.id_code }}</p>
              <!-- ACT TYPE -->
              <p v-if="applicant.applicant_type">
                {{ applicant.applicant_type }}
              </p>
            </div>
            <!-- GENRE -->
            <p v-if="applicant.genre">{{ applicant.genre }}</p>
            <!-- VOLUNTEER TYPE -->
            <p v-if="applicant.volunteer_type">{{ applicant.volunteer_type }}</p>
            <!-- WORKSHOP TITLE -->
            <p v-if="applicant.workshop_title">{{ applicant.workshop_title }}</p>
            <!-- WORKSHOP DESCRIPTION -->
            <p v-if="applicant.workshop_description">{{ applicant.workshop_description }}</p>

            <!-- BIO -->
            <p>{{ applicant.bio }}</p>
            <!-- STATEMENT -->
            <p>{{ applicant.statement }}</p>
            <!-- COMMENTS -->
            <span v-if="applicant.comments">{{ applicant.comments }} </span>
          </div>

          <!-- TICKET DATA -->
          <div v-if="applicant.payment_type" class="ticket-content">
            <div class="payment-section">
              <!-- PAID STATUS -->
              Payment Status:
              <p v-if="applicant.paid" style="color: green; font-size: large">
                Paid<br />

                <button @click="revokeTicket(applicant.id_code)">Revoke Ticket</button><br />
              </p>
              <p v-else style="color: red; font-size: large">
                Unpaid<br />
                <a @click="remindPayment(applicant.id_code)">
                  <img :src="reminder_icon" alt="Remind Payment" class="action-icon" />
                </a>
              </p>
              <button @click="confirmPaymentReceived(applicant.id_code)">
                Confirm Payment Received
              </button>
              <br />
            </div>
            <div class="checkedin-section">
              <!-- CHECKED IN STATUS -->
              <p v-if="applicant.checked_in">Checked In</p>
              <p v-else>Not Checked In</p>

              <!-- TICKET TYPE -->
              <p v-if="applicant.ticket_type">Ticket Type: {{ applicant.ticket_type }}</p>
            </div>
            <div class="quantities-section">
              <!-- TICKET QUANTITY -->
              <div class="quantity">
                <p><strong>Ticket Quantity:</strong>&nbsp;{{ applicant.ticket_quantity }}</p>
                <div class="tickets">
                  <img
                    v-for="n in Number(applicant.ticket_quantity)"
                    :key="n"
                    :src="ticket_icon"
                    style="width: 32px; transform: rotate(-45deg)"
                    alt="Ticket Icon"
                    class="ticket-icon"
                  />
                </div>
              </div>
              <!-- MEAL TICKETS REMAINING -->
              <div class="quantity">
                <p><strong>Meal Tickets:</strong>&nbsp;{{ applicant.meal_tickets_remaining }}</p>
                <div class="meals">
                  <img
                    v-for="n in Number(applicant.meal_tickets_remaining)"
                    :key="n"
                    :src="meal_icon"
                    style="width: 32px"
                    alt="Meal Icon"
                    class="meal-icon"
                  />
                </div>
              </div>
            </div>

            <div class="revenue-section">
              <!-- TOTAL PRICE -->
              <p v-if="applicant.total_price">
                Total Price:
                <span
                  v-if="
                    applicant.payment_type === 'inkind' || applicant.payment_type === 'etransfer'
                  "
                  >$</span
                >{{ applicant.total_price }}
                <span v-if="applicant.payment_type === 'bitcoin'">BTC</span>
              </p>
              <!-- PAYMENT TYPE -->
              <p v-if="applicant.payment_type">Payment Type: {{ applicant.payment_type }}</p>
            </div>
            <div class="preview-section">
              <!-- PREVIEW TICKET -->
              <button @click="previewTicket(applicant.id_code)">Preview Ticket</button>
              <a
                :href="deliverTicket(applicant.email, applicant.fullname, applicant.id_code)"
                target="_blank"
              >
                <img
                  :src="ticket_icon"
                  alt="Deliver Ticket"
                  class="action-icon"
                  style="width: auto; height: 32px"
                />
              </a>
            </div>
          </div>
          <!-- DASHBOARD ACTIONS-->
          <div v-if="applicant.payment_type !== 'inkind'" class="actions">
            <a v-if="applicant.mix_track_url" :href="applicant.mix_track_url" target="_blank">
              <img :src="mixTrack_icon" alt="Listen to Mix/Track" class="action-icon" />
            </a>

            Contract Status:
            <p v-if="applicant.contract_signed" style="color: green; font-size: large">Signed</p>
            <p v-else style="color: red; font-size: large">Not Signed</p>

            <a v-if="applicant.applicant_type" @click="remindContract(applicant.id_code)">
              <img :src="reminder_icon" alt="Remind Applicant" class="action-icon" />
            </a>
            <div v-if="applicant.phone" class="message-section">
              <input type="text" v-model="applicant.message" placeholder="message applicant" />
              <img
                @click="sendSMS(applicant.phone, applicant.message), (applicant.message = '')"
                :src="sms_icon"
                alt="Send SMS"
                class="action-icon"
                style="width: auto; height: 42px"
              />
            </div>
            <div v-if="applicant.applicant_type" class="compensation-section">
              <input
                type="text"
                v-model="applicant.additional_compensation"
                placeholder="update compensation"
              />
              <img
                @click="
                  updateCompensation(applicant.id_code, applicant.additional_compensation),
                    (applicant.additional_compensation = '')
                "
                :src="compensation_icon"
                alt="Update Compensation"
                class="action-icon"
                style="width: auto; height: 32px"
              />

              <p v-if="applicant.rates">
                Fee: {{ applicant.rates }}
                <button @click="clearCompensation(applicant.id_code, '')">
                  Clear Compensation
                </button>
              </p>
            </div>

            <div
              v-if="
                applicant.applicant_type === 'Artist' || applicant.applicant_type === 'Workshop'
              "
              class="settime-section"
            >
              <input type="datetime-local" v-model="applicant.settime" />
              <img
                @click="
                  updateSettime(applicant.id_code, applicant.settime), (applicant.settime = '')
                "
                :src="lineup_icon"
                alt="Update Settime"
                class="action-icon"
                style="width: auto; height: 32px"
              />

              <p v-if="applicant.settime">
                Settime:
                {{
                  new Date(applicant.settime).toLocaleString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    year: '4-digit',
                    month: 'numeric',
                    day: 'numeric'
                  })
                }}
                <button @click="clearSettime(applicant.id_code, '')">Clear Settime</button>
              </p>
            </div>
            <div class="contract-section">
              <button @click="generateContract(applicant.id_code)">Preview Contract</button>
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
                <img :src="contract_icon" alt="Book Applicant" class="action-icon" />
              </a>
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
import mixTrack_icon from '@/assets/images/icons/mix_track.png'
import contract_icon from '@/assets/images/icons/contract.png'
import { useRoute, useRouter } from 'vue-router'
import { sendSMS, sendEmail, sendReunionApplications } from '/scripts/notifications.js'
import sms_icon from '@/assets/images/icons/sms.png'
import compensation_icon from '@/assets/images/icons/compensation.png'
import ticket_icon from '@/assets/images/icons/ticket.png'
import meal_icon from '@/assets/images/icons/meals.png'
import artist_icon from '@/assets/images/icons/artist.png'
import lineup_icon from '@/assets/images/icons/lineup.png'
import reminder_icon from '@/assets/images/icons/reminder.png'
import workshop_icon from '@/assets/images/icons/workshop.png'

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

    const clearCompensation = async (id_code, additional_compensation) => {
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
        console.error('Error clearing compensation:', error)
      }
    }

    const updateSettime = async (id_code, settime) => {
      try {
        const docRef = doc(reunion_db, 'applications_2025', id_code)
        await updateDoc(docRef, {
          settime: settime
        })
        applicants.value = applicants.value.map((applicant) => {
          if (applicant.id_code === id_code) {
            applicant.settime = settime
          }
          return applicant
        })
      } catch (error) {
        console.error('Error updating settime:', error)
      }
    }

    const clearSettime = async (id_code, settime) => {
      try {
        const docRef = doc(reunion_db, 'applications_2025', id_code)
        await updateDoc(docRef, {
          settime: settime
        })
        applicants.value = applicants.value.map((applicant) => {
          if (applicant.id_code === id_code) {
            applicant.settime = ''
          }
          return applicant
        })
      } catch (error) {
        console.error('Error clearing settime:', error)
      }
    }

    const generateLineup = () => {
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Festivall//Lineup//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Reunion Artist Lineup',
        'X-WR-TIMEZONE:America/Regina',
        'X-WR-CALDESC:Lineup for Reunion 2025',
        ...filteredApplicants.value
          .filter((applicant) => applicant.settime)
          .map((applicant) => {
            const startTime =
              new Date(applicant.settime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
            const endTime =
              new Date(new Date(applicant.settime).getTime() + 3600000)
                .toISOString()
                .replace(/[-:]/g, '')
                .split('.')[0] + 'Z' // Adds 1 hour to the start time

            return [
              'BEGIN:VEVENT',
              `UID:${applicant.id_code_long || applicant.email || Math.random().toString(36).substring(2)}`,
              `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
              `DTSTART:${startTime}`,
              `DTEND:${endTime}`,
              `SUMMARY:${applicant.act_name || applicant.workshop_title || applicant.full_name}`,
              `DESCRIPTION:${applicant.mix_track_url || ''}`,
              `LOCATION:https://festivall.ca/reunionlocation`,
              'STATUS:CONFIRMED',
              'SEQUENCE:0',
              'TRANSP:OPAQUE',
              applicant.email
                ? `ATTENDEE;CN=${applicant.full_name || applicant.act_name || 'Guest'};RSVP=TRUE:mailto:${applicant.email}`
                : '',
              `X-APPLICANT-ID:${applicant.id_code || ''}`,
              `X-APPLICANT-NAME:${applicant.full_name || applicant.act_name || ''}`,
              `X-APPLICANT-EMAIL:${applicant.email || ''}`,
              `X-APPLICANT-TYPE:${applicant.applicant_type || ''}`,
              `X-APPLICANT-ACTNAME:${applicant.act_name || ''}`,
              `X-APPLICANT-ACTDESCRIPTION:${applicant.act_description || ''}`,
              `X-APPLICANT-MIXTRACKURL:${applicant.mix_track_url || ''}`,
              `X-APPLICANT-WORKSHOPTITLE:${applicant.workshop_title || ''}`,
              `X-APPLICANT-WORKSHOPDESCRIPTION:${applicant.workshop_description || ''}`,

              'END:VEVENT'
            ]
              .filter(Boolean)
              .join('\n') // Filters out empty lines
          }),
        'END:VCALENDAR'
      ].join('\n')

      const blob = new Blob([icsContent], { type: 'text/calendar' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'lineup.ics'
      link.click()
      URL.revokeObjectURL(url)
    }

    const generateContract = (id_code) => {
      router.push({ path: `/reunioncontract/${id_code}` })
    }

    const remindContract = (id_code) => {
      const applicant = applicants.value.find((applicant) => applicant.id_code === id_code)
      if (applicant && applicant.phone) {
        const message = `Hello ${applicant.fullname || 'there'}. This is a gentle reminder to sign your contract for Reunion 2025, if you haven't already.`
        sendSMS(applicant.phone, message)
        alert('Contract reminder sent successfully.')
      } else {
        alert('Phone number not available for this applicant.')
      }
    }

    const remindPayment = (id_code) => {
      const applicant = applicants.value.find((applicant) => applicant.id_code === id_code)
      if (applicant && applicant.phone) {
        const message = `Hello ${applicant.fullname || 'there'}. This is a gentle reminder to make your payment for Reunion 2025, if you haven't already.`
        sendSMS(applicant.phone, message)
        alert('Payment reminder sent successfully.')
      } else {
        alert('Phone number not available for this applicant.')
      }
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
          sendReunionApplications(
            `:bust_in_silhouette: Payment confirmed for ${applicant.fullname}.\n:ticket: ${applicant.id_code}`
          )
          return applicant
        })
        alert('Payment status updated successfully.')
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
          sendReunionApplications(
            `:warning: Ticket revoked for ${applicant.fullname}.\n:ticket: ${applicant.id_code}`
          )
          return applicant
        })
        alert('Ticket revoked successfully.')
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
      meal_icon,
      artist_icon,
      workshop_icon,
      sendEmail,
      compensation_icon,
      updateCompensation,
      clearCompensation,
      lineup_icon,
      updateSettime,
      clearSettime,
      generateLineup,
      generateContract,
      remindContract,
      remindPayment,
      confirmPaymentReceived,
      revokeTicket,
      previewTicket,
      mixTrack_icon,
      contract_icon,
      reminder_icon,
      contractEmailBody,
      ticketEmailBody
    }
  }
}
</script>

<style scoped>
img {
  margin: 0.5rem;
}
.dashboard {
  width: 100vw;
  padding: 0.5rem;
  background-color: #1f1e22;
  color: #f0f4f8;
}

.banner {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  padding: 1rem;
  border-radius: 10px;
}

.logo {
  height: auto;
  width: 100px;
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
  border-radius: 15px;
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.9);
  transition: transform 0.3s ease;
  width: 100%;
  /* display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  text-align: left; */
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

.applicants.cards .quantities-section,
.applicants.cards .preview-section,
.applicants.cards .ticket-section,
.applicants.cards .checkedin-section,
.applicants.cards .message-section,
.applicants.cards .compensation-section,
.applicants.cards .settime-section,
.applicants.cards .revenue-section,
.applicants.cards .contract-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 10px;
  background-color: #444;
  border: 1px solid var(--festivall-baby-blue);
  width: 100%;
  align-items: center;
  max-width: 300px;
  height: 100%;
  overflow: hidden;
}

.applicants.rows .applicant,
.applicants.rows .applicant-content,
.applicants.rows .ticket-content,
.applicants.rows .quantities,
.applicants.rows .message-section,
.applicants.rows .compensation-section,
.applicants.rows .revenue-section,
.applicants.rows .settime-section,
.applicants.rows .tickets,
.applicants.rows .meals,
.applicants.rows .actions,
.applicants.rows .action-icon,
.applicants.rows img,
.applicants.rows p,
.applicants.rows input {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
}

.applicants.rows .payment-section,
.applicants.rows .quantities-section,
.applicants.rows .revenue-section {
  flex-direction: column;
  align-items: center;
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
  flex-direction: column;
  gap: 0.5rem;
}
.actions img {
  margin: auto;
}

input [type='datetime-local'],
input {
  padding: 0.4rem;
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
  display: inline-block;
  color: var(--festivall-baby-blue);
  text-decoration: none;
  border-radius: 6px;
}

.action-icon {
  width: 42px;
  height: auto;
  cursor: pointer;
  margin: 3px;
}
</style>
