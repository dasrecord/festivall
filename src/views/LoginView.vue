<template>
  <div id="login-container">
    <div id="logo-container">
      <img src="@/assets/images/festivall_emblem_white.png" alt="Festivall Logo" />
    </div>
    <h2>LOGIN</h2>
    <p>You are currently {{ status }}.</p>
    <form @submit.prevent="login">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit">Login</button>
      <button @click="logout" v-if="isUserLoggedIn">LOGOUT</button>
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
    const route = useRoute() // Initialize useRoute at the top

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
#logo-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}
#logo-container img {
  width: 200px;
}
#login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
h2 {
  color: var(--festivall-baby-blue);
  margin-bottom: 1rem;
}
form {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 1rem 0;
}
input {
  width: 100%;
  padding: 0.75rem;
  margin: 0.5rem 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}
button {
  display: inline-block;
  width: 100%;
  padding: 0.75rem;
  margin: 5px;
  border: none;
  border-radius: 5px;
  background-color: var(--festivall-baby-blue);
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
</style>
