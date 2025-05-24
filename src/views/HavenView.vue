<template>
  <div class="container">
    <div class="video-section">
      <video autoplay muted loop>
        <source :src="haven_video" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div class="logo">
        <img :src="haven_emblem" alt="haven emblem" class="emblem" />
      </div>
    </div>

    <div class="form-section">
      <img :src="haven_logo" alt="haven logo" class="discoball" />

      <form @submit.prevent="sendtorelay">
        <div>
          <label for="fullname">Legal Name:</label>
          <input type="text" id="fullname" v-model="form.fullname" required autocomplete="off" />
        </div>
        <div>
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="form.email" required autocomplete="off" />
        </div>
        <div>
          <label for="phone">Phone:</label>
          <input type="tel" id="phone" v-model="form.phone" required autocomplete="off" />
        </div>
        <div>
          <label for="enquiry">I Want To:</label>
          <select id="enquiry" v-model="form.enquiry" required>
            <option disabled value="">Select an option</option>
            <option value="Customer">Buy Haven Residency Tickets</option>
            <!-- <option value="Artist">Perform at Haven</option> -->
            <option value="Partner">Partner with Haven</option>
            <option value="Battle">Dance Battle at Haven</option>
            <option value="Contact">Contact Haven</option>
          </select>
        </div>
        <div v-if="form.enquiry === 'Artist'">
          <label for="act_type">Act Type:</label>
          <select id="act_type" v-model="form.act_type" required>
            <option disabled value="">Select an option</option>
            <option value="DJ">DJ</option>
            <option value="Live Performance">Live Performance</option>
            <option value="Other">Other</option>
          </select>
          <div>
            <label for="mix_url">Mix/Track URL:</label>
            <input type="url" id="mix_url" v-model="form.mix_url" required />
          </div>
        </div>
        <div v-if="form.enquiry === 'Partner'">
          <label for="partnership_type">Partnership Type:</label>
          <select id="partnership_type" v-model="form.partnership_type" required>
            <option disabled value="">Select an option</option>
            <option value="Sponsorship">Sponsorship</option>
            <option value="Collaboration">Collaboration</option>
            <option value="Other">Other</option>
          </select>
          <div>
            <label for="website">Website/URL:</label>
            <input type="url" id="website" v-model="form.website" required />
          </div>
        </div>
        <div v-if="form.enquiry === 'Customer'">
          <label for="event_date">Event Date:</label>
          <select id="event_date" v-model="form.event_date" required>
            <option disabled value="">Select a night</option>
            <option value="May 24th, 2025 ft. Joiboi">May 24th, 2025 ft. Joiboi</option>
            <option value="June 7th, 2025 ft. T.B.A">June 7th, 2025 ft. Das Record</option>
            <option value="June 20th, 2025 ft. Doctor Yvo">June 20th, 2025 ft. Doctor Yvo</option>
            <option value="July 5th, 2025 ft. Mr. Fudge">July 5th, 2025 ft. Mr. Fudge</option>
            <option value="July 19th, 2025 ft. Snakeman">July 19th, 2025 ft. Snakeman</option>
            <option value="August 2nd, 2025 ft. Das Record">August 2nd, 2025 ft. Das Record</option>
            <option value="August 16th, 2025 ft. Will Wallace">
              August 16th, 2025 ft. Will Wallace
            </option>
          </select>
        </div>

        <div v-if="form.enquiry === 'Battle'">
          <div>
            <label for="act_name">Act Name:</label>
            <input type="text" id="act_name" v-model="form.act_name" required />
          </div>
          <div>
            <label for="dance_style">Dance Style:</label>
            <select id="dance_style" v-model="form.dance_style" required>
              <option disabled value="">Select an option</option>
              <option value="Hip Hop">Hip Hop</option>
              <option value="Breaking">Breaking</option>
              <option value="Popping">Popping</option>
              <option value="Locking">Locking</option>
              <option value="House">House</option>
              <option value="Krump">Krump</option>
              <option value="Waacking">Waacking</option>
              <option value="Voguing">Voguing</option>
              <option value="Tutting">Tutting</option>
              <option value="Animation">Animation</option>
              <option value="Contemporary">Contemporary</option>
              <option value="Dancehall">Dancehall</option>
              <option value="Ballet">Ballet</option>
              <option value="Tap">Tap</option>
              <option value="Jazz">Jazz</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label for="act_url">Video URL:</label>
            <input type="url" id="video_url" v-model="form.video_url" required />
          </div>

          <div>
            <label>
              <input type="checkbox" v-model="form.agree_communication" required />
              I agree to receive communication from Haven.
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" v-model="form.participate_risk" required />
              I agree to participate at my own risk.
            </label>
          </div>
        </div>

        <div v-if="form.enquiry === 'Contact'">
          <label for="message">Message:</label>
          <textarea id="message" v-model="form.message" required rows="3"></textarea>
        </div>

        <button type="submit">SUBMIT</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import haven_emblem from '../assets/images/haven_emblem_white.png'
