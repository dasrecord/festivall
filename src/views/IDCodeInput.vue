<template>
  <div class="id-code-input">
    <img :src="festivall_emblem" style="width: 100px" alt="Festivall Emblem" class="emblem" />
    <h1>Reunion Festival</h1>
    <img :src="frog_image" style="width: 200px" alt="Frog" class="frog" />

    <h3>Enter Your ID Code</h3>

    <form @submit.prevent="checkIdCode">
      <input type="text" v-model="idCode" placeholder="a2c4e" required />
      <button type="submit">ENTER</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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

    const checkIdCode = async () => {
      try {
        // Check if the ID code exists in 'orders_2025'
        let q = query(collection(reunion_db, 'orders_2025'), where('id_code', '==', idCode.value))
        let querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          // Redirect to the ticket page if the ID code is valid
          router.push({ name: 'TicketPage', params: { id_code: idCode.value } })
          return
        }

        // Check if the ID code exists in 'applications_2025'
        q = query(collection(reunion_db, 'applications_2025'), where('id_code', '==', idCode.value))
        querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          // Redirect to the contract page if the ID code is valid
          router.push({ name: 'ContractPage', params: { id_code: idCode.value } })
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
