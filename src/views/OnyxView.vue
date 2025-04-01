<template>
  <div class="container">
    <!-- Video Section -->
    <div class="video-section">
      <video autoplay muted loop>
        <source src="/src/assets/videos/onyx/Hair.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div class="logo">
        <span @click="toggleForm" style="cursor: pointer">ONYX</span>
        <div class="video-buttons">
          <button @mouseover="changeVideo('Hair')" @click="toggleForm">Hair</button>
          <button @mouseover="changeVideo('Photo')" @click="toggleForm">Photo</button>
          <button @mouseover="changeVideo('Design')" @click="toggleForm">Design</button>
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
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Message:* ${this.form.message}`
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
        this.form.name = ''
        this.form.email = ''
        this.form.message = ''
        this.form.enquiry = ''
        this.showForm = false
        console.log('Form submitted successfully:', response.data)
      } catch (error) {
        console.error('Error submitting form:', error)
        alert('Error submitting form. Please try again.')
      }
    },
    changeVideo(videoName) {
      const video = document.querySelector('video')
      if (video) {
        const newVideoSrc = `/src/assets/videos/onyx/${videoName}.mp4`
        // video.pause() // Pause the current video before changing the source
        video.src = newVideoSrc
        this.form.enquiry = videoName

        // Add an event listener to handle errors if the video file doesn't exist
        video.onerror = () => {
          console.error(`Error loading video: ${newVideoSrc}`)
          alert('The selected video could not be loaded. Please try another.')
        }

        video.load() // Reload the video with the new source
        video.play().catch((error) => {
          console.error('Error playing video:', error)
        })
      }
    },
    toggleForm() {
      this.showForm = !this.showForm
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
video {
  max-height: 100%;
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
.video-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  /* margin-top: 1rem; */
  font-size: 1rem;
}
.video-buttons button {
  margin: 0 10px;
  /* padding: 10px 20px; */
  background-color: #000;
  color: #fff;
  border: 1px solid #fff;
  border-radius: 9px;
  cursor: pointer;
}
.video-buttons button:hover {
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
</style>
