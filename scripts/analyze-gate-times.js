#!/usr/bin/env node

/**
 * Analyze entrance_activity_history timestamps to find peak gate times
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import dotenv from 'dotenv'
import process from 'process'

// Load env
dotenv.config()

// Firebase (reunion) from your .env
const ReunionConfig = {
  apiKey: process.env.VITE_APP_REUNION_API_KEY,
  authDomain: process.env.VITE_APP_REUNION_AUTH_DOMAIN,
  projectId: process.env.VITE_APP_REUNION_PROJECT_ID,
  storageBucket: process.env.VITE_APP_REUNION_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_APP_REUNION_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_REUNION_APP_ID,
  measurementId: process.env.VITE_APP_REUNION_MEASUREMENT_ID
}

const app = initializeApp(ReunionConfig, 'reunion')
const db = getFirestore(app)

// Utility to parse and format timestamps
function parseTimestamp(ts) {
  try {
    if (!ts) return null
    if (ts.toDate) return ts.toDate() // Firestore Timestamp
    if (typeof ts === 'string') return new Date(ts)
    if (ts instanceof Date) return ts
    return null
  } catch {
    return null
  }
}

function formatDateTime(date) {
  if (!date) return 'Unknown'
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function formatTime(date) {
  if (!date) return 'Unknown'
  const hours = date.getHours()
  const mins = String(date.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${mins} ${ampm}`
}

async function analyzeGateTimes() {
  console.log('🚪 ANALYZING GATE ENTRY TIMES\n')
  console.log('Fetching orders_2025...')
  
  const ordersSnap = await getDocs(collection(db, 'orders_2025'))
  const allActivities = []
  
  // Collect all entrance activities
  for (const orderDoc of ordersSnap.docs) {
    const order = orderDoc.data()
    const activities = Array.isArray(order.entrance_activity_history) 
      ? order.entrance_activity_history 
      : []
    
    for (const activity of activities) {
      const timestamp = parseTimestamp(activity.timestamp)
      if (timestamp) {
        allActivities.push({
          timestamp,
          action: activity.action,
          festivalDay: activity.festival_day,
          orderName: order.fullname || 'Unknown',
          idCode: orderDoc.id
        })
      }
    }
  }
  
  console.log(`Found ${allActivities.length} gate activities\n`)
  
  // Sort by timestamp
  allActivities.sort((a, b) => a.timestamp - b.timestamp)
  
  // Group by date and hour
  const byDateHour = {}
  const byDate = {}
  const byHour = {}
  
  for (const activity of allActivities) {
    const date = formatDateTime(activity.timestamp)
    const hour = activity.timestamp.getHours()
    const hourLabel = `${String(hour).padStart(2, '0')}:00`
    const dateHourKey = `${date} ${hourLabel}`
    
    // By date and hour
    if (!byDateHour[dateHourKey]) {
      byDateHour[dateHourKey] = { checkIns: 0, checkOuts: 0, activities: [] }
    }
    if (activity.action === 'check_in') {
      byDateHour[dateHourKey].checkIns++
    } else if (activity.action === 'check_out') {
      byDateHour[dateHourKey].checkOuts++
    }
    byDateHour[dateHourKey].activities.push(activity)
    
    // By date only
    if (!byDate[date]) {
      byDate[date] = { checkIns: 0, checkOuts: 0 }
    }
    if (activity.action === 'check_in') {
      byDate[date].checkIns++
    } else if (activity.action === 'check_out') {
      byDate[date].checkOuts++
    }
    
    // By hour across all days
    if (!byHour[hourLabel]) {
      byHour[hourLabel] = { checkIns: 0, checkOuts: 0 }
    }
    if (activity.action === 'check_in') {
      byHour[hourLabel].checkIns++
    } else if (activity.action === 'check_out') {
      byHour[hourLabel].checkOuts++
    }
  }
  
  // Sort and display results
  console.log('━'.repeat(80))
  console.log('📊 BUSIEST DATES')
  console.log('━'.repeat(80))
  const sortedDates = Object.entries(byDate)
    .sort((a, b) => (b[1].checkIns + b[1].checkOuts) - (a[1].checkIns + a[1].checkOuts))
  
  for (const [date, stats] of sortedDates) {
    const total = stats.checkIns + stats.checkOuts
    console.log(`${date}`)
    console.log(`  Check-ins: ${stats.checkIns} | Check-outs: ${stats.checkOuts} | Total: ${total}`)
  }
  
  console.log('\n' + '━'.repeat(80))
  console.log('⏰ BUSIEST HOURS (across all days)')
  console.log('━'.repeat(80))
  const sortedHours = Object.entries(byHour)
    .sort((a, b) => (b[1].checkIns + b[1].checkOuts) - (a[1].checkIns + a[1].checkOuts))
    .slice(0, 10)
  
  for (const [hour, stats] of sortedHours) {
    const total = stats.checkIns + stats.checkOuts
    const bar = '█'.repeat(Math.floor(total / 2))
    console.log(`${hour} | ${bar} ${total} activities (${stats.checkIns} in, ${stats.checkOuts} out)`)
  }
  
  console.log('\n' + '━'.repeat(80))
  console.log('🔥 TOP 20 PEAK TIME SLOTS (specific date + hour)')
  console.log('━'.repeat(80))
  const sortedDateHours = Object.entries(byDateHour)
    .sort((a, b) => (b[1].checkIns + b[1].checkOuts) - (a[1].checkIns + a[1].checkOuts))
    .slice(0, 20)
  
  for (const [dateHour, stats] of sortedDateHours) {
    const total = stats.checkIns + stats.checkOuts
    const bar = '█'.repeat(Math.floor(total / 2))
    console.log(`${dateHour} | ${bar} ${total} (${stats.checkIns} in, ${stats.checkOuts} out)`)
  }
  
  // Show detailed activities for the top 3 peak hours
  console.log('\n' + '━'.repeat(80))
  console.log('📋 DETAILED VIEW - TOP 3 PEAK HOURS')
  console.log('━'.repeat(80))
  
  for (let i = 0; i < Math.min(3, sortedDateHours.length); i++) {
    const [dateHour, stats] = sortedDateHours[i]
    console.log(`\n${dateHour}`)
    console.log('-'.repeat(80))
    
    stats.activities
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach(activity => {
        const time = formatTime(activity.timestamp)
        const action = activity.action === 'check_in' ? 'IN ' : 'OUT'
        console.log(`  ${time} | ${action} | ${activity.orderName} (${activity.idCode})`)
      })
  }
  
  process.exit(0)
}

analyzeGateTimes().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
