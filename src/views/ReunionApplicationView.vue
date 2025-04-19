<script setup>
import frog_image from '@/assets/images/frog.png'
import reunion_emblem from '../assets/images/reunion_emblem_white.png'
import artist_icon from '../assets/images/icons/artist.png'
import volunteer_icon from '../assets/images/icons/volunteer.png'
import workshop_icon from '../assets/images/icons/workshop.png'
import ticket_icon from '../assets/images/icons/ticket.png'
import meal_icon from '../assets/images/icons/meals.png'
import art_installation_icon from '../assets/images/icons/art_installation.png'
import vendor_icon from '../assets/images/icons/vendor.png'
import profit_icon from '../assets/images/icons/profit.png'
import footer from '@/assets/images/poster_footer_v1.png'

import { ref, onMounted } from 'vue'
import axios from 'axios'
import { reunion_db } from '@/firebase'
import { collection, getDoc, doc, setDoc } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { sendSMS, sendEmail } from '/scripts/notifications.js'

const form = ref({
  id_code_long: '',
  id_code: '',
  fullname: '',
  email: '',
  phone: '',
  street_address: '',
  city: '',
  province: '',
  country: '',
  postal_code: '',
  formatted_phone: '',
  payment_type: 'inkind',
  applicant_types: [],
  act_type: '',
  act_name: '',
  genre: '',
  act_description: '',
  mix_track_url: '',
  act_website: '',
  social_url: '',
  press_kit_url: '',
  logo_url: '',
  rates: '',
  volunteer_type: '',
  volunteer_availability: [],
  workshop_title: '',
  workshop_description: '',
  workshop_requirements: '',
  vendor_type: '',
  vendor_description: '',
  vendor_requirements: '',
  vendor_url: '',
  statement: '',
  installation_title: '',
  installation_description: '',
  space_requirements: '',
  other_requirements: '',
  portfolio_url: '',
  fixture_type: '',
  contract_signed: false
})

const submitting = ref(false)

const fetchApplicantData = async (id_code) => {
  try {
    const docRef = doc(reunion_db, 'applications', id_code)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      form.value = { ...form.value, ...docSnap.data() }
    } else {
      console.log('No such document in applications!')

      // Try fetching from 'orders' collection
      const ordersDocRef = doc(reunion_db, 'orders', id_code)
      const ordersDocSnap = await getDoc(ordersDocRef)
      if (ordersDocSnap.exists()) {
        form.value = { ...form.value, ...ordersDocSnap.data() }
      } else {
        console.log('No such document in orders!')
      }
    }
  } catch (error) {
    console.error('Error fetching document:', error)
  }
}