import haven_logo from '../assets/images/haven_logo_white.png'
import haven_video from '../assets/videos/haven/luxe.mp4'
import { v4 as uuidv4 } from 'uuid'
import { festivall_db } from '@/firebase'
import { getDoc, doc, setDoc } from 'firebase/firestore'

export default {
  data() {
    return {
      haven_emblem,
      haven_logo,
      haven_video,
      form: {
        id_code_long: '',
        id_code: '',
        fullname: '',
        email: '',
        phone: '',
        act_name: '',
        video_url: '',
        dance_style: '',
        agree_communication: false,
        participate_risk: false,
        enquiry: '',
        act_type: '',
        mix_url: '',
        partnership_type: '',
        website: '',
        event_date: '',
        message: '',
        battles: [],
        paid: false,
        checked_in: false
      }
    }
  },
  methods: {
    async addToHavenList() {
      console.log('addToHavenList called with form data:', this.form)
      if (!this.form.email) {
        console.error('Email is required to create a document reference.')
        alert('Please provide a valid email address.')
        return
      }

      try {
        const docRef = doc(festivall_db, 'haven', this.form.id_code)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          console.log('Document already exists in haven list:', docSnap.data())
          alert('You are on the mailing list!')
        } else {
          await setDoc(docRef, {
            id_code_long: this.form.id_code_long,
            id_code: this.form.id_code,
            fullname: this.form.fullname,
            email: this.form.email,
            phone: this.form.phone,
            enquiry: this.form.enquiry,
            act_type: this.form.act_type,
            mix_url: this.form.mix_url,
            partnership_type: this.form.partnership_type,
            website: this.form.website,
            act_name: this.form.act_name,
            video_url: this.form.video_url,
            agree_communication: this.form.agree_communication,
            participate_risk: this.form.participate_risk,
            message: this.form.message,
            records: [],
            timestamp: new Date()
          })
          console.log('Document successfully written to haven list!')
          alert('You have been added to the mailing list!')
        }
      } catch (error) {
        console.error('Error in addToHavenList:', error)
      }
    },
    async sendtorelay() {
      // Only generate a new id_code if it doesn't already exist
      if (!this.form.id_code_long || !this.form.id_code) {
        this.form.id_code_long = uuidv4()
        this.form.id_code = this.form.id_code_long.slice(0, 5)
      }

      console.log('sendtorelay called with form data:', this.form)

      const slackPayload = {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:id: ${this.form.id_code}\n:bust_in_silhouette: ${this.form.fullname}\n:Email: ${this.form.email}\n:haven_logo_white: ${this.form.enquiry}${
                this.form.enquiry === 'Battle'
                  ? `\n:trident: ${this.form.act_name}\n:vhs: ${this.form.video_url}`
                  : ''
              }${this.form.enquiry === 'Customer' ? `\n:calendar: ${this.form.event_date}` : ''}${
                this.form.message ? `\n:pencil: ${this.form.message}` : ''
              }`
            }
          }
        ]
      }

      try {
        const response = await axios.post(
          'https://relayproxy.vercel.app/festivall_haven',
          slackPayload,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        console.log('Slack notification sent successfully:', response.data)

        await this.addToHavenList()

        if (this.form.enquiry === 'Customer') {
          const idCode = this.form.id_code
          navigator.clipboard
            .writeText(idCode)
            .then(() => {
              alert(
                `Write down your Festivall ID CODE: ${idCode}\n\nAfter payment, you can use it login and access your ticket.`
              )
              setTimeout(() => {
                const baseUrl = 'https://festivall.ca'
                const successUrl = `${baseUrl}/haventicket/${idCode}`
                const stripeUrl = `https://buy.stripe.com/5kQaEXbUCd1v9lTgfZ28800?success_url=${encodeURIComponent(
                  successUrl
                )}`
                window.location.href = stripeUrl
              }, 1000)
            })
            .catch(() => {
              alert(
                `Write down your Festivall ID CODE: ${idCode}\n\nAfter payment, you can use it login and access your ticket.`
              )
              setTimeout(() => {
                const baseUrl = 'https://festivall.ca'
                const successUrl = `${baseUrl}/haventicket/${idCode}`
                const stripeUrl = `https://buy.stripe.com/5kQaEXbUCd1v9lTgfZ28800?success_url=${encodeURIComponent(
                  successUrl
                )}`
                window.location.href = stripeUrl
              }, 1000)
            })
        } else {
          this.form = {
            fullname: '',
            email: '',
            phone: '',
            act_name: '',
            video_url: '',
            agree_communication: false,
            participate_risk: false,
            enquiry: '',
            act_type: '',
            mix_url: '',
            partnership_type: '',
            website: '',
            event_date: '',
            message: ''
          }
          this.$router.push({ name: 'haveninstagram' })
        }
      } catch (error) {
        console.error('Error in sendtorelay:', error)
        alert('Error submitting form. Please try again.')
      }
    }
  },
  mounted() {
    console.log('HavenView mounted')
    if (import.meta.env.MODE === 'development') {
      this.form = {
        id_code: '1b3d5',
        fullname: 'Prasenjit',
        email: 'dasrecord@protonmail.com',
        phone: '13064916040',
        act_name: '',
        video_url: '',
        agree_communication: '',
        participate_risk: '',
        enquiry: 'Customer',
        act_type: '',
        mix_url: '',
        partnership_type: '',
        website: '',
        event_date: '',
        message: '',
        paid: false,
        checked_in: false
      }
      console.log('Development mode: pre-filled form data:', this.form)
    }
  }
}
</script>

<style scoped>
* {
  /* border: 1px solid lime; */
}
.container {
  display: flex;
  flex-direction: column;
  height: 96vh;
}

.discoball {
  width: 100px;
  height: auto;
  margin: 0 auto;
  margin-bottom: 3rem;
}

.video-section {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
  overflow-y: hidden;
  margin: -1rem;
}
.form-section {
  position: fixed;
  bottom: 0;
  left: -0.5rem;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.888);
  z-index: 1;
  padding: 1rem;
  text-align: center;
}
.emblem {
  width: 100%;
  margin-bottom: 3rem;
}
Submit .information {
  color: white;

  text-align: center;
  margin-bottom: 1rem;
}

input,
select,
textarea {
  display: block;
  width: 100%;
  padding: 10px;
  margin: 5px 0;
  background-color: rgb(0, 0, 0);
  border-radius: 10px 10px 10px 10px;
  color: white;
}
input:focus,
textarea:focus,
select:focus {
  outline: none;
  border: 2px solid #ffffff;
  background-color: rgb(0, 0, 0);
  color: white;
}

input:hover,
textarea:hover,
select:hover {
  background-color: white;
  color: black;
}

video {
  max-height: 100%;
}
.logo {
  position: absolute;
  width: 66vw;
  top: 25%;
}
button {
  width: 100%;
  border-radius: 10px 10px 10px 10px;
  padding: 0.5rem;
}

img {
  box-shadow: none;
}

@media (min-width: 768px) {
  .form-section {
    position: absolute;
    top: 0%;
    left: 0%;
    width: 300px;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.888);
    z-index: 1;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .logo {
    position: absolute;
    width: 500px;
    top: 50%;
    left: 65%;
    transform: translate(-50%, -50%);
  }
}
</style>
