<template>
  <div class="page">
    <div class="banner">
      <RouterLink to="/services" class="back-link">← Services</RouterLink>
      <h1>SOUND TECH</h1>
      <span></span>
    </div>

    <div class="content">
      <p class="intro">FESTIVALL features an in-house team of sound technicians & audio professionals to help you create the perfect sonic representation of your brand.</p>

      <div class="cards-grid">
        <div class="budget-card">
          <div class="card-header"><span class="card-title">We Provide</span></div>
          <div class="chips">
            <span class="chip" v-for="item in provides" :key="item" @click="setNeeds(item)" :class="{ 'chip-active': form.needs === item }">{{ item }}</span>
          </div>
        </div>
        <div class="budget-card">
          <div class="card-header"><span class="card-title">We Serve</span></div>
          <div class="chips">
            <span class="chip" v-for="item in serves" :key="item" @click="setClient(item)" :class="{ 'chip-active': form.client === item }">{{ item }}</span>
          </div>
        </div>
        <div class="budget-card">
          <div class="card-header"><span class="card-title">We Also Do</span></div>
          <div class="chips">
            <span class="chip" v-for="item in alsoDoes" :key="item" @click="setNeeds(item)" :class="{ 'chip-active': form.needs === item }">{{ item }}</span>
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
            <label for="client">I represent</label>
            <select id="client" v-model="form.client" required>
              <option value="" disabled>Select...</option>
              <option v-for="c in clientTypes" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div class="form-section">
            <label for="needs">I need</label>
            <select id="needs" v-model="form.needs" required>
              <option value="" disabled>Select...</option>
              <option v-for="n in needsOptions" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
          <div class="form-section">
            <label for="contact_point">Preferred contact</label>
            <select id="contact_point" v-model="form.contact" required>
              <option value="" disabled>Select...</option>
              <option value="Prasenjit">Prasenjit</option>
              <option value="Brandon">Brandon</option>
              <option value="Yvo">Yvo</option>
              <option value="Arthur">Arthur</option>
            </select>
          </div>
          <div class="form-section">
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
import { sendReunionServicesSlack } from '/scripts/notifications.js'

export default {
  name: 'SoundTechView',
  components: { RouterLink },
  data() {
    return {
      form: { name: '', email: '', client: '', needs: '', contact_point: '', message: '' },
      provides: [
        'a live sound technician', 'sound system setup & tuning', 'P/A system installation',
        'acoustic treatment', 'repairs & upgrades', 'free consultation',
        'guitar servicing', 'drum tuning', 'speaker/amplifier repair'
      ],
      serves: [
        'individual', 'band', 'school', 'theater', 'club', 'bar', 'restaurant',
        'auditorium', 'arena', 'stadium', 'outdoor event', 'festival', 'conference',
        'convention center', 'hotel', 'banquet hall', 'church', 'house of worship'
      ],
      alsoDoes: [
        'mixing & mastering', 'audio recording', 'music production', 'custom composition',
        'voiceovers', 'sound design', 'audio editing'
      ],
      clientTypes: [
        'individual', 'band', 'school', 'theater', 'club', 'bar', 'restaurant',
        'auditorium', 'arena', 'stadium', 'outdoor event', 'festival', 'conference',
        'convention center', 'hotel', 'banquet hall', 'church', 'house of worship', 'other'
      ],
      needsOptions: [
        'a live sound technician', 'sound system setup & tuning', 'P/A system installation',
        'acoustic treatment', 'repairs & upgrades', 'free consultation', 'guitar servicing',
        'drum tuning', 'speaker/amplifier repair', 'mixing & mastering', 'audio recording',
        'music production', 'custom composition', 'voiceovers', 'sound design', 'audio editing', 'other'
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
        await sendReunionServicesSlack(`Name: ${this.form.name}\nEmail: ${this.form.email}\nClient: ${this.form.client}\nNeeds: ${this.form.needs}\nPreferred Contact Person: ${this.form.contact}\nMessage: ${this.form.message}`)
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
  background-color: #1f1e22;
  color: #e0e0e0;
  padding-bottom: 3rem;
}

.banner {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  padding: 0.75rem 1rem;
}

.back-link {
  font-size: 11px;
  color: var(--festivall-baby-blue);
  text-decoration: none;
}

h1 {
  font-size: 13px;
  letter-spacing: 0.12em;
  color: var(--festivall-baby-blue);
  margin: 0;
}

.content {
  max-width: 960px;
  margin: 0 auto;
  padding: 1rem;
}

.intro {
  font-size: 12px;
  color: #888;
  margin: 1rem 0;
  text-align: center;
  line-height: 1.6;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1px;
  background-color: #2a2a2e;
  margin-bottom: 1px;
}

.budget-card {
  background-color: #252528;
  padding: 0.75rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid #333;
  padding-bottom: 0.35rem;
  margin-bottom: 0.5rem;
}

.card-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #ccc;
}

.card-sub {
  font-size: 10px;
  color: #666;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.chip {
  font-size: 10px;
  padding: 3px 8px;
  border: 1px solid #444;
  border-radius: 3px;
  color: #aaa;
  background-color: #1f1e22;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;
}

.chip:hover {
  border-color: var(--festivall-baby-blue);
  color: var(--festivall-baby-blue);
}

.chip-active {
  background-color: var(--festivall-baby-blue);
  color: #000;
  border-color: var(--festivall-baby-blue);
}

.form-card {
  margin-top: 1px;
}

.form-section {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  margin-bottom: 6px;
}

.form-section label {
  width: 30%;
  min-width: 120px;
  font-size: 11px;
  font-family: Oswald, Helvetica, sans-serif;
  padding: 8px 10px;
  background-color: var(--festivall-baby-blue);
  color: #000;
  border-radius: 4px 0 0 4px;
  display: flex;
  align-items: center;
}

.form-section input,
.form-section select,
.form-section textarea {
  flex: 1;
  font-size: 11px;
  font-family: Oswald, Helvetica, sans-serif;
  padding: 8px 10px;
  background-color: #1a1a1d;
  color: #e0e0e0;
  border: 1px solid #444;
  border-left: none;
  border-radius: 0 4px 4px 0;
  outline: none;
}

.form-section textarea {
  min-height: 80px;
  resize: vertical;
}

.form-section input:focus,
.form-section select:focus,
.form-section textarea:focus {
  border-color: var(--festivall-baby-blue);
}

.form-section select option {
  background-color: #252528;
  color: #e0e0e0;
}

button[type='submit'] {
  width: 100%;
  padding: 10px;
  margin-top: 0.5rem;
  background-color: var(--festivall-baby-blue);
  color: #000;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button[type='submit']:hover {
  background-color: #fff;
}

@media (max-width: 600px) {
  .form-section {
    flex-direction: column;
  }
  .form-section label {
    width: 100%;
    border-radius: 4px 4px 0 0;
    min-width: unset;
  }
  .form-section input,
  .form-section select,
  .form-section textarea {
    border-left: 1px solid #444;
    border-top: none;
    border-radius: 0 0 4px 4px;
  }
}
</style>
