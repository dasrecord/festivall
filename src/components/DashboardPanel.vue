<template>
  <div class="banner">
    <IconFestivall style="width: 50px; height: 50px" />
    <HelloWorld msg="SCOUTING DASHBORAD" />
  </div>

  <div class="controls">
    <h2>Talent Pool</h2>
    <button @click="loadApplicants('blessed_coast')">Blessed Coast</button>
    <button @click="loadApplicants('impact')">Impact</button>
  </div>
  <h2>Filter By</h2>
  <div class="filters">
    <button @click="filterbyActType('Artist')">Artists</button>
    <button @click="filterbyActType('Musician')">Musicians</button>
    <button @click="filterbyActType('Dancer')">Dancers</button>
    <button @click="filterbyActType('Workshop')">Workshops</button>
    <button @click="filterbyActType('DJ')">DJs</button>
    <button @click="filterbyActType('Volunteer')">Volunteers</button>
    <button @click="filterbyActType('Vendor')">Vendors</button>
    <button @click="filterbyActType('Promoter')">Promoters</button>
    <button @click="filterbyActType('Art Vendor')">Art Vendors</button>
    <button @click="filterbyProperty('mix_track_url', '')">Mixes</button>
    <button @click="filterbyProperty('willing', '')">Willing</button>
    <button @click="filterbyProperty('url', '')">URL</button>
    <button @click="filterbyProperty('build_crew', '')">Build Crew</button>
    <button @click="filterbyProperty('kitchen_crew', '')">Kitchen Crew</button>
    <button @click="filterbyProperty('security', '')">Security</button>
    <button @click="filterbyProperty('first_aid', '')">First Aid</button>
    <button @click="filterbyProperty('front_gat', '')">Front Gate</button>
    <button @click="filterbyProperty('parking_attendant', '')">Parking Attendant</button>
    <button @click="filterbyProperty('front_of_house', '')">Front of House</button>
    <button @click="filterbyProperty('stage_tech', '')">Stage Tech</button>
    <button @click="filterbyProperty('hospitality', '')">Hospitality</button>
    <button @click="filterbyProperty('green_team', '')">Green Team</button>
    <button @click="filterbyProperty('childrens_area', '')">Children's Area</button>
    <button @click="filterbyProperty('merch_table', '')">Merch Table</button>
    <button @click="filterbyProperty('float_crew', '')">Float Crew</button>
    <button @click="filterbyProperty('cleanup_crew', '')">Cleanup Crew</button>
  </div>
  <div class="dashboard-panel">
    <h2>Current View <br />{{ filteredApplicants.length }}</h2>
    <div class="applicants" :style="{ transform: `scale(${scale})` }">
      <div v-for="applicant in filteredApplicants" :key="applicant.id" class="applicant">
        <div class="applicant-content">
          <h2>
            <a v-if="applicant.url" :href="applicant.url" target="_blank">{{
              applicant.act_name
            }}</a>
            <span v-else>{{ applicant.full_name || applicant.email.split('@')[0] }}</span
            ><br />
          </h2>
          <p>
            <a v-if="applicant.mix_track_url" :href="applicant.mix_track_url" target="_blank">
              LISTEN TO A MIX/TRACK
            </a>
          </p>
          <p id="bio">{{ applicant.bio }}</p>
          <br />
          <p>{{ applicant.rates }}</p>
          <br />
          <br />
          <p>
            <a :href="generateMailtoLink(applicant.email)">BOOK APPLICANT</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HelloWorld from './HelloWorld.vue'
import IconFestivall from './icons/IconFestivall.vue'

export default {
  components: {
    HelloWorld,
    IconFestivall
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
    filterbyProperty(property, value) {
      this.filteredApplicants = this.applicants.filter((applicant) => applicant[property] !== value)
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
.banner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: sticky;
  top: 0;
  background-color: #1f1e22;
  z-index: 25;
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.controls {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}
.filters {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2px;
}

button {
  width: auto;
  padding: 0.5rem 0.5rem;

  border-radius: 10px;
  background-color: #1f1e22;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #2c3e50;
}

.applicants {
  font-size: 1rem;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  transition: transform 50ms ease-in;
  padding: 0.5rem 0.5rem;
}

.applicant {
  border: 3px solid #7097be;
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  font-size: 6px;
}

.applicant-content {
  width: auto;
  height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

#bio {
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
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