const addApplicant = async () => {
  try {
    await setDoc(doc(reunion_db, 'applications_2025', form.value.id_code), form.value)
    console.log('Document successfully written!')
  } catch (error) {
    console.error('Error writing document:', error)
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
  form.value.phone = event.target.value
  form.value.formatted_phone = formatPhoneNumber(event.target.value)
}

const submitForm = async () => {
  if (submitting.value) return
  submitting.value = true

  form.value.raw_phone = form.value.phone.replace(/\D/g, '')

  try {
    // Generate `id_code_long` based on user-provided `id_code` or create a new one
    if (form.value.id_code) {
      // Use the provided `id_code` as the prefix for the UUID
      const uuidSuffix = uuidv4().slice(5) // Generate the remaining characters of the UUID
      form.value.id_code_long = `${form.value.id_code}${uuidSuffix}`
    } else {
      // Generate a completely new UUID and use the first 5 characters as the `id_code`
      form.value.id_code_long = uuidv4()
      form.value.id_code = form.value.id_code_long.slice(0, 5)
    }

    // Add the applicant to the database
    await addApplicant()

    // Send the application to the Slack webhook
    const response = await axios.post(
      'https://relayproxy.vercel.app/reunion_applications',
      {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:bust_in_silhouette: ${form.value.fullname}\n:email: ${form.value.email}\n:phone: ${form.value.formatted_phone}\n:globe_with_meridians: ${form.value.city}\n:trident: ${form.value.applicant_types.join(', ')}\n:cd: ${form.value.mix_track_url}\n:memo: ${form.value.statement}\n:id: ${form.value.id_code}\n:bookmark_tabs: <https://festivall.ca/dashboard|Dashboard>`
            }
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.status === 200) {
      alert(
        'Your application has been submitted successfully!\nSelected applicants will be contacted by our team directly.'
      )

      // Send SMS and email notifications if applicable
      if (form.value.phone) {
        await sendSMS(form.value.phone, `Thank you for applying to Reunion 2025!`)
      }
      if (form.value.email) {
        await sendEmail(
          form.value.email,
          `Reunion 2025`,
          `Your application has been submitted successfully!\nSelected applicants will be contacted by our team directly.`
        )
      }

      // Reset the form after successful submission
      form.value = {
        id_code_long: '',
        id_code: '',
        fullname: '',
        email: '',
        phone: '',
        street_address: '',
        city: '',
        province: '',
        country: '',
        postal_code: '',
        formatted_phone: '',
        payment_type: 'inkind',
        applicant_type: '',
        act_type: '',
        act_name: '',
        genre: '',
        act_description: '',
        mix_track_url: '',
        act_website: '',
        social_url: '',
        press_kit_url: '',
        logo_url: '',
        volunteer_type: '',
        workshop_title: '',
        workshop_description: '',
        workshop_requirements: '',
        vendor_type: '',
        vendor_description: '',
        vendor_requirements: '',
        vendor_url: '',
        statement: '',
        rates: '',
        volunteer_availability: [],
        installation_title: '',
        installation_description: '',
        space_requirements: '',
        other_requirements: '',
        portfolio_url: '',
        fixture_type: '',
        contract_signed: false
      }
    } else {
      alert('Failed to submit the form.')
    }
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (import.meta.env.MODE === 'development') {
    // Mock data for testing in development mode
    form.value = {
      id_code_long: 'a2c4e-' + uuidv4().slice(5),
      id_code: 'a2c4e',
      fullname: 'Prasenjit Das',
      email: 'dasrecord@protonmail.com',
      phone: '306-491-6040',
      street_address: '736 Henry Dayday Road',
      city: 'Saskatoon',
      province: 'Saskatchewan',
      country: 'Canada',
      postal_code: 'S7W1E2',
      formatted_phone: '(123)456-7890',
      payment_type: 'inkind',
      applicant_types: ['Artist', 'Volunteer', 'Workshop', 'Art Installation', 'Vendor'],
      act_type: 'DJ',
      act_name: 'Das Record',
      genre: 'Ambient',
      act_description: 'Live Piano over Liquid Drum and Bass',
      mix_track_url: 'https://soundcloud.com/dasrecord/das-record-the-smirk-bootleg',
      act_website: 'https://festivall.ca/dasrecord',
      social_url: 'https://instagram.com/dasrecord',
      press_kit_url: 'https://festivall.ca/about',
      logo_url: 'https://1drv.ms/u/s!AmQS9nkxDiX4gehuc_5c2T_hUphbIQ?e=77rWMu',
      volunteer_type: 'Stage Crew',
      workshop_title: 'Bitcoin - Part 2',
      workshop_description: 'An introduction to wallets & keys.',
      workshop_requirements: 'Whiteboard or projector, 1 vocal mic.',
      vendor_type: 'Merchandise',
      vendor_description: 'Branded Hoodies',
      vendor_requirements: 'Table for display.',
      vendor_url: 'https://festivall.ca/reunion',
      statement:
        'Skill is hitting that others cannot hit, genius is hitting that others cannot see.',
      rates: 'A bottle of amaretto.',
      volunteer_availability: [
        'Aug 25',
        'Aug 26',
        'Aug 27',
        'Aug 28',
        'Aug 29',
        'Aug 30',
        'Aug 31',
        'Sept 1'
      ],
      installation_title: 'Video Game Arcade',
      installation_description: 'A linux based retro video game arcade station.',
      space_requirements: 'Indoor setting.',
      other_requirements: '2 chairs and power access.',
      portfolio_url: 'https://festivall.ca/',
      fixture_type: 'Non-permanent',
      contract_signed: false
    }
  }
  console.log(form.value)
})
</script>
<template>
  <a href="/">
    <img
      src="@/assets/images/festivall_emblem_white.png"
      alt="Festivall Logo"
      class="logo"
      style="display: flex; align-items: center; height: auto; width: 100px; margin: auto"
    />
  </a>
  <div class="basic">
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
        <h1>Interested in performing at Reunion 2025?</h1>
        <h3>
          Please fill out the form below.<br />
          If you have a
          <span class="highlight">Festivall ID_CODE</span> and would like us to use your existing
          information,<br />
          please enter it first.<br /><br />
        </h3>
      </div>
      <h4 class="disclaimer">
        <div>
          <h1>Compensation Schedule:</h1>
        </div>
        Please note that submitting this form does not guarantee a performance slot.<br />
        Be sure to read the corresponding duties* for your category before applying.<br />
        <br />
        <div class="applicant-type">
          <div>
            <img :src="artist_icon" alt="artist" class="icon" />
            <h1><span class="highlight">ARTISTS</span></h1>
          </div>
          <div>
            <h2>
              <img
                :src="ticket_icon"
                alt="ticket"
                class="icon"
                style="transform: rotate(-45deg) translateY(-10px) translateX(12px); scale: 0.8"
              /><img
                :src="ticket_icon"
                alt="ticket"
                class="icon"
                style="transform: rotate(-45deg) translateY(-10px) translateX(12px); scale: 0.8"
              />
              <h4>
                Weekend Pass<br />
                + 1 Guest<br />
              </h4>
              <RouterLink to="/reunion-artist-responsibilities" class="info"
                >*Artist Duties*</RouterLink
              >
            </h2>
          </div>
        </div>
        <div class="applicant-type">
          <div>
            <img :src="volunteer_icon" alt="volunteer" class="icon" />
            <h1><span class="highlight">VOLUNTEERS</span></h1>
          </div>
          <div>
            <h2>
              <img
                :src="ticket_icon"
                alt="ticket"
                class="icon"
                style="transform: rotate(-45deg) translateY(-12px) translateX(12px); scale: 0.8"
              /><img :src="meal_icon" alt="meal" class="icon" style="scale: 0.8" />
              <h4>
                Weekend Pass<br />
                + 1 Meal Package/DayWorked<br />
              </h4>
              <RouterLink to="/reunion-volunteer-responsibilities" class="info"
                >*Volunteer Duties*</RouterLink
              >
            </h2>
          </div>
        </div>
        <div class="applicant-type">
          <div>
            <img :src="workshop_icon" alt="workshop" class="icon" />
            <h1><span class="highlight">WORKSHOPS</span></h1>
          </div>
          <div>
            <h2>
              <img
                :src="ticket_icon"
                alt="ticket"
                class="icon"
                style="transform: rotate(-45deg) translateY(-12px) translateX(12px); scale: 0.8"
              />
              <h4>Weekend Pass<br /></h4>
              <RouterLink to="/reunion-workshop-responsibilities" class="info"
                >*Workshop Duties*</RouterLink
              >
            </h2>
          </div>
        </div>
        <div class="applicant-type">
          <div>
            <img
              :src="art_installation_icon"
              alt="art installation"
              class="icon"
              style="scale: 1.3; transform: translateY(-5px)"
            />
            <h1><span class="highlight">ART INSTALLATIONS</span></h1>
          </div>
          <div>
            <h2>
              <img
                :src="ticket_icon"
                alt="ticket"
                class="icon"
                style="transform: rotate(-45deg) translateY(-12px) translateX(12px); scale: 0.8"
              />
              <h4>Weekend Pass<br /></h4>
              <RouterLink to="/reunion-artinstallation-responsibilities" class="info"
                >*Installation Duties*</RouterLink
              >
            </h2>
          </div>
        </div>
        <div class="applicant-type">
          <div>
            <img :src="vendor_icon" alt="vendor" class="icon" />
            <h1><span class="highlight">VENDORS</span><br /></h1>
          </div>
          <div>
            <h2>
              <img :src="profit_icon" alt="profit" class="icon" style="scale: 0.8" />
              <h4>Keep 100% of Profits<br /></h4>
              <RouterLink to="/reunion-vendor-responsibilities" class="info"
                >*Vendor Duties*</RouterLink
              >
            </h2>
          </div>
        </div>
      </h4>

      <br />
      <form @submit.prevent="submitForm">
        <div class="form-section">
          <label for="id_code">ID_CODE:</label>
          <input
            type="text"
            id="id_code"
            v-model="form.id_code"
            placeholder="Enter your ID_CODE if you have one!"
            @blur="fetchApplicantData(form.id_code)"
          />
        </div>
        <div class="form-section">
          <label for="name">Full Name:</label>
          <input
            type="text"
            id="name"
            v-model="form.fullname"
            placeholder="Please use your legal name."
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
          <label for="address">Street Address:</label>
          <input
            type="text"
            id="address"
            v-model="form.street_address"
            placeholder="123 Main St."
            required
          />
        </div>
        <div class="form-section">
          <label for="city">City:</label>
          <input type="text" id="city" v-model="form.city" placeholder="Enter your city" required />
        </div>
        <div class="form-section">
          <label for="province">Province/Region:</label>
          <input
            type="text"
            id="region"
            v-model="form.province"
            placeholder="Province/Region"
            required
          />
        </div>
        <div class="form-section">
          <label for="country">Country:</label>
          <input type="text" id="country" v-model="form.country" placeholder="Canada" required />
        </div>
        <div class="form-section">
          <label for="postal_code">Postal Code:</label>
          <input
            type="text"
            id="postal_code"
            v-model="form.postal_code"
            placeholder="A1A 1A1"
            required
          />
        </div>
        <div class="form-section">
          <label for="applicant_type">Categories:</label>
          <div class="checkboxes">
            <span class="checkbox-label">
              <input type="checkbox" id="artist" value="Artist" v-model="form.applicant_types" />
              Artist
            </span>

            <span class="checkbox-label">
              <input
                type="checkbox"
                id="volunteer"
                value="Volunteer"
                v-model="form.applicant_types"
              />
              Volunteer
            </span>

            <span class="checkbox-label">
              <input
                type="checkbox"
                id="workshop"
                value="Workshop"
                v-model="form.applicant_types"
              />
              Workshop
            </span>
            <span class="checkbox-label">
              <input
                type="checkbox"
                id="art_installation"
                value="Art Installation"
                v-model="form.applicant_types"
              />
              Art Installation
            </span>
            <span class="checkbox-label">
              <input type="checkbox" id="vendor" value="Vendor" v-model="form.applicant_types" />
              Vendor
            </span>
          </div>
        </div>

        <!-- Conditional Form Sections -->
        <!-- ARTIST -->
        <div v-if="form.applicant_types.includes('Artist')">
          ARTIST SECTION
          <div class="form-section">
            <label for="act_type">Act Type:</label>
            <select id="act_type" v-model="form.act_type" required>
              <option value="" disabled>What type of artist are you?</option>
              <option value="DJ">DJ</option>
              <option value="Musician">Musician</option>
              <option value="Spoken Word">Spoken Word</option>
              <option value="Live Band">Live Band</option>
              <option value="Singer/Songwriter">Singer/Songwriter</option>
              <option value="Rapper">Rapper</option>
              <option value="Dancer">Dancer</option>
            </select>
          </div>

          <div class="form-section">
            <label for="act_name">Act Name:</label>
            <input
              type="text"
              id="act_name"
              v-model="form.act_name"
              placeholder="What is your stage name?"
            />
          </div>
          <div class="form-section">
            <label for="genre">Genre:</label>
            <select id="genre" v-model="form.genre" required>
              <option value="" disabled>Select your genre</option>
              <option value="House">House</option>
              <option value="Techno">Techno</option>
              <option value="Trance">Trance</option>
              <option value="Drum and Bass">Drum and Bass</option>
              <option value="Hip Hop">Hip Hop</option>
              <option value="Garage">Garage</option>
              <option value="Dubstep">Dubstep</option>
              <option value="Ambient">Ambient</option>
              <option value="Electro">Electro</option>
              <option value="Synthwave">Synthwave</option>
              <option value="Future Bass">Future Bass</option>
              <option value="Trap">Trap</option>
              <option value="Hardstyle">Hardstyle</option>
              <option value="Progressive">Progressive</option>
              <option value="Chillout">Chillout</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="form-section">
            <label for="act_description">Description:</label>
            <textarea
              id="act_description"
              v-model="form.act_description"
              placeholder="Please use third person.1000 Character Limit"
              required
              maxlength="1000"
            ></textarea>
          </div>
          <div class="form-section">
            <label for="mix_track_url">Mix/Track URL:</label>
            <input
              type="url"
              id="mix_track_url"
              v-model="form.mix_track_url"
              placeholder="This link will be shown on the artist lineup page."
              required
            />
          </div>
          <div class="form-section">
            <label for="act_website">Act/Website URL:</label>
            <input
              type="url"
              id="act_website_url"
              v-model="form.act_website"
              placeholder="Enter your artist website here if you have one."
            />
          </div>
          <div class="form-section">
            <label for="social_url">Social Media URL:</label>
            <input
              type="url"
              id="social_url"
              v-model="form.social_url"
              placeholder="X, FB, IG, TT, LI"
            />
          </div>
          <div class="form-section">
            <label for="press_kit_url">Press Kit URL:</label>
            <input
              type="url"
              id="press_kit_url"
              v-model="form.press_kit_url"
              placeholder="Please provide a link to a downloadable press kit."
            />
          </div>
          <div class="form-section">
            <label for="logo_url">Logo URL:</label>
            <input
              type="url"
              id="logo_url"
              v-model="form.logo_url"
              placeholder="We prefer .SVG vector files, or high resolution .PNG with alpha layer."
            />
          </div>
        </div>

        <!-- VOLUNTEER -->
        <div v-if="form.applicant_types.includes('Volunteer')">
          VOLUNTEER SECTION
          <div class="form-section">
            <label for="volunteer_type">Volunteer Type:</label>
            <select id="volunteer_type" v-model="form.volunteer_type" required>
              <option value="" disabled>What team are you interested in?</option>
              <option value="Setup Crew">Setup Crew</option>
              <option value="Cleanup Crew">Cleanup Crew</option>
              <option value="Stage Crew">Stage Crew</option>
              <option value="Front Gate">Front Gate</option>
              <option value="Food Team">Food Team</option>
            </select>
          </div>
          <div class="form-section">
            <label for="volunteer_availability">Availability:</label>
            <div class="checkboxes">
              <span class="checkbox-label">
                <input type="checkbox" v-model="form.volunteer_availability" value="Aug 25" />
                Aug 25
              </span>

              <span class="checkbox-label">
                <input type="checkbox" v-model="form.volunteer_availability" value="Aug 26" />
                Aug 26
              </span>

              <span class="checkbox-label">
                <input type="checkbox" v-model="form.volunteer_availability" value="Aug 27" />
                Aug 27
              </span>

              <span class="checkbox-label">
                <input type="checkbox" v-model="form.volunteer_availability" value="Aug 28" />
                Aug 28
              </span>

              <span class="checkbox-label">
                <input type="checkbox" v-model="form.volunteer_availability" value="Aug 29" />
                Aug 29
              </span>

              <span class="checkbox-label">
                <input type="checkbox" v-model="form.volunteer_availability" value="Aug 30" />
                Aug 30
              </span>

              <span class="checkbox-label">
                <input type="checkbox" v-model="form.volunteer_availability" value="Aug 31" />
                Aug 31
              </span>

              <span class="checkbox-label">
                <input type="checkbox" v-model="form.volunteer_availability" value="Sept 1" />
                Sept 1
              </span>
            </div>
          </div>
        </div>

        <!-- WORKSHOP -->
        <div v-if="form.applicant_types.includes('Workshop')">
          WORKSHOP SECTION
          <div class="form-section">
            <label for="workshop_title">Title:</label>
            <input
              type="text"
              id="workshop_title"
              v-model="form.workshop_title"
              placeholder="What is the name of your workshop?"
            />
          </div>
          <div class="form-section">
            <label for="workshop_description">Description:</label>
            <textarea
              id="workshop_description"
              v-model="form.workshop_description"
              placeholder="Please provide a detailed description of your workshop."
              maxlength="1000"
              required
            ></textarea>
          </div>
          <div class="form-section">
            <label for="workshop_requirements">Requirements:</label>
            <textarea
              id="workshop_requirements"
              v-model="form.workshop_requirements"
              placeholder="Specify the requirements for your workshop."
              maxlength="500"
              required
            ></textarea>
          </div>
        </div>

        <!-- ART INSTALLATION -->
        <div v-if="form.applicant_types.includes('Art Installation')">
          ART INSTALLATION SECTION
          <div class="form-section">
            <label for="installation_title">Title:</label>
            <input
              type="text"
              id="installation_title"
              v-model="form.installation_title"
              placeholder="What is the name of your installation?"
              required
            />
          </div>
          <div class="form-section">
            <label for="fixture_type">Fixture Type:</label>
            <select id="fixture_type" v-model="form.fixture_type" required>
              <option value="" disabled>Is this a permanent or non-permanent fixture?</option>
              <option value="Permanent">Permanent</option>
              <option value="Non-permanent">Non-permanent</option>
            </select>
          </div>
          <div class="form-section">
            <label for="installation_description">Description:</label>
            <textarea
              id="installation_description"
              v-model="form.installation_description"
              placeholder="Provide a detailed description of your installation."
              maxlength="1000"
              required
            ></textarea>
          </div>
          <div class="form-section">
            <label for="space_requirements">Requirements:</label>
            <textarea
              id="physical_space_requirements"
              v-model="form.space_requirements"
              placeholder="Specify the physical space requirements for your installation."
              maxlength="500"
              required
            ></textarea>
          </div>
          <div class="form-section">
            <label for="other_requirements">Other Requirements:</label>
            <textarea
              id="other_requirements"
              v-model="form.other_requirements"
              placeholder="Electricity, building materials, etc."
              maxlength="500"
            ></textarea>
          </div>
          <div class="form-section">
            <label for="portfolio_url">Portfolio URL:</label>
            <input
              type="url"
              id="portfolio_url"
              v-model="form.portfolio_url"
              placeholder="Provide a link to your portfolio or previous work."
            />
          </div>
        </div>

        <!-- VENDOR -->
        <div v-if="form.applicant_types.includes('Vendor')">
          VENDOR SECTION
          <div class="form-section">
            <label for="vendor_type">Vendor Type:</label>
            <select id="vendor_type" v-model="form.vendor_type" required>
              <option value="" disabled>What type of vendor are you?</option>
              <option value="Food">Food</option>
              <option value="Merchandise">Merchandise</option>
              <option value="Artisan">Artisan</option>
              <option value="Service">Service</option>
            </select>
          </div>
          <div class="form-section">
            <label for="vendor_description">Vendor Description:</label>
            <textarea
              id="vendor_description"
              v-model="form.vendor_description"
              placeholder="Provide a brief description of your products or services."
              maxlength="500"
              required
            ></textarea>
          </div>
          <div class="form-section">
            <label for="vendor_requirements">Requirements:</label>
            <textarea
              id="vendor_requirements"
              v-model="form.vendor_requirements"
              placeholder="Specify any requirements for your vendor setup (e.g., electricity, space)."
              maxlength="500"
            ></textarea>
          </div>
          <div class="form-section">
            <label for="vendor_url">Vendor URL:</label>
            <input
              type="url"
              id="vendor_url"
              v-model="form.vendor_url"
              placeholder="Provide a link to your vendor website or product page."
            />
          </div>
        </div>

        <div class="form-section">
          <label for="statement">Statement:</label>
          <textarea
            id="statement"
            v-model="form.statement"
            placeholder="Leave a personal statement to the festival team. Tell us what sets you apart from other applicants."
          ></textarea>
        </div>
        <button type="submit">SUBMIT</button>
      </form>
      <div class="footer">
        <img :src="footer" alt="footer" style="max-width: 600px" />
      </div>
    </h3>
  </div>
</template>

<style scoped>
#app {
  padding: 0;
}

