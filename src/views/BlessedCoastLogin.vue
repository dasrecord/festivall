<template>
  <div id="login-container">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'
import { auth } from '/firebase.js' // Adjusted import path
import { signInWithEmailAndPassword } from 'firebase/auth'

export default {
  name: 'BlessedCoastLogin',
  setup() {
    const email = ref('')
    const password = ref('')

    const login = () => {
      signInWithEmailAndPassword(auth, email.value, password.value)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user
          console.log('User signed in:', user)
          // Redirect or show authenticated content
        })
        .catch((error) => {
          const errorCode = error.code
          const errorMessage = error.message
          console.error('Error signing in:', errorCode, errorMessage)
        })
    }

    return {
      email,
      password,
      login
    }
  }
}
</script>

<style scoped>
#login-container {
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  margin-top: 50px;
}
h2 {
  margin-bottom: 20px;
}
input,
button {
  display: flex;
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}
button {
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}
</style>
