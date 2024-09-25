<template>
  <HelloWorld msg="Blessed Coast" />
  <div class="controls">
    <button @click="loadApplicants('artist')">Artist Dashboard</button>
    <button @click="loadApplicants('workshop')">Workshop Dashboard</button>
  </div>
  <div class="dashboard-panel">
    <div class="applicants" :style="{ transform: `scale(${scale})` }">
      <div v-for="applicant in applicants" :key="applicant.id" class="applicant">
        <div class="applicant-content">
          <h3>{{ applicant.act_name }}</h3>
          <h4 v-if="applicant.url"><a :href="applicant.url" target="_blank">Link</a></h4>
          <h4>{{ applicant.bio }}</h4>
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
  mounted() {
    // fetch('src/data/applicants/artist_raw.json')
    //   .then((response) => {
    //     if (!response.ok) {
    //       throw new Error('Network response was not ok ' + response.statusText)
    //     }
    //     return response.json()
    //   })
    //   .then((data) => {
    //     console.log('Fetched data:', data) // Log the fetched data
    //     // Sort applicants by whether they have a URL
    //     this.applicants = data.sort((a, b) => {
    //       if (a.url && !b.url) return -1
    //       if (!a.url && b.url) return 1
    //       return 0
    //     })
    //   })
    //   .catch((error) => {
    //     console.error('There was a problem with the fetch operation:', error)
    //   })
  },
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
}

.applicants {
  font-size: 60%;
  display: flex;
  flex-wrap: wrap;
  transition: transform 0.3s ease;
}

.applicant {
  border: 1px solid #ccc;
  width: 100px; /* Reduced width */
  height: 50px; /* Fixed height */
  margin: 5px;
  border-radius: 5px;
  overflow: hidden; /* Clip text */
  white-space: wrap; /* Prevent text wrapping */
  text-overflow: ellipsis; /* Add ellipsis for clipped text */
  transition:
    transform 0.3s ease,
    width 0.3s ease,
    height 0.3s ease; /* Smooth transition for zoom effect */
  background-color: #1f1e22; /* Ensure the cards are not transparent */
  position: relative; /* Ensure each card is positioned relative */
  transform-origin: center center; /* Set the origin point for scaling */
}

.applicant:hover {
  transform: scale(3); /* Increase zoom effect */
  z-index: 10; /* Ensure the hovered element is on top */
}

.applicant-content {
  width: auto;
  height: 100%;
  overflow: auto; /* Make the content scrollable */
}

.applicant-content::-webkit-scrollbar {
  display: none; /* Hide scrollbar for WebKit browsers */
}

.applicant-content {
  scrollbar-width: none; /* Hide scrollbar for Firefox */
}
</style>
