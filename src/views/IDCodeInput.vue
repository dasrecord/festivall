<template>
  <div class="id-code-input">
    <img :src="festivall_emblem" style="width: 100px" alt="Festivall Emblem" class="emblem" />
    <h1>Reunion Festival</h1>
    <img :src="frog_image" style="width: 200px" alt="Frog" class="frog" />

    <h3>Enter Your ID Code</h3>

    <form @submit.prevent="checkIdCode">
      <input type="text" v-model="idCode" placeholder="" required />
      <button type="submit">ENTER</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import festivall_emblem from '@/assets/images/festivall_emblem_black.png'
import frog_image from '@/assets/images/frog.png'

export default {
  name: 'EnterIDCode',
  setup() {
    const idCode = ref('')
    const errorMessage = ref('')
    const router = useRouter()
    const route = useRoute()

    const checkIdCode = async () => {
      try {
        // Convert to lowercase since UUIDs are stored in lowercase
        const normalizedIdCode = idCode.value.toLowerCase()

        // Check if the ID code exists in 'participants_2026'
        const q = query(
          collection(reunion_db, 'participants_2026'),
          where('id_code', '==', normalizedIdCode)
        )
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          // Determine which page to redirect to based on current path
          if (route.path === '/reunioncontract') {
            // If we're on the contract entry page, go to contract
            router.push({ name: 'ContractPage', params: { id_code: normalizedIdCode } })
          } else {
            // Default to ticket page
            router.push({ name: 'TicketPage', params: { id_code: normalizedIdCode } })
          }
        } else {
          errorMessage.value = 'Invalid ID code. Please try again.'
        }
      } catch (error) {
        console.error('Error checking ID code:', error)
        errorMessage.value = 'An error occurred. Please contact webmaster.'
      }
    }

    return {
      festivall_emblem,
      frog_image,
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
  color: var(--reunion-frog-green);
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
  background-color: var(--reunion-frog-green);
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #404224;
}

.error {
  color: red;
  margin-top: 1rem;
}
</style>
