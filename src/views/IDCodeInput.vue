<template>
  <div class="id-code-input">
    <h1>Enter Your ID Code</h1>
    <form @submit.prevent="checkIdCode">
      <input type="text" v-model="idCode" placeholder="Enter your ID code" required />
      <button type="submit">Submit</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'EnterIDCode',
  setup() {
    const idCode = ref('')
    const errorMessage = ref('')
    const router = useRouter()

    const checkIdCode = async () => {
      try {
        // Check if the ID code exists in Firestore
        const response = await fetch(`/api/check-id-code?id_code=${idCode.value}`)
        const data = await response.json()

        if (data.exists) {
          // Redirect to the contract page if the ID code is valid
          router.push({ name: 'ContractPage', params: { id_code: idCode.value } })
        } else {
          errorMessage.value = 'Invalid ID code. Please try again.'
        }
      } catch (error) {
        console.error('Error checking ID code:', error)
        errorMessage.value = 'An error occurred. Please try again later.'
      }
    }

    return {
      idCode,
      errorMessage,
      checkIdCode
    }
  }
}
</script>

<style scoped>
.id-code-input {
  padding: 2rem;
  background-color: #f9f9f9;
  color: #333;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 2rem auto;
  text-align: center;
}

h1 {
  color: var(--festivall-baby-blue);
  margin-bottom: 1.5rem;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

input {
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: 100%;
  max-width: 300px;
  margin-bottom: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  background-color: #0056b3;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #004494;
}

.error {
  color: red;
  margin-top: 1rem;
}
</style>