.reunion-emblem {
  border-radius: 0%;
  width: 75%;
}
.basic {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 100%;
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
  max-width: 250px;
}

.applicant-type {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  border: 1px solid var(--reunion-frog-green);
  border-radius: 15px;
  padding: 1rem;
  margin: 1rem;
}
.icon {
  width: 50px;
  height: auto;
  margin-top: 1rem;
}

.info {
  color: var(--reunion-frog-green);
  font-weight: bold;
  text-decoration: none;
  font-size: smaller;
}

.application-form {
  width: 80vw;
  padding: 0.5rem;
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
  width: 25%;
  height: 40px;
  text-align: left;
  padding: 10px;
  background-color: var(--reunion-frog-green);
  color: white;
  font-weight: bold;
  border-radius: 15px 0 0 15px;
}

input,
textarea,
select {
  width: 75%;
  height: 42px;
  font-family: Helvetica;
  gap: 0.5rem;
  border-radius: 0 15px 15px 0;
  padding: 5px;
  margin: 5px;
  cursor: pointer;
}
input[type='checkbox'] {
  width: 20px;
  height: 20px;
  margin: 5px;
  cursor: pointer;
}
.checkboxes {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 3px;
  justify-items: center;
  align-items: center;
  text-align: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
}
button {
  background-color: white;
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 5px;
}
button:hover {
  background-color: var(--reunion-frog-green);
  color: white;
}
.highlight {
  color: var(--reunion-frog-green);
  text-shadow: 0px 0px 5px rgba(255, 255, 255, 0.5);
}

table {
  display: flex;
  flex-direction: column;

  border-collapse: collapse;
  margin: 1rem;
  border: 1px solid white;
  td {
    padding: 10px;
    border: 1px solid white;
    text-align: center;
  }
}

@media (max-width: 600px) {
  .applicant-type {
    padding: 0.5rem;
  }
  h1 {
    font-size: large;
  }
  .application-form {
    width: 100%;
    padding: 0.5rem;
  }

  .form-section {
    flex-direction: column;
    align-items: center;
  }

  label {
    width: 100%;
    height: auto;
    padding: 5px;
    border-radius: 15px 15px 0 0;
    font-weight: bold;
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

  .checkboxes {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
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
    text-align: center;
  }
  .info,
  h4 {
    font-size: 1rem;
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
  max-width: 600px;
}
</style>
