<template>
  <div class="banner">
    <IconFestivall style="width: 50px; height: 50px" />
    <HelloWorld msg="SCOUTING DASHBOARD" />
  </div>

  <div class="controls">
    <h2>Talent Pool</h2>
    <button @click="loadApplicants('blessed_coast')">Blessed Coast</button>
    <button @click="loadApplicants('impact')">Impact</button>
    <button @click="loadApplicants('cream_collective')">Cream Collective</button>
    <button @click="loadApplicants('rapture')">Rapture</button>
  </div>

  <h2>Filter By</h2>
  <div class="filters">
    <button
      v-for="filter in relevantFilters"
      :key="filter.property"
      @click="applyFilter(filter.property, filter.value)"
    >
      {{ filter.label }}
    </button>
    <button @click="clearFilters">Clear Filters</button>
  </div>

  <div class="dashboard-panel">
    <h2>Current View <br />{{ filteredApplicants.length }}</h2>
    <div class="applicants" :style="{ transform: `scale(${scale})` }">
      <div v-for="applicant in filteredApplicants" :key="applicant.id" class="applicant">
        <div class="applicant-content">
          <h2>
            <a v-if="applicant.url" :href="applicant.url" target="_blank">
              {{ applicant.act_name || applicant.full_name }}
            </a>
            <span v-else>
              {{ applicant.full_name || applicant.act_name || applicant.email.split('@')[0] }}
            </span>
            <br />
          </h2>
          <p>
            <a v-if="applicant.mix_track_url" :href="applicant.mix_track_url" target="_blank">
              LISTEN TO A MIX/TRACK
            </a>
          </p>
          <p v-if="applicant.region">{{ applicant.region }}</p>
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
      emailBody: '',
      filters: [
        { property: 'applicant_type', value: 'Artist', label: 'Artists' },
        { property: 'applicant_type', value: 'Musician', label: 'Musicians' },
        { property: 'applicant_type', value: 'Dancer', label: 'Dancers' },
        { property: 'applicant_type', value: 'Workshop', label: 'Workshops' },
        { property: 'applicant_type', value: 'DJ', label: 'DJs' },
        { property: 'applicant_type', value: 'Volunteer', label: 'Volunteers' },
        { property: 'applicant_type', value: 'Vendor', label: 'Vendors' },
        { property: 'applicant_type', value: 'Promoter', label: 'Promoters' },
        { property: 'applicant_type', value: 'Art Vendor', label: 'Art Vendors' },
        { property: 'applicant_type', value: 'Event Manager', label: 'Event Manager' },
        { property: 'applicant_type', value: 'A&R', label: 'A&R' },
        { property: 'applicant_type', value: 'Accounts Manager', label: 'Accounts Manager' },
        { property: 'applicant_type', value: 'Marketing', label: 'Marketing' },
        { property: 'applicant_type', value: 'Operations Manager', label: 'Operations Manager' },
        { property: 'applicant_type', value: 'Market Analyst', label: 'Market Analyst' },
        { property: 'applicant_type', value: 'Social Media', label: 'Social Media' },
        { property: 'applicant_type', value: 'UX', label: 'UX' },
        { property: 'applicant_type', value: 'Web Dev', label: 'Web Dev' },
        { property: 'mix_track_url', value: '', label: 'Mix/Track' },
        { property: 'willing', value: '', label: 'Willing' },
        { property: 'url', value: '', label: 'URL' },
        { property: 'build_crew', value: '', label: 'Build Crew' },
        { property: 'kitchen_crew', value: '', label: 'Kitchen Crew' },
        { property: 'security', value: '', label: 'Security' },
        { property: 'first_aid', value: '', label: 'First Aid' },
        { property: 'front_gate', value: '', label: 'Front Gate' },
        { property: 'parking_attendant', value: '', label: 'Parking Attendant' },
        { property: 'front_of_house', value: '', label: 'Front of House' },
        { property: 'stage_tech', value: '', label: 'Stage Tech' },
        { property: 'hospitality', value: '', label: 'Hospitality' },
        { property: 'green_team', value: '', label: 'Green Team' },
        { property: 'childrens_area', value: '', label: "Children's Area" },
        { property: 'merch_table', value: '', label: 'Merch Table' },
        { property: 'float_crew', value: '', label: 'Float Crew' },
        { property: 'cleanup_crew', value: '', label: 'Cleanup Crew' }
      ]
    }
  },
  computed: {
    relevantFilters() {
      return this.filters.filter((filter) => {
        return this.applicants.some((applicant) => {
          if (filter.value === '') {
            return applicant[filter.property] !== undefined && applicant[filter.property] !== ''
          }
          return applicant[filter.property] === filter.value
        })
      })
    }
  },
  created() {
    this.loadEmailTemplate()
  },
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
    applyFilter(property, value) {
      this.filteredApplicants = this.applicants.filter((applicant) => {
        if (value === '') {
          return applicant[property] !== undefined && applicant[property] !== ''
        }
        return applicant[property] === value
      })
    },
    clearFilters() {
      this.filteredApplicants = this.applicants
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
