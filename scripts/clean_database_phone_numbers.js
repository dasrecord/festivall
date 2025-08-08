import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Firebase configurations
const ReunionConfig = {
  apiKey: process.env.VITE_APP_REUNION_API_KEY,
  authDomain: process.env.VITE_APP_REUNION_AUTH_DOMAIN,
  projectId: process.env.VITE_APP_REUNION_PROJECT_ID,
  storageBucket: process.env.VITE_APP_REUNION_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_APP_REUNION_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_REUNION_APP_ID,
  measurementId: process.env.VITE_APP_REUNION_MEASUREMENT_ID
}

const FestivallConfig = {
  apiKey: process.env.VITE_APP_FESTIVALL_API_KEY,
  authDomain: process.env.VITE_APP_FESTIVALL_AUTH_DOMAIN,
  projectId: process.env.VITE_APP_FESTIVALL_PROJECT_ID,
  storageBucket: process.env.VITE_APP_FESTIVALL_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_APP_FESTIVALL_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_FESTIVALL_APP_ID,
  measurementId: process.env.VITE_APP_FESTIVALL_MEASUREMENT_ID
}

// Initialize Firebase apps
const reunion_app = initializeApp(ReunionConfig, 'reunion')
const reunion_db = getFirestore(reunion_app)

const festivall_app = initializeApp(FestivallConfig, 'festivall')
const festivall_db = getFirestore(festivall_app)

/**
 * Clean phone number by removing all non-digit characters
 * @param {string} phone - The phone number to clean
 * @returns {string} - Cleaned phone number with only digits
 */
function cleanPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') {
    return ''
  }
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/[^0-9]/g, '')
  
  // Return cleaned number or empty string if no digits found
  return cleaned || ''
}

/**
 * Clean phone numbers in a Firebase collection
 * @param {string} collectionName - Name of the Firebase collection to clean
 * @param {string} database - Database to use ('reunion' or 'festivall')
 * @param {boolean} dryRun - If true, only logs what would be changed without updating
 */
async function cleanPhoneNumbersInCollection(collectionName, database = 'reunion', dryRun = true) {
  const db = database === 'reunion' ? reunion_db : festivall_db
  
  console.log(`\n🧹 Starting phone number cleanup for collection: ${collectionName}`)
  console.log(`🗄️  Database: ${database}`)
  console.log(`📋 Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE UPDATE'}`)
  console.log('─'.repeat(60))
  
  try {
    // Get all documents from the collection
    const collectionRef = collection(db, collectionName)
    const snapshot = await getDocs(collectionRef)
    
    let totalDocuments = 0
    let documentsWithPhone = 0
    let documentsNeedingUpdate = 0
    let updatedDocuments = 0
    let errors = 0
    
    console.log(`📊 Found ${snapshot.docs.length} documents in collection`)
    
    for (const docSnapshot of snapshot.docs) {
      totalDocuments++
      const docData = docSnapshot.data()
      const docId = docSnapshot.id
      
      // Check if document has a phone field
      if (docData.phone) {
        documentsWithPhone++
        const originalPhone = docData.phone
        const cleanedPhone = cleanPhoneNumber(originalPhone)
        
        // Check if phone number needs cleaning
        if (originalPhone !== cleanedPhone) {
          documentsNeedingUpdate++
          
          console.log(`📞 Document ${docId}:`)
          console.log(`   Original: "${originalPhone}"`)
          console.log(`   Cleaned:  "${cleanedPhone}"`)
          
          if (!dryRun) {
            try {
              // Update the document with cleaned phone number
              const docRef = doc(db, collectionName, docId)
              await updateDoc(docRef, {
                phone: cleanedPhone
              })
              
              updatedDocuments++
              console.log(`   ✅ Updated successfully`)
            } catch (error) {
              errors++
              console.log(`   ❌ Error updating: ${error.message}`)
            }
          } else {
            console.log(`   🔍 Would be updated (dry run)`)
          }
          
          console.log('')
        }
      }
    }
    
    // Summary
    console.log('─'.repeat(60))
    console.log('📈 SUMMARY:')
    console.log(`   Total documents: ${totalDocuments}`)
    console.log(`   Documents with phone: ${documentsWithPhone}`)
    console.log(`   Documents needing update: ${documentsNeedingUpdate}`)
    
    if (!dryRun) {
      console.log(`   Successfully updated: ${updatedDocuments}`)
      if (errors > 0) {
        console.log(`   Errors: ${errors}`)
      }
    }
    
    if (dryRun && documentsNeedingUpdate > 0) {
      console.log(`\n💡 To actually update the database, run with dryRun=false`)
    } else if (!dryRun && updatedDocuments > 0) {
      console.log(`\n🎉 Phone number cleanup completed successfully!`)
    } else if (documentsNeedingUpdate === 0) {
      console.log(`\n✨ All phone numbers are already clean!`)
    }
    
  } catch (error) {
    console.error('❌ Error cleaning phone numbers:', error)
  }
}

// Main execution
async function main() {
  // Get arguments from command line
  const collectionName = process.argv[2] || 'orders_2025'
  const database = process.argv[3] || 'reunion'
  const liveFlag = process.argv[4]
  
  // Determine if this is a dry run
  const dryRun = liveFlag !== '--live'
  
  console.log('🔧 Phone Number Database Cleaner')
  console.log('================================')
  
  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made')
    console.log('   To actually update the database, add --live flag')
  } else {
    console.log('🚨 LIVE MODE - Database will be updated!')
  }
  
  if (!['reunion', 'festivall'].includes(database)) {
    console.error('❌ Database must be either "reunion" or "festivall"')
    console.log('Usage: npm run clean-phone-numbers <collection> <database> [--live]')
    console.log('Example: npm run clean-phone-numbers orders_2025 reunion --live')
    return
  }
  
  await cleanPhoneNumbersInCollection(collectionName, database, dryRun)
  
  console.log('\n✅ Script completed')
}

// Run the script
main().catch(console.error)

// Export for testing
export {
  cleanPhoneNumber,
  cleanPhoneNumbersInCollection
}
