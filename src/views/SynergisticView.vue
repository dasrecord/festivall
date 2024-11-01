<template>
  <div class="container">
    <div class="video-section">
      <video autoplay muted loop>
        <source src="/src/assets/videos/synergistic/syn_lotus.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>

    <div class="form-section">
      <div class="logo">
        <img src="/src/assets/images/synergistic_logo_white.png" alt="Synergistic Logo" />
      </div>
      <form @submit.prevent="sendtorelay">
        <div>
          <label for="name">Name:</label>
          <input type="text" id="name" v-model="form.name" required />
        </div>
        <div>
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="form.email" required />
        </div>
        <div>
          <label for="enquiry">Enquiry:</label>
          <select id="enquiry" v-model="form.enquiry" required>
            <option disabled value="">Please select one</option>
            <option>Event Production</option>
            <option>Consultation</option>
            <option>Partnerships</option>
          </select>
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

export default {
  data() {
    return {
      form: {
        name: '',
        email: '',
        message: ''
      }
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
              text: `*Message:* ${this.form.message}`
            }
          }
        ]
      }

      try {
        const response = await axios.post('https://relayproxy.vercel.app/slack', slackPayload, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        console.log('Form submitted successfully:', response.data)
      } catch (error) {
        console.error('Error submitting form:', error)
      }
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
  height: 97vh;
}

.video-section {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
  overflow-y: hidden;
}
.form-section {
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.888);
  z-index: 1;
  padding: 2rem;
}

input,
select,
textarea {
  display: block;
  width: 60%;
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
  width: 300px;
}

@media (min-width: 768px) {
  .container {
    display: grid;
  }

  .video-section {
    order: 2;
    flex: 1;
  }

  .form-section {
    background-color: rgba(0, 0, 0, 0.555);
  }
}
</style>
