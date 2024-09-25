<template>
  <div class="dashboard-panel">
    <div class="controls">
      <button @click="zoomIn">Zoom In</button>
      <button @click="zoomOut">Zoom Out</button>
    </div>
    <div class="applicants" :style="{ transform: `scale(${scale})` }">
      <div v-for="applicant in applicants" :key="applicant.id" class="applicant">
        <h3>{{ applicant.act_name }}</h3>
        <p>{{ applicant.bio }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      applicants: [],
      scale: 1
    }
  },
  mounted() {
    fetch('src/data/applicants/artist_raw.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText)
        }
        return response.json()
      })
      .then((data) => {
        console.log('Fetched data:', data) // Log the fetched data
        this.applicants = data
      })
      .catch((error) => {
        console.error('There was a problem with the fetch operation:', error)
      })
  },
  methods: {
    zoomIn() {
      this.scale += 0.1
    },
    zoomOut() {
      if (this.scale > 0.1) this.scale -= 0.1
    }
  }
}
</script>

<style scoped>
.dashboard-panel {
  padding: 20px;
}

.controls {
  margin-bottom: 20px;
}

.applicants {
  display: flex;
  flex-wrap: wrap;
  transition: transform 0.3s ease;
}

.applicant {
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px;
  width: 200px;
}
</style>
