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
          <label for="name">Name:</label>
          <input type="text" id="name" v-model="form.name" required autocomplete="off" />
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
          <label for="enquiry">Enquiry:</label>
          <select id="enquiry" v-model="form.enquiry" required>
            <option disabled value="">Select an option</option>
            <option value="Customer">Experience Haven</option>
            <!-- <option value="Artist">Perform at Haven</option> -->
            <option value="Partner">Partner with Haven</option>
            <option value="Battle">Dance Battle at Haven</option>
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
          <label for="experience_type">Experience Type:</label>
          <select id="experience_type" v-model="form.experience_type" required>
            <option disabled value="">Select an option</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Bookings">Booking the Space</option>
            <option value="Feedback">Feedback</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div v-if="form.enquiry === 'Battle'">
          <div>
            <label for="act_name">Act Name:</label>
            <input type="text" id="act_name" v-model="form.act_name" required />
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

        <div>
          <label for="message">Message:</label>
          <textarea id="message" v-model="form.message" required></textarea>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import haven_emblem from '../assets/images/haven_emblem_white.png'
import haven_logo from '../assets/images/haven_logo_white.png'
import haven_video from '../assets/videos/haven/luxe.mp4'

import { festivall_db } from '@/firebase'
import { getDoc, doc, setDoc } from 'firebase/firestore'

export default {
  data() {
    return {
      haven_emblem,
      haven_logo,
      haven_video,
      form: {
        name: '',
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
        experience_type: '',
        message: ''
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
        const docRef = doc(festivall_db, 'haven', this.form.email)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          console.log('Document already exists in haven list:', docSnap.data())
          alert('You are on the mailing list!')
        } else {
          await setDoc(docRef, {
            name: this.form.name,
            email: this.form.email,
            phone: this.form.phone,
            enquiry: this.form.enquiry,
            act_type: this.form.act_type,
            mix_url: this.form.mix_url,
            partnership_type: this.form.partnership_type,
            website: this.form.website,
            experience_type: this.form.experience_type,
            act_name: this.form.act_name,
            video_url: this.form.video_url,
            agree_communication: this.form.agree_communication,
            participate_risk: this.form.participate_risk,
            message: this.form.message,
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
      console.log('sendtorelay called with form data:', this.form)
      const slackPayload = {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Name:* ${this.form.name}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Email:* ${this.form.email}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Enquiry:* ${this.form.enquiry}`
            }
          },
          ...(this.form.enquiry === 'Battle'
            ? [
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `*Act Name:* ${this.form.act_name}`
                  }
                },
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `*Video URL:* ${this.form.video_url}`
                  }
                }
              ]
            : []),
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Message:* ${this.form.message}`
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
        alert('Your message was received successfully!')

        // Call Firestore methods

        await this.addToHavenList()

        // Reset the form AFTER Firestore operations
        this.form = {
          name: '',
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
          experience_type: '',
          message: ''
        }
        this.$router.push({ name: 'havenbattle' })
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
        name: 'alice',
        email: 'alice@example.com',
        phone: '1234567890',
        act_name: `Act`,
        video_url: 'http://twitch.tv/dasrecord',
        agree_communication: true,
        participate_risk: true,
        enquiry: 'Battle',
        act_type: '',
        mix_url: '',
        partnership_type: '',
        website: '',
        experience_type: '',
        message: 'This is a sample message.'
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
  left: 0;
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

.information {
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
  border-radius: 10px 0px 10px 0px;
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
  background-color: rgba(255, 255, 255, 0.242);
  color: rgb(0, 0, 0);
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
