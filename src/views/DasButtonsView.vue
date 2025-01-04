<template>
  <div class="button-container">
    <button @click="track_in_slack(':pill: SSRI')">SSRI</button>
    <button @click="track_in_slack(':medical_symbol: PRENATAL & DHA')">PRENATAL & DHA</button>
    <button @click="track_in_slack(':magnet: IRON')">IRON</button>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'DasButtonsView',
  methods: {
    async track_in_slack(buttonName) {
      try {
        const response = await axios.post(
          'https://relayproxy.vercel.app/das_tracker',
          {
            text: `${buttonName}`
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        if (response.status === 200) {
          alert(`${buttonName} updated successfully!`)
        } else {
          alert(`Failed to update ${buttonName}.`)
        }
      } catch (error) {
        console.error(`Error updating ${buttonName}:`, error)
        alert(`An error occurred while updating ${buttonName}.`)
      }
    }
  }
}
</script>

<style scoped>
.button-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full viewport height */
  margin: 0; /* Remove default margin */
  padding: 0; /* Remove default padding */
  box-sizing: border-box; /* Include padding and border in the element's total width and height */
}

button {
  flex: 1; /* Distribute the available space evenly among the buttons */
  padding: 10px 20px;
  font-size: 2rem; /* Adjust font size for better readability */
}
</style>
