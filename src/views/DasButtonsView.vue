<template>
  <div class="button-container">
    <button @click="updateSheet('IRON')">IRON</button>
    <button @click="updateSheet('FOLATE')">FOLATE</button>
    <button @click="updateSheet('SSRI')">SSRI</button>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'DasButtonsView',
  methods: {
    async updateSheet(buttonName) {
      try {
        const response = await axios.post(
          'https://relayproxy.vercel.app/das_tracker',
          JSON.stringify({ text: buttonName }),
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
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
}

button {
  width: 100%;
  height: calc(100vh / 3);
  padding: 10px 20px;
}
</style>
