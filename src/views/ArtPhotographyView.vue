<template>
  <div class="basic">
    <HelloWorld msg="Art & Photography" />
    FESTIVALL features an in-house team of photohraphers and graphic designers to help you create
    the perfect visual representation of your brand.
    <br />
    <h2>Art Services:</h2>
    <ul class="art">
      <li>2d editing</li>
      <li>3d modeling</li>
      <li>animation</li>
      <li>canvas & digital artwork</li>
      <li>album artwork</li>
      <li>poster design</li>
      <li>graffiti</li>
    </ul>
    <br />
    <h2>Design Services:</h2>
    <ul class="design">
      <li>hair</li>
      <li>fashion</li>
      <li>set design</li>
      <li>game asset & level design</li>
      <li>2d/3d rigging & level design</li>
      <li>character design</li>
      <li>2d & 3d animation</li>
      <li>stage & art construction</li>
      <li>hair & make-up</li>
      <li>prop design</li>
      <li>sculpture & game asset design</li>
    </ul>
    <br />
    <h2>Photo Servies:</h2>
    <ul class="photo">
      <li>small events</li>
      <li>family photos</li>
      <li>hair & fashion</li>
      <li>photo editing</li>
      <li>reconstruction</li>
      <li>color grading</li>
      <li>skin correction & touchups</li>
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
            <option value="band">group</option>
          </select>
        </div>
        <div>
          <label for="needs">I am looking for:</label>
          <select id="needs" v-model="form.needs" required>
            <option value="2d editing">2d editing</option>
            <option value="3d modeling">3d modeling</option>
            <option value="animation">animation</option>
            <option value="canvas & digital artwork">canvas & digital artwork</option>
            <option value="hair">hair</option>
            <option value="fashion">fashion</option>
            <option value="set design">set design</option>
            <option value="game asset & level design">game asset & level design</option>
            <option value="2d/3d rigging & level design">2d/3d rigging & level design</option>
            <option value="character design">character design</option>
            <option value="2d & 3d animation">2d & 3d animation</option>
            <option value="stage & art construction">stage & art construction</option>
            <option value="hair make up & prop design">hair make up & prop design</option>
            <option value="sculpture & game asset design">sculpture & game asset design</option>
            <option value="small events">small events</option>
            <option value="family photos">family photos</option>
            <option value="hair & fashion">hair & fashion</option>
            <option value="photo editing">photo editing</option>
            <option value="reconstruction">reconstruction</option>
            <option value="color grading">color grading</option>
            <option value="skin correction & touchups">skin correction & touchups</option>

            <option value="other">other</option>
          </select>
        </div>
        <div>
          <label for="contact_point">Preferred Contact Person:</label>
          <select id="contact_point" v-model="form.contact_point" required>
            <option value="Nish">Nish</option>
            <option value="Janicka">Janicka</option>
            <option value="Becca">Becca</option>
            <option value="Prasenjit">Prasenjit</option>
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
  name: 'ArtPhotographyView',
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
.art,
.design,
.photo {
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
  font-weight: bold;
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
