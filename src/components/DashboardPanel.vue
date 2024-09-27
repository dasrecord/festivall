<template>
  <HelloWorld msg="Blessed Coast" />
  <div><h2>Dashboard Panel</h2></div>
  <div class="controls">
    <button @click="loadApplicants('artist')">Past Artist Applicants</button>
    <button @click="loadApplicants('workshop')">Past Workshops Applicants</button>
  </div>
  <div class="dashboard-panel">
    <div class="applicants" :style="{ transform: `scale(${scale})` }">
      <div v-for="applicant in applicants" :key="applicant.id" class="applicant">
        <div class="applicant-content">
          <h2>
            <a v-if="applicant.url" :href="applicant.url" target="_blank">{{
              applicant.act_name
            }}</a>
            <span v-else>{{ applicant.act_name }}</span>
          </h2>
          <!-- <p>{{ applicant.bio }}</p> -->
          <br />
          <p>{{ applicant.rates }}</p>
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
      scale: 1
    }
  },
  mounted() {},
  methods: {
    loadApplicants(type) {
      fetch(`src/data/applicants/${type}_raw.json`)
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
        })
        .catch((error) => {
          console.error('There was a problem with the fetch operation:', error)
        })
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
  transition: transform 2s ease-in;
  padding: 1rem 1rem;
}

.applicant {
  border: 1px solid #5e5e5e;
  width: 150px;
  height: 100px;
  margin: 5px;
  border-radius: 15px;
  overflow: hidden;
  white-space: wrap;
  text-overflow: ellipsis;
  transition:
    transform 750ms ease-in,
    width 1750s ease-in,
    height 750ms ease-in;
  background-color: #1f1e22;
  position: relative;
  transform-origin: center top;
}

.applicant p {
  display: none;
}
.applicant h2 {
  justify-content: center;
}

.applicant:hover {
  transform: scale(4);
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
