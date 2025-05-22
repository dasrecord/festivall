<template>
  <div class="id-code-input">
    <img :src="festivall_emblem" style="width: 100px" alt="Festivall Emblem" class="emblem" />

    <img :src="haven_emblem" alt="Haven Emblem" class="haven-emblem" />

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
import { useRouter } from 'vue-router'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { festivall_db } from '@/firebase'
import festivall_emblem from '@/assets/images/festivall_emblem_black.png'
import haven_emblem from '@/assets/images/haven_emblem_black.png'

export default {
  name: 'HavenIDCodeInput',
  setup() {
    const idCode = ref('')
    const errorMessage = ref('')
    const router = useRouter()

    const checkIdCode = async () => {
      try {
        const havenRef = collection(festivall_db, 'haven')
        console.log(havenRef)
        const q = query(havenRef, where('id_code', '==', idCode.value))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          errorMessage.value = 'Invalid ID code. Please try again.'
          return
        }

        router.push({
          name: 'HavenTicketPage',
          params: { id_code: querySnapshot.docs[0].id }
        })
      } catch (error) {
        errorMessage.value = 'Error checking ID code. Please try again.'
        console.error('Error:', error)
      }
    }

    return {
      festivall_emblem,
      haven_emblem,
      idCode,
      errorMessage,
      checkIdCode
    }
  }
}
</script>

<style scoped>
.haven-emblem {
  width: 300px;
  margin: 1rem;
}
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
  background-color: var(--festivall-baby-blue);
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: black;
  color: white;
}

.error {
  color: red;
  margin-top: 1rem;
}
</style>
