<template>
  <div class="banner">
    <IconFestivall style="width: 50px; height: 50px" />
    <HelloWorld msg="SCOUTING DASHBORAD" />
  </div>

  <div class="controls">
    <h2>Choose Talent Pool</h2>
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
  <h2>Applicants with URLS will appear at the top.</h2>
  <h2>Hover over an applicant for more information.</h2>
  <h2>Click on an applicant for one-click booking template.</h2>
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
            <a :href="'mailto:' + applicant.email">{{ applicant.email }}</a>
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
      scale: 1
    }
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
  flex-direction: column;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  gap: 2px;
}

button {
  width: auto;
  padding: 20px 10px;
  border: none;
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
  height: 80px;
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
  /* padding: 5px; */
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
