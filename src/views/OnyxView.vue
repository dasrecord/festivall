<template>
  <div class="container">
    <!-- Video Section -->
    <div class="video-section">
      <div class="video-container">
        <div class="video-placeholder">
          <div class="loading-spinner">Onyx Visual Experience</div>
        </div>
      </div>
      <div class="logo">
        <span @click="toggleForm" style="cursor: pointer">ONYX</span>
        <div class="splash-text" style="font-size: 0.8rem">
          <p v-show="form.enquiry === 'Hair'" style="padding: 1rem">
            Onyx seamlessly integrates hair artistry with 3D design, photography, and visual art,
            drawing inspiration from global fashion runways, high-profile fashion weeks, and
            editorial campaigns.
          </p>
          <p v-show="form.enquiry === 'Photo'" style="padding: 1rem">
            From humble beginnings as a solo hair artist, Nish has grown to craft iconic looks for
            New York Fashion Week and collaborate with renowned fashion houses in Las Vegas.
          </p>
          <p v-show="form.enquiry === 'Design'" style="padding: 1rem">
            Leveraging extensive experience with Fortune 500 companies, Nish delivers innovative
            media solutions, design direction, and art direction for projects ranging from creative
            initiatives to large-scale enterprise strategies.
          </p>
        </div>
        <div class="action-buttons">
          <button @click="toggleForm">Art & Design</button>
          <button @click="toggleForm">Hair</button>
          <button @click="toggleForm">Photography</button>
        </div>
      </div>
    </div>

    <!-- Form Section -->

    <div class="form-section" :class="{ hidden: !showForm }">
      <form v-show="showForm" @submit.prevent="sendtorelay">
        <div>
          <label for="name">Name:</label>
          <input type="text" id="name" v-model="form.name" required autocomplete="off" />
        </div>
        <div>
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="form.email" required autocomplete="off" />
        </div>
        <div>
          <label for="enquiry">Enquiry:</label>
          <select id="enquiry" v-model="form.enquiry" required>
            <option disabled value="">Please select one</option>
            <option value="Hair">Hair</option>
            <option value="Photo">Photo</option>
            <option value="Design">Design</option>
          </select>
        </div>
        <div>
          <label for="message">Message:</label>
          <textarea id="message" v-model="form.message" required></textarea>
        </div>
        <button type="submit">SUBMIT</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      form: {
        name: '',
        email: '',
        message: '',
        enquiry: '',
        contact_point: 'Nish'
      },
      showForm: false
    }
  },
  methods: {
    async sendtorelay() {
      const slackPayload = {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:bust_in_silhouette: ${this.form.name}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:email: ${this.form.email}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:trident: ${this.form.enquiry}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:memo: ${this.form.message}`
            }
          }
        ],
        contact_point: this.form.contact_point
      }

      try {
        const response = await axios.post(
          'https://relayproxy.vercel.app/reunion_services_slack',
          slackPayload,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        alert('Your message was received successfully!')
        this.resetForm()
        console.log('Form submitted successfully:', response.data)
      } catch (error) {
        console.error('Error submitting form:', error)
        alert('Error submitting form. Please try again.')
      }
    },
    toggleForm() {
      this.showForm = !this.showForm
    },
    resetForm() {
      this.form = {
        name: '',
        email: '',
        message: '',
        enquiry: '',
        contact_point: 'Nish'
      }
      this.showForm = false
    }
  }
}
</script>

<style scoped>
/* General Styles */
* {
  font-family: 'Oswald', sans-serif;
}
.container {
  display: flex;
  flex-direction: column;
  height: 96vh;
}

/* Video Section */
.video-section {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin: -1rem;
}
.logo {
  position: absolute;
  top: 20%;
  text-align: center;
  font-size: 4rem;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 1rem;
  border-radius: 15px;
}
.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  /* margin-top: 1rem; */
  font-size: 1rem;
}
.action-buttons button {
  margin: 0 10px;
  /* padding: 10px 20px; */
  background-color: #000;
  color: #fff;
  border: 1px solid #fff;
  border-radius: 9px;
  cursor: pointer;
}
.action-buttons button:hover {
  background-color: #fff;
  color: #000;
}

/* Form Section */
.form-section {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1;
  padding: 2rem;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.form-section.hidden {
  transform: translateY(100%);
  opacity: 0;
}

input,
select,
textarea {
  display: block;
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  background-color: #000;
  border: 1px solid #fff;
  border-radius: 5px;
  color: #fff;
}
input:focus,
textarea:focus,
select:focus {
  outline: none;
  border: 2px solid #fff;
}
button {
  width: 100%;
  padding: 10px;
  background-color: #000;
  color: #fff;
  border: 1px solid #fff;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  background-color: #fff;
  color: #000;
}

/* Responsive Design */
@media (min-width: 768px) {
  .form-section {
    position: absolute;
    top: 0;
    left: 0;
    width: 300px;
    height: 100%;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .form-section.hidden {
    transform: translateX(-100%);
    opacity: 0;
  }
  .logo {
    width: 500px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 5rem;
  }
}

/* Video lazy loading styles */
.video-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
}

.loading-spinner {
  color: white;
  font-size: 1.2rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
