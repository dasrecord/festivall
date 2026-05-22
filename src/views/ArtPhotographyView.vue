<template>
  <div class="page">
    <div class="banner">
      <RouterLink to="/services" class="back-link">← Services</RouterLink>
      <h1>ART &amp; PHOTOGRAPHY</h1>
      <span></span>
    </div>

    <div class="content">
      <p class="intro">
        An in-house team of photographers, graphic designers, and artists — crafting the perfect
        visual identity for your brand, event, or project.
      </p>

      <div class="cards-grid">
        <div class="budget-card">
          <div class="card-header">
            <span class="card-title">Art Services</span>
            <span class="card-sub">click to prefill</span>
          </div>
          <div class="chips">
            <span class="chip" v-for="item in artServices" :key="item"
              @click="setNeeds(item)" :class="{ 'chip-active': form.needs === item }">{{ item }}</span>
          </div>
        </div>

        <div class="budget-card">
          <div class="card-header">
            <span class="card-title">Design Services</span>
            <span class="card-sub">click to prefill</span>
          </div>
          <div class="chips">
            <span class="chip" v-for="item in designServices" :key="item"
              @click="setNeeds(item)" :class="{ 'chip-active': form.needs === item }">{{ item }}</span>
          </div>
        </div>

        <div class="budget-card">
          <div class="card-header">
            <span class="card-title">Photography</span>
            <span class="card-sub">click to prefill</span>
          </div>
          <div class="chips">
            <span class="chip" v-for="item in photoServices" :key="item"
              @click="setNeeds(item)" :class="{ 'chip-active': form.needs === item }">{{ item }}</span>
          </div>
        </div>

        <div class="budget-card">
          <div class="card-header">
            <span class="card-title">We Work With</span>
            <span class="card-sub">click to prefill</span>
          </div>
          <div class="chips">
            <span class="chip" v-for="item in serves" :key="item"
              @click="setClient(item)" :class="{ 'chip-active': form.client === item }">{{ item }}</span>
          </div>
        </div>
      </div>

      <div class="budget-card form-card" ref="contactForm">
        <div class="card-header">
          <span class="card-title">Contact Us</span>
          <span class="card-sub">Let's talk about your project.</span>
        </div>
        <form @submit.prevent="submitForm">
          <div class="form-section">
            <label for="name">Name</label>
            <input type="text" id="name" v-model="form.name" required />
          </div>
          <div class="form-section">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="form.email" required />
          </div>
          <div class="form-section">
            <label for="client">I represent a(n)</label>
            <select id="client" v-model="form.client" required>
              <option value="">— select —</option>
              <option v-for="opt in clientTypes" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
          <div class="form-section">
            <label for="needs">I'm looking for</label>
            <select id="needs" v-model="form.needs" required>
              <option value="">— select —</option>
              <option v-for="opt in needsOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
          <div class="form-section">
            <label for="contact_point">Preferred Contact</label>
            <select id="contact_point" v-model="form.contact_point" required>
              <option value="">— select —</option>
              <option value="Nish">Nish</option>
              <option value="Janicka">Janicka</option>
              <option value="Becca">Becca</option>
              <option value="Prasenjit">Prasenjit</option>
            </select>
          </div>
          <div class="form-section form-section--full">
            <label for="message">Message</label>
            <textarea id="message" v-model="form.message" required></textarea>
          </div>
          <button type="submit">SUBMIT</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { RouterLink } from 'vue-router'
import { sendReunionSlack } from '/scripts/notifications.js'

