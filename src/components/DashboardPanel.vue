<template>
  <HelloWorld msg="Blessed Coast" />
  <div><h2>Scouting Dashboard</h2></div>
  <div class="controls">
    <button @click="loadApplicants('blessed_coast')">Blessed Coast</button>
    <button @click="loadApplicants('impact')">Impact Leads</button>
  </div>
  <h2>Filter By</h2>
  <div class="filters">
    <button @click="filterbyActType('Artist')">Artists</button>
    <button @click="filterbyActType('Musician')">Musicians</button>
    <button @click="filterbyActType('Dancer')">Dancers</button>
    <button @click="filterbyActType('Workshop')">Workshops</button>
    <button @click="filterbyActType('DJ')">DJs</button>
    <button @click="filterbyActType('Art Vendor')">Art Vendors</button>
  </div>
  <div class="dashboard-panel">
    <div class="applicants" :style="{ transform: `scale(${scale})` }">
      <div v-for="applicant in filteredApplicants" :key="applicant.id" class="applicant">
        <div class="applicant-content">
          <h2>
            <a v-if="applicant.url" :href="applicant.url" target="_blank">{{
              applicant.act_name
            }}</a
            ><span v-else>{{ applicant.act_name }}</span>
          </h2>
          <p>{{ applicant.bio }}</p>
          <br />
          <p>{{ applicant.rates }}</p>
          <p>
            <a :href="generateMailtoLink(applicant.email)">{{ applicant.email }}</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HelloWorld from './HelloWorld.vue'

export default {
  components: {
    HelloWorld
  },
  data() {
    return {
      applicants: [],
      filteredApplicants: [],
      scale: 1,
      emailBody: ''
    }
  },
  created() {
    this.loadEmailTemplate()
  },
  mounted() {},
  methods: {
    loadApplicants(type) {
      fetch(`/data/applicants/${type}.json`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText)
          }
          return response.json()
        })
        .then((data) => {
          console.log('Fetched data:', data) // Log the fetched data
          // Sort applicants by whether they have a URL
          this.applicants = data.sort((a, b) => {
            if (a.url && !b.url) return -1
            if (!a.url && b.url) return 1
            return 0
          })
          this.filteredApplicants = this.applicants // Initialize filteredApplicants
        })
        .catch((error) => {
          console.error('There was a problem with the fetch operation:', error)
        })
    },
    filterbyActType(type) {
      this.filteredApplicants = this.applicants.filter(
        (applicant) => applicant.applicant_type === type
      )
    },
    loadEmailTemplate() {
      fetch('/email_templates/artist_request_template.txt')
        .then((response) => response.text())
        .then((text) => {
          this.emailBody = text
        })
        .catch((error) => {
          console.error('Error loading email template:', error)
        })
    },
    generateMailtoLink(email) {
      const subject = encodeURIComponent('Your Subject Here')
      const body = encodeURIComponent(this.emailBody)
      return `mailto:${email}?subject=${subject}&body=${body}`
    }
  }
}
</script>

<style scoped>
.controls {
  margin-bottom: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
.filters {
  display: flex;
  flex-direction: column;

  margin-bottom: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

button {
  width: 100px;
  padding: 10px;
  border: none;
  border-radius: 10px;
  background-color: #1f1e22;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #2c3e50;
}

.applicants {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  transition: transform 50ms ease-in;
  padding: 1rem 1rem;
}

.applicant {
  border: 1px solid #5e5e5e;
  width: 150px;
  height: 150px;
  margin: 10px;
  border-radius: 10px;
  overflow: hidden;
  white-space: wrap;
  text-overflow: ellipsis;
  transition:
    transform 750ms ease,
    width 750s ease-in-out,
    height 750ms ease-in-out;
  background-color: #1f1e22;
  position: relative;
  transform-origin: center center;
  box-shadow: inset 0 0 25px rgba(121, 188, 255, 0.25);
}

.applicant p {
  display: none;
}
.applicant h2 {
  justify-content: center;
}

.applicant:hover {
  transform: scale(2.5);
  z-index: 10;
  padding: 3px 3px;
  font-size: 30%;
}

.applicant:hover h2 {
  font-size: 6px;
  padding: 5px;
}
.applicant:hover p {
  display: block;
  text-align: left;
  font-size: 6px;
}

.applicant-content {
  width: auto;
  height: 100%;
  overflow: auto;
  display: flex;
  flex-basis: shrink;
  flex-direction: column;
  justify-content: center;
}

.applicant-content::-webkit-scrollbar {
  display: none;
}

.applicant-content:hover {
  justify-content: flex-start;
  padding: 0px 10px;
  scrollbar-width: thin;
}
</style>
