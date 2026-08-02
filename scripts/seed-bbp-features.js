#!/usr/bin/env node

/**
 * Seed BBP Features to Firestore
 * 
 * Migrates the features array from bitcoinBlockPartyConfig.js to Firestore.
 * Run this once to populate the Firebase document with initial features.
 * 
 * Usage:
 *   node scripts/seed-bbp-features.js
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'
import dotenv from 'dotenv'

dotenv.config()

// Initialize Firebase (using Festivall DB - same as BBP views)
const firebaseConfig = {
  apiKey: process.env.VITE_APP_FESTIVALL_API_KEY,
  authDomain: process.env.VITE_APP_FESTIVALL_AUTH_DOMAIN,
  projectId: process.env.VITE_APP_FESTIVALL_PROJECT_ID,
  storageBucket: process.env.VITE_APP_FESTIVALL_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_APP_FESTIVALL_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_FESTIVALL_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Features to seed (from bitcoinBlockPartyConfig.js)
const features = [
  'Food & Drink',
  'Learning Resources',
  'Art Gallery',
  'Workshops',
  '21UP',
  'Film Screenings',
  'P2P Desk',
  'Bitcoin Quiz',
  'Live Music',
  'Speakers',
]

async function seedFeatures() {
  try {
    console.log('🌱 Seeding BBP features to Firestore...')
    
    const scheduleRef = doc(db, 'bbp_config_2026', 'schedule')
    
    // Check if features already exist
    const docSnap = await getDoc(scheduleRef)
    if (docSnap.exists() && docSnap.data().features?.length > 0) {
      console.log('⚠️  Features already exist in Firestore:')
      console.log(docSnap.data().features)
      console.log('\nTo overwrite, delete the features field first or modify this script.')
      return
    }
    
    // Seed features
    await setDoc(scheduleRef, { features }, { merge: true })
    
    console.log('✅ Successfully seeded features:')
    features.forEach((f, i) => console.log(`  ${i + 1}. ${f}`))
    console.log('\n🎉 Features are now live on the landing page!')
    console.log('👉 Visit /admin/bitcoinblockparty → Features tab to manage them.')
    
  } catch (error) {
    console.error('❌ Error seeding features:', error)
    process.exit(1)
  }
}

seedFeatures()