export default {
  name: 'ArtPhotographyView',
  components: { RouterLink },
  data() {
    return {
      form: { name: '', email: '', client: '', needs: '', contact_point: '', message: '' },
      artServices: [
        '2d editing', '3d modeling', 'animation', 'canvas & digital artwork',
        'album artwork', 'poster design', 'graffiti'
      ],
      designServices: [
        'hair', 'fashion', 'set design', 'game asset & level design',
        '2d/3d rigging & level design', 'character design', '2d & 3d animation',
        'stage & art construction', 'prop design', 'sculpture & game asset design'
      ],
      photoServices: [
        'small events', 'family photos', 'hair & fashion', 'photo editing',
        'reconstruction', 'color grading', 'skin correction & touchups'
      ],
      serves: [
        'individual', 'band', 'group', 'small business', 'brand',
        'event', 'festival', 'film production', 'other'
      ],
      clientTypes: [
        'individual', 'band', 'group', 'small business', 'brand',
        'event', 'festival', 'film production', 'other'
      ],
      needsOptions: [
        '2d editing', '3d modeling', 'animation', 'canvas & digital artwork', 'album artwork', 'poster design', 'graffiti',
        'hair', 'fashion', 'set design', 'game asset & level design', '2d/3d rigging & level design', 'character design',
        '2d & 3d animation', 'stage & art construction', 'prop design', 'sculpture & game asset design',
        'small events', 'family photos', 'hair & fashion', 'photo editing', 'reconstruction', 'color grading',
        'skin correction & touchups', 'other'
      ]
    }
  },
  methods: {
    setNeeds(item) {
      this.form.needs = item
      this.$nextTick(() => this.$refs.contactForm?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    },
    setClient(item) {
      this.form.client = item
      this.$nextTick(() => this.$refs.contactForm?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    },
    async submitForm() {
      try {
        await sendReunionSlack(`Name: ${this.form.name}\nEmail: ${this.form.email}\nClient: ${this.form.client}\nNeeds: ${this.form.needs}\nPreferred Contact: ${this.form.contact_point}\nMessage: ${this.form.message}`)
        alert('Form submitted successfully!')
        this.form = { name: '', email: '', client: '', needs: '', contact_point: '', message: '' }
      } catch (error) {
        console.error('Error submitting form:', error)
        alert('An error occurred while submitting the form.')
      }
    }
  }
}
</script>

<style scoped>
.page {
  width: 100%;
  min-height: 100vh;
  background-color: #0e0e0e;
  color: #e0e0e0;
  padding-bottom: 3rem;
}

.banner {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0.75rem 1rem;
}

.back-link {
  font-size: 11px;
  color: #888;
  text-decoration: none;
  transition: color 0.15s;
}

.back-link:hover {
  color: #fff;
}

h1 {
  font-size: 13px;
  letter-spacing: 0.18em;
  color: #fff;
  text-shadow:
    0 0 18px rgba(255, 255, 255, 0.6),
    0 0 40px rgba(255, 255, 255, 0.2);
  margin: 0;
}

.content {
  max-width: 960px;
  margin: 0 auto;
  padding: 1rem;
}

.intro {
  font-size: 12px;
  color: #555;
  margin: 1rem 0;
  text-align: center;
  line-height: 1.6;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2px;
  background-color: #0e0e0e;
}

.budget-card {
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.055);
  padding: 0.75rem;
  transition: border-color 0.2s;
}

.budget-card:hover {
  border-color: rgba(255, 255, 255, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 0.35rem;
  margin-bottom: 0.5rem;
}

.card-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #bbb;
}

.card-sub {
  font-size: 10px;
  color: #3a3a3a;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.chip {
  font-size: 10px;
  padding: 3px 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  color: #666;
  background-color: transparent;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
}

.chip:hover {
  border-color: rgba(255, 255, 255, 0.5);
  color: #e8e8e8;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.12);
}

.chip-active {
  background-color: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.65);
  color: #fff;
  box-shadow: 0 0 14px rgba(255, 255, 255, 0.22);
}

.form-card {
  margin-top: 2px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.055);
}

.form-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.form-section--full {
  flex-direction: column;
  align-items: stretch;
}

label {
  font-size: 10px;
  color: #555;
  width: 140px;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

input,
select,
textarea {
  flex: 1;
  background-color: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: #e0e0e0;
  font-size: 11px;
  font-family: inherit;
  padding: 0.25rem 0;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

input:focus,
select:focus,
textarea:focus {
  border-bottom-color: rgba(255, 255, 255, 0.45);
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.04);
}

select option {
  background-color: #141414;
  color: #e0e0e0;
}

textarea {
  resize: vertical;
  min-height: 80px;
  width: 100%;
  margin-top: 0.35rem;
}

button[type='submit'] {
  margin-top: 1rem;
  width: 100%;
  background-color: transparent;
  color: #ccc;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 3px;
  padding: 0.5rem;
  font-size: 11px;
  letter-spacing: 0.14em;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
}

button[type='submit']:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.55);
  box-shadow: 0 0 22px rgba(255, 255, 255, 0.12), 0 0 6px rgba(255, 255, 255, 0.08);
}
</style>
