<script>
import { ref } from 'vue'
import { festivall_auth } from '../firebase.js'
import { signInWithEmailAndPassword } from 'firebase/auth'

export default {
  name: 'BlessedCoastLogin',
  setup() {
    const email = ref('')
    const password = ref('')

    const login = () => {
      signInWithEmailAndPassword(festivall_auth, email.value, password.value)
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

<style scoped>
#login-container {
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  margin-top: 50px;
}
</style>
