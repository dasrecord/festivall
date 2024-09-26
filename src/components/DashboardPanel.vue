<template>
  <HelloWorld msg="Blessed Coast" />
  <div class="controls">
    <button @click="loadApplicants('artist')">Artists</button>
    <button @click="loadApplicants('workshop')">Workshops</button>
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
          <p>{{ applicant.bio }}</p>
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
  transition: transform 0.3s ease;
  padding: 1rem 1rem;
}

.applicant {
  border: 1px solid #ccc;
  width: 150px;
  height: 150px;
  margin: 5px;
  border-radius: 50%;
  overflow: hidden;
  white-space: wrap;
  text-overflow: ellipsis;
  transition:
    transform 0.3s ease,
    width 0.3s ease,
    height 0.5s ease;
  background-color: #1f1e22;
  position: relative;
  transform-origin: center center;
}

.applicant p {
  display: none;
}
.applicant h2 {
  justify-content: center;
}

.applicant:hover {
  padding: 3px 3px;
  transform: scale(3);
  z-index: 2;
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
  padding: 10px;
}

.applicant-content::-webkit-scrollbar {
  display: none;
}

.applicant-content:hover {
  scrollbar-width: thin;
}
</style>
