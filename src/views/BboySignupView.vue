<template>
  <div class="basic">
    <img
      src="@/assets/images/bboy/bring_the_circle_back.jpg"
      alt="Bring the Circle Back"
      class="signup-image"
    />
    <form @submit.prevent="submitForm">
      <h2>Dancer Registration</h2>
      <div>
        <label for="name">Full Name:</label>
        <input type="text" id="name" v-model="form.name" required />
      </div>
      <div>
        <label for="duo_name">Duo Name:</label>
        <input type="text" id="duo_name" v-model="form.duo_name" required />
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="form.email" required />
      </div>
      <div>
        <label for="newsletter">
          <input type="checkbox" id="newsletter" v-model="form.newsletter" />
          I consent to receive future newsletters.
        </label>
      </div>
      <div>
        <label for="liability">
          <input type="checkbox" id="liability" v-model="form.liability" required />
          I agree to participate at my own risk.
        </label>
      </div>
      <button type="submit">Submit</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const form = ref({
  name: '',
  duo_name: '',
  email: '',
  newsletter: false,
  liability: false
})

const submitForm = async () => {
  try {
    const response = await axios.post(
      'https://relayproxy.vercel.app/reunion_registration',
      {
        text: `Full Name: ${form.value.name}\nDuo Name: ${form.value.duo_name}\nEmail: ${form.value.email}\nNewsletter Consent: ${form.value.newsletter}\nLiability Agreement: ${form.value.liability}`
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    if (response.status === 200) {
      alert('Form submitted successfully!')
      form.value = {
        name: '',
        duo_name: '',
        email: '',
        newsletter: false,
        liability: false
      }
    } else {
      alert('Failed to submit the form.')
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    alert('An error occurred while submitting the form.')
  }
}
</script>

<style scoped>
.basic {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 15px;
  max-width: 1200px; /* Increase max-width for desktop */
  margin: auto;
}

.signup-image {
  width: 100%;
  max-width: 400px; /* Increase max-width for desktop */
  margin-bottom: 20px;
}

form {
  width: 100%;
  display: grid;
  gap: 1rem;
}

label {
  font-weight: bold;
}

input[type='text'],
input[type='email'],
input[type='checkbox'] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  background-color: white;
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  background-color: #059bfa;
  color: white;
}

@media (min-width: 768px) {
  .basic {
    flex-direction: row;
    align-items: flex-start; /* Align items to the top */
  }

  .signup-image {
    margin-bottom: 0;
    margin-right: 20px;
  }

  form {
    width: calc(100% - 420px); /* Adjust width to account for image and margin */
  }
}
</style>
