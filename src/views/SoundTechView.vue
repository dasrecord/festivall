<template>
  <div class="basic">
    <HelloWorld msg="Sound Tech" />
    FESTIVALL features an in-house team of sound technicians & audio professionals to help you
    create the perfect sonic representation of your brand.
    <h2>We Provide:</h2>
    <ul class="services">
      <li>live sound technicians</li>
      <li>sound system setup & tuning</li>
      <li>P/A system installation</li>
      <li>acoustic treatment</li>
      <li>repairs & upgrades</li>
      <li>reasonable rates</li>
      <li>positive references</li>
      <li>free consultations</li>
      <li>guitar servicing</li>
      <li>drum tuning</li>
      <li>speaker/amplifier repair</li>
    </ul>
    <br />
    <h2>We Serve:</h2>
    <ul class="audience">
      <li>individuals</li>
      <li>bands</li>
      <li>schools</li>
      <li>theaters</li>
      <li>clubs</li>
      <li>bars</li>
      <li>restaurants</li>
      <li>auditoriums</li>
      <li>arenas</li>
      <li>stadiums</li>
      <li>outdoor events</li>
      <li>festivals</li>
      <li>conferences</li>
      <li>convention centers</li>
      <li>hotels</li>
      <li>banquet halls</li>
      <li>conference rooms</li>
      <li>churches</li>
      <li>houses of worship</li>
    </ul>
    <br />
    <h2>We Also Do:</h2>
    <ul class="audio-services">
      <li>mixing & mastering</li>
      <li>audio recording</li>
      <li>music production</li>
      <li>custom composition</li>
      <li>voiceovers</li>
      <li>sound design</li>
      <li>audio editing</li>
    </ul>
    <div class="contact-form">
      <h2>Contact Us</h2>
      Let's talk about your project.<br />Fill out the form below and we'll get back to you as soon
      as possible.<br /><br />
      <form @submit.prevent="submitForm">
        <div>
          <label for="name">Name:</label>
          <input type="text" id="name" v-model="form.name" required />
        </div>
        <div>
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="form.email" required />
        </div>
        <!-- <div>
          <label for="phone">Phone:</label>
          <input type="tel" id="phone" v-model="form.phone" />
        </div> -->
        <div>
          <label for="client">I am/represent a(n):</label>
          <select id="client" v-model="form.client" required>
            <option value="individual">individual</option>
            <option value="band">band</option>
            <option value="school">school</option>
            <option value="theater">theater</option>
            <option value="club">club</option>
            <option value="bar">bar</option>
            <option value="restaurant">restaurant</option>
            <option value="auditorium">auditorium</option>
            <option value="arena">arena</option>
            <option value="stadium">stadium</option>
            <option value="outdoor event">outdoor event</option>
            <option value="festival">festival</option>
            <option value="conference">conference</option>
            <option value="convention center">convention center</option>
            <option value="hotel">hotel</option>
            <option value="banquet hall">banquet hall</option>
            <option value="conference room">conference room</option>
            <option value="church">church</option>
            <option value="house of worship">house of worship</option>
            <option value="other">other</option>
          </select>
        </div>
        <div>
          <label for="needs">I am looking for:</label>
          <select id="needs" v-model="form.needs" required>
            <option value="live sound technician">a live sound technician</option>
            <option value="sound system setup & tuning">sound system setup & tuning</option>
            <option value="P/A system installation">P/A system installation</option>
            <option value="acoustic treatment">acoustic treatment</option>
            <option value="repairs & upgrades">repairs & upgrades</option>
            <option value="reasonable rates">reasonable rates</option>
            <option value="positive references">positive references</option>
            <option value="free consultations">free consultations</option>
            <option value="guitar servicing">guitar servicing</option>
            <option value="drum tuning">drum tuning</option>
            <option value="speaker/amplifier repair">speaker/amplifier repair</option>
            <option value="mixing & mastering">mixing & mastering</option>
            <option value="audio recording">audio recording</option>
            <option value="music production">music production</option>
            <option value="custom composition">custom composition</option>
            <option value="voiceovers">voiceovers</option>
            <option value="sound design">sound design</option>
            <option value="audio editing">audio editing</option>
            <option value="other">other</option>
          </select>
        </div>
        <div>
          <label for="contact_point">Preferred Contact Person:</label>
          <select id="contact-point" v-model="form.contact" required>
            <option value="Prasenjit">Prasenjit</option>
            <option value="Brandon">Brandon</option>
            <option value="Yvo">Yvo</option>
            <option value="Arthur">Arthur</option>
            <option value="Janicka">Janicka</option>
            <option value="Cory">Cory</option>
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
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'SoundTechView',
  components: {
    HelloWorld
  },
  data() {
    return {
      form: {
        name: '',
        email: '',
        client: '',
        needs: '',
        contact_point: '',
        message: ''
      }
    }
  },
  methods: {
    async submitForm() {
      try {
        const response = await axios.post(
          'https://relayproxy.vercel.app/reunion_slack',
          {
            text: `Name: ${this.form.name}\nEmail: ${this.form.email}\nClient: ${this.form.client}\nNeeds: ${this.form.needs}\nPreferred Contact Person: ${this.form.contact_point}\nMessage: ${this.form.message}`
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        if (response.status === 200) {
          alert('Form submitted successfully!')
          this.form.name = ''
          this.form.email = ''
          this.form.client = ''
          this.form.needs = ''
          this.form.contact_point = ''
          this.form.message = ''
        } else {
          alert('Failed to submit the form.')
        }
      } catch (error) {
        console.error('Error submitting form:', error)
        alert('An error occurred while submitting the form.')
      }
    }
  }
}
</script>

<style scoped>
.basic {
  display: flex;
  flex-direction: column;
  font-weight: bold;
}
.services,
.audience,
.audio-services {
  padding: 0;
  font-weight: bold;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;

  list-style-type: none;
}
li {
  /* font-weight: bold; */
  padding: 5px;
  margin: 3px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.contact-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
form,
label,
input,
textarea,
select {
  font-family: Oswald, Helvetica, sans-serif;
  width: 500px;
  max-width: 80vw;
  display: block;
  margin-bottom: 10px;
}
button {
  background-color: white;
  width: 100%;
  max-width: 80vw;
  display: block;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}
button:hover {
  background-color: var(--festivall-baby-blue);
  color: white;
}
</style>
