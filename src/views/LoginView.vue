<template>
  <h2>Login</h2>
  <div id="login-container">
    <p>You are currently {{ status }}.</p>
    <form @submit.prevent="login">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit">Login</button>
      <button @click="logout" v-if="isUserLoggedIn">Logout</button>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { festivall_auth } from '@/firebase' // Adjust the import path as needed

export default {
  name: 'FestivallLogin',
  setup() {
    const email = ref('')
    const password = ref('')
    const status = ref('logged out')
    const isUserLoggedIn = ref(false)
    const router = useRouter()

    const login = () => {
      signInWithEmailAndPassword(festivall_auth, email.value, password.value)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user
          console.log('User signed in:', user)
          console.log('User email:', user.email)

          // Check if localStorage is available
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user))
            status.value = 'logged in'
            isUserLoggedIn.value = true
          } else {
            console.warn('localStorage is not available.')
          }
          
          // Get the redirect path from query parameters or default to dashboard
          const route = useRoute()
          const redirectPath = route.query.redirect || '/dashboard'
          router.push(redirectPath)
        })
        .catch((error) => {
          const errorCode = error.code
          const errorMessage = error.message
          console.error('Error signing in:', errorCode, errorMessage)
        })
    }

    const logout = () => {
      signOut(festivall_auth)
        .then(() => {
          console.log('User signed out')

          // Check if localStorage is available
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('user')
            status.value = 'logged out'
            isUserLoggedIn.value = false
          } else {
            console.warn('localStorage is not available.')
          }

          // Redirect to login page or home page
          router.push('/login')
        })
        .catch((error) => {
          console.error('Error signing out:', error)
        })
    }

    onMounted(() => {
      // Check if localStorage is available
      if (typeof localStorage !== 'undefined') {
        const user = localStorage.getItem('user')
        if (user) {
          status.value = 'logged in'
          isUserLoggedIn.value = true
        }
      } else {
        console.warn('localStorage is not available.')
      }
    })

    return {
      email,
      password,
      login,
      logout,
      status,
      isUserLoggedIn
    }
  }
}
</script>

<style scoped>
#login-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100vh;
}
form {
  width: 60vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 1rem 0;
}
button {
  display: inline-block;
  width: 30%;
  margin: 5px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
</style>
