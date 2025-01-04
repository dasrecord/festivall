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
          alert(`Tracked successfully!`)
        } else {
          alert(`Failed to track.`)
        }
      } catch (error) {
        console.error(`Error tracking ${buttonName}:`, error)
        alert(`An error occurred while tracking ${buttonName}.`)
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
  box-shadow: inset 0 0 0 2px #000; /* Add a border around the button */
  background-color: #fff; /* Set the background color to white */
  border: none; /* Remove the default border */
}
</style>
