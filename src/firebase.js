import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

const ReunionConfig = {
  apiKey: import.meta.env.VITE_APP_REUNION_API_KEY,
  authDomain: import.meta.env.VITE_APP_REUNION_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_APP_REUNION_PROJECT_ID,
  storageBucket: import.meta.env.VITE_APP_REUNION_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_REUNION_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_REUNION_APP_ID,
  measurementId: import.meta.env.VITE_APP_REUNION_MEASUREMENT_ID
}

const FestivallConfig = {
  apiKey: import.meta.env.VITE_APP_FESTIVALL_API_KEY,
  authDomain: import.meta.env.VITE_APP_FESTIVALL_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_APP_FESTIVALL_PROJECT_ID,
  storageBucket: import.meta.env.VITE_APP_FESTIVALL_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_FESTIVALL_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_FESTIVALL_APP_ID,
  measurementId: import.meta.env.VITE_APP_FESTIVALL_MEASUREMENT_ID
}

const reunion_app = initializeApp(ReunionConfig, 'reunion')
const reunion_db = getFirestore(reunion_app)
const reunion_analytics = getAnalytics(reunion_app)

const festivall_app = initializeApp(FestivallConfig, 'festivall')
const festivall_db = getFirestore(festivall_app)
const festivall_auth = getAuth(festivall_app)
const festivall_analytics = getAnalytics(festivall_app)

export { festivall_auth, reunion_db, festivall_db, reunion_analytics, festivall_analytics }
