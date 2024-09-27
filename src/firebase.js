import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const ReunionConfig = {
  apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_APP_FIREBASE_MEASUREMENT_ID
};

const FestivallConfig = {
  apiKey: import.meta.env.VITE_APP_AUTH_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_APP_AUTH_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_APP_AUTH_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_APP_AUTH_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_AUTH_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_AUTH_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_APP_AUTH_FIREBASE_MEASUREMENT_ID
};

const reunion_app = initializeApp(ReunionConfig, 'reunion');
const reunion_db = getFirestore(reunion_app);

const festivall_app = initializeApp(FestivallConfig, 'festivall');
const festivall_auth = getAuth(festivall_app);

export { festivall_auth, reunion_db };